<?php
/** Read-only runtime checks for the local environment. */
defined( 'ABSPATH' ) || exit;
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
    return;
}

global $wp_version, $wpdb;
$checks = array(
    'wordpress' => $wp_version,
    'woocommerce' => defined( 'WC_VERSION' ) ? WC_VERSION : null,
    'php' => PHP_VERSION,
    'database' => $wpdb->db_version(),
    'environment' => wp_get_environment_type(),
    'site_url' => home_url(),
    'hpos_enabled' => class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' )
        && \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled(),
    'search_indexing_disabled' => 0 === (int) get_option( 'blog_public' ),
    'external_mail_disabled' => true === apply_filters( 'pre_wp_mail', null, array() ),
    'permalinks' => get_option( 'permalink_structure' ),
    'setup_complete' => (bool) get_option( 'katukina_local_initialized' ),
);

WP_CLI::line( wp_json_encode( $checks, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
if ( ! $checks['woocommerce'] || 'local' !== $checks['environment']
    || ! $checks['hpos_enabled'] || ! $checks['search_indexing_disabled']
    || ! $checks['external_mail_disabled'] || ! $checks['setup_complete'] ) {
    WP_CLI::error( 'Local environment verification failed.' );
}
