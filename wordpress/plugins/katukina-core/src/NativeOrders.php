<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class NativeOrders {
    public static function register(): void {
        add_action( 'add_meta_boxes', static function () {
            if ( ! current_user_can( 'katukina_orders' ) ) { return; }
            foreach ( array_unique( array( 'shop_order', wc_get_page_screen_id( 'shop-order' ) ) ) as $screen ) {
                add_meta_box( 'katukina_order_operations', 'Picking and shipping', array( self::class, 'render' ), $screen, 'normal', 'default' );
            }
        } );
        add_action( 'woocommerce_process_shop_order_meta', array( self::class, 'save' ), 50 );
        add_action( 'admin_post_katukina_picking', array( self::class, 'picking' ) );
    }
    public static function render( $object ): void {
        $order = $object instanceof \WC_Order ? $object : wc_get_order( $object->ID );
        if ( ! $order ) { return; }
        try { $row = Workflow::get( $order->get_id() ); } catch ( DomainError $error ) { $row = null; }
        wp_nonce_field( 'katukina_order_' . $order->get_id(), 'katukina_order_nonce' );
        echo '<input type="hidden" name="kat_order[version]" value="' . esc_attr( $row['version'] ?? 0 ) . '">';
        echo '<input type="hidden" name="kat_order[key]" value="' . esc_attr( wp_generate_uuid4() ) . '">';
        echo '<p>Manage payment and order status using the standard order controls. The stage below tracks stock handling and shipping.</p><table class="form-table"><tbody>';
        echo '<tr><th><label for="kat-order-channel">Sales channel</label></th><td><select id="kat-order-channel" name="kat_order[channel_id]" ' . ( $row ? 'disabled' : '' ) . '><option value="">Select…</option>';
        foreach ( Registry::all( 'channel' ) as $channel ) { if ( $channel['data']['active'] ) { echo '<option value="' . esc_attr( $channel['id'] ) . '" ' . selected( $row['channel_id'] ?? '', $channel['id'], false ) . '>' . esc_html( $channel['data']['name'] ) . '</option>'; } }
        echo '</select></td></tr><tr><th><label for="kat-order-state">Operational stage</label></th><td><select id="kat-order-state" name="kat_order[state]">';
        $states = array( $row['state'] ?? 'ordered' => Workflow::STATES[ $row['state'] ?? 'ordered' ] );
        foreach ( Registry::all( 'transition' ) as $rule ) { if ( $row && $rule['data']['active'] && $rule['data']['from'] === $row['state'] && ( 'packed_pending' !== $rule['data']['to'] || current_user_can( 'katukina_inventory' ) ) ) { $states[ $rule['data']['to'] ] = Workflow::STATES[ $rule['data']['to'] ]; } }
        foreach ( $states as $value => $label ) { echo '<option value="' . esc_attr( $value ) . '" ' . selected( $row['state'] ?? 'ordered', $value, false ) . '>' . esc_html( $label ) . '</option>'; }
        echo '</select><p class="description">Only transitions configured in WooCommerce → Settings → Operations are available.</p></td></tr>';
        foreach ( array( 'short_note' => array( 'SHORT NOTE', $row['short_note'] ?? '' ), 'tracking_code' => array( 'Tracking number', $order->get_meta( '_kat_tracking_code' ) ), 'tracking_url' => array( 'Tracking URL', $order->get_meta( '_kat_tracking_url' ) ), 'reason' => array( 'Reason for operational change', '' ) ) as $key => [ $label, $value ] ) {
            echo '<tr><th><label for="kat-order-' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td><input class="regular-text" id="kat-order-' . esc_attr( $key ) . '" name="kat_order[' . esc_attr( $key ) . ']" value="' . esc_attr( $value ) . '" ' . ( 'short_note' === $key ? 'maxlength="240"' : '' ) . '></td></tr>';
        }
        echo '</tbody></table><p>Use the order <strong>Update</strong> button to save changes.</p>';
        if ( $row && current_user_can( 'katukina_inventory' ) ) {
            echo '<a class="button" target="_blank" href="' . esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=katukina_picking&order_id=' . $order->get_id() ), 'picking-' . $order->get_id() ) ) . '">Print picking list</a> ';
            echo '<a class="button" href="' . esc_url( admin_url( 'edit.php?post_type=product&page=katukina-lots&operation=reserve&order_id=' . $order->get_id() ) ) . '">Order lot reservations</a>';
        }
    }
    public static function save( int $order_id ): void {
        if ( ! current_user_can( 'edit_shop_order', $order_id ) || ! current_user_can( 'katukina_orders' ) || ! isset( $_POST['katukina_order_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['katukina_order_nonce'] ) ), 'katukina_order_' . $order_id ) ) { return; }
        $input = wp_unslash( $_POST['kat_order'] ?? array() );
        if ( ! is_array( $input ) ) { return; }
        try {
            try { $row = Workflow::get( $order_id ); } catch ( DomainError $error ) { $row = null; }
            $order = wc_get_order( $order_id );
            $note = sanitize_text_field( $input['short_note'] ?? '' ); $tracking = sanitize_text_field( $input['tracking_code'] ?? '' );
            $url = esc_url_raw( $input['tracking_url'] ?? '', array( 'https', 'http' ) );
            if ( ! empty( $input['tracking_url'] ) && ! $url ) { throw new DomainError( 'Invalid tracking URL.' ); }
            if ( ! $row && empty( $input['channel_id'] ) ) { if ( $note || $tracking || $url ) { throw new DomainError( 'Select a channel to save the operation.' ); } return; }
            $state = sanitize_key( $input['state'] ?? 'ordered' );
            if ( $row && $note === $row['short_note'] && $state === $row['state'] && $tracking === $order->get_meta( '_kat_tracking_code' ) && $url === $order->get_meta( '_kat_tracking_url' ) ) { return; }
            if ( 'packed_pending' === $state && ! current_user_can( 'katukina_inventory' ) ) { throw new DomainError( 'Stock deduction requires inventory permission.', 403 ); }
            $data = array( 'key' => $input['key'] ?? '', 'order_id' => $order_id, 'channel_id' => $input['channel_id'] ?? 0, 'state' => $state, 'short_note' => $note, 'version' => (int) ( $input['version'] ?? 0 ), 'reason' => $input['reason'] ?? '', 'tracking_code' => $tracking, 'tracking_url' => $url );
            Database::command( 'native-order.save', $data, static function ( $data ) use ( $row, $order ) {
                if ( ! $row ) { $assigned = Workflow::initialize( $data ); $data['version'] = $assigned['version']; }
                $result = Workflow::transition( $data );
                $order->update_meta_data( '_kat_tracking_code', $data['tracking_code'] ); $order->update_meta_data( '_kat_tracking_url', $data['tracking_url'] ); $order->save();
                return $result;
            } );
        } catch ( \Throwable $error ) { \WC_Admin_Meta_Boxes::add_error( 'Operation not saved: ' . $error->getMessage() ); }
    }
    public static function picking(): void {
        $id = absint( $_GET['order_id'] ?? 0 );
        if ( ! current_user_can( 'katukina_orders' ) || ! current_user_can( 'katukina_inventory' ) || ! current_user_can( 'edit_shop_order', $id ) ) { wp_die( 'You do not have permission to perform this action.', '', array( 'response' => 403 ) ); }
        check_admin_referer( 'picking-' . $id );
        try { $data = Workflow::picking( $id ); } catch ( DomainError $error ) { wp_die( esc_html( $error->getMessage() ) ); }
        nocache_headers(); header( 'Content-Type: text/html; charset=utf-8' );
        echo '<!doctype html><html><head><meta charset="utf-8"><title>Picking #' . esc_html( $id ) . '</title><style>body{font:16px sans-serif;max-width:900px;margin:40px auto}table{border-collapse:collapse;width:100%}td,th{padding:10px;border:1px solid #ccc;text-align:left}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Print</button><h1>Picking #' . esc_html( $id ) . '</h1><p>' . esc_html( $data['workflow']['short_note'] ) . '</p><p>' . esc_html( implode( ' · ', array_filter( $data['destination'], 'is_scalar' ) ) ) . '</p>';
        foreach ( $data['shipping_notes'] as $note ) { echo '<p>' . esc_html( $note ) . '</p>'; }
        echo '<table><tr><th>SKU</th><th>Product</th><th>Quantity</th></tr>';
        foreach ( $data['lines'] as $line ) { echo '<tr><td>' . esc_html( $line['sku'] ) . '</td><td>' . esc_html( $line['name'] ) . '</td><td>' . esc_html( $line['quantity'] ) . '</td></tr>'; }
        echo '</table><h2>Reservations</h2><table><tr><th>Lot</th><th>Line</th><th>Quantity</th><th>Status</th></tr>';
        foreach ( $data['allocations'] as $row ) { echo '<tr><td>' . esc_html( $row['code'] ) . '</td><td>' . esc_html( $row['line_id'] ) . '</td><td>' . esc_html( Database::number( (int) $row['quantity'] ) ) . '</td><td>' . esc_html( $row['state'] ) . '</td></tr>'; }
        echo '</table></body></html>'; exit;
    }
}
