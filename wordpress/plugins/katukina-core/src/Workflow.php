<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Workflow {
    const STATES = array(
        'in_basket' => 'IN PROGRESS (IN BASKET)', 'ordered' => 'ORDERED', 'pending_action' => 'PENDING ACTION',
        'ready_to_process' => 'READY TO PROCESS', 'packed_pending' => 'PACKED AND PENDING', 'ready_to_ship' => 'READY TO SHIP',
        'shipped' => 'SHIPPED', 'delivered' => 'DELIVERED', 'picked_up' => 'PICKED UP', 'being_returned' => 'BEING RETURNED',
        'returned' => 'RETURNED', 'reshipped' => 'RESHIPPED', 'lost' => 'LOST',
    );
    public static function get( int $id ): array {
        global $wpdb;
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'orders' ) . ' WHERE order_id=%d', $id ), ARRAY_A );
        if ( ! $row ) { throw new DomainError( 'Assign a channel in the WooCommerce order editor first.', 409 ); }
        return $row;
    }
    public static function initialize( array $input ): array {
        $id = Registry::positive_id( $input['order_id'] ?? 0 ); $order = wc_get_order( $id );
        $channel = Registry::get( Registry::positive_id( $input['channel_id'] ?? 0 ), 'channel' );
        if ( ! $order || $order->get_currency() !== $channel['data']['currency'] ) { throw new DomainError( 'Order not found or its currency differs from the channel currency.' ); }
        Database::reason( $input );
        Database::insert( 'orders', array( 'order_id' => $id, 'channel_id' => $channel['id'], 'state' => 'ordered' ) );
        Database::audit( 'order.assigned', 'order:' . $id, array( 'channel_id' => $channel['id'], 'reason' => Database::reason( $input ) ) );
        return self::get( $id );
    }
    public static function transition( array $input ): array {
        global $wpdb;
        $id = Registry::positive_id( $input['order_id'] ?? 0 ); $row = self::get( $id );
        if ( (int) $row['version'] !== (int) ( $input['version'] ?? 0 ) ) { throw new DomainError( 'Another session changed this order. Reload before saving.', 409 ); }
        $state = (string) ( $input['state'] ?? $row['state'] ); $reason = Database::reason( $input );
        if ( ! isset( self::STATES[ $state ] ) ) { throw new DomainError( 'Unknown stage.' ); }
        if ( $state !== $row['state'] ) {
            $allowed = false;
            foreach ( Registry::all( 'transition' ) as $rule ) { if ( $rule['data']['active'] && $rule['data']['from'] === $row['state'] && $rule['data']['to'] === $state ) { $allowed = true; break; } }
            if ( ! $allowed ) { throw new DomainError( 'This transition has not been authorised in settings.', 409 ); }
            if ( 'packed_pending' === $state ) { Inventory::pack( $id, $reason ); }
        }
        $note = sanitize_text_field( $input['short_note'] ?? $row['short_note'] );
        if ( mb_strlen( $note ) > 240 ) { throw new DomainError( 'SHORT NOTE must be no longer than 240 characters.' ); }
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'orders' ) . ' SET state=%s,short_note=%s,version=version+1 WHERE order_id=%d', $state, $note, $id ) );
        Database::audit( 'order.transition', 'order:' . $id, array( 'from' => $row['state'], 'to' => $state, 'reason' => $reason, 'short_note' => $note ) );
        return self::get( $id );
    }
    public static function picking( int $id ): array {
        $order = wc_get_order( $id );
        if ( ! $order ) { throw new DomainError( 'Order not found.', 404 ); }
        $workflow = self::get( $id ); $country = $order->get_shipping_country() ?: $order->get_billing_country();
        $notes = array();
        foreach ( Registry::all( 'country' ) as $rule ) { if ( $rule['data']['active'] && (int) $rule['data']['channel_id'] === (int) $workflow['channel_id'] && $rule['data']['country'] === $country ) { $notes[] = $rule['data']['shipping_note']; } }
        $lines = array();
        foreach ( $order->get_items() as $line ) { $product = $line->get_product(); $lines[] = array( 'line_id' => $line->get_id(), 'name' => $line->get_name(), 'sku' => $product ? $product->get_sku() : '', 'quantity' => $line->get_quantity() ); }
        global $wpdb;
        $allocations = $wpdb->get_results( $wpdb->prepare( 'SELECT r.*,l.code,l.data lot_details FROM ' . Database::table( 'reservations' ) . ' r JOIN ' . Database::table( 'lots' ) . ' l ON l.id=r.lot_id WHERE r.order_id=%d', $id ), ARRAY_A );
        return array( 'order_id' => $id, 'workflow' => $workflow, 'destination' => $order->get_address( 'shipping' ), 'shipping_notes' => $notes, 'lines' => $lines, 'allocations' => $allocations );
    }
    public static function register(): void {
        add_filter( 'manage_woocommerce_page_wc-orders_columns', static function ( $columns ) { $columns['katukina_operation'] = 'Katukina / SHORT NOTE'; return $columns; } );
        add_action( 'manage_woocommerce_page_wc-orders_custom_column', static function ( $column, $order ) {
            if ( 'katukina_operation' !== $column || ! current_user_can( 'katukina_orders' ) ) { return; }
            try { $row = self::get( $order->get_id() ); echo esc_html( self::STATES[ $row['state'] ] ) . '<br><small>' . esc_html( $row['short_note'] ) . '</small>'; }
            catch ( DomainError $e ) { echo '<small>Channel not assigned</small>'; }
        }, 10, 2 );
    }
}
