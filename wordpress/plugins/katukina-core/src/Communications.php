<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

interface MailboxProvider {
    /** Fetch at most 100 normalized messages. Credentials must be read from server-side secret storage. */
    public function fetch( array $mailbox, string $cursor ): array;
}

interface MessageTransport {
    /** The provider must deduplicate this stable key, including after an interrupted response. */
    public function send( array $message, string $idempotency_key ): string;
}

final class Communications {
    public static function register(): void {
        add_action( 'katukina_mail_sync', array( self::class, 'sync' ) );
        add_action( 'katukina_deliver', array( self::class, 'deliver' ) );
        add_action( 'katukina_restock_scan', array( self::class, 'restock' ) );
        add_action( 'katukina_mail_recover', array( self::class, 'recover' ) );
        add_action( 'katukina_domain_committed', static function ( $action ) {
            if ( in_array( $action, array( 'receive', 'adjust', 'produce', 'complete-production', 'return-stock' ), true ) && function_exists( 'as_schedule_single_action' ) ) { as_schedule_single_action( time() + 10, 'katukina_restock_scan', array(), 'katukina', true ); }
        } );
        add_action( 'woocommerce_product_set_stock_status', static function ( $id, $status ) { if ( 'instock' === $status && function_exists( 'as_schedule_single_action' ) ) { as_schedule_single_action( time() + 10, 'katukina_restock_scan', array(), 'katukina', true ); } }, 10, 2 );
        add_action( 'init', static function () {
            if ( ! function_exists( 'as_schedule_recurring_action' ) ) { return; }
            if ( ! as_has_scheduled_action( 'katukina_mail_recover', array(), 'katukina' ) ) { as_schedule_recurring_action( time() + 300, 300, 'katukina_mail_recover', array(), 'katukina', true ); }
            $providers = apply_filters( 'katukina_mailbox_providers', array() );
            foreach ( Registry::all( 'mailbox' ) as $mailbox ) {
                if ( $mailbox['data']['active'] && isset( $providers[ $mailbox['data']['provider'] ] ) && ! as_has_scheduled_action( 'katukina_mail_sync', array( (int) $mailbox['id'] ), 'katukina' ) ) {
                    as_schedule_recurring_action( time() + 30, 300, 'katukina_mail_sync', array( (int) $mailbox['id'] ), 'katukina', true );
                }
            }
        } );
        add_action( 'admin_menu', static function () { add_submenu_page( 'users.php', 'Unified inbox', 'Unified inbox', 'katukina_crm', 'katukina-inbox', array( self::class, 'inbox' ) ); } );
        add_action( 'admin_post_katukina_message_link', array( self::class, 'link_message' ) );
        add_action( 'katukina_record_detail', array( self::class, 'record_detail' ), 10, 2 );
        add_action( 'admin_post_katukina_queue_campaign', static function () {
            if ( ! current_user_can( 'katukina_crm' ) ) { wp_die( 'CRM permission required.', '', array( 'response' => 403 ) ); }
            $id = absint( $_POST['campaign_id'] ?? 0 ); check_admin_referer( 'kat-campaign-' . $id );
            try { $result = self::campaign( $id ); NativeAdmin::notice( $result['queued'] . ' eligible subscriptions queued. Repeated requests do not send duplicates.' ); } catch ( \Throwable $e ) { NativeAdmin::notice( $e->getMessage(), 'error' ); }
            wp_safe_redirect( admin_url( 'users.php?page=katukina-contacts&section=campaign&record_id=' . $id ) ); exit;
        } );
        add_action( 'woocommerce_admin_order_data_after_order_details', static function ( $order ) {
            if ( current_user_can( 'katukina_orders' ) && current_user_can( 'katukina_crm' ) ) { echo '<p><label><input type="checkbox" name="kat_notify_shipment" value="1"> Queue shipment notification when saving (requires shipped/reshipped stage and tracking).</label></p>'; }
        } );
        add_action( 'woocommerce_process_shop_order_meta', static function ( $id ) {
            if ( empty( $_POST['kat_notify_shipment'] ) || ! current_user_can( 'katukina_orders' ) || ! current_user_can( 'katukina_crm' ) || ! current_user_can( 'edit_shop_order', $id ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['katukina_order_nonce'] ?? '' ) ), 'katukina_order_' . $id ) ) { return; }
            try { self::shipment( $id ); } catch ( \Throwable $e ) { \WC_Admin_Meta_Boxes::add_error( 'Shipment notification: ' . $e->getMessage() ); }
        }, 60 );
        add_action( 'rest_api_init', static function () {
            register_rest_route( 'katukina/v1', '/communications/campaigns/(?P<id>\d+)/queue', array( 'methods' => 'POST', 'permission_callback' => static fn() => current_user_can( 'katukina_crm' ), 'callback' => static fn( $r ) => OperationsApi::response( static fn() => self::campaign( (int) $r['id'] ) ) ) );
        } );
    }

    public static function sync( int $mailbox_id ): void {
        $mailbox = Registry::get( $mailbox_id, 'mailbox' ); $providers = apply_filters( 'katukina_mailbox_providers', array() );
        $provider = $providers[ $mailbox['data']['provider'] ] ?? null;
        if ( ! $provider instanceof MailboxProvider ) { throw new DomainError( 'Mailbox provider is not configured.', 503 ); }
        $cursor = (string) get_option( 'katukina_mail_cursor_' . $mailbox_id, '' );
        $page = $provider->fetch( $mailbox['data'], $cursor );
        if ( ! is_array( $page['messages'] ?? null ) || count( $page['messages'] ) > 100 || ! is_string( $page['cursor'] ?? null ) || strlen( $page['cursor'] ) > 4000 || ( ! empty( $page['has_more'] ) && $page['cursor'] === $cursor ) ) { throw new DomainError( 'Invalid mailbox synchronization response.', 502 ); }
        foreach ( $page['messages'] as $message ) {
            if ( empty( $message['id'] ) || ! is_scalar( $message['id'] ) || ! is_email( $message['sender'] ?? '' ) || ! is_string( $message['body'] ?? null ) || strlen( $message['body'] ) > 200000 ) { throw new DomainError( 'Invalid normalized mailbox message.', 502 ); }
            $key = hash( 'sha256', $mailbox_id . ':' . $message['id'] );
            Database::command( 'mail.sync', array( 'key' => 'mail-' . $key, 'mailbox_id' => $mailbox_id, 'external_id' => (string) $message['id'] ), static function () use ( $mailbox_id, $message, $key ) {
                $received = strtotime( (string) ( $message['received_at'] ?? '' ) );
                if ( false === $received ) { throw new DomainError( 'Message timestamp is required.' ); }
                $id = Database::insert( 'inbox', array( 'mailbox_id' => $mailbox_id, 'external_key' => $key, 'sender' => sanitize_email( $message['sender'] ), 'subject' => sanitize_text_field( $message['subject'] ?? '' ), 'body' => sanitize_textarea_field( $message['body'] ), 'received_at' => gmdate( 'Y-m-d H:i:s', $received ) ) );
                return array( 'id' => $id );
            } );
        }
        // Cursor moves only after every message is durable. Replayed pages are harmless.
        update_option( 'katukina_mail_cursor_' . $mailbox_id, $page['cursor'], false );
        if ( ! empty( $page['has_more'] ) && function_exists( 'as_schedule_single_action' ) ) { as_schedule_single_action( time() + 5, 'katukina_mail_sync', array( $mailbox_id ), 'katukina', true ); }
    }

    public static function render_template( array $template, array $values ): array {
        $replace = array();
        foreach ( array( 'name', 'order_number', 'tracking_url', 'tracking_code', 'product_instructions', 'unsubscribe_url' ) as $field ) { $replace[ '{{' . $field . '}}' ] = sanitize_textarea_field( (string) ( $values[ $field ] ?? '' ) ); }
        return array( 'subject' => sanitize_text_field( strtr( $template['subject'], $replace ) ), 'body' => strtr( $template['body'], $replace ) );
    }
    public static function recover(): void {
        global $wpdb;
        $ids = $wpdb->get_col( 'SELECT id FROM ' . Database::table( 'outbox' ) . " WHERE attempts<5 AND (state IN ('pending','failed') OR (state='processing' AND lease_until<UTC_TIMESTAMP())) ORDER BY id LIMIT 100" );
        foreach ( $ids as $id ) { if ( ! as_has_scheduled_action( 'katukina_deliver', array( (int) $id ), 'katukina' ) ) { as_schedule_single_action( time() + 10, 'katukina_deliver', array( (int) $id ), 'katukina', true ); } }
    }
    public static function restock(): void {
        foreach ( Registry::all( 'subscription' ) as $row ) {
            $s = $row['data']; if ( ! $s['active'] || ! $s['consent'] || 'back_in_stock' !== $s['purpose'] ) { continue; }
            try {
                $channel = Registry::get( (int) $s['channel_id'], 'channel' ); $form = Registry::get( (int) $s['form_id'], 'form' ); $product = wc_get_product( $form['data']['product_id'] );
                if ( ! $product || 'publish' !== $product->get_status() || ! Channels::listed( $product, (int) $channel['id'] ) || ( Commerce::tracked_form( $product->get_id() ) ? Channels::available( $product->get_id(), $channel ) < 1000 : ! $product->is_in_stock() ) ) { continue; }
                $mailbox = Subscriptions::mailbox( (int) $channel['id'] );
                self::queue( 'restock:' . $row['id'] . ':' . $row['version'], array( 'to' => $s['email'], 'from' => $mailbox['data']['email'], 'transport' => $mailbox['data']['provider'], 'subject' => $product->get_name() . ' is available again', 'body' => $product->get_name() . " is available again. Availability may change before checkout.\n" . trailingslashit( $channel['data']['url'] ?: home_url() ) . 'products/' . $product->get_slug() . "\n\nUnsubscribe: " . Subscriptions::unsubscribe_url( (int) $row['id'] ) ), (int) $row['id'] );
            } catch ( DomainError $error ) { /* Unconfigured/inactive channels never send or leak internal configuration. */ }
        }
    }

    public static function queue( string $key, array $message, int $subscription_id = 0 ): array {
        if ( ! is_email( $message['to'] ?? '' ) || ! is_email( $message['from'] ?? '' ) || empty( $message['transport'] ) || empty( $message['subject'] ) || empty( $message['body'] ) ) { throw new DomainError( 'Message requires a verified sender, recipient and transport.' ); }
        $result = Database::command( 'mail.queue', array( 'key' => 'delivery-' . hash( 'sha256', $key ), 'message' => $message, 'subscription_id' => $subscription_id ), static function ( $input ) use ( $key ) {
            $id = Database::insert( 'outbox', array( 'delivery_key' => hash( 'sha256', $key ), 'payload' => wp_json_encode( $input['message'] ), 'subscription_id' => $input['subscription_id'], 'state' => 'pending', 'created_at' => gmdate( 'Y-m-d H:i:s' ) ) );
            return array( 'id' => $id, 'state' => 'pending' );
        } );
        if ( function_exists( 'as_schedule_single_action' ) && ! as_has_scheduled_action( 'katukina_deliver', array( $result['id'] ), 'katukina' ) ) { as_schedule_single_action( time() + 10, 'katukina_deliver', array( $result['id'] ), 'katukina', true ); }
        return $result;
    }

    public static function deliver( int $id ): void {
        global $wpdb;
        $row = Database::command( 'mail.claim', array( 'key' => 'claim-' . wp_generate_uuid4(), 'id' => $id ), static function () use ( $id, $wpdb ) {
            $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'outbox' ) . ' WHERE id=%d FOR UPDATE', $id ), ARRAY_A );
            if ( ! $row || in_array( $row['state'], array( 'sent', 'suppressed' ), true ) || ( $row['lease_until'] && $row['lease_until'] > gmdate( 'Y-m-d H:i:s' ) ) || (int) $row['attempts'] >= 5 ) { return array(); }
            if ( $row['subscription_id'] ) {
                $subscription = Registry::get( (int) $row['subscription_id'], 'subscription', false );
                if ( ! $subscription['data']['active'] || ! $subscription['data']['consent'] ) { Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'outbox' ) . " SET state='suppressed' WHERE id=%d", $id ) ); return array(); }
            }
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'outbox' ) . " SET state='processing',attempts=attempts+1,lease_until=%s WHERE id=%d", gmdate( 'Y-m-d H:i:s', time() + 600 ), $id ) );
            return $row;
        } );
        if ( ! $row ) { return; }
        $message = json_decode( $row['payload'], true ); $transports = apply_filters( 'katukina_message_transports', array() );
        try {
            $transport = $transports[ $message['transport'] ] ?? null;
            if ( ! $transport instanceof MessageTransport ) { throw new DomainError( 'Message transport is not configured.', 503 ); }
            $provider_id = $transport->send( $message, $row['delivery_key'] );
            if ( '' === $provider_id ) { throw new DomainError( 'Provider did not acknowledge delivery.', 502 ); }
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'outbox' ) . " SET state='sent',provider_id=%s,lease_until=NULL,last_error='',sent_at=%s WHERE id=%d", sanitize_text_field( $provider_id ), gmdate( 'Y-m-d H:i:s' ), $id ) );
        } catch ( \Throwable $error ) {
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'outbox' ) . " SET state='failed',lease_until=NULL,last_error=%s WHERE id=%d", 'Delivery failed: ' . get_class( $error ), $id ) );
            if ( (int) $row['attempts'] < 4 && function_exists( 'as_schedule_single_action' ) ) { as_schedule_single_action( time() + 60 * ( 2 ** (int) $row['attempts'] ), 'katukina_deliver', array( $id ), 'katukina', true ); }
        }
    }

    public static function campaign( int $id ): array {
        $campaign = Registry::get( $id, 'campaign' ); $template = Registry::get( (int) $campaign['data']['template_id'], 'template' );
        $mailbox = null;
        foreach ( Registry::all( 'mailbox' ) as $row ) { if ( $row['data']['active'] && (int) $row['data']['channel_id'] === (int) $campaign['data']['channel_id'] ) { $mailbox = $row; break; } }
        $transports = apply_filters( 'katukina_message_transports', array() );
        if ( ! $mailbox || ! ( ( $transports[ $mailbox['data']['provider'] ] ?? null ) instanceof MessageTransport ) ) { throw new DomainError( 'Configure an authorized channel mailbox transport before queueing a campaign.', 503 ); }
        // Every marketing message must include a working, per-subscription opt-out link.
        if ( ! str_contains( $template['data']['body'], '{{unsubscribe_url}}' ) ) { throw new DomainError( 'Campaign template must contain {{unsubscribe_url}}.' ); }
        $queued = 0; $seen = array();
        foreach ( Registry::all( 'subscription' ) as $subscription ) {
            $s = $subscription['data']; $identity = strtolower( $s['email'] );
            if ( ! $s['active'] || ! $s['consent'] || isset( $seen[ $identity ] ) || (int) $s['channel_id'] !== (int) $campaign['data']['channel_id'] || $s['purpose'] !== $campaign['data']['purpose'] || ( 'back_in_stock' === $s['purpose'] && (int) $s['form_id'] !== (int) $campaign['data']['form_id'] ) ) { continue; }
            $seen[ $identity ] = true;
            $rendered = self::render_template( $template['data'], array( 'name' => $s['name'], 'unsubscribe_url' => Subscriptions::unsubscribe_url( (int) $subscription['id'] ) ) );
            self::queue( 'campaign:' . $id . ':' . $campaign['version'] . ':' . $subscription['id'], $rendered + array( 'campaign_id' => $id, 'campaign_version' => (int) $campaign['version'], 'to' => $s['email'], 'from' => $mailbox['data']['email'], 'transport' => $mailbox['data']['provider'] ), (int) $subscription['id'] ); ++$queued;
        }
        return array( 'campaign_id' => $id, 'queued' => $queued );
    }

    public static function shipment( int $id ): array {
        $order = wc_get_order( $id ); $workflow = Workflow::get( $id );
        if ( ! $order || ! in_array( $workflow['state'], array( 'shipped', 'reshipped' ), true ) || ! $order->get_meta( '_kat_tracking_code' ) ) { throw new DomainError( 'Confirm the shipped/reshipped stage and tracking before notifying the customer.' ); }
        $mailbox = Subscriptions::mailbox( (int) $workflow['channel_id'] ); $instructions = array();
        foreach ( $order->get_items() as $line ) { $product = $line->get_product(); if ( ! $product ) { continue; } $note = NativeCatalog::value( $product, 'post_shipping_instructions' ); if ( ! $note && $product->get_parent_id() ) { $parent = wc_get_product( $product->get_parent_id() ); $note = $parent ? NativeCatalog::value( $parent, 'post_shipping_instructions' ) : ''; } if ( $note ) { $instructions[] = $line->get_name() . ': ' . $note; } }
        return self::queue( 'shipment:' . $id . ':' . hash( 'sha256', $order->get_meta( '_kat_tracking_code' ) ), array( 'order_id' => $id, 'to' => $order->get_billing_email(), 'from' => $mailbox['data']['email'], 'transport' => $mailbox['data']['provider'], 'subject' => 'Shipment for order ' . $order->get_order_number(), 'body' => 'Your order has been shipped. Tracking: ' . $order->get_meta( '_kat_tracking_code' ) . "\n" . $order->get_meta( '_kat_tracking_url' ) . "\n\n" . implode( "\n\n", $instructions ) ) );
    }

    public static function record_detail( string $kind, int $id ): void {
        if ( 'incoming' === $kind && current_user_can( 'katukina_inventory' ) ) {
            $record = Registry::get( $id, 'incoming', false ); $received = Inventory::incoming_received( $id );
            echo '<h2>Receipt progress</h2><p>Received: ' . esc_html( Database::number( $received ) ) . ' · Outstanding: ' . esc_html( Database::number( max( 0, Database::quantity( $record['data']['quantity'] ) - $received ) ) ) . '</p><p>Receive physical stock under Products → Lots → Receive lot and select this expected receipt. Planned stock is never available to sell.</p>'; return;
        }
        if ( ! current_user_can( 'katukina_crm' ) ) { return; }
        global $wpdb;
        if ( 'campaign' === $kind ) {
            echo '<h2>Campaign delivery</h2><p>Only active, consenting subscribers in this channel and purpose are eligible. A configured transport is required. Save template changes before queueing.</p><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="katukina_queue_campaign"><input type="hidden" name="campaign_id" value="' . esc_attr( $id ) . '">'; wp_nonce_field( 'kat-campaign-' . $id ); submit_button( 'Queue eligible recipients', 'secondary' ); echo '</form><h3>Delivery history</h3>';
            $rows = $wpdb->get_results( $wpdb->prepare( 'SELECT id,state,attempts,created_at,sent_at,last_error FROM ' . Database::table( 'outbox' ) . " WHERE JSON_EXTRACT(payload,'$.campaign_id')=%d ORDER BY id DESC LIMIT 100", $id ), ARRAY_A ); self::history_table( $rows );
        }
        if ( in_array( $kind, array( 'contact', 'supplier' ), true ) ) {
            $record = Registry::get( $id, $kind, false ); $column = 'supplier' === $kind ? 'supplier_id' : 'contact_id';
            echo '<h2>Related conversations</h2>'; self::history_table( $wpdb->get_results( $wpdb->prepare( 'SELECT id,mailbox_id,subject,received_at,order_id FROM ' . Database::table( 'inbox' ) . " WHERE $column=%d ORDER BY id DESC LIMIT 100", $id ), ARRAY_A ) );
            if ( 'contact' === $kind && ! empty( $record['data']['customer_id'] ) && current_user_can( 'katukina_orders' ) ) {
                echo '<h2>Customer orders</h2><ul>'; foreach ( wc_get_orders( array( 'customer_id' => (int) $record['data']['customer_id'], 'limit' => 50, 'orderby' => 'date', 'order' => 'DESC' ) ) as $order ) { echo '<li><a href="' . esc_url( $order->get_edit_order_url() ) . '">#' . esc_html( $order->get_order_number() ) . '</a> ' . esc_html( $order->get_status() ) . '</li>'; } echo '</ul>';
            }
            if ( 'supplier' === $kind && current_user_can( 'katukina_inventory' ) ) { echo '<h2>Received lots / purchasing evidence</h2>'; self::history_table( $wpdb->get_results( $wpdb->prepare( 'SELECT id,code,form_id,warehouse_id,balance,data FROM ' . Database::table( 'lots' ) . " WHERE JSON_EXTRACT(data,'$.supplier_id')=%d ORDER BY id DESC LIMIT 100", $id ), ARRAY_A ) ); }
        }
    }
    private static function history_table( array $rows ): void {
        if ( ! $rows ) { echo '<p>No linked history.</p>'; return; }
        echo '<table class="widefat striped"><thead><tr>'; foreach ( array_keys( $rows[0] ) as $key ) { echo '<th>' . esc_html( str_replace( '_', ' ', $key ) ) . '</th>'; } echo '</tr></thead><tbody>';
        foreach ( $rows as $row ) { echo '<tr>'; foreach ( $row as $value ) { echo '<td>' . esc_html( (string) $value ) . '</td>'; } echo '</tr>'; } echo '</tbody></table><p>Most recent 100 records.</p>';
    }

    public static function inbox(): void {
        if ( ! current_user_can( 'katukina_crm' ) ) { wp_die( 'CRM permission required.', '', array( 'response' => 403 ) ); }
        global $wpdb; $account = absint( $_GET['mailbox_id'] ?? 0 ); $page = max( 1, absint( $_GET['paged'] ?? 1 ) );
        echo '<div class="wrap"><h1>Unified inbox</h1><p>Mailbox synchronization runs in the background. Provider credentials belong in server-side secret storage.</p><form method="get"><input type="hidden" name="page" value="katukina-inbox"><label>Account <select name="mailbox_id"><option value="0">All accounts</option>';
        foreach ( Registry::all( 'mailbox' ) as $box ) { echo '<option value="' . esc_attr( $box['id'] ) . '" ' . selected( $account, $box['id'], false ) . '>' . esc_html( $box['data']['email'] ) . '</option>'; } echo '</select></label> <button class="button">Filter</button></form>';
        $where = $account ? $wpdb->prepare( 'mailbox_id=%d', $account ) : '1=1';
        $rows = $wpdb->get_results( 'SELECT * FROM ' . Database::table( 'inbox' ) . " WHERE $where ORDER BY received_at DESC,id DESC LIMIT 50 OFFSET " . ( $page - 1 ) * 50, ARRAY_A );
        foreach ( $rows as $row ) {
            echo '<div class="postbox" style="padding:16px"><h2>' . esc_html( $row['subject'] ) . '</h2><p>' . esc_html( $row['sender'] . ' · ' . $row['received_at'] . ' UTC' ) . '</p><details><summary>Read message</summary><pre style="white-space:pre-wrap">' . esc_html( $row['body'] ) . '</pre></details><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="katukina_message_link"><input type="hidden" name="message_id" value="' . esc_attr( $row['id'] ) . '">'; wp_nonce_field( 'kat-message-' . $row['id'] );
            foreach ( array( 'order_id' => 'Order ID', 'contact_id' => 'Contact ID', 'supplier_id' => 'Supplier ID' ) as $field => $label ) { echo '<label>' . esc_html( $label ) . ' <input type="number" min="0" name="' . esc_attr( $field ) . '" value="' . esc_attr( $row[ $field ] ) . '"></label> '; }
            echo '<button class="button">Save associations</button></form></div>';
        }
        if ( ! $rows ) { echo '<p>No synchronized messages. Configure an authorized provider in the mailbox settings.</p>'; }
        if ( $page > 1 ) { echo '<a href="' . esc_url( add_query_arg( 'paged', $page - 1 ) ) . '">Previous</a> '; } if ( count( $rows ) === 50 ) { echo '<a href="' . esc_url( add_query_arg( 'paged', $page + 1 ) ) . '">Next</a>'; }
        echo '</div>';
    }
    public static function link_message(): void {
        if ( ! current_user_can( 'katukina_crm' ) ) { wp_die( 'CRM permission required.', '', array( 'response' => 403 ) ); }
        $id = absint( $_POST['message_id'] ?? 0 ); check_admin_referer( 'kat-message-' . $id );
        try {
            $data = array(); foreach ( array( 'order_id', 'contact_id', 'supplier_id' ) as $field ) { $data[ $field ] = absint( $_POST[ $field ] ?? 0 ); }
            if ( $data['order_id'] && ( ! current_user_can( 'katukina_orders' ) || ! wc_get_order( $data['order_id'] ) ) ) { throw new DomainError( 'Order is unavailable or permission is missing.', 403 ); }
            if ( $data['contact_id'] ) { Registry::get( $data['contact_id'], 'contact' ); } if ( $data['supplier_id'] ) { Registry::get( $data['supplier_id'], 'supplier' ); }
            global $wpdb;
            if ( false === $wpdb->update( Database::table( 'inbox' ), $data, array( 'id' => $id ) ) ) { throw new DomainError( 'Message association failed.' ); }
            Database::audit( 'mail.linked', 'message:' . $id, $data ); NativeAdmin::notice( 'Message associations saved.' );
        } catch ( DomainError $error ) { NativeAdmin::notice( $error->getMessage(), 'error' ); }
        wp_safe_redirect( admin_url( 'users.php?page=katukina-inbox' ) ); exit;
    }
}
