<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Headless {
    public static function origin(): string {
        return defined( 'KATUKINA_FRONTEND_URL' ) ? untrailingslashit( KATUKINA_FRONTEND_URL ) : '';
    }

    public static function register(): void {
        if ( ! self::origin() ) {
            return;
        }
        // A browser entering the private local port must reach the public login
        // before entering credentials. Next's proxy supplies x-forwarded-host;
        // this flag only avoids a convenience redirect, never grants access.
        $request_uri = $_SERVER['REQUEST_URI'] ?? '/';
        $request_path = wp_parse_url( $request_uri, PHP_URL_PATH ) ?: '/';
        $public = wp_parse_url( self::origin() );
        $public_authority = strtolower( $public['host'] . ( isset( $public['port'] ) ? ':' . $public['port'] : '' ) );
        $incoming_authority = strtolower( $_SERVER['HTTP_HOST'] ?? '' );
        if ( 'local' === wp_get_environment_type()
            && 'GET' === ( $_SERVER['REQUEST_METHOD'] ?? '' )
            && empty( $_SERVER['HTTP_X_FORWARDED_HOST'] )
            && preg_match( '~^(?:localhost|127\\.0\\.0\\.1)(?::[0-9]{1,5})?$~', $incoming_authority )
            && $incoming_authority !== $public_authority
            && preg_match( '~^/(?:wp-admin(?:/|$)|wp-login\\.php$)~', $request_path )
            && ! in_array( $request_path, array( '/wp-admin/admin-ajax.php', '/wp-admin/admin-post.php' ), true )
        ) {
            add_action( 'init', static function () use ( $request_uri, $request_path ) {
                $target = self::origin() . $request_uri;
                if ( '/wp-login.php' === $request_path ) {
                    $target = add_query_arg( 'redirect_to', self::origin() . '/wp-admin/', $target );
                }
                wp_safe_redirect( $target, 302, 'Katukina Local Admin' );
                exit;
            }, 0 );
        }
        // The reverse proxy connects to a private Docker origin. WordPress uses
        // HTTP_HOST when building login redirect_to URLs; use the configured
        // public origin, never an arbitrary forwarded header supplied by a client.
        if ( ! ( defined( 'WP_CLI' ) && WP_CLI ) ) {
            $public = wp_parse_url( self::origin() );
            $secure = 'https' === ( $public['scheme'] ?? '' );
            $_SERVER['HTTP_HOST'] = $public['host'] . ( isset( $public['port'] ) ? ':' . $public['port'] : '' );
            $_SERVER['SERVER_NAME'] = $public['host'];
            $_SERVER['SERVER_PORT'] = (string) ( $public['port'] ?? ( $secure ? 443 : 80 ) );
            $_SERVER['HTTPS'] = $secure ? 'on' : 'off';
        }
        add_filter( 'post_type_link', static function ( $url, $post ) {
            return 'product' === $post->post_type ? self::origin() . '/products/' . $post->post_name : $url;
        }, 10, 2 );
        add_filter( 'post_link', static function ( $url, $post ) {
            return self::origin() . '/journal/' . $post->post_name;
        }, 10, 2 );
        add_filter( 'term_link', static function ( $url, $term ) {
            return 'product_cat' === $term->taxonomy ? self::origin() . '/collections/' . $term->slug : $url;
        }, 10, 2 );
        add_filter( 'page_link', static function ( $url, $id ) {
            $slug = get_post_field( 'post_name', $id );
            $routes = array( 'shop' => '/shop', 'cart' => '/cart', 'checkout' => '/checkout', 'my-account' => '/account' );
            return self::origin() . ( $routes[ $slug ] ?? '/pages/' . $slug );
        }, 10, 2 );

        // Never render a second public storefront from the WordPress theme.
        add_action( 'template_redirect', static function () {
            if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
                return;
            }
            $target = self::origin() . '/';
            if ( is_singular( array( 'product', 'post', 'page' ) ) ) {
                $target = get_permalink();
            } elseif ( is_tax( 'product_cat' ) ) {
                $term_url = get_term_link( get_queried_object() );
                if ( ! is_wp_error( $term_url ) ) {
                    $target = $term_url;
                }
            } elseif ( is_post_type_archive( 'product' ) ) {
                $target = self::origin() . '/shop';
            }
            // Destination comes only from configured origin and WordPress permalinks.
            wp_redirect( $target, 302, 'Katukina Headless' );
            exit;
        }, 0 );
    }
}
