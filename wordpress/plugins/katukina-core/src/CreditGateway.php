<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Native gateway: explicit, full-balance redemption, never an untaxed negative fee. */
final class CreditGateway extends \WC_Payment_Gateway {
    public function __construct() {
        $this->id = 'katukina_credit'; $this->method_title = 'Store credit';
        $this->method_description = 'Pay the complete order using an authenticated customer’s credit in the order currency. Mixed tender is not supported.';
        $this->supports = array( 'products' ); $this->has_fields = false;
        $this->form_fields = array( 'enabled' => array( 'title' => 'Enable', 'type' => 'checkbox', 'label' => 'Enable store credit payments', 'default' => 'no' ), 'title' => array( 'title' => 'Title', 'type' => 'text', 'default' => 'Store credit' ) );
        $this->init_settings(); $this->enabled = $this->get_option( 'enabled', 'no' ); $this->title = $this->get_option( 'title', 'Store credit' );
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    }
    public function is_available() {
        $customer = get_current_user_id() ?: (int) wp_validate_auth_cookie( '', 'logged_in' );
        if ( 'yes' !== $this->enabled || ! $customer || ! WC()->cart ) { return false; }
        $amount = Finance::to_minor( (string) WC()->cart->get_total( 'edit' ), wc_get_price_decimals() );
        return $amount > 0 && Finance::credit_balance( $customer, get_woocommerce_currency(), wc_get_price_decimals() ) >= $amount;
    }
    public function process_payment( $order_id ) {
        $customer = get_current_user_id() ?: (int) wp_validate_auth_cookie( '', 'logged_in' );
        if ( 'yes' !== $this->enabled || ! $customer ) { throw new DomainError( 'Sign in to use store credit.', 403 ); }
        Finance::redeem( (int) $order_id, $customer );
        WC()->cart?->empty_cart();
        return array( 'result' => 'success', 'redirect' => $this->get_return_url( wc_get_order( $order_id ) ) );
    }
}
