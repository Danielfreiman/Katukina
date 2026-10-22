<?php
/** Idempotent local setup, invoked explicitly through WP-CLI. */
defined( 'ABSPATH' ) || exit;

if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) {
    return;
}

if ( ! class_exists( 'WooCommerce' ) ) {
    WP_CLI::error( 'WooCommerce must be active before local setup.' );
}

if ( get_option( 'katukina_local_initialized' ) ) {
    WP_CLI::success( 'Local setup already applied; existing settings preserved.' );
    return;
}

update_option( 'blogname', 'Katukina — Desenvolvimento local' );
update_option( 'blogdescription', 'Backend local WordPress + WooCommerce' );
update_option( 'blog_public', 0 );
update_option( 'woocommerce_allow_tracking', 'no' );
update_option( 'woocommerce_custom_orders_table_enabled', 'yes' );
update_option( 'woocommerce_custom_orders_table_data_sync_enabled', 'no' );

// Skip the guided questionnaire without inventing a business location or profile.
$profile = (array) get_option( 'woocommerce_onboarding_profile', array() );
$profile['skipped'] = true;
update_option( 'woocommerce_onboarding_profile', $profile );
delete_transient( '_wc_activation_redirect' );

// The API needs pretty permalinks; changing stock/tax/currency policy is out of scope.
global $wp_rewrite;
$wp_rewrite->set_permalink_structure( '/%postname%/' );
flush_rewrite_rules();

if ( class_exists( 'WC_Install' ) ) {
    WC_Install::create_pages();
}

update_option( 'katukina_local_initialized', gmdate( 'c' ) );
WP_CLI::success( 'Katukina local setup applied. Commercial configuration remains pending.' );
