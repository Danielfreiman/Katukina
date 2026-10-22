<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class OperationsApi {
    const ACTIONS = array(
        'receive' => array( 'inventory', Inventory::class, 'receive' ), 'adjust' => array( 'inventory', Inventory::class, 'adjust' ),
        'reserve' => array( 'inventory', Inventory::class, 'reserve' ), 'release' => array( 'inventory', Inventory::class, 'release' ),
        'expire' => array( 'inventory', Inventory::class, 'expire' ), 'produce' => array( 'inventory', Inventory::class, 'produce' ),
        'reverse-production' => array( 'inventory', Inventory::class, 'reverse_production' ), 'assign-order' => array( 'orders', Workflow::class, 'initialize' ),
        'transition' => array( 'orders', Workflow::class, 'transition' ), 'money' => array( 'finance', Finance::class, 'record' ),
    );
    public static function response( callable $callback ): mixed {
        try { $response = rest_ensure_response( $callback() ); $response->header( 'Cache-Control', 'private, no-store' ); return $response; }
        catch ( DomainError $error ) { return new \WP_Error( 'katukina_conflict', $error->getMessage(), array( 'status' => $error->status ) ); }
        catch ( \Throwable $error ) { error_log( 'Katukina operation failed: ' . get_class( $error ) ); return new \WP_Error( 'katukina_error', 'The operation was rolled back. Check the local diagnostic log.', array( 'status' => 500 ) ); }
    }
    public static function register(): void {
        add_action( 'rest_api_init', static function () {
            $route = static function ( $path, $methods, $permission, $callback ) {
                register_rest_route( 'katukina/v1', $path, array( 'methods' => $methods, 'permission_callback' => $permission, 'callback' => static fn( $request ) => self::response( static fn() => $callback( $request ) ) ) );
            };
            $route( '/schema', 'GET', static fn() => current_user_can( 'manage_woocommerce' ), static function () {
                $reports = array( 'lots', 'stock_levels', 'movements', 'reservations', 'production', 'reconciliation', 'orders', 'order_volume', 'money', 'credit_balances', 'accounting', 'audit' );
                return array(
                    'entities' => array_filter( Registry::definitions(), static fn( $definition, $kind ) => ! in_array( $kind, array( 'item', 'form', 'publication', 'tax', 'payment_method' ), true ) && current_user_can( $definition['capability'] ), ARRAY_FILTER_USE_BOTH ),
                    'states' => Workflow::STATES,
                    'actions' => array_keys( array_filter( self::ACTIONS, static fn( $action ) => current_user_can( 'katukina_' . $action[0] ) ) ),
                    'reports' => array_values( array_filter( $reports, static fn( $type ) => current_user_can( self::report_capability( $type ) ) ) ),
                );
            } );
            $route( '/references/(?P<kind>[a-z_]+)', 'GET', static function ( $r ) {
                if ( ! current_user_can( 'manage_woocommerce' ) || ! isset( Registry::definitions()[ $r['kind'] ] ) ) { return false; }
                if ( current_user_can( Registry::definitions()[ $r['kind'] ]['capability'] ) ) { return true; }
                $dependencies = array( 'company' => array( 'catalog', 'inventory', 'orders' ), 'warehouse' => array( 'inventory', 'orders' ), 'channel' => array( 'catalog', 'orders', 'crm' ), 'form' => array( 'inventory', 'crm' ), 'item' => array( 'inventory' ), 'supplier' => array( 'catalog', 'inventory' ), 'contact' => array( 'inventory' ), 'carrier' => array( 'orders' ) );
                foreach ( $dependencies[ $r['kind'] ] ?? array() as $cap ) { if ( current_user_can( 'katukina_' . $cap ) ) { return true; } } return false;
            }, static function ( $r ) {
                $result = Registry::list( $r['kind'], (int) ( $r['page'] ?? 1 ) );
                $result['rows'] = array_map( static fn( $row ) => array( 'id' => $row['id'], 'code' => $row['code'], 'data' => array( 'name' => $row['data']['name'], 'active' => $row['data']['active'] ) ), $result['rows'] ); return $result;
            } );
            $record_permission = static function ( $r ) { $kind = $r['kind']; return isset( Registry::definitions()[ $kind ] ) && current_user_can( Registry::definitions()[ $kind ]['capability'] ); };
            $route( '/settings', 'GET', static fn() => current_user_can( 'katukina_settings' ), static fn() => array( 'channel_id' => (int) get_option( 'katukina_storefront_channel', 0 ), 'reservation_minutes' => (int) get_option( 'katukina_reservation_minutes', 0 ), 'local_checkout' => Commerce::local_enabled(), 'local_environment' => 'local' === wp_get_environment_type() ) );
            $route( '/settings', 'POST', static fn() => current_user_can( 'katukina_settings' ), static fn( $r ) => Database::command( 'settings.save', $r->get_json_params() ?? array(), static function ( $input ) {
                $channel = Registry::get( Registry::positive_id( $input['channel_id'] ?? 0 ), 'channel' );
                if ( $channel['data']['currency'] !== get_woocommerce_currency() || $channel['data']['display_currency'] !== get_woocommerce_currency() ) { throw new DomainError( 'The storefront requires payment and display currencies to match the WooCommerce currency. Currency conversion is not available.' ); }
                $minutes = (int) ( $input['reservation_minutes'] ?? 0 ); if ( $minutes < 1 || $minutes > 10080 ) { throw new DomainError( 'Reservation: enter between 1 and 10080 minutes.' ); }
                $reason = Database::reason( $input );
                if ( ! empty( $input['local_checkout'] ) && 'local' !== wp_get_environment_type() ) { throw new DomainError( 'Test checkout is only available in the local environment.' ); }
                update_option( 'katukina_storefront_channel', (int) $channel['id'] ); update_option( 'katukina_reservation_minutes', $minutes ); update_option( 'katukina_local_checkout', ! empty( $input['local_checkout'] ) ? 'yes' : 'no' );
                \WC_Cache_Helper::get_transient_version( 'shipping', true ); Database::audit( 'storefront.settings', 'storefront', array( 'channel_id' => $channel['id'], 'reservation_minutes' => $minutes, 'reason' => $reason ) );
                return array( 'saved' => true );
            } ) );
            $route( '/records/(?P<kind>[a-z_]+)', 'GET', $record_permission, static function ( $r ) {
                if ( in_array( $r['kind'], array( 'item', 'form', 'publication', 'tax', 'payment_method' ), true ) ) { throw new DomainError( 'Use the WooCommerce product, variation and settings APIs.', 410 ); }
                return Registry::list( $r['kind'], (int) ( $r['page'] ?? 1 ), sanitize_text_field( $r['search'] ?? '' ) );
            } );
            $route( '/records/(?P<kind>[a-z_]+)', 'POST', $record_permission, static function ( $r ) {
                $input = $r->get_json_params() ?? array(); $input['kind'] = $r['kind'];
                return Database::command( 'record.save', $input, array( Registry::class, 'save' ) );
            } );
            $route( '/command/(?P<action>[a-z-]+)', 'POST', static function ( $r ) { return isset( self::ACTIONS[ $r['action'] ] ) && current_user_can( 'katukina_' . self::ACTIONS[ $r['action'] ][0] ); }, static function ( $r ) {
                $action = self::ACTIONS[ $r['action'] ];
                if ( 'transition' === $r['action'] && 'packed_pending' === ( $r['state'] ?? '' ) && ! current_user_can( 'katukina_inventory' ) ) { throw new DomainError( 'Stock deduction requires inventory permission.', 403 ); }
                return Database::command( $r['action'], $r->get_json_params() ?? array(), array( $action[1], $action[2] ) );
            } );
            $route( '/report/(?P<type>[a-z_]+)', 'GET', static fn( $r ) => current_user_can( self::report_capability( $r['type'] ) ), static fn( $r ) => self::report( $r['type'], (int) ( $r['page'] ?? 1 ), (int) ( $r['order_id'] ?? 0 ), (int) ( $r['lot_id'] ?? 0 ) ) );
            $route( '/picking/(?P<id>\d+)', 'GET', static fn() => current_user_can( 'katukina_orders' ) && current_user_can( 'katukina_inventory' ), static fn( $r ) => Workflow::picking( (int) $r['id'] ) );
            $route( '/import/(?P<kind>[a-z_]+)', 'POST', $record_permission, static function ( $r ) {
                $input = $r->get_json_params() ?? array(); $input['kind'] = $r['kind'];
                if ( empty( $input['commit'] ) ) { return self::import( $input, false ); }
                return Database::command( 'records.import', $input, static fn( $data ) => self::import( $data, true ) );
            } );
            $route( '/campaign/(?P<id>\d+)/preview', 'GET', static fn() => current_user_can( 'katukina_crm' ), static function ( $r ) {
                $campaign = Registry::get( (int) $r['id'], 'campaign' )['data']; $rows = array();
                foreach ( Registry::all( 'subscription' ) as $record ) {
                    $s = $record['data'];
                    if ( $s['active'] && $s['consent'] && $s['purpose'] === $campaign['purpose'] && (int) $s['channel_id'] === (int) $campaign['channel_id'] && ( 'marketing' === $s['purpose'] || (int) $s['form_id'] === (int) $campaign['form_id'] ) ) { $rows[ strtolower( $s['email'] ) ] = array( 'email' => $s['email'], 'name' => $s['name'] ); }
                }
                return array( 'template' => Registry::get( (int) $campaign['template_id'], 'template' )['data'], 'recipients' => array_values( $rows ), 'delivery' => 'draft_only' );
            } );
        } );
        add_action( 'katukina_expire_reservations', static function () {
            try { Database::command( 'expire', array( 'key' => 'cron-' . wp_generate_uuid4() ), array( Inventory::class, 'expire' ) ); }
            catch ( \Throwable $error ) { error_log( 'Katukina: reservation expiration failed.' ); }
        } );
        add_action( 'init', static function () { if ( ! wp_next_scheduled( 'katukina_expire_reservations' ) ) { wp_schedule_event( time() + 300, 'hourly', 'katukina_expire_reservations' ); } } );
    }
    public static function report_capability( string $type ): string {
        return match ( $type ) { 'lots', 'stock_levels', 'movements', 'reservations', 'production', 'reconciliation' => 'katukina_inventory', 'orders' => 'katukina_orders', 'money', 'credit_balances', 'accounting' => 'katukina_finance', default => 'katukina_reports' };
    }
    public static function report( string $type, int $page = 1, int $order_id = 0, int $lot_id = 0 ): array {
        global $wpdb; $page = max( 1, $page ); $offset = ( $page - 1 ) * 100;
        if ( 'stock_levels' === $type ) {
            $base = 'SELECT form_id,company_id,warehouse_id,SUM(balance) physical,SUM(reserved) reserved,SUM(balance-reserved) available FROM ' . Database::table( 'lots' ) . ' GROUP BY form_id,company_id,warehouse_id';
            $rows = $wpdb->get_results( $base . " ORDER BY form_id LIMIT 100 OFFSET $offset", ARRAY_A );
            foreach ( $rows as &$row ) { $form = Registry::get( (int) $row['form_id'], 'form', false ); $row['sku'] = $form['code']; $row['name'] = $form['data']['name']; $row['unit'] = $form['data']['unit']; $row['low_stock'] = ! empty( $form['data']['low_stock'] ) && (int) $row['available'] <= Database::quantity( $form['data']['low_stock'] ); foreach ( array( 'physical', 'reserved', 'available' ) as $key ) { $row[ $key ] = Database::number( (int) $row[ $key ] ); } }
            return array( 'rows' => $rows, 'total' => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM (' . $base . ') stock' ) );
        }
        if ( 'order_volume' === $type ) {
            $groups = array(); $batch = 1;
            do { $result = wc_get_orders( array( 'limit' => 100, 'page' => $batch++, 'paginate' => true, 'type' => 'shop_order' ) );
                foreach ( $result->orders as $order ) { $channel = (int) $order->get_meta( '_katukina_channel_id' ); try { $channel = (int) Workflow::get( $order->get_id() )['channel_id']; } catch ( DomainError $e ) {} $month = $order->get_date_created()?->date( 'Y-m' ); $test = 'yes' === $order->get_meta( '_katukina_test_order' ); $key = implode( ':', array( $month, $channel, $order->get_currency(), $order->get_status(), (int) $test ) ); $groups[ $key ] ??= array( 'month' => $month, 'channel_id' => $channel, 'currency' => $order->get_currency(), 'status' => $order->get_status(), 'test_orders' => $test, 'count' => 0 ); $groups[ $key ]['count']++; }
            } while ( $batch <= $result->max_num_pages );
            return array( 'rows' => array_slice( array_values( $groups ), $offset, 100 ), 'total' => count( $groups ) );
        }
        if ( 'reconciliation' === $type ) { $rows = Inventory::reconcile(); return array( 'rows' => $rows, 'total' => count( $rows ) ); }
        if ( 'credit_balances' === $type ) { $rows = $wpdb->get_results( 'SELECT customer_id,currency,minor_unit,SUM(amount) balance FROM ' . Database::table( 'money' ) . " WHERE kind='credit' GROUP BY customer_id,currency,minor_unit ORDER BY customer_id LIMIT 100 OFFSET $offset", ARRAY_A ); return array( 'rows' => $rows, 'total' => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM (SELECT customer_id,currency FROM ' . Database::table( 'money' ) . " WHERE kind='credit' GROUP BY customer_id,currency) balances" ) ); }
        if ( in_array( $type, array( 'orders', 'accounting' ), true ) ) {
            $args = array( 'limit' => 100, 'page' => $page, 'paginate' => true, 'orderby' => 'date', 'order' => 'DESC', 'type' => 'shop_order' );
            if ( $order_id ) { $args['include'] = array( $order_id ); }
            $query = wc_get_orders( $args ); $rows = array();
            foreach ( $query->orders as $order ) {
                $row = array( 'order_id' => $order->get_id(), 'created_at' => $order->get_date_created()?->date( DATE_ATOM ), 'financial_status' => $order->get_status(), 'currency' => $order->get_currency(), 'total' => $order->get_total(), 'tax' => $order->get_total_tax(), 'shipping' => $order->get_shipping_total(), 'refunded' => $order->get_total_refunded(), 'payment_method' => $order->get_payment_method(), 'transaction_id' => $order->get_transaction_id() );
                try { $row += Workflow::get( $order->get_id() ); } catch ( DomainError $e ) { $row += array( 'channel_id' => null, 'state' => null, 'short_note' => '', 'version' => null ); }
                $row['lines'] = array(); foreach ( $order->get_items() as $line ) { $row['lines'][] = array( 'id' => $line->get_id(), 'product_id' => $line->get_variation_id() ?: $line->get_product_id(), 'name' => $line->get_name(), 'quantity' => $line->get_quantity() ); }
                $rows[] = $row;
            }
            return array( 'rows' => $rows, 'total' => $query->total );
        }
        if ( ! in_array( $type, array( 'lots', 'movements', 'reservations', 'production', 'money', 'audit' ), true ) ) { throw new DomainError( 'Unknown report.' ); }
        $where = '1=1';
        if ( $order_id && in_array( $type, array( 'reservations', 'money' ), true ) ) { $where .= $wpdb->prepare( ' AND order_id=%d', $order_id ); }
        if ( $lot_id && in_array( $type, array( 'movements', 'reservations' ), true ) ) { $where .= $wpdb->prepare( ' AND lot_id=%d', $lot_id ); }
        $rows = $wpdb->get_results( 'SELECT * FROM ' . Database::table( $type ) . " WHERE $where ORDER BY id DESC LIMIT 100 OFFSET $offset", ARRAY_A );
        foreach ( $rows as &$row ) {
            if ( isset( $row['data'] ) ) { $row['data'] = json_decode( $row['data'], true ); }
            if ( isset( $row['detail'] ) ) { $row['detail'] = json_decode( $row['detail'], true ); }
            if ( 'lots' === $type ) {
                $form = Registry::get( (int) $row['form_id'], 'form', false ); $row['form_name'] = $form['data']['name']; $row['unit'] = $form['data']['unit'];
                $row['available'] = (int) $row['balance'] - (int) $row['reserved'];
                $row['low_stock'] = ! empty( $form['data']['low_stock'] ) && $row['available'] <= Database::quantity( $form['data']['low_stock'] );
                foreach ( array( 'balance', 'reserved', 'available' ) as $quantity ) { $row[ $quantity . '_display' ] = Database::number( (int) $row[ $quantity ] ); }
            }
        }
        return array( 'rows' => $rows, 'total' => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . Database::table( $type ) . " WHERE $where" ) );
    }
    public static function import( array $input, bool $commit ): array {
        $rows = $input['rows'] ?? array(); $kind = $input['kind'];
        if ( in_array( $kind, array( 'item', 'form', 'publication', 'tax', 'payment_method' ), true ) ) { throw new DomainError( 'Use the WooCommerce product importer or settings.', 410 ); }
        if ( ! is_array( $rows ) || count( $rows ) < 1 || count( $rows ) > 500 ) { throw new DomainError( 'Importe de 1 a 500 linhas por lote.' ); }
        $errors = array(); $seen = array();
        foreach ( $rows as $index => $row ) {
            try {
                $code = $row['code'] ?? '';
                if ( ! preg_match( '/^[\pL\pN_.:-]{1,100}$/uD', $code ) || isset( $seen[ $code ] ) ) { throw new DomainError( 'Invalid or duplicate reference code in the file.' ); }
                $seen[ $code ] = true;
                Registry::validate( $kind, $row['data'] ?? array() );
                if ( ! empty( $row['id'] ) ) { $existing = Registry::get( (int) $row['id'], $kind, false ); if ( (int) $existing['version'] !== (int) ( $row['version'] ?? 0 ) ) { throw new DomainError( 'Version mismatch.' ); } }
                else { global $wpdb; if ( $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . Database::table( 'records' ) . ' WHERE kind=%s AND code=%s', $kind, $code ) ) ) { throw new DomainError( 'Reference code already exists. Provide id and version to update it.' ); } }
            } catch ( DomainError $e ) { $errors[] = array( 'line' => $index + 1, 'error' => $e->getMessage() ); }
        }
        if ( $errors || ! $commit ) { if ( $commit && $errors ) { throw new DomainError( 'Import rejected. Run validation and correct all rows.', 409 ); } return array( 'valid' => ! $errors, 'count' => count( $rows ), 'errors' => $errors, 'committed' => false ); }
        $ids = array(); foreach ( $rows as $row ) { $row['kind'] = $kind; $ids[] = Registry::save( $row )['id']; }
        return array( 'committed' => true, 'count' => count( $ids ), 'ids' => $ids );
    }
}
