<?php
/** Read-only verification of the headless origin and Docker loopback routing. */
defined( 'ABSPATH' ) || exit;
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) {
    return;
}
$response = wp_remote_get( rest_url(), array( 'timeout' => 20 ) );
$checks = array(
    'public_origin' => home_url(),
    'admin_url' => admin_url(),
    'admin_origin_matches' => admin_url() === untrailingslashit( KATUKINA_FRONTEND_URL ) . '/wp-admin/',
    'core_plugin' => class_exists( '\Katukina\Core\Headless' ),
    'loopback_api_http' => is_wp_error( $response ) ? 0 : wp_remote_retrieve_response_code( $response ),
);
WP_CLI::line( wp_json_encode( $checks, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
if ( ! $checks['core_plugin'] || ! $checks['admin_origin_matches'] || 200 !== $checks['loopback_api_http'] ) {
    WP_CLI::error( 'Headless environment verification failed.' );
}
