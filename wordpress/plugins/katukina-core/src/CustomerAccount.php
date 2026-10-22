<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class CustomerAccount {
    public static function register(): void {
        foreach ( array( 'session', 'login', 'register', 'logout' ) as $action ) {
            $callback = static fn() => self::handle( $action );
            add_action( 'wp_ajax_katukina_customer_' . $action, $callback );
            add_action( 'wp_ajax_nopriv_katukina_customer_' . $action, $callback );
        }
    }
    private static function session(): array {
        $result = array( 'user' => null, 'orders' => array(), 'nonce' => wp_create_nonce( 'katukina_customer' ), 'registration' => Commerce::local_enabled() || 'yes' === get_option( 'woocommerce_enable_myaccount_registration' ), 'local' => 'local' === wp_get_environment_type() );
        if ( ! is_user_logged_in() ) { return $result; }
        $user = wp_get_current_user(); $result['user'] = array( 'name' => $user->display_name, 'email' => $user->user_email );
        $page = max( 1, (int) ( $_GET['page'] ?? 1 ) );
        $orders = wc_get_orders( array( 'customer_id' => $user->ID, 'limit' => 20, 'page' => $page, 'paginate' => true, 'type' => 'shop_order' ) );
        foreach ( $orders->orders as $order ) { $result['orders'][] = array( 'id' => $order->get_id(), 'date' => $order->get_date_created()?->date( 'Y-m-d' ), 'status' => wc_get_order_status_name( $order->get_status() ), 'currency' => $order->get_currency(), 'total' => $order->get_total(), 'test' => 'yes' === $order->get_meta( '_katukina_test_order' ) ); }
        $result['pages'] = $orders->max_num_pages;
        return $result;
    }
    public static function handle( string $action ): never {
        nocache_headers();
        try {
            if ( 'session' === $action ) { if ( 'GET' !== $_SERVER['REQUEST_METHOD'] ) { throw new DomainError( 'Method not allowed.', 405 ); } wp_send_json( self::session() ); }
            if ( 'POST' !== $_SERVER['REQUEST_METHOD'] || ( $_SERVER['HTTP_ORIGIN'] ?? '' ) !== Headless::origin() || ! str_starts_with( $_SERVER['CONTENT_TYPE'] ?? '', 'application/json' ) ) { throw new DomainError( 'Invalid request origin.', 403 ); }
            $raw = file_get_contents( 'php://input', false, null, 0, 12001 );
            if ( strlen( $raw ) > 12000 ) { throw new DomainError( 'Request too large.', 413 ); }
            $input = json_decode( $raw, true );
            if ( ! is_array( $input ) ) { throw new DomainError( 'Invalid request.' ); }
            if ( 'logout' === $action ) {
                if ( ! wp_verify_nonce( $input['nonce'] ?? '', 'katukina_customer' ) ) { throw new DomainError( 'Session expired. Reload the page.', 403 ); }
                wp_logout(); wp_send_json( array( 'ok' => true ) );
            }
            $bucket = 'kat_login_' . hash( 'sha256', ( $_SERVER['REMOTE_ADDR'] ?? '' ) . ':' . strtolower( (string) ( $input['email'] ?? '' ) ) );
            $attempts = (int) get_transient( $bucket ); if ( $attempts >= 10 ) { throw new DomainError( 'Too many attempts. Please try again in 15 minutes.', 429 ); }
            set_transient( $bucket, $attempts + 1, 15 * MINUTE_IN_SECONDS );
            $email = sanitize_email( $input['email'] ?? '' ); $password = (string) ( $input['password'] ?? '' );
            if ( ! is_email( $email ) || strlen( $password ) > 200 ) { throw new DomainError( 'Check your email and password.' ); }
            if ( 'register' === $action ) {
                if ( ! Commerce::local_enabled() && 'yes' !== get_option( 'woocommerce_enable_myaccount_registration' ) ) { throw new DomainError( 'Registration is not available.', 403 ); }
                if ( strlen( $password ) < 12 ) { throw new DomainError( 'Use a password with at least 12 characters.' ); }
                $id = wc_create_new_customer( $email, '', $password );
                if ( is_wp_error( $id ) ) { throw new DomainError( 'Could not create the account. If you already have an account, sign in or reset your password.' ); }
            }
            $user = wp_signon( array( 'user_login' => $email, 'user_password' => $password, 'remember' => true ), is_ssl() );
            if ( is_wp_error( $user ) ) { throw new DomainError( 'Check your email and password.', 401 ); }
            wp_set_current_user( $user->ID ); delete_transient( $bucket ); wp_send_json( self::session() );
        } catch ( DomainError $error ) { wp_send_json( array( 'message' => $error->getMessage() ), $error->status ); }
    }
}
