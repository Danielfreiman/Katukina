<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class DomainError extends \RuntimeException {
    public function __construct( string $message, public int $status = 400 ) { parent::__construct( $message ); }
}

final class Database {
    const VERSION = '4';
    private static int $depth = 0;
    public static function table( string $name ): string { global $wpdb; return $wpdb->prefix . 'kat_' . $name; }
    public static function install(): void {
        if ( get_option( 'katukina_schema' ) === self::VERSION ) { return; }
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $collate = $wpdb->get_charset_collate();
        $definitions = array(
            'returns' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\norder_id bigint unsigned NOT NULL,\nreservation_id bigint unsigned NOT NULL,\nquantity bigint NOT NULL,\nreference varchar(100) NOT NULL,\nreason text NOT NULL,\nactor_id bigint unsigned NOT NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nUNIQUE KEY receipt_reference (reference),\nKEY reservation_id (reservation_id)",
            'inbox' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\nmailbox_id bigint unsigned NOT NULL,\nexternal_key char(64) NOT NULL,\nsender varchar(254) NOT NULL,\nsubject text NOT NULL,\nbody longtext NOT NULL,\nreceived_at datetime NOT NULL,\norder_id bigint unsigned NOT NULL DEFAULT 0,\ncontact_id bigint unsigned NOT NULL DEFAULT 0,\nsupplier_id bigint unsigned NOT NULL DEFAULT 0,\nPRIMARY KEY  (id),\nUNIQUE KEY external_key (external_key),\nKEY mailbox_received (mailbox_id,received_at),\nKEY related_order (order_id),\nKEY related_contact (contact_id),\nKEY related_supplier (supplier_id)",
            'outbox' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\ndelivery_key char(64) NOT NULL,\npayload longtext NOT NULL,\nsubscription_id bigint unsigned NOT NULL DEFAULT 0,\nstate varchar(20) NOT NULL,\nattempts int NOT NULL DEFAULT 0,\nlease_until datetime NULL,\nprovider_id varchar(255) NOT NULL DEFAULT '',\nlast_error varchar(255) NOT NULL DEFAULT '',\ncreated_at datetime NOT NULL,\nsent_at datetime NULL,\nPRIMARY KEY  (id),\nUNIQUE KEY delivery_key (delivery_key),\nKEY queue (state,lease_until)",
            'subscription_tokens' => "subscription_id bigint unsigned NOT NULL,\ntoken_hash char(64) NOT NULL,\nexpires_at datetime NOT NULL,\nrequested_at datetime NOT NULL,\nPRIMARY KEY  (subscription_id),\nKEY expiry (expires_at)",
            'production_jobs' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\nstate varchar(20) NOT NULL,\nversion bigint NOT NULL DEFAULT 1,\nplan longtext NOT NULL,\nresult longtext NULL,\nactor_id bigint unsigned NOT NULL,\ncreated_at datetime NOT NULL,\nupdated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nKEY state (state)",
            'production_allocations' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\njob_id bigint unsigned NOT NULL,\nlot_id bigint unsigned NOT NULL,\nquantity bigint NOT NULL,\nstate varchar(20) NOT NULL,\nPRIMARY KEY  (id),\nUNIQUE KEY job_lot (job_id,lot_id),\nKEY lot_state (lot_id,state)",
            'records' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\nkind varchar(32) NOT NULL,\ncode varchar(100) NOT NULL,\ndata longtext NOT NULL,\nversion bigint NOT NULL DEFAULT 1,\ncreated_at datetime NOT NULL,\nupdated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nUNIQUE KEY identity (kind,code)",
            'commands' => "idempotency_key varchar(100) NOT NULL,\nfingerprint char(64) NOT NULL,\nresult longtext NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (idempotency_key)",
            'locks' => "name varchar(32) NOT NULL,\nPRIMARY KEY  (name)",
            'lots' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\ncode varchar(100) NOT NULL,\nform_id bigint unsigned NOT NULL,\ncompany_id bigint unsigned NOT NULL,\nwarehouse_id bigint unsigned NOT NULL,\nbalance bigint NOT NULL DEFAULT 0,\nreserved bigint NOT NULL DEFAULT 0,\ndata longtext NOT NULL,\nPRIMARY KEY  (id),\nUNIQUE KEY code (code),\nKEY allocation (form_id,company_id,warehouse_id)",
            'movements' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\nlot_id bigint unsigned NOT NULL,\nquantity bigint NOT NULL,\nreserved_delta bigint NOT NULL DEFAULT 0,\naction varchar(32) NOT NULL,\nreference varchar(100) NOT NULL,\nreason text NOT NULL,\nactor_id bigint unsigned NOT NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nKEY lot_id (lot_id)",
            'reservations' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\nlot_id bigint unsigned NOT NULL,\norder_id bigint unsigned NOT NULL,\nline_id bigint unsigned NOT NULL,\nquantity bigint NOT NULL,\nstate varchar(16) NOT NULL,\nexpires_at datetime NOT NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nKEY order_state (order_id,state),\nKEY expiration (state,expires_at)",
            'production' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\ninput_lot_id bigint unsigned NOT NULL,\noutput_lot_id bigint unsigned NOT NULL,\nconsumed bigint NOT NULL,\nproduced bigint NOT NULL,\nloss bigint NOT NULL,\nstate varchar(20) NOT NULL,\nreason text NOT NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (id)",
            'orders' => "order_id bigint unsigned NOT NULL,\nchannel_id bigint unsigned NOT NULL,\nstate varchar(40) NOT NULL,\nshort_note varchar(240) NOT NULL DEFAULT '',\nversion bigint NOT NULL DEFAULT 1,\npacked_at datetime NULL,\nPRIMARY KEY  (order_id)",
            'money' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\nkind varchar(20) NOT NULL,\ncustomer_id bigint unsigned NOT NULL DEFAULT 0,\norder_id bigint unsigned NOT NULL DEFAULT 0,\ncurrency char(3) NOT NULL,\nminor_unit int NOT NULL,\namount bigint NOT NULL,\nreference varchar(100) NOT NULL,\nreason text NOT NULL,\nactor_id bigint unsigned NOT NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nUNIQUE KEY reference (kind,reference),\nKEY balance (kind,customer_id,currency)",
            'audit' => "id bigint unsigned NOT NULL AUTO_INCREMENT,\naction varchar(60) NOT NULL,\nentity varchar(100) NOT NULL,\nactor_id bigint unsigned NOT NULL,\ndetail longtext NOT NULL,\ncreated_at datetime NOT NULL,\nPRIMARY KEY  (id),\nKEY entity (entity)",
        );
        foreach ( $definitions as $name => $definition ) {
            dbDelta( 'CREATE TABLE ' . self::table( $name ) . " (\n$definition\n) ENGINE=InnoDB $collate;" );
            if ( $wpdb->last_error ) { throw new \RuntimeException( 'Failed to install Katukina tables.' ); }
        }
        self::query( 'INSERT IGNORE INTO ' . self::table( 'locks' ) . " (name) VALUES ('operations')" );
        $admin = get_role( 'administrator' );
        foreach ( array( 'catalog', 'inventory', 'orders', 'finance', 'crm', 'settings', 'reports' ) as $domain ) { $admin?->add_cap( 'katukina_' . $domain ); }
        update_option( 'katukina_schema', self::VERSION, false );
    }
    public static function query( string $sql ): int {
        global $wpdb; $result = $wpdb->query( $sql );
        if ( false === $result ) { throw new \RuntimeException( 'The operation could not be saved.' ); }
        return $result;
    }
    public static function insert( string $table, array $data ): int {
        global $wpdb;
        if ( false === $wpdb->insert( self::table( $table ), $data ) ) { throw new DomainError( 'Duplicate record or incompatible data.', 409 ); }
        return (int) $wpdb->insert_id;
    }
    public static function audit( string $action, string $entity, array $detail ): void {
        self::insert( 'audit', array( 'action' => $action, 'entity' => $entity, 'actor_id' => get_current_user_id(), 'detail' => wp_json_encode( $detail ), 'created_at' => gmdate( 'Y-m-d H:i:s' ) ) );
    }
    public static function canonical( mixed $value ): mixed {
        if ( ! is_array( $value ) ) { return $value; }
        if ( ! array_is_list( $value ) ) { ksort( $value ); }
        return array_map( array( self::class, 'canonical' ), $value );
    }
    public static function command( string $action, array $input, callable $callback ): array {
        global $wpdb;
        $key = (string) ( $input['key'] ?? '' );
        if ( ! preg_match( '/^[a-zA-Z0-9_-]{16,100}$/D', $key ) ) { throw new DomainError( 'Provide an idempotency key of 16 to 100 characters.' ); }
        unset( $input['key'] );
        $hash = hash( 'sha256', wp_json_encode( self::canonical( array( $action, $input ) ) ) );
        $level = ++self::$depth;
        $savepoint = 'kat_command_' . $level;
        self::query( 1 === $level ? 'START TRANSACTION' : 'SAVEPOINT ' . $savepoint );
        try {
            // All domain writes acquire this mutex, including catalogue edits.
            $wpdb->get_var( 'SELECT name FROM ' . self::table( 'locks' ) . " WHERE name='operations' FOR UPDATE" );
            self::query( $wpdb->prepare( 'INSERT IGNORE INTO ' . self::table( 'commands' ) . ' (idempotency_key,fingerprint,created_at) VALUES (%s,%s,%s)', $key, $hash, gmdate( 'Y-m-d H:i:s' ) ) );
            $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::table( 'commands' ) . ' WHERE idempotency_key=%s FOR UPDATE', $key ), ARRAY_A );
            if ( ! $row || ! hash_equals( $row['fingerprint'], $hash ) ) { throw new DomainError( 'This key has already been used for another command.', 409 ); }
            if ( null !== $row['result'] ) { self::query( 1 === $level ? 'COMMIT' : 'RELEASE SAVEPOINT ' . $savepoint ); self::$depth--; return json_decode( $row['result'], true ); }
            $result = $callback( $input );
            self::audit( $action, (string) ( $result['id'] ?? $result['order_id'] ?? $key ), array( 'key' => $key ) );
            self::query( $wpdb->prepare( 'UPDATE ' . self::table( 'commands' ) . ' SET result=%s WHERE idempotency_key=%s', wp_json_encode( $result ), $key ) );
            self::query( 1 === $level ? 'COMMIT' : 'RELEASE SAVEPOINT ' . $savepoint );
            self::$depth--;
            if ( 1 === $level ) {
                try { do_action( 'katukina_domain_committed', $action, $result ); }
                catch ( \Throwable $notification_error ) { error_log( 'Katukina post-commit scheduling failed: ' . get_class( $notification_error ) ); }
            }
            return $result;
        } catch ( \Throwable $error ) { $wpdb->query( 1 === $level ? 'ROLLBACK' : 'ROLLBACK TO SAVEPOINT ' . $savepoint ); self::$depth--; throw $error; }
    }
    public static function quantity( mixed $value, bool $signed = false ): int {
        if ( ! is_scalar( $value ) || ! preg_match( $signed ? '/^-?\d{1,9}(\.\d{1,3})?$/D' : '/^\d{1,9}(\.\d{1,3})?$/D', (string) $value ) ) { throw new DomainError( 'Invalid quantity: use a decimal point and up to three decimal places.' ); }
        $parts = explode( '.', ltrim( (string) $value, '-' ) );
        $amount = (int) $parts[0] * 1000 + (int) str_pad( $parts[1] ?? '', 3, '0' );
        if ( str_starts_with( (string) $value, '-' ) ) { $amount = -$amount; }
        if ( 0 === $amount ) { throw new DomainError( 'Quantity must not be zero.' ); }
        return $amount;
    }
    public static function number( int $milli ): string { return number_format( $milli / 1000, 3, '.', '' ); }
    public static function reason( array $input ): string {
        $reason = sanitize_textarea_field( $input['reason'] ?? '' );
        if ( strlen( $reason ) < 3 || strlen( $reason ) > 2000 ) { throw new DomainError( 'Enter a reason of 3 to 2000 characters.' ); }
        return $reason;
    }
}
