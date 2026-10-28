<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Commerce {
    public static function local_enabled(): bool { return 'local' === wp_get_environment_type() && 'yes' === get_option( 'katukina_local_checkout' ); }
    public static function channel(): ?array {
        return Channels::current();
    }
    public static function public_config(): array {
        $channel = self::channel(); $countries = array(); $notices = array();
        if ( $channel ) {
            foreach ( explode( ',', $channel['data']['countries'] ) as $country ) { $countries[ $country ] = WC()->countries->get_countries()[ $country ] ?? $country; }
            foreach ( Registry::all( 'country' ) as $record ) { $data = $record['data']; if ( $data['active'] && (int) $data['channel_id'] === (int) $channel['id'] ) { $notices[ $data['country'] ] = array( 'id' => (int) $record['id'], 'version' => (int) $record['version'], 'note' => $data['checkout_note'], 'warning' => $data['checkout_warning'], 'requires_acceptance' => $data['requires_acceptance'] ); } }
        }
        return array( 'local_checkout' => self::local_enabled(), 'countries' => $countries, 'destination' => Channels::destination(), 'notices' => $notices, 'currency' => get_woocommerce_currency(), 'currencies' => $channel ? PriceLists::currencies( $channel ) : array(), 'payment_method' => self::local_enabled() ? 'katukina_local_test' : null );
    }
    public static function register(): void {
        add_action( 'plugins_loaded', static function () {
            if ( ! class_exists( '\WC_Payment_Gateway' ) ) { return; }
            require_once __DIR__ . '/LocalGateway.php';
            require_once __DIR__ . '/LocalShipping.php';
            require_once __DIR__ . '/CreditGateway.php';
            require_once __DIR__ . '/CarrierShipping.php';
            add_filter( 'woocommerce_payment_gateways', static function ( $gateways ) { $gateways[] = LocalGateway::class; return $gateways; } );
            add_filter( 'woocommerce_payment_gateways', static function ( $gateways ) { $gateways[] = CreditGateway::class; return $gateways; } );
            add_filter( 'woocommerce_shipping_methods', static function ( $methods ) { $methods['katukina_test'] = LocalShipping::class; return $methods; } );
            add_filter( 'woocommerce_shipping_methods', static function ( $methods ) { $methods['katukina_carrier'] = CarrierShipping::class; return $methods; } );
        }, 30 );
        add_action( 'rest_api_init', static function () { register_rest_route( 'katukina/v1', '/commerce/config', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => static fn() => OperationsApi::response( static fn() => self::public_config() ) ) ); } );
        add_action( 'woocommerce_init', static function () {
            foreach ( WC()->payment_gateways()->payment_gateways() as $gateway ) {
                $gateway->form_fields['katukina_countries'] = array( 'title' => 'Allowed destinations', 'type' => 'multiselect', 'class' => 'wc-enhanced-select', 'options' => WC()->countries->get_countries(), 'description' => 'Empty inherits the channel destinations.' );
                $choices = array(); foreach ( Registry::all( 'channel' ) as $channel ) { $choices[ $channel['id'] ] = $channel['data']['name']; }
                $gateway->form_fields['katukina_channels'] = array( 'title' => 'Allowed sales channels', 'type' => 'multiselect', 'class' => 'wc-enhanced-select', 'options' => $choices, 'description' => 'Empty permits all configured channels.' );
                if ( 'bacs' === $gateway->id ) { $gateway->form_fields['katukina_bank_currencies'] = array( 'title' => 'Verified bank transfer currencies', 'type' => 'multiselect', 'options' => array( 'GBP' => 'GBP', 'EUR' => 'EUR' ), 'description' => 'Enable only currencies supported by the bank accounts and instructions configured in this gateway. No conversion is performed.' ); }
            }
        } );
        add_action( 'woocommerce_blocks_loaded', static function () { woocommerce_store_api_register_endpoint_data( array( 'endpoint' => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema::IDENTIFIER, 'namespace' => 'katukina', 'schema_type' => ARRAY_A, 'schema_callback' => static fn() => array( 'payment_options' => array( 'type' => 'array', 'readonly' => true, 'items' => array( 'type' => 'object', 'properties' => array( 'id' => array( 'type' => 'string' ), 'title' => array( 'type' => 'string' ), 'description' => array( 'type' => 'string' ) ) ) ) ), 'data_callback' => static function () {
            $rows = array();
            foreach ( WC()->payment_gateways()->get_available_payment_gateways() as $gateway ) {
                // Providers with interactive fields must supply a reviewed headless integration.
                if ( ! in_array( $gateway->id, apply_filters( 'katukina_headless_gateways', array( 'katukina_local_test', 'katukina_credit', 'bacs' ) ), true ) ) { continue; }
                $rows[] = array( 'id' => $gateway->id, 'title' => wp_strip_all_tags( $gateway->get_title() ), 'description' => wp_strip_all_tags( $gateway->get_description() ) );
            }
            return array( 'payment_options' => $rows );
        } ) ); } );
        add_filter( 'woocommerce_available_payment_gateways', static function ( $gateways ) {
            $channel = self::channel(); $country = WC()->customer ? WC()->customer->get_shipping_country() : Channels::destination();
            foreach ( $gateways as $id => $gateway ) {
                $countries = (array) $gateway->get_option( 'katukina_countries', array() ); $channels = array_map( 'strval', (array) $gateway->get_option( 'katukina_channels', array() ) );
                if ( ( self::local_enabled() && ! in_array( $id, array( 'katukina_local_test', 'katukina_credit' ), true ) ) || ( $countries && ! in_array( $country, $countries, true ) ) || ( $channels && ( ! $channel || ! in_array( (string) $channel['id'], $channels, true ) ) ) ) { unset( $gateways[ $id ] ); }
            }
            return $gateways;
        } );
        // Shipping zones, enabled instances and rates are resolved by WooCommerce itself.
        // Custom lots remain authoritative. WooCommerce must not debit them on payment.
        add_filter( 'woocommerce_order_item_quantity', static function ( $quantity, $order, $item ) {
            return self::tracked_form( (int) ( $item->get_variation_id() ?: $item->get_product_id() ) ) ? 0 : $quantity;
        }, 10, 3 );
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', array( self::class, 'validate_destination' ), 10, 2 );
        add_action( 'woocommerce_store_api_checkout_order_processed', array( self::class, 'allocate' ) );
    }
    public static function tracked_form( int $product_id ): ?array {
        global $wpdb;
        $form_id = (int) get_post_meta( $product_id, '_kat_form_record_id', true );
        if ( $form_id && $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . Database::table( 'lots' ) . ' WHERE form_id=%d LIMIT 1', $form_id ) ) ) { return Registry::get( $form_id, 'form', false ); }
        return null;
    }
    private static function fail( string $message ): never { throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_checkout', $message, 400 ); }
    public static function validate_destination( $order, $request ): void {
        // Link only a cryptographically validated native WordPress session, never a client-supplied ID.
        $customer_id = wp_validate_auth_cookie( '', 'logged_in' );
        if ( $customer_id ) { $order->set_customer_id( (int) $customer_id ); }
        $channel = self::channel();
        if ( ! $channel ) { self::fail( 'Checkout is not configured for a sales channel.' ); }
        $country = $order->get_shipping_country() ?: $order->get_billing_country();
        if ( ! in_array( $country, explode( ',', $channel['data']['countries'] ), true ) ) { self::fail( 'This destination is not available for this channel.' ); }
        if ( ! in_array( $order->get_currency(), PriceLists::currencies( $channel ), true ) || $order->get_currency() !== get_woocommerce_currency() ) { self::fail( 'Checkout currency does not match the selected channel price list.' ); }
        foreach ( $order->get_items() as $line ) {
            $product = $line->get_product();
            if ( ! $product ) { self::fail( 'An item is unavailable.' ); }
            if ( ! Channels::listed( $product, (int) $channel['id'] ) ) { self::fail( 'An item is not published on this channel.' ); }
            $blocked = explode( ',', NativeCatalog::value( $product, 'blocked_countries' ) );
            if ( $product->get_parent_id() ) { $parent = wc_get_product( $product->get_parent_id() ); if ( $parent ) { $blocked = array_merge( $blocked, explode( ',', NativeCatalog::value( $parent, 'blocked_countries' ) ) ); } }
            if ( 'trash' === $product->get_status() || in_array( $country, $blocked, true ) ) { self::fail( 'An item is unavailable for this destination.' ); }
        }
        $notice = self::public_config()['notices'][ $country ] ?? null;
        if ( $notice && $notice['requires_acceptance'] ) {
            $acceptance = $request->get_param( 'extensions' )['katukina']['acceptance'] ?? array();
            if ( empty( $acceptance['accepted'] ) || (int) ( $acceptance['version'] ?? 0 ) !== $notice['version'] || (int) ( $acceptance['id'] ?? 0 ) !== $notice['id'] ) { self::fail( 'Please review and accept the current destination notice.' ); }
            $order->update_meta_data( '_katukina_destination_acceptance', array( 'country' => $country, 'notice_id' => $notice['id'], 'version' => $notice['version'], 'text' => $notice['warning'], 'accepted_at' => gmdate( DATE_ATOM ) ) );
        }
        $order->update_meta_data( '_katukina_channel_id', (int) $channel['id'] );
    }
    public static function allocate( $order ): void {
        $channel = self::channel(); if ( ! $channel ) { self::fail( 'Sales channel unavailable.' ); }
        $lines = array(); foreach ( $order->get_items() as $line ) { $lines[] = array( 'id' => $line->get_id(), 'product_id' => $line->get_variation_id() ?: $line->get_product_id(), 'quantity' => $line->get_quantity() ); }
        try {
            Database::command( 'checkout.allocate', array( 'key' => 'checkout-order-' . $order->get_id(), 'order_id' => $order->get_id(), 'channel_id' => $channel['id'], 'lines' => $lines ), static function ( $input ) use ( $order, $channel ) {
                global $wpdb; Inventory::expire();
                $workflow = null; try { $workflow = Workflow::get( $order->get_id() ); } catch ( DomainError $e ) { if ( 409 !== $e->status ) { throw $e; } }
                if ( ! $workflow ) { Workflow::initialize( array( 'order_id' => $order->get_id(), 'channel_id' => $channel['id'], 'reason' => 'Store API checkout' ) ); }
                elseif ( (int) $workflow['channel_id'] !== (int) $channel['id'] ) { throw new DomainError( 'Order belongs to another channel.' ); }
                foreach ( $input['lines'] as $line ) {
                    $form = self::tracked_form( (int) $line['product_id'] );
                    // Products without lot history use native WooCommerce stock/reservations.
                    if ( ! $form ) { continue; }
                    $remaining = Database::quantity( (string) $line['quantity'] );
                    $lots = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'lots' ) . ' WHERE form_id=%d AND company_id=%d AND warehouse_id=%d AND balance>reserved ORDER BY id', $form['id'], $channel['data']['company_id'], $channel['data']['warehouse_id'] ), ARRAY_A );
                    foreach ( $lots as $lot ) {
                        $details = json_decode( $lot['data'], true ); if ( ! empty( $details['expiry'] ) && $details['expiry'] < gmdate( 'Y-m-d' ) ) { continue; }
                        $take = min( $remaining, (int) $lot['balance'] - (int) $lot['reserved'] );
                        if ( $take <= 0 ) { continue; }
                        Inventory::reserve( array( 'lot_id' => $lot['id'], 'order_id' => $order->get_id(), 'line_id' => $line['id'], 'quantity' => Database::number( $take ), 'expires_at' => gmdate( 'Y-m-d H:i:s', time() + (int) get_option( 'katukina_reservation_minutes', 60 ) * 60 ), 'reason' => 'Checkout reservation; no physical debit' ) );
                        $remaining -= $take; if ( 0 === $remaining ) { break; }
                    }
                    if ( $remaining ) { throw new DomainError( 'An item no longer has enough available stock.' ); }
                }
                return array( 'order_id' => $order->get_id() );
            } );
            // Replayed allocation commands must not authorize payment against an expired reservation.
            global $wpdb;
            foreach ( $lines as $line ) {
                if ( ! self::tracked_form( (int) $line['product_id'] ) ) { continue; }
                $valid = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COALESCE(SUM(quantity),0) FROM ' . Database::table( 'reservations' ) . " WHERE order_id=%d AND line_id=%d AND state='active' AND expires_at>UTC_TIMESTAMP()", $order->get_id(), $line['id'] ) );
                if ( $valid !== Database::quantity( (string) $line['quantity'] ) ) { throw new DomainError( 'Stock reservation expired or changed. Ask the shop to review this order before retrying.' ); }
            }
        } catch ( DomainError $error ) { self::fail( $error->getMessage() ); }
    }
}
