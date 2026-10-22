<?php
/** Remove only abandoned synthetic test accounts/orders from this project's browser suite. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException( 'Local CLI only.' ); }
require_once ABSPATH . 'wp-admin/includes/user.php';
$removed_users = 0; $removed_orders = 0;
foreach ( get_users( array( 'search' => 'account-test-*', 'search_columns' => array( 'user_email' ) ) ) as $user ) {
    if ( ! preg_match( '/^account-test-\d{13}@example\.invalid$/D', $user->user_email ) || ! in_array( 'customer', $user->roles, true ) ) { continue; }
    if ( wc_get_orders( array( 'customer_id' => $user->ID, 'limit' => 1 ) ) ) { continue; }
    wp_delete_user( $user->ID ); $removed_users++;
}
foreach ( wc_get_orders( array( 'billing_email' => 'checkout-test@example.invalid', 'limit' => -1 ) ) as $order ) {
    if ( 'yes' !== $order->get_meta( '_katukina_test_order' ) || $order->is_paid() || 'katukina_local_test' !== $order->get_payment_method() ) { continue; }
    $order->delete( true ); $removed_orders++;
}
WP_CLI::success( "Removed $removed_users abandoned synthetic customer(s), $removed_orders unpaid local test order(s)." );
