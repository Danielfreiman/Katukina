<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Permissions {
    const DOMAINS = array( 'catalog' => 'Operational catalogue', 'inventory' => 'Inventory and repacking', 'orders' => 'Orders and shipping', 'finance' => 'Credits and finance', 'crm' => 'Support and contacts', 'settings' => 'Settings and rules', 'reports' => 'Audit and operational reports' );
    public static function register(): void {
        add_action( 'show_user_profile', array( self::class, 'render' ) ); add_action( 'edit_user_profile', array( self::class, 'render' ) );
        add_action( 'personal_options_update', array( self::class, 'save' ) ); add_action( 'edit_user_profile_update', array( self::class, 'save' ) );
    }
    public static function render( $user ): void {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'edit_user', $user->ID ) ) { return; }
        echo '<h2>Katukina permissions</h2><p>Permissions apply to this installation and all its registered companies. These permissions do not isolate independent companies.</p>';
        wp_nonce_field( 'katukina_user_permissions', 'katukina_permissions_nonce' );
        foreach ( self::DOMAINS as $domain => $label ) { echo '<p><label><input type="checkbox" name="katukina_caps[]" value="' . esc_attr( $domain ) . '" ' . checked( $user->has_cap( 'katukina_' . $domain ), true, false ) . '> ' . esc_html( $label ) . '</label></p>'; }
        echo '<p>The user also needs WooCommerce admin access to open the menus. Administrators retain full access.</p>';
    }
    public static function save( int $user_id ): void {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'edit_user', $user_id ) || ! wp_verify_nonce( $_POST['katukina_permissions_nonce'] ?? '', 'katukina_user_permissions' ) ) { return; }
        $user = get_user_by( 'id', $user_id ); if ( ! $user || in_array( 'administrator', $user->roles, true ) ) { return; }
        $requested = array_map( 'sanitize_key', (array) ( $_POST['katukina_caps'] ?? array() ) );
        foreach ( self::DOMAINS as $domain => $label ) { if ( in_array( $domain, $requested, true ) ) { $user->add_cap( 'katukina_' . $domain ); } else { $user->remove_cap( 'katukina_' . $domain ); } }
        Database::audit( 'permissions.updated', 'user:' . $user_id, array( 'domains' => array_values( array_intersect( $requested, array_keys( self::DOMAINS ) ) ) ) );
    }
}
