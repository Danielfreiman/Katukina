<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Finance {
    public static function precision( \WC_Order $order ): int {
        $saved = $order->get_meta( '_kat_currency_precision', true, 'edit' );
        return '' === $saved ? wc_get_price_decimals() : (int) $saved;
    }
    public static function to_minor( string $amount, int $precision ): int {
        if ( $precision < 0 || $precision > 6 || ! preg_match( '/^\d{1,12}(?:\.\d{1,6})?$/D', $amount ) ) { throw new DomainError( 'Invalid monetary amount.' ); }
        [ $whole, $fraction ] = array_pad( explode( '.', $amount ), 2, '' );
        if ( strlen( rtrim( $fraction, '0' ) ) > $precision ) { throw new DomainError( 'Amount cannot be represented in this currency precision.' ); }
        $value = (int) $whole * ( 10 ** $precision ) + (int) str_pad( substr( $fraction, 0, $precision ), $precision, '0' );
        if ( $value > 999999999999 ) { throw new DomainError( 'Amount exceeds the ledger limit.' ); }
        return $value;
    }
    public static function from_minor( int $amount, int $precision ): string {
        if ( $precision < 0 || $precision > 6 ) { throw new DomainError( 'Invalid monetary precision.' ); }
        $digits = str_pad( (string) abs( $amount ), $precision + 1, '0', STR_PAD_LEFT );
        return ( $amount < 0 ? '-' : '' ) . ( $precision ? substr( $digits, 0, -$precision ) . '.' . substr( $digits, -$precision ) : $digits );
    }
    public static function credit_balance( int $customer, string $currency, int $precision ): int {
        global $wpdb;
        return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COALESCE(SUM(amount),0) FROM ' . Database::table( 'money' ) . " WHERE kind='credit' AND customer_id=%d AND currency=%s AND minor_unit=%d", $customer, $currency, $precision ) );
    }
    public static function redeem( int $order_id, int $customer ): array {
        return Database::command( 'credit.redeem', array( 'key' => 'credit-checkout-order-' . $order_id, 'order_id' => $order_id, 'customer_id' => $customer ), static function ( $input ) {
            $order = wc_get_order( $input['order_id'] );
            if ( ! $order || ! $input['customer_id'] || $order->get_customer_id() !== $input['customer_id'] || 'katukina_credit' !== $order->get_payment_method() || ! $order->needs_payment() ) { throw new DomainError( 'This order cannot use the customer credit balance.', 409 ); }
            $precision = self::precision( $order ); $amount = self::to_minor( $order->get_total(), $precision );
            if ( $amount < 1 || self::credit_balance( $input['customer_id'], $order->get_currency(), $precision ) < $amount ) { throw new DomainError( 'Credit balance is insufficient for this order.', 409 ); }
            $result = self::record( array( 'kind' => 'credit', 'customer_id' => $input['customer_id'], 'order_id' => $order->get_id(), 'currency' => $order->get_currency(), 'minor_unit' => $precision, 'amount' => (string) -$amount, 'reference' => 'credit-order-' . $order->get_id(), 'reason' => 'Store credit payment in native checkout' ) );
            $order->payment_complete( 'credit-order-' . $order->get_id() );
            return $result + array( 'order_id' => $order->get_id() );
        } );
    }
    public static function record( array $input ): array {
        global $wpdb;
        $kind = (string) ( $input['kind'] ?? '' ); $currency = strtoupper( $input['currency'] ?? '' );
        if ( ! in_array( $kind, array( 'credit', 'payment' ), true ) || ! isset( get_woocommerce_currencies()[ $currency ] ) ) { throw new DomainError( 'Enter a valid entry type and currency.' ); }
        $amount = (string) ( $input['amount'] ?? '' );
        if ( ! preg_match( '/^-?[1-9]\d{0,11}$/D', $amount ) ) { throw new DomainError( 'Amount must be a non-zero integer in currency minor units.' ); }
        if ( ! isset( $input['minor_unit'] ) || ! preg_match( '/^[0-6]$/D', (string) $input['minor_unit'] ) ) { throw new DomainError( 'Enter currency precision from 0 to 6 decimal places.' ); }
        $precision = (int) $input['minor_unit'];
        $existing = $wpdb->get_var( $wpdb->prepare( 'SELECT minor_unit FROM ' . Database::table( 'money' ) . ' WHERE currency=%s LIMIT 1', $currency ) );
        if ( null !== $existing && (int) $existing !== $precision ) { throw new DomainError( 'Precision differs from existing entries in this currency.', 409 ); }
        $customer = (int) ( $input['customer_id'] ?? 0 ); $order_id = (int) ( $input['order_id'] ?? 0 );
        if ( 'credit' === $kind && ( ! $customer || ! get_user_by( 'id', $customer ) ) ) { throw new DomainError( 'Customer not found.' ); }
        $order = $order_id ? wc_get_order( $order_id ) : false;
        if ( ( 'payment' === $kind || $order_id ) && ( ! $order || $order->get_currency() !== $currency ) ) { throw new DomainError( 'Order not found or currency does not match.' ); }
        if ( 'credit' === $kind && $order && $order->get_customer_id() !== $customer ) { throw new DomainError( 'The order belongs to another customer.' ); }
        if ( 'payment' === $kind ) { $customer = $order->get_customer_id(); }
        $where = 'credit' === $kind ? $wpdb->prepare( "kind='credit' AND customer_id=%d AND currency=%s", $customer, $currency ) : $wpdb->prepare( "kind='payment' AND order_id=%d AND currency=%s", $order_id, $currency );
        $balance = (int) $wpdb->get_var( 'SELECT COALESCE(SUM(amount),0) FROM ' . Database::table( 'money' ) . ' WHERE ' . $where );
        if ( $balance + (int) $amount < 0 ) { throw new DomainError( 'The debit or refund exceeds the recorded balance.', 409 ); }
        $reference = sanitize_text_field( $input['reference'] ?? '' );
        if ( strlen( $reference ) < 3 || strlen( $reference ) > 100 ) { throw new DomainError( 'Enter a unique external reference of 3 to 100 characters.' ); }
        $id = Database::insert( 'money', array( 'kind' => $kind, 'customer_id' => $customer, 'order_id' => $order_id, 'currency' => $currency, 'minor_unit' => $precision, 'amount' => (int) $amount, 'reference' => $reference, 'reason' => Database::reason( $input ), 'actor_id' => get_current_user_id(), 'created_at' => gmdate( 'Y-m-d H:i:s' ) ) );
        return array( 'id' => $id, 'balance' => $balance + (int) $amount, 'currency' => $currency, 'minor_unit' => $precision );
    }
}
