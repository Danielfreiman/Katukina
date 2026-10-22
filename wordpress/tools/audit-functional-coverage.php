<?php
/** Read-only aggregate evidence. Never output personal records or credentials. */
defined( 'ABSPATH' ) || exit;
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) {
    return;
}
global $wpdb;
$records = \Katukina\Core\Database::table( 'records' );
$counts = array();
foreach ( array( 'company', 'warehouse', 'channel', 'hs', 'transition', 'carrier', 'publication' ) as $kind ) {
    $rows = $wpdb->get_col( $wpdb->prepare( "SELECT data FROM $records WHERE kind=%s", $kind ) );
    $active = 0;
    foreach ( $rows as $json ) {
        $data = json_decode( $json, true );
        if ( ! empty( $data['active'] ) ) { ++$active; }
    }
    $counts[ $kind ] = array( 'total' => count( $rows ), 'active' => $active );
}
$gateways = array();
foreach ( WC()->payment_gateways()->payment_gateways() as $gateway ) {
    if ( 'yes' === $gateway->enabled ) { $gateways[] = $gateway->id; }
}
WP_CLI::line( wp_json_encode( array(
    'scope' => 'Local aggregate configuration only; not an end-to-end functional test.',
    'wordpress_multisite' => is_multisite(),
    'public_origin' => home_url(),
    'admin_origin' => admin_url(),
    'store_currency' => get_woocommerce_currency(),
    'taxes_enabled' => wc_tax_enabled(),
    'local_test_checkout_enabled' => \Katukina\Core\Commerce::local_enabled(),
    'enabled_gateway_ids' => $gateways,
    'records' => $counts,
), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
