<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Inventory {
    public static function lot( int $id ): array {
        global $wpdb;
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'lots' ) . ' WHERE id=%d FOR UPDATE', $id ), ARRAY_A );
        if ( ! $row ) { throw new DomainError( 'Lot not found.', 404 ); }
        $row['data'] = json_decode( $row['data'], true );
        return $row;
    }
    public static function create_lot( array $input ): array {
        $form = Registry::get( Registry::positive_id( $input['form_id'] ?? 0 ), 'form' );
        if ( ! empty( $form['data']['product_id'] ) ) { $product = wc_get_product( $form['data']['product_id'] ); if ( $product && $product->managing_stock() ) { throw new DomainError( 'Disable WooCommerce stock management for this product before enabling the Katukina lot ledger.' ); } }
        if ( empty( $product ) ) { throw new DomainError( 'Select an existing WooCommerce product or variation.' ); }
        $warehouse = Registry::get( Registry::positive_id( $input['warehouse_id'] ?? 0 ), 'warehouse' );
        Registry::get( (int) $warehouse['data']['company_id'], 'company' );
        $code = trim( (string) ( $input['code'] ?? '' ) );
        if ( ! preg_match( '/^[\pL\pN_.:-]{1,100}$/uD', $code ) ) { throw new DomainError( 'Enter a lot code without spaces.' ); }
        $data = array( 'location' => sanitize_text_field( $input['location'] ?? '' ), 'supplier_id' => (int) ( $input['supplier_id'] ?? 0 ), 'supplier_lot' => sanitize_text_field( $input['supplier_lot'] ?? '' ), 'expiry' => (string) ( $input['expiry'] ?? '' ), 'cost_minor' => (string) ( $input['cost_minor'] ?? '' ), 'currency' => strtoupper( $input['currency'] ?? '' ), 'source_lot_id' => (int) ( $input['source_lot_id'] ?? 0 ) );
        if ( $data['supplier_id'] ) { Registry::get( $data['supplier_id'], 'supplier' ); }
        if ( $data['expiry'] ) { $date = \DateTimeImmutable::createFromFormat( '!Y-m-d', $data['expiry'] ); if ( ! $date || $date->format( 'Y-m-d' ) !== $data['expiry'] ) { throw new DomainError( 'Invalid lot expiry date.' ); } }
        if ( '' !== $data['cost_minor'] && ( ! preg_match( '/^\d{1,12}$/D', $data['cost_minor'] ) || ! isset( get_woocommerce_currencies()[ $data['currency'] ] ) ) ) { throw new DomainError( 'Enter the total lot cost in minor units and a valid currency.' ); }
        $id = Database::insert( 'lots', array( 'code' => $code, 'form_id' => $form['id'], 'company_id' => $warehouse['data']['company_id'], 'warehouse_id' => $warehouse['id'], 'data' => wp_json_encode( $data ) ) );
        update_post_meta( $product->get_id(), '_kat_lot_identity', NativeCatalog::identity( $product ) );
        return self::lot( $id );
    }
    public static function move( int $lot_id, int $quantity, int $reserved_delta, string $action, string $reference, string $reason ): void {
        global $wpdb;
        $lot = self::lot( $lot_id ); $form = Registry::get( (int) $lot['form_id'], 'form', false )['data'];
        $balance = (int) $lot['balance'] + $quantity; $reserved = (int) $lot['reserved'] + $reserved_delta;
        if ( $balance < 0 || $reserved < 0 || $reserved > $balance || $balance > 999999999000 ) { throw new DomainError( 'Stock is insufficient, reserved or outside the allowed limit.', 409 ); }
        if ( 'unit' === $form['unit'] && ( $quantity % 1000 !== 0 || $reserved_delta % 1000 !== 0 ) ) { throw new DomainError( 'Stock units must be whole numbers.' ); }
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'lots' ) . ' SET balance=%d,reserved=%d WHERE id=%d', $balance, $reserved, $lot_id ) );
        Database::insert( 'movements', array( 'lot_id' => $lot_id, 'quantity' => $quantity, 'reserved_delta' => $reserved_delta, 'action' => $action, 'reference' => $reference, 'reason' => $reason, 'actor_id' => get_current_user_id(), 'created_at' => gmdate( 'Y-m-d H:i:s' ) ) );
    }
    public static function receive( array $input ): array {
        $reason = Database::reason( $input ); $quantity = Database::quantity( $input['quantity'] ?? '' );
        $input['source_lot_id'] = 0;
        $lot = self::create_lot( $input );
        self::move( (int) $lot['id'], $quantity, 0, 'receipt', (string) ( $input['reference'] ?? $lot['code'] ), $reason );
        return self::lot( (int) $lot['id'] );
    }
    public static function adjust( array $input ): array {
        $id = Registry::positive_id( $input['lot_id'] ?? 0 ); $reason = Database::reason( $input );
        self::move( $id, Database::quantity( $input['quantity'] ?? '', true ), 0, 'adjustment', sanitize_text_field( $input['reference'] ?? '' ), $reason );
        return self::lot( $id );
    }
    public static function expire( array $input = array() ): array {
        global $wpdb;
        $rows = $wpdb->get_results( 'SELECT * FROM ' . Database::table( 'reservations' ) . " WHERE state='active' AND expires_at <= UTC_TIMESTAMP()", ARRAY_A );
        foreach ( $rows as $row ) { self::release_one( $row, 'expired', 'The reservation has expired.' ); }
        return array( 'expired' => count( $rows ) );
    }
    private static function release_one( array $row, string $state, string $reason ): void {
        global $wpdb;
        self::move( (int) $row['lot_id'], 0, -(int) $row['quantity'], $state, 'reservation:' . $row['id'], $reason );
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'reservations' ) . ' SET state=%s WHERE id=%d', $state, $row['id'] ) );
    }
    public static function release( array $input ): array {
        global $wpdb;
        $id = Registry::positive_id( $input['reservation_id'] ?? 0 );
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'reservations' ) . ' WHERE id=%d', $id ), ARRAY_A );
        if ( ! $row || 'active' !== $row['state'] ) { throw new DomainError( 'The reservation is not active.', 409 ); }
        self::release_one( $row, 'released', Database::reason( $input ) );
        return array( 'id' => $id, 'state' => 'released' );
    }
    public static function reserve( array $input ): array {
        global $wpdb;
        self::expire(); $reason = Database::reason( $input );
        $lot = self::lot( Registry::positive_id( $input['lot_id'] ?? 0 ) );
        $form = Registry::get( (int) $lot['form_id'], 'form' )['data'];
        $product = ! empty( $form['product_id'] ) ? wc_get_product( $form['product_id'] ) : null;
        if ( $product && $product->managing_stock() ) { throw new DomainError( 'This product has two stock authorities. Review WooCommerce stock management before reserving.', 409 ); }
        if ( 'packaged' !== $form['type'] ) { throw new DomainError( 'Repack bulk stock before reserving it for sale.' ); }
        if ( ! empty( $lot['data']['expiry'] ) && $lot['data']['expiry'] < gmdate( 'Y-m-d' ) ) { throw new DomainError( 'The lot has expired.', 409 ); }
        $order_id = Registry::positive_id( $input['order_id'] ?? 0 ); $order = wc_get_order( $order_id );
        $workflow = Workflow::get( $order_id );
        if ( $workflow['packed_at'] ) { throw new DomainError( 'The order is already packed.', 409 ); }
        $channel = Registry::get( (int) $workflow['channel_id'], 'channel' )['data'];
        Registry::get( (int) $channel['company_id'], 'company' ); Registry::get( (int) $channel['warehouse_id'], 'warehouse' );
        if ( (int) $channel['company_id'] !== (int) $lot['company_id'] || (int) $channel['warehouse_id'] !== (int) $lot['warehouse_id'] ) { throw new DomainError( 'The lot does not belong to the channel company and warehouse.', 409 ); }
        $line_id = Registry::positive_id( $input['line_id'] ?? 0 ); $line = $order ? $order->get_item( $line_id ) : null;
        if ( ! $line instanceof \WC_Order_Item_Product || (int) ( $line->get_variation_id() ?: $line->get_product_id() ) !== (int) $form['product_id'] ) { throw new DomainError( 'The order item does not match the packaging.' ); }
        $quantity = Database::quantity( $input['quantity'] ?? '' );
        $allocated = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COALESCE(SUM(quantity),0) FROM ' . Database::table( 'reservations' ) . " WHERE order_id=%d AND line_id=%d AND state IN ('active','fulfilled')", $order_id, $line_id ) );
        if ( $allocated + $quantity > Database::quantity( (string) $line->get_quantity() ) ) { throw new DomainError( 'The reservation exceeds the order item quantity.', 409 ); }
        $expires = (string) ( $input['expires_at'] ?? '' ); $date = \DateTimeImmutable::createFromFormat( '!Y-m-d H:i:s', $expires, new \DateTimeZone( 'UTC' ) );
        if ( ! $date || $date->format( 'Y-m-d H:i:s' ) !== $expires || $date->getTimestamp() <= time() || $date->getTimestamp() > time() + 365 * DAY_IN_SECONDS ) { throw new DomainError( 'Enter a future expiry in UTC (YYYY-MM-DD HH:MM:SS), within one year.' ); }
        $id = Database::insert( 'reservations', array( 'lot_id' => $lot['id'], 'order_id' => $order_id, 'line_id' => $line_id, 'quantity' => $quantity, 'state' => 'active', 'expires_at' => $expires, 'created_at' => gmdate( 'Y-m-d H:i:s' ) ) );
        self::move( (int) $lot['id'], 0, $quantity, 'reserve', 'reservation:' . $id, $reason );
        return array( 'id' => $id, 'state' => 'active', 'quantity' => $quantity );
    }
    public static function pack( int $order_id, string $reason ): void {
        global $wpdb;
        self::expire(); $workflow = Workflow::get( $order_id );
        $channel = Registry::get( (int) $workflow['channel_id'], 'channel' )['data'];
        Registry::get( (int) $channel['company_id'], 'company' ); Registry::get( (int) $channel['warehouse_id'], 'warehouse' );
        if ( $workflow['packed_at'] ) { throw new DomainError( 'Stock has already been deducted for this order.', 409 ); }
        $order = wc_get_order( $order_id );
        if ( ! $order || in_array( $order->get_status(), array( 'cancelled', 'refunded', 'failed', 'trash' ), true ) ) { throw new DomainError( 'This order cannot be packed.', 409 ); }
        $rows = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'reservations' ) . " WHERE order_id=%d AND state='active'", $order_id ), ARRAY_A );
        $totals = array();
        foreach ( $rows as $row ) {
            $lot = self::lot( (int) $row['lot_id'] );
            if ( ! empty( $lot['data']['expiry'] ) && $lot['data']['expiry'] < gmdate( 'Y-m-d' ) ) { throw new DomainError( 'The reservation contains an expired lot.', 409 ); }
            $form = Registry::get( (int) $lot['form_id'], 'form' )['data']; $line = $order->get_item( (int) $row['line_id'] );
            if ( ! $line instanceof \WC_Order_Item_Product || (int) ( $line->get_variation_id() ?: $line->get_product_id() ) !== (int) $form['product_id'] ) { throw new DomainError( 'The order changed after the reservation.', 409 ); }
            $totals[ $row['line_id'] ] = ( $totals[ $row['line_id'] ] ?? 0 ) + (int) $row['quantity'];
        }
        foreach ( $order->get_items() as $id => $line ) {
            $product = $line->get_product();
            if ( $product && $product->is_virtual() ) { continue; }
            if ( $product && ! Commerce::tracked_form( $product->get_id() ) ) { continue; }
            if ( ( $totals[ $id ] ?? 0 ) !== Database::quantity( (string) $line->get_quantity() ) ) { throw new DomainError( 'All physical order items require complete, active reservations.', 409 ); }
        }
        foreach ( $rows as $row ) {
            self::move( (int) $row['lot_id'], -(int) $row['quantity'], -(int) $row['quantity'], 'packed', 'order:' . $order_id, $reason );
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'reservations' ) . " SET state='fulfilled' WHERE id=%d", $row['id'] ) );
        }
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'orders' ) . ' SET packed_at=%s WHERE order_id=%d', gmdate( 'Y-m-d H:i:s' ), $order_id ) );
    }
    public static function produce( array $input ): array {
        $reason = Database::reason( $input ); $source = self::lot( Registry::positive_id( $input['input_lot_id'] ?? 0 ) );
        $bulk = Registry::get( (int) $source['form_id'], 'form' )['data']; $target = Registry::get( Registry::positive_id( $input['form_id'] ?? 0 ), 'form' )['data'];
        if ( 'bulk' !== $bulk['type'] || 'packaged' !== $target['type'] || (int) $bulk['item_id'] !== (int) $target['item_id'] || $bulk['unit'] !== $target['content_unit'] ) { throw new DomainError( 'The source must be bulk stock of the same master item and match the packaging content unit.' ); }
        if ( ! empty( $source['data']['expiry'] ) && $source['data']['expiry'] < gmdate( 'Y-m-d' ) ) { throw new DomainError( 'An expired lot cannot be repacked.', 409 ); }
        $produced = Database::quantity( $input['quantity'] ?? '' );
        if ( $produced % 1000 !== 0 ) { throw new DomainError( 'Repacking requires whole packs.' ); }
        $loss = empty( $input['loss'] ) || '0' === (string) $input['loss'] || '0.000' === (string) $input['loss'] ? 0 : Database::quantity( $input['loss'] );
        $consumed = intdiv( $produced, 1000 ) * Database::quantity( $target['content_quantity'] ) + $loss;
        if ( ! is_int( $consumed ) || $consumed > 999999999000 ) { throw new DomainError( 'The output quantity exceeds the limit.' ); }
        $input['warehouse_id'] = $source['warehouse_id']; $input['source_lot_id'] = $source['id'];
        $input['supplier_id'] = $source['data']['supplier_id']; $input['supplier_lot'] = $source['data']['supplier_lot'];
        // A derived lot cannot outlive its source; no extension is inferred.
        $input['expiry'] = $source['data']['expiry'];
        $output = self::create_lot( $input );
        $id = Database::insert( 'production', array( 'input_lot_id' => $source['id'], 'output_lot_id' => $output['id'], 'consumed' => $consumed, 'produced' => $produced, 'loss' => $loss, 'state' => 'completed', 'reason' => $reason, 'created_at' => gmdate( 'Y-m-d H:i:s' ) ) );
        self::move( (int) $source['id'], -$consumed, 0, 'production_input', 'production:' . $id, $reason );
        self::move( (int) $output['id'], $produced, 0, 'production_output', 'production:' . $id, $reason );
        return array( 'id' => $id, 'output_lot_id' => (int) $output['id'], 'consumed' => $consumed, 'produced' => $produced, 'loss' => $loss, 'remaining' => (int) self::lot( (int) $source['id'] )['balance'] );
    }
    public static function reverse_production( array $input ): array {
        global $wpdb; $id = Registry::positive_id( $input['production_id'] ?? 0 ); $reason = Database::reason( $input );
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'production' ) . ' WHERE id=%d', $id ), ARRAY_A );
        if ( ! $row || 'completed' !== $row['state'] ) { throw new DomainError( 'This repacking run cannot be reversed.', 409 ); }
        $output = self::lot( (int) $row['output_lot_id'] );
        $movements = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . Database::table( 'movements' ) . ' WHERE lot_id=%d', $output['id'] ) );
        if ( (int) $output['balance'] !== (int) $row['produced'] || (int) $output['reserved'] !== 0 || 1 !== $movements ) { throw new DomainError( 'The output lot already has movements. A supervised stock adjustment is required.', 409 ); }
        self::move( (int) $output['id'], -(int) $row['produced'], 0, 'production_reverse', 'production:' . $id, $reason );
        self::move( (int) $row['input_lot_id'], (int) $row['consumed'], 0, 'production_reverse', 'production:' . $id, $reason );
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'production' ) . " SET state='reversed' WHERE id=%d", $id ) );
        return array( 'id' => $id, 'state' => 'reversed' );
    }
    public static function reconcile(): array {
        global $wpdb;
        return $wpdb->get_results( 'SELECT l.id,l.code,l.balance,l.reserved,COALESCE(m.physical,0) ledger_balance,COALESCE(m.reserved,0) ledger_reserved,COALESCE(r.quantity,0) active_reserved FROM ' . Database::table( 'lots' ) . ' l LEFT JOIN (SELECT lot_id,SUM(quantity) physical,SUM(reserved_delta) reserved FROM ' . Database::table( 'movements' ) . ' GROUP BY lot_id) m ON m.lot_id=l.id LEFT JOIN (SELECT lot_id,SUM(quantity) quantity FROM ' . Database::table( 'reservations' ) . " WHERE state='active' GROUP BY lot_id) r ON r.lot_id=l.id HAVING balance <> ledger_balance OR reserved <> ledger_reserved OR reserved <> active_reserved OR balance < reserved OR reserved < 0", ARRAY_A );
    }
}
