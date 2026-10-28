<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Public channel context is catalog selection, never administrative authentication. */
final class Channels {
    private static ?array $context = null;
    private static bool $store_request = false;
    private static string $destination = '';
    private static mixed $original_customer = null;
    private static bool $customer_replaced = false;
    public static function destination(): string { return self::$destination; }

    public static function current(): ?array {
        if ( self::$context ) { return self::$context; }
        try { return Registry::get( (int) get_option( 'katukina_storefront_channel', 0 ), 'channel' ); }
        catch ( DomainError $error ) { return null; }
    }

    public static function resolve( string $code ): array {
        if ( '' === $code ) {
            return Registry::get( (int) get_option( 'katukina_storefront_channel', 0 ), 'channel' );
        } else {
            foreach ( Registry::all( 'channel' ) as $channel ) {
                if ( $channel['data']['active'] && ( $channel['code'] === $code || (string) $channel['id'] === $code ) ) { return $channel; }
            }
        }
        throw new DomainError( 'Sales channel unavailable.', 404 );
    }

    public static function listed( \WC_Product $product, int $channel_id ): bool {
        $ids = $product->get_meta( '_kat_channel_ids', true, 'edit' );
        if ( $product->get_parent_id() ) {
            $parent = wc_get_product( $product->get_parent_id() );
            if ( ! $parent || ! self::listed( $parent, $channel_id ) ) { return false; }
            // An unset variation inherits the parent's publication; explicit values only narrow it.
            if ( '' === $ids ) { return true; }
        }
        if ( '' === $ids ) { return $channel_id === (int) get_option( 'katukina_storefront_channel' ); }
        return in_array( (string) $channel_id, explode( ',', trim( (string) $ids, ',' ) ), true );
    }

    public static function register(): void {
        add_filter( 'rest_request_before_callbacks', static function ( $response, $handler, $request ) {
            $route = $request->get_route();
            self::$store_request = str_starts_with( $route, '/wc/store/v1/' );
            if ( ! self::$store_request && ! str_starts_with( $route, '/katukina/v1/commerce/' ) ) { return $response; }
            try {
                self::$context = self::resolve( (string) $request->get_header( 'X-Katukina-Channel' ) );
                $primary = self::resolve( '' );
                if ( (int) self::$context['data']['company_id'] !== (int) $primary['data']['company_id'] ) { throw new DomainError( 'Independent seller tax configuration has not been validated for this installation.', 409 ); }
                PriceLists::select( self::$context, (string) $request->get_header( 'X-Katukina-Currency' ) );
                self::$destination = strtoupper( (string) $request->get_header( 'X-Katukina-Destination' ) );
                if ( self::$destination && ! in_array( self::$destination, explode( ',', self::$context['data']['countries'] ), true ) ) { throw new DomainError( 'Destination unavailable for this channel.', 400 ); }
                if ( self::$destination && ( str_starts_with( $route, '/wc/store/v1/products' ) || str_starts_with( $route, '/katukina/v1/commerce/products/' ) ) ) {
                    // Request-only tax estimate. Never save an address based on a public catalog header.
                    self::$original_customer = WC()->customer;
                    self::$customer_replaced = true;
                    WC()->customer = self::$original_customer ? clone self::$original_customer : new \WC_Customer();
                    WC()->customer->set_shipping_country( self::$destination ); WC()->customer->set_billing_country( self::$destination );
                    WC()->customer->set_shipping_state( '' ); WC()->customer->set_billing_state( '' );
                    WC()->customer->set_shipping_postcode( '' ); WC()->customer->set_billing_postcode( '' );
                }
                if ( ( null !== $request->get_param( 'min_price' ) || null !== $request->get_param( 'max_price' ) || 'price' === $request->get_param( 'orderby' ) || str_contains( $route, 'collection-data' ) ) && PriceLists::custom_index() ) { throw new DomainError( 'Native price-range indexing is unavailable for this fixed price list.', 400 ); }
                if ( preg_match( '~^/wc/store/v1/products/(\d+)$~', $route, $match ) ) {
                    $product = wc_get_product( (int) $match[1] );
                    if ( ! $product || ! self::listed( $product, (int) self::$context['id'] ) || ! self::destination_allowed( $product, self::$destination ) ) { throw new DomainError( 'Product not found.', 404 ); }
                    if ( ! $product->is_type( 'variable' ) && '' === $product->get_price() ) { throw new DomainError( 'No configured price for this presentation and currency.', 404 ); }
                }
            } catch ( DomainError $error ) { return new \WP_Error( 'katukina_channel', $error->getMessage(), array( 'status' => $error->status ) ); }
            return $response;
        }, 5, 3 );
        add_filter( 'rest_post_dispatch', static function ( $response ) {
            if ( self::$context && ! is_wp_error( $response ) ) {
                $response->header( 'Cache-Control', 'private, no-store' );
                $response->header( 'Vary', 'X-Katukina-Channel, X-Katukina-Destination, X-Katukina-Currency, Cookie, Cart-Token' );
            }
            if ( self::$customer_replaced ) { WC()->customer = self::$original_customer; }
            self::$customer_replaced = false;
            PriceLists::reset();
            self::$original_customer = null; self::$context = null; self::$store_request = false; self::$destination = '';
            return $response;
        } );
        add_filter( 'posts_where', static function ( $where, $query ) {
            if ( ! self::$store_request || ! self::$context || ! array_intersect( (array) $query->get( 'post_type' ), array( 'product', 'product_variation' ) ) ) { return $where; }
            global $wpdb;
            $channel_id = (int) self::$context['id'];
            $match = $wpdb->prepare( ' AND EXISTS (SELECT 1 FROM ' . $wpdb->postmeta . " cp WHERE cp.post_id=IF({$wpdb->posts}.post_parent>0,{$wpdb->posts}.post_parent,{$wpdb->posts}.ID) AND cp.meta_key='_kat_channel_ids' AND cp.meta_value LIKE %s)", '%,' . $channel_id . ',%' );
            $default = $channel_id === (int) get_option( 'katukina_storefront_channel' ) ? " OR NOT EXISTS (SELECT 1 FROM {$wpdb->postmeta} cp WHERE cp.post_id=IF({$wpdb->posts}.post_parent>0,{$wpdb->posts}.post_parent,{$wpdb->posts}.ID) AND cp.meta_key='_kat_channel_ids' AND cp.meta_value<>'')" : '';
            $where .= ' AND (' . substr( $match, 5 ) . $default . ')';
            $where .= $wpdb->prepare( " AND ({$wpdb->posts}.post_parent=0 OR NOT EXISTS (SELECT 1 FROM {$wpdb->postmeta} vp WHERE vp.post_id={$wpdb->posts}.ID AND vp.meta_key='_kat_channel_ids' AND vp.meta_value<>'' AND vp.meta_value NOT LIKE %s))", '%,' . $channel_id . ',%' );
            if ( self::$destination ) { $where .= $wpdb->prepare( " AND NOT EXISTS (SELECT 1 FROM {$wpdb->postmeta} dp WHERE dp.post_id IN ({$wpdb->posts}.ID,{$wpdb->posts}.post_parent) AND dp.meta_key='_kat_blocked_countries' AND FIND_IN_SET(%s,dp.meta_value)>0)", self::$destination ); }
            if ( PriceLists::foreign() ) { $pattern = '%;' . $channel_id . '/' . get_woocommerce_currency() . '=%'; $where .= $wpdb->prepare( " AND EXISTS (SELECT 1 FROM {$wpdb->postmeta} pp JOIN {$wpdb->posts} pc ON pc.ID=pp.post_id WHERE (pc.ID={$wpdb->posts}.ID OR pc.post_parent={$wpdb->posts}.ID) AND pp.meta_key='_kat_channel_prices' AND CONCAT(';',pp.meta_value) LIKE %s)", $pattern ); }
            return $where;
        }, 20, 2 );
        add_action( 'woocommerce_store_api_validate_add_to_cart', array( self::class, 'validate_product' ) );
        add_action( 'woocommerce_store_api_validate_cart_item', array( self::class, 'validate_product' ) );
        add_filter( 'woocommerce_product_is_in_stock', static function ( $in_stock, $product ) {
            if ( ! self::$store_request || ! Commerce::tracked_form( $product->get_id() ) ) { return $in_stock; }
            return self::available( $product->get_id() ) > 0;
        }, 20, 2 );
        add_filter( 'woocommerce_store_api_product_quantity_maximum', static function ( $maximum, $product ) {
            return Commerce::tracked_form( $product->get_id() ) ? min( $maximum, intdiv( self::available( $product->get_id() ), 1000 ) ) : $maximum;
        }, 20, 2 );
    }

    public static function validate_product( $product ): void {
        $channel = self::current();
        if ( ! $channel || ! self::listed( $product, (int) $channel['id'] ) ) {
            throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_publication', 'This item is not available on this sales channel.', 400 );
        }
        $country = self::$destination ?: ( WC()->customer ? WC()->customer->get_shipping_country() : '' );
        if ( ! self::destination_allowed( $product, $country ) ) { throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_destination', 'This item is unavailable for the selected destination.', 400 ); }
        if ( WC()->session ) {
            $currency = WC()->session->get( 'katukina_currency', '' );
            if ( $currency && $currency !== get_woocommerce_currency() && WC()->cart && ! WC()->cart->is_empty() ) { throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_currency', 'Empty your bag before changing its currency.', 409 ); }
            if ( '' === $product->get_price() ) { throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_price', 'This presentation has no price in the selected currency.', 409 ); }
            WC()->session->set( 'katukina_currency', get_woocommerce_currency() );
            $bound = (int) WC()->session->get( 'katukina_channel_id', 0 );
            if ( $bound && $bound !== (int) $channel['id'] ) {
                throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_cart_channel', 'Start a separate cart for this channel.', 409 );
            }
            WC()->session->set( 'katukina_channel_id', (int) $channel['id'] );
        }
    }
    public static function destination_allowed( \WC_Product $product, string $country ): bool {
        if ( ! $country ) { return true; }
        if ( in_array( $country, explode( ',', NativeCatalog::value( $product, 'blocked_countries' ) ), true ) ) { return false; }
        $parent = $product->get_parent_id() ? wc_get_product( $product->get_parent_id() ) : null;
        return ! $parent || ! in_array( $country, explode( ',', NativeCatalog::value( $parent, 'blocked_countries' ) ), true );
    }

    /** Integer thousandths; excludes expired lots and stock belonging to other owners. */
    public static function available( int $product_id, ?array $channel = null ): int {
        $channel ??= self::current(); $form = Commerce::tracked_form( $product_id );
        if ( ! $channel || ! $form ) { return 0; }
        global $wpdb; $total = 0;
        $lots = $wpdb->get_results( $wpdb->prepare( 'SELECT balance,reserved,data FROM ' . Database::table( 'lots' ) . ' WHERE form_id=%d AND company_id=%d AND warehouse_id=%d', $form['id'], $channel['data']['company_id'], $channel['data']['warehouse_id'] ), ARRAY_A );
        foreach ( $lots as $lot ) {
            $data = json_decode( $lot['data'], true );
            if ( empty( $data['expiry'] ) || $data['expiry'] >= gmdate( 'Y-m-d' ) ) { $total += (int) $lot['balance'] - (int) $lot['reserved']; }
        }
        return max( 0, $total );
    }
}
