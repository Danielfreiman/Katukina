<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Explicit fixed prices extend native products; no exchange rate or currency relabeling. */
final class PriceLists {
    private static string $currency = '';
    public static function currencies( array $channel ): array {
        return array_values( array_unique( array_filter( array_merge( array( $channel['data']['currency'] ), explode( ',', $channel['data']['currencies'] ?? '' ) ) ) ) );
    }
    public static function select( array $channel, string $currency ): void {
        $currency = strtoupper( $currency ?: $channel['data']['currency'] );
        if ( ! in_array( $currency, self::currencies( $channel ), true ) ) { throw new DomainError( 'Currency is not enabled for this channel.', 400 ); }
        if ( $currency !== get_option( 'woocommerce_currency' ) && ! in_array( $currency, array( 'GBP', 'EUR' ), true ) ) { throw new DomainError( 'Additional price lists currently support GBP and EUR.', 409 ); }
        self::$currency = $currency;
    }
    public static function reset(): void { self::$currency = ''; }
    public static function active(): bool { return '' !== self::$currency; }
    public static function foreign(): bool { return self::active() && self::$currency !== get_option( 'woocommerce_currency' ); }
    public static function custom_index(): bool {
        if ( self::foreign() ) { return true; }
        global $wpdb; $needle = '%;' . (int) ( Channels::current()['id'] ?? 0 ) . '/' . self::$currency . '=%';
        return (bool) $wpdb->get_var( $wpdb->prepare( "SELECT meta_id FROM {$wpdb->postmeta} WHERE meta_key='_kat_channel_prices' AND CONCAT(';',meta_value) LIKE %s LIMIT 1", $needle ) );
    }
    public static function parse( string $text ): array {
        $rows = array();
        foreach ( array_filter( array_map( 'trim', explode( ';', $text ) ) ) as $entry ) {
            if ( ! preg_match( '~^(\d+)/([A-Z]{3})=(\d{1,9}(?:\.\d{1,2})?)$~D', $entry, $match ) ) { throw new DomainError( 'Fixed prices: use channel ID/currency=amount, separated by semicolons; for example 12/GBP=9.50.' ); }
            $channel = Registry::get( (int) $match[1], 'channel', false );
            if ( ! in_array( $match[2], self::currencies( $channel ), true ) ) { throw new DomainError( 'Enable the price currency in the channel first.' ); }
            $key = $match[1] . '/' . $match[2]; if ( isset( $rows[ $key ] ) ) { throw new DomainError( 'Duplicate channel/currency fixed price.' ); }
            $rows[ $key ] = Finance::from_minor( Finance::to_minor( $match[3], 2 ), 2 );
        }
        return $rows;
    }
    public static function price( $original, $product ) {
        if ( ! self::active() ) { return $original; }
        $channel = Channels::current(); if ( ! $channel ) { return ''; }
        // Saved values were validated on native product save. Reading does not require a still-active unrelated channel.
        $needle = (int) $channel['id'] . '/' . self::$currency . '=';
        foreach ( explode( ';', (string) $product->get_meta( '_kat_channel_prices', true, 'edit' ) ) as $entry ) { $entry = trim( $entry ); if ( str_starts_with( $entry, $needle ) ) { return substr( $entry, strlen( $needle ) ); } }
        return self::foreign() ? '' : $original;
    }
    public static function register(): void {
        add_filter( 'woocommerce_variation_is_visible', static function ( $visible, $id, $parent, $variation ) { return ! self::active() ? $visible : $visible && Channels::listed( $variation, (int) ( Channels::current()['id'] ?? 0 ) ) && Channels::destination_allowed( $variation, Channels::destination() ) && '' !== $variation->get_price(); }, 30, 4 );
        add_filter( 'woocommerce_currency', static fn( $currency ) => self::$currency ?: $currency );
        add_filter( 'wc_get_price_decimals', static fn( $precision ) => self::active() && in_array( self::$currency, array( 'GBP', 'EUR' ), true ) ? 2 : $precision );
        foreach ( array( 'woocommerce_product_get_price', 'woocommerce_product_get_regular_price', 'woocommerce_product_variation_get_price', 'woocommerce_product_variation_get_regular_price', 'woocommerce_variation_prices_price', 'woocommerce_variation_prices_regular_price' ) as $hook ) { add_filter( $hook, array( self::class, 'price' ), 30, 2 ); }
        foreach ( array( 'woocommerce_product_get_sale_price', 'woocommerce_product_variation_get_sale_price', 'woocommerce_variation_prices_sale_price' ) as $hook ) { add_filter( $hook, static function ( $price, $product ) { return self::foreign() || ( self::active() && self::price( '__missing__', $product ) !== '__missing__' ) ? '' : $price; }, 30, 2 ); }
        add_filter( 'woocommerce_get_variation_prices_hash', static function ( $hash ) { if ( self::active() ) { $hash[] = self::$currency; $hash[] = Channels::current()['id'] ?? 0; $hash[] = Channels::destination(); } return $hash; } );
        add_filter( 'woocommerce_coupon_is_valid', static function ( $valid, $coupon ) { if ( self::foreign() && ( 'percent' !== $coupon->get_discount_type() || $coupon->get_minimum_amount() || $coupon->get_maximum_amount() ) ) { throw new \Exception( 'This coupon has store-currency amounts and cannot be used in the selected currency.' ); } return $valid; }, 20, 2 );
        add_filter( 'woocommerce_cart_shipping_packages', static function ( $packages ) { foreach ( $packages as &$package ) { $package['katukina_currency'] = get_woocommerce_currency(); $package['katukina_channel'] = Channels::current()['id'] ?? 0; } return $packages; } );
        add_filter( 'woocommerce_package_rates', static function ( $rates ) { if ( ! self::foreign() ) { return $rates; } return array_filter( $rates, static fn( $rate ) => 'katukina_carrier' === $rate->get_method_id() ); }, 30 );
        add_filter( 'woocommerce_available_payment_gateways', static function ( $gateways ) {
            if ( ! self::foreign() ) { return $gateways; }
            $supported = apply_filters( 'katukina_multicurrency_gateways', array( 'katukina_credit', 'katukina_local_test' ), self::$currency );
            if ( isset( $gateways['bacs'] ) && in_array( self::$currency, (array) $gateways['bacs']->get_option( 'katukina_bank_currencies', array() ), true ) ) { $supported[] = 'bacs'; }
            return array_intersect_key( $gateways, array_flip( $supported ) );
        }, 30 );
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', static function ( $order ) {
            $order->update_meta_data( '_kat_currency_context', array( 'base' => get_option( 'woocommerce_currency' ), 'price_list' => get_woocommerce_currency(), 'display' => get_woocommerce_currency(), 'transaction' => $order->get_currency(), 'settlement' => null ) );
        }, 25 );
    }
}
