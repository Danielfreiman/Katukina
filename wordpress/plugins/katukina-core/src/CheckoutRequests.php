<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Serializes checkout retries per authenticated cart token, without storing address payloads. */
final class CheckoutRequests {
    private static ?array $context = null;
    public static function register(): void {
        add_filter( 'rest_dispatch_request', static fn( $response, $request, $route, $handler ) => self::before( $response, $handler, $request ), 10, 4 );
        add_filter( 'rest_request_after_callbacks', array( self::class, 'after' ), 10, 3 );
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', static function ( $order ) {
            if ( self::$context ) { $order->update_meta_data( '_katukina_checkout_key', self::$context['key'] ); $order->update_meta_data( '_katukina_checkout_fingerprint', self::$context['fingerprint'] ); }
        } );
        add_action( 'shutdown', array( self::class, 'unlock' ) );
    }
    public static function before( $response, $handler, $request ) {
        if ( null !== $response || '/wc/store/v1/checkout' !== $request->get_route() || 'POST' !== $request->get_method() ) { return $response; }
        $token = (string) $request->get_header( 'Cart-Token' );
        $payload = \Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils::get_cart_token_payload( $token );
        $request_key = (string) $request->get_header( 'X-Katukina-Request' );
        if ( empty( $payload['user_id'] ) || ! preg_match( '/^[a-zA-Z0-9_-]{16,100}$/D', $request_key ) ) { return new \WP_Error( 'katukina_checkout_identity', 'A valid cart and checkout request key are required.', array( 'status' => 401 ) ); }
        global $wpdb;
        $identity = hash( 'sha256', (string) $payload['user_id'] ); $key = 'checkout-' . hash( 'sha256', $identity . ':' . $request_key );
        $fingerprint = hash( 'sha256', wp_json_encode( Database::canonical( $request->get_json_params() ) ) );
        $lock = 'kat-checkout-' . substr( $identity, 0, 40 );
        if ( '1' !== (string) $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK(%s,15)', $lock ) ) ) { return new \WP_Error( 'katukina_checkout_busy', 'Checkout is already processing. Retry the same request shortly.', array( 'status' => 409 ) ); }
        self::$context = compact( 'key', 'fingerprint', 'lock' );
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'commands' ) . ' WHERE idempotency_key=%s', $key ), ARRAY_A );
        if ( $row && ! hash_equals( $row['fingerprint'], $fingerprint ) ) { self::unlock(); return new \WP_Error( 'katukina_checkout_conflict', 'This request key was used for a different checkout.', array( 'status' => 409 ) ); }
        if ( $row && null !== $row['result'] ) { $result = json_decode( $row['result'], true ); self::unlock(); return new \WP_REST_Response( $result ); }
        // Recover an interrupted response after the test gateway saved the order.
        $orders = wc_get_orders( array( 'limit' => 1, 'meta_query' => array( array( 'key' => '_katukina_checkout_key', 'value' => $key ) ) ) );
        if ( $orders && 'yes' === $orders[0]->get_meta( '_katukina_test_order' ) && 'on-hold' === $orders[0]->get_status() ) {
            $result = array( 'order_id' => $orders[0]->get_id(), 'status' => 'on-hold', 'payment_result' => array( 'payment_status' => 'success' ) ); self::save( $result ); self::unlock(); return new \WP_REST_Response( $result );
        }
        if ( ! $row ) { Database::query( $wpdb->prepare( 'INSERT INTO ' . Database::table( 'commands' ) . ' (idempotency_key,fingerprint,created_at) VALUES (%s,%s,%s)', $key, $fingerprint, gmdate( 'Y-m-d H:i:s' ) ) ); }
        return $response;
    }
    private static function save( array $data ): void {
        global $wpdb;
        if ( self::$context ) { Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'commands' ) . ' SET result=%s WHERE idempotency_key=%s', wp_json_encode( $data ), self::$context['key'] ) ); }
    }
    public static function after( $response, $handler, $request ) {
        if ( ! self::$context || '/wc/store/v1/checkout' !== $request->get_route() ) { return $response; }
        if ( ! is_wp_error( $response ) ) {
            $rest = rest_ensure_response( $response ); $data = $rest->get_data();
            if ( $rest->get_status() < 300 && ! empty( $data['order_id'] ) ) { self::save( array_intersect_key( $data, array_flip( array( 'order_id', 'order_number', 'status', 'payment_result' ) ) ) ); }
        }
        self::unlock(); return $response;
    }
    public static function unlock(): void { global $wpdb; if ( self::$context ) { $wpdb->get_var( $wpdb->prepare( 'SELECT RELEASE_LOCK(%s)', self::$context['lock'] ) ); self::$context = null; } }
}
