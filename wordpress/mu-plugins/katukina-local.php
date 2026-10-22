<?php
/**
 * Plugin Name: Katukina Local Development
 * Description: Local-only indexation and mail controls. No commercial rules.
 * Version: 0.1.0
 */

defined( 'ABSPATH' ) || exit;

if ( 'local' !== wp_get_environment_type() ) {
    return;
}

add_filter( 'pre_option_blog_public', '__return_zero' );
add_filter( 'pre_wp_mail', '__return_true' );
add_filter( 'woocommerce_allow_tracking', '__return_false' );

// The public localhost origin belongs to Windows, not this container. Keep WordPress's own
// cron/REST/AJAX loopbacks inside Docker while browser URLs use the public origin.
add_filter( 'pre_http_request', static function ( $preempt, $args, $url ) {
    if ( false !== $preempt || ! defined( 'KATUKINA_FRONTEND_URL' ) || ! empty( $args['_katukina_loopback'] ) ) {
        return $preempt;
    }
    $origin = untrailingslashit( KATUKINA_FRONTEND_URL );
    if ( ! str_starts_with( $url, $origin . '/' ) ) {
        return $preempt;
    }
    $relative = substr( $url, strlen( $origin ) );
    if ( ! preg_match( '~^/(?:wp-cron\\.php(?:[?]|$)|wp-json(?:/|[?]|$)|wp-admin(?:/|[?]|$))~', $relative ) ) {
        return $preempt;
    }
    $args['_katukina_loopback'] = true;
    return wp_remote_request( 'http://wordpress' . $relative, $args );
}, 10, 3 );

add_action(
    'admin_notices',
    static function () {
        echo '<div class="notice notice-info"><p><strong>Katukina — local development.</strong> Search indexing and outgoing email are disabled. Commercial settings await validation.</p></div>';
    }
);
