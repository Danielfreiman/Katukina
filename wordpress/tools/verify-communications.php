<?php
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException( 'Local CLI only.' ); }
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;
use Katukina\Core\Communications as M;
use Katukina\Core\Subscriptions as S;
use Katukina\Core\Channels;
use Katukina\Core\MailboxProvider;
use Katukina\Core\MessageTransport;
use Katukina\Core\DomainError;

final class KatukinaFakeMailbox implements MailboxProvider {
    public function fetch( array $mailbox, string $cursor ): array { return array( 'messages' => array( array( 'id' => 'synthetic-message-1', 'sender' => 'sender@example.invalid', 'subject' => '<script>unsafe</script>Support', 'body' => 'Synthetic message only', 'received_at' => '2026-10-26T10:00:00Z' ) ), 'cursor' => 'page-1', 'has_more' => false ); }
}
final class KatukinaFakeTransport implements MessageTransport {
    public array $sent = array();
    public function send( array $message, string $key ): string { $this->sent[ $key ] = $message; return 'fake-' . $key; }
}

global $wpdb; $prefix = 'testmail-' . bin2hex( random_bytes( 5 ) ); $records = array(); $outbox = array(); $mailbox_id = 0; $checks = 0;
$transport = new KatukinaFakeTransport();
$mail_filter = static fn( $providers ) => $providers + array( 'local-test' => new KatukinaFakeMailbox() );
$transport_filter = static fn( $providers ) => $providers + array( 'local-test' => $transport );
add_filter( 'katukina_mailbox_providers', $mail_filter ); add_filter( 'katukina_message_transports', $transport_filter );
$assert = static function ( $value, $name ) use ( &$checks ) { if ( ! $value ) { throw new RuntimeException( $name ); } ++$checks; };
$record = static function ( $kind, $data ) use ( $prefix, &$records ) { $row = D::command( 'record.save', array( 'key' => $prefix . '-' . wp_generate_uuid4(), 'kind' => $kind, 'code' => $prefix . '-' . count( $records ), 'data' => $data + array( 'active' => true ) ), array( R::class, 'save' ) ); $records[] = (int) $row['id']; return $row; };
try {
    $channel = Channels::current();
    $mailbox = $record( 'mailbox', array( 'name' => 'Synthetic mailbox', 'email' => 'sender@example.invalid', 'channel_id' => $channel['id'], 'provider' => 'local-test' ) ); $mailbox_id = (int) $mailbox['id'];
    M::sync( $mailbox_id ); M::sync( $mailbox_id );
    $assert( 1 === (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . D::table( 'inbox' ) . ' WHERE mailbox_id=%d', $mailbox_id ) ), 'sync pages deduplicate provider identifiers' );
    $subject = $wpdb->get_var( $wpdb->prepare( 'SELECT subject FROM ' . D::table( 'inbox' ) . ' WHERE mailbox_id=%d', $mailbox_id ) );
    $assert( ! str_contains( $subject, '<script>' ), 'incoming subject is plain text' );
    $template = $record( 'template', array( 'name' => 'Synthetic template', 'language' => 'en', 'subject' => 'Hello {{name}}', 'body' => 'Updates. {{unsubscribe_url}}' ) );
    $subscription = $record( 'subscription', array( 'name' => 'Synthetic subscriber', 'email' => $prefix . '@example.invalid', 'channel_id' => $channel['id'], 'purpose' => 'marketing', 'consent' => true, 'consent_reference' => 'Synthetic consent; no real recipient' ) );
    $campaign = $record( 'campaign', array( 'name' => 'Synthetic campaign', 'channel_id' => $channel['id'], 'template_id' => $template['id'], 'purpose' => 'marketing' ) );
    $queued = M::campaign( (int) $campaign['id'] ); M::campaign( (int) $campaign['id'] );
    $outbox = array_map( 'intval', $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . D::table( 'outbox' ) . ' WHERE subscription_id=%d', $subscription['id'] ) ) );
    $assert( 1 === count( $outbox ) && $queued['queued'] === 1, 'campaign retries do not queue duplicate recipients' );
    M::deliver( $outbox[0] ); M::deliver( $outbox[0] );
    $assert( 1 === count( $transport->sent ), 'transport receives a stable deduplicated delivery key' );
    $message = reset( $transport->sent );
    $assert( str_contains( $message['subject'], 'Synthetic subscriber' ) && str_contains( $message['body'], 'mode=unsubscribe' ), 'template expansion includes working preference link' );
    $token = hash_hmac( 'sha256', 'unsubscribe:' . $subscription['id'], wp_salt( 'auth' ) );
    S::change( (int) $subscription['id'], 'unsubscribe', $token );
    $blocked = M::queue( $prefix . '-suppressed', $message, (int) $subscription['id'] ); $outbox[] = $blocked['id']; M::deliver( $blocked['id'] );
    $assert( 'suppressed' === $wpdb->get_var( $wpdb->prepare( 'SELECT state FROM ' . D::table( 'outbox' ) . ' WHERE id=%d', $blocked['id'] ) ) && 1 === count( $transport->sent ), 'consent checked again immediately before delivery' );
    // Public signup must remain inactive until the signed confirmation is explicitly posted.
    $email = $prefix . '-confirm@example.invalid'; S::request( array( 'email' => $email, 'purpose' => 'marketing', 'consent' => true ) );
    foreach ( R::all( 'subscription' ) as $candidate ) { if ( $candidate['data']['email'] === $email ) { $pending = $candidate; $records[] = (int) $candidate['id']; } }
    $assert( isset( $pending ) && ! $pending['data']['consent'], 'public email address is not itself consent confirmation' );
    $confirmation = $wpdb->get_row( $wpdb->prepare( 'SELECT id,payload FROM ' . D::table( 'outbox' ) . ' WHERE payload LIKE %s ORDER BY id DESC LIMIT 1', '%' . $wpdb->esc_like( $email ) . '%' ), ARRAY_A );
    $outbox[] = (int) $confirmation['id']; $payload = json_decode( $confirmation['payload'], true ); preg_match( '/token=([a-f0-9]{64})/', $payload['body'], $matches );
    S::change( (int) $pending['id'], 'confirm', $matches[1] );
    $assert( R::get( (int) $pending['id'], 'subscription' )['data']['consent'], 'valid confirmation activates subscription' );
    $invalid = false; try { S::change( (int) $pending['id'], 'confirm', $matches[1] ); } catch ( DomainError $error ) { $invalid = true; }
    $assert( $invalid, 'confirmation tokens are single use' );
    WP_CLI::success( $checks . ' communications assertions passed; all delivery used an in-memory fake.' );
} finally {
    foreach ( $outbox as $id ) { if ( function_exists( 'as_unschedule_all_actions' ) ) { as_unschedule_all_actions( 'katukina_deliver', array( (int) $id ), 'katukina' ); } $wpdb->delete( D::table( 'outbox' ), array( 'id' => $id ) ); }
    if ( $mailbox_id ) { $wpdb->delete( D::table( 'inbox' ), array( 'mailbox_id' => $mailbox_id ) ); delete_option( 'katukina_mail_cursor_' . $mailbox_id ); }
    foreach ( $records as $id ) { $wpdb->delete( D::table( 'subscription_tokens' ), array( 'subscription_id' => $id ) ); $wpdb->delete( D::table( 'records' ), array( 'id' => $id ) ); }
    remove_filter( 'katukina_mailbox_providers', $mail_filter ); remove_filter( 'katukina_message_transports', $transport_filter );
}
