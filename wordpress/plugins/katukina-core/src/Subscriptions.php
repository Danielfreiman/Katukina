<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Subscriptions {
    const NOTICE = 'Receive the requested Katukina updates by email. Unsubscribe at any time.';
    public static function register(): void {
        add_action( 'rest_api_init', static function () {
            register_rest_route( 'katukina/v1', '/commerce/subscriptions', array( 'methods' => 'POST', 'permission_callback' => '__return_true', 'callback' => static fn( $r ) => OperationsApi::response( static fn() => self::request( $r->get_json_params() ?? array() ) ) ) );
        } );
        foreach ( array( 'admin_post_', 'admin_post_nopriv_' ) as $prefix ) {
            add_action( $prefix . 'katukina_subscription', array( self::class, 'confirmation_page' ) );
        }
    }
    public static function mailbox( int $channel ): array {
        $transports = apply_filters( 'katukina_message_transports', array() );
        foreach ( Registry::all( 'mailbox' ) as $mailbox ) {
            if ( $mailbox['data']['active'] && (int) $mailbox['data']['channel_id'] === $channel && ( $transports[ $mailbox['data']['provider'] ] ?? null ) instanceof MessageTransport ) { return $mailbox; }
        }
        throw new DomainError( 'Email subscriptions are not available until an authorized mailbox is configured.', 503 );
    }
    public static function unsubscribe_url( int $id ): string {
        $token = hash_hmac( 'sha256', 'unsubscribe:' . $id, wp_salt( 'auth' ) );
        return add_query_arg( array( 'action' => 'katukina_subscription', 'mode' => 'unsubscribe', 'id' => $id, 'token' => $token ), admin_url( 'admin-post.php' ) );
    }
    public static function request( array $input ): array {
        if ( ! is_string( $input['email'] ?? null ) || ! is_email( $input['email'] ) || true !== ( $input['consent'] ?? null ) || ! in_array( $input['purpose'] ?? '', array( 'marketing', 'back_in_stock' ), true ) ) { throw new DomainError( 'A valid email address, purpose and explicit consent are required.' ); }
        $channel = Channels::current(); if ( ! $channel ) { throw new DomainError( 'Sales channel unavailable.' ); }
        $mailbox = self::mailbox( (int) $channel['id'] ); $form_id = 0;
        if ( 'back_in_stock' === $input['purpose'] ) {
            $product = wc_get_product( absint( $input['product_id'] ?? 0 ) );
            if ( ! $product || 'publish' !== $product->get_status() || ! Channels::listed( $product, (int) $channel['id'] ) ) { throw new DomainError( 'Product unavailable.', 404 ); }
            $form_id = (int) get_post_meta( $product->get_id(), '_kat_form_record_id', true );
            if ( ! $form_id ) { throw new DomainError( 'Select a product presentation.' ); }
        }
        $email = strtolower( sanitize_email( $input['email'] ) ); $purpose = $input['purpose'];
        $code = 'public-' . hash( 'sha256', implode( ':', array( $email, $channel['id'], $purpose, $form_id ) ) );
        $prepared = Database::command( 'subscription.request', array( 'key' => 'subscribe-' . wp_generate_uuid4(), 'code' => $code ), static function () use ( $code, $email, $channel, $purpose, $form_id ) {
            global $wpdb;
            $id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . Database::table( 'records' ) . " WHERE kind='subscription' AND code=%s", $code ) );
            if ( $id ) {
                $prior = Registry::get( $id, 'subscription', false );
                if ( $prior['data']['active'] && $prior['data']['consent'] ) { return array(); }
                $last = $wpdb->get_var( $wpdb->prepare( 'SELECT requested_at FROM ' . Database::table( 'subscription_tokens' ) . ' WHERE subscription_id=%d', $id ) );
                if ( $last && strtotime( $last . ' UTC' ) > time() - 1800 ) { return array(); }
            } else {
                $row = Registry::save( array( 'kind' => 'subscription', 'code' => $code, 'data' => array( 'name' => 'Email subscriber', 'email' => $email, 'channel_id' => $channel['id'], 'purpose' => $purpose, 'form_id' => $form_id ?: '', 'consent' => false, 'active' => false, 'consent_reference' => 'Confirmation requested ' . gmdate( DATE_ATOM ) . '; notice v1: ' . self::NOTICE ) ) ); $id = (int) $row['id'];
            }
            $token = bin2hex( random_bytes( 32 ) );
            $wpdb->replace( Database::table( 'subscription_tokens' ), array( 'subscription_id' => $id, 'token_hash' => hash( 'sha256', $token ), 'expires_at' => gmdate( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS ), 'requested_at' => gmdate( 'Y-m-d H:i:s' ) ) );
            if ( $wpdb->last_error ) { throw new DomainError( 'Confirmation could not be prepared.' ); }
            return array( 'id' => $id, 'token' => $token );
        } );
        if ( $prepared ) {
            $url = add_query_arg( array( 'action' => 'katukina_subscription', 'mode' => 'confirm', 'id' => $prepared['id'], 'token' => $prepared['token'] ), admin_url( 'admin-post.php' ) );
            Communications::queue( 'confirm:' . $prepared['id'] . ':' . hash( 'sha256', $prepared['token'] ), array( 'to' => $email, 'from' => $mailbox['data']['email'], 'transport' => $mailbox['data']['provider'], 'subject' => 'Confirm your email subscription', 'body' => self::NOTICE . "\n\nConfirm within 24 hours: " . $url ) );
        }
        return array( 'status' => 'accepted', 'message' => 'If confirmation is needed, an email will be queued.' );
    }
    public static function change( int $id, string $mode, string $token ): array {
        return Database::command( 'subscription.' . $mode, array( 'key' => 'subscription-' . wp_generate_uuid4(), 'id' => $id ), static function () use ( $id, $mode, $token ) {
            global $wpdb; $row = Registry::get( $id, 'subscription', false );
            if ( 'unsubscribe' === $mode ) {
                if ( ! hash_equals( hash_hmac( 'sha256', 'unsubscribe:' . $id, wp_salt( 'auth' ) ), $token ) ) { throw new DomainError( 'Invalid subscription link.', 403 ); }
                $row['data']['consent'] = false; $row['data']['active'] = false;
            } elseif ( 'confirm' === $mode ) {
                $confirmation = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'subscription_tokens' ) . ' WHERE subscription_id=%d', $id ), ARRAY_A );
                if ( ! $confirmation || $confirmation['expires_at'] < gmdate( 'Y-m-d H:i:s' ) || ! hash_equals( $confirmation['token_hash'], hash( 'sha256', $token ) ) ) { throw new DomainError( 'Confirmation link is invalid or expired.', 403 ); }
                $row['data']['consent'] = true; $row['data']['active'] = true;
                $wpdb->delete( Database::table( 'subscription_tokens' ), array( 'subscription_id' => $id ) );
            } else { throw new DomainError( 'Unknown subscription action.' ); }
            $row['data']['consent_reference'] = $mode . ' ' . gmdate( DATE_ATOM ) . '; notice v1: ' . self::NOTICE;
            Registry::save( $row ); return array( 'status' => $mode === 'confirm' ? 'confirmed' : 'unsubscribed' );
        } );
    }
    public static function confirmation_page(): void {
        $id = absint( $_REQUEST['id'] ?? 0 ); $mode = sanitize_key( $_REQUEST['mode'] ?? '' ); $token = sanitize_text_field( wp_unslash( $_REQUEST['token'] ?? '' ) );
        nocache_headers(); header( 'Referrer-Policy: no-referrer' ); header( 'Content-Type: text/html; charset=utf-8' );
        if ( ! in_array( $mode, array( 'confirm', 'unsubscribe' ), true ) || ! preg_match( '/^[a-f0-9]{64}$/D', $token ) ) { wp_die( 'Invalid subscription link.' ); }
        echo '<!doctype html><html lang="en"><meta charset="utf-8"><title>Email preferences</title><body><h1>Email preferences</h1>';
        if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
            try { $result = self::change( $id, $mode, $token ); echo '<p>' . esc_html( $result['status'] ) . '</p>'; }
            catch ( DomainError $error ) { echo '<p>' . esc_html( $error->getMessage() ) . '</p>'; }
        } else {
            echo '<p>' . esc_html( self::NOTICE ) . '</p><form method="post">';
            foreach ( array( 'action' => 'katukina_subscription', 'id' => $id, 'mode' => $mode, 'token' => $token ) as $key => $value ) { echo '<input type="hidden" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '">'; }
            echo '<button type="submit">' . ( 'confirm' === $mode ? 'Confirm subscription' : 'Unsubscribe' ) . '</button></form>';
        }
        echo '</body></html>'; exit;
    }
}
