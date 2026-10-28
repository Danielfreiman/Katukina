<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Implementations must authenticate raw payloads before returning any normalized event. */
interface PaymentProvider {
    public function gateway_id(): string;
    /** @return array{event_id:string,type:string,order_id:int,transaction_id:string,amount:string,currency:string,minor_unit:int} */
    public function verify_event( string $raw_body, array $headers ): array;
}

final class Payments {
    public static function register(): void {
        add_action( 'woocommerce_before_order_object_save', static function ( $order ) { if ( '' === $order->get_meta( '_kat_currency_precision', true, 'edit' ) ) { $order->update_meta_data( '_kat_currency_precision', wc_get_price_decimals() ); } } );
        add_action( 'rest_api_init', static function () {
            register_rest_route( 'katukina/v1', '/payments/(?P<provider>[a-z0-9_-]+)/events', array(
                'methods' => 'POST', 'permission_callback' => '__return_true',
                'callback' => static fn( $r ) => OperationsApi::response( static function () use ( $r ) {
                    // Empty by default. No generic secret or guessed live provider is installed.
                    $providers = apply_filters( 'katukina_payment_providers', array() );
                    $provider = $providers[ $r['provider'] ] ?? null;
                    if ( ! $provider instanceof PaymentProvider ) { throw new DomainError( 'Payment integration is not configured.', 503 ); }
                    if ( strlen( $r->get_body() ) > 65536 ) { throw new DomainError( 'Payment event is too large.', 413 ); }
                    return self::process( $r['provider'], $provider, $r->get_body(), $r->get_headers() );
                } ),
            ) );
        } );
    }

    public static function process( string $name, PaymentProvider $provider, string $body, array $headers ): array {
        // The adapter owns provider-specific signatures, timestamps and replay windows.
        $event = $provider->verify_event( $body, $headers );
        foreach ( array( 'event_id', 'type', 'order_id', 'transaction_id', 'amount', 'currency', 'minor_unit' ) as $field ) { if ( ! isset( $event[ $field ] ) || ! is_scalar( $event[ $field ] ) ) { throw new DomainError( 'Malformed payment event.' ); } }
        if ( ! in_array( $event['type'], array( 'paid', 'refunded', 'pending' ), true ) || ! preg_match( '/^[A-Za-z0-9_.:-]{1,120}$/D', $event['event_id'] ) || ! preg_match( '/^[A-Za-z0-9_.:-]{1,120}$/D', $event['transaction_id'] ) || ! preg_match( '/^[1-9]\d{0,11}$/D', (string) $event['amount'] ) || ! preg_match( '/^[0-6]$/D', (string) $event['minor_unit'] ) ) { throw new DomainError( 'Unsupported payment event.' ); }
        $event['provider'] = $name; $event['key'] = 'payment-event-' . hash( 'sha256', $name . ':' . $event['event_id'] );
        return Database::command( 'payment.event', $event, static function ( $data ) use ( $provider ) {
            $order = wc_get_order( Registry::positive_id( $data['order_id'] ) );
            if ( ! $order || $order->get_payment_method() !== $provider->gateway_id() || $order->get_currency() !== $data['currency'] ) { throw new DomainError( 'Payment order, gateway or currency mismatch.', 409 ); }
            $amount = (int) $data['amount']; $precision = (int) $data['minor_unit'];
            if ( $precision !== Finance::precision( $order ) ) { throw new DomainError( 'Payment currency precision does not match the order.', 409 ); }
            $total = Finance::to_minor( $order->get_total(), $precision );
            if ( $amount > $total || ( 'paid' === $data['type'] && $amount !== $total ) ) { throw new DomainError( 'Payment amount differs from the expected order amount.', 409 ); }
            $reference = 'provider-' . hash( 'sha256', $data['provider'] . ':' . $data['transaction_id'] );
            if ( 'paid' === $data['type'] ) {
                if ( $order->is_paid() ) {
                    if ( $order->get_transaction_id() !== $data['transaction_id'] ) { throw new DomainError( 'Order already has another payment.', 409 ); }
                } else {
                    if ( ! $order->needs_payment() ) { throw new DomainError( 'Order is not awaiting payment.', 409 ); }
                    Finance::record( array( 'kind' => 'payment', 'order_id' => $order->get_id(), 'currency' => $data['currency'], 'minor_unit' => $precision, 'amount' => (string) $amount, 'reference' => $reference, 'reason' => 'Authenticated provider payment' ) );
                    $order->payment_complete( $data['transaction_id'] );
                }
            } elseif ( 'refunded' === $data['type'] ) {
                global $wpdb;
                $prior = $wpdb->get_row( $wpdb->prepare( 'SELECT order_id,amount,currency,minor_unit FROM ' . Database::table( 'money' ) . " WHERE kind='payment' AND reference=%s", $reference ), ARRAY_A );
                if ( $prior ) {
                    if ( (int) $prior['order_id'] !== $order->get_id() || (int) $prior['amount'] !== -$amount || $prior['currency'] !== $data['currency'] || (int) $prior['minor_unit'] !== $precision ) { throw new DomainError( 'Refund transaction conflicts with the recorded event.', 409 ); }
                    return array( 'order_id' => $order->get_id(), 'event_id' => $data['event_id'], 'state' => 'refunded' );
                }
                $remaining = $total - Finance::to_minor( $order->get_total_refunded(), $precision );
                if ( $amount > $remaining || ! $order->get_date_paid() ) { throw new DomainError( 'Refund exceeds the remaining paid amount.', 409 ); }
                Finance::record( array( 'kind' => 'payment', 'order_id' => $order->get_id(), 'currency' => $data['currency'], 'minor_unit' => $precision, 'amount' => (string) -$amount, 'reference' => $reference, 'reason' => 'Authenticated provider refund; physical returns require inspection' ) );
                $refund = wc_create_refund( array( 'order_id' => $order->get_id(), 'amount' => Finance::from_minor( $amount, $precision ), 'reason' => 'Provider refund ' . $data['transaction_id'], 'refund_payment' => false, 'restock_items' => false ) );
                if ( is_wp_error( $refund ) ) { throw new DomainError( 'The native refund could not be recorded.', 409 ); }
            }
            return array( 'order_id' => $order->get_id(), 'event_id' => $data['event_id'], 'state' => $data['type'] );
        } );
    }
}
