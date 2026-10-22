<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Test-only adapter. It never calls a payment provider or marks an order paid. */
final class LocalGateway extends \WC_Payment_Gateway {
    public function __construct() {
        $this->id = 'katukina_local_test'; $this->method_title = 'Katukina — local test';
        $this->title = 'Local test — no payment'; $this->description = 'Creates an unpaid local test order. No charge or dispatch.';
        $this->enabled = Commerce::local_enabled() ? 'yes' : 'no'; $this->has_fields = false; $this->supports = array( 'products' );
    }
    public function is_available() { return Commerce::local_enabled(); }
    public function process_payment( $order_id ) {
        if ( ! Commerce::local_enabled() ) { throw new \Exception( 'Local checkout is disabled.' ); }
        $order = wc_get_order( $order_id );
        $order->update_meta_data( '_katukina_test_order', 'yes' ); $order->save();
        if ( 'on-hold' !== $order->get_status() ) { $order->update_status( 'on-hold', 'Local test. No payment collected; no dispatch requested.' ); }
        WC()->cart->empty_cart();
        return array( 'result' => 'success', 'redirect' => home_url( '/checkout?complete=1' ) );
    }
}
