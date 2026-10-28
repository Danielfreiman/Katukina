<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Native admin extensions for functionality absent from WooCommerce core. */
final class NativeAdmin {
    const SETTINGS = array( 'company', 'warehouse', 'channel', 'country', 'hs', 'transition' );
    const CONTACTS = array( 'contact', 'mailbox', 'template', 'message', 'subscription', 'campaign' );
    public static function register(): void {
        add_action( 'init', static function () { if ( is_admin() && current_user_can( 'manage_woocommerce' ) && 'katukina' === ( $_GET['page'] ?? '' ) ) { wp_safe_redirect( admin_url( 'edit.php?post_type=product' ) ); exit; } } );
        add_action( 'admin_enqueue_scripts', static function () { if ( current_user_can( 'manage_woocommerce' ) ) { wp_enqueue_script( 'wp-api-request' ); } } );
        add_action( 'admin_menu', static function () {
            add_submenu_page( 'edit.php?post_type=product', 'Lots and repacking', 'Lots and repacking', 'katukina_inventory', 'katukina-lots', array( self::class, 'inventory' ) );
            add_submenu_page( 'edit.php?post_type=product', 'Inventory', 'Inventory', 'katukina_inventory', 'katukina-inventory', static function () { echo '<div class="wrap"><h1>Inventory</h1>'; self::report( 'stock_levels' ); echo '<p><a href="' . esc_url( admin_url( 'edit.php?post_type=product&page=katukina-lots' ) ) . '">Lots, receipts, adjustments and reservations</a></p></div>'; } );
            add_submenu_page( 'edit.php?post_type=product', 'Production', 'Production', 'katukina_inventory', 'katukina-production', array( ProductionAdmin::class, 'render' ) );
            add_submenu_page( 'edit.php?post_type=product', 'HS Codes', 'HS Codes', 'katukina_settings', 'katukina-hs', static fn() => self::record_page( 'hs' ) );
            add_submenu_page( 'edit.php?post_type=product', 'Samples', 'Samples', 'katukina_inventory', 'katukina-samples', static function () { $_GET['operation'] = 'issue-sample'; self::inventory(); } );
            add_submenu_page( 'edit.php?post_type=product', 'Suppliers', 'Suppliers', 'katukina_crm', 'katukina-suppliers', static fn() => self::record_page( 'supplier' ) );
            add_submenu_page( 'edit.php?post_type=product', 'Expected receipts', 'Expected receipts', 'katukina_inventory', 'katukina-incoming', static fn() => self::record_page( 'incoming' ) );
            add_submenu_page( 'users.php', 'Contacts and support', 'Contacts and support', 'katukina_crm', 'katukina-contacts', array( self::class, 'contacts' ) );
            add_submenu_page( 'tools.php', 'Operational audit', 'Operational audit', 'katukina_reports', 'katukina-audit', static function () { echo '<div class="wrap"><h1>Operational audit</h1>'; self::report( 'audit' ); echo '</div>'; } );
        } );
        add_filter( 'woocommerce_settings_tabs_array', static function ( $tabs ) { if ( current_user_can( 'katukina_settings' ) ) { $tabs['katukina'] = 'Operations'; } return $tabs; }, 50 );
        add_action( 'woocommerce_sections_katukina', array( self::class, 'settings_sections' ) );
        add_action( 'woocommerce_settings_katukina', array( self::class, 'settings' ) );
        add_action( 'woocommerce_update_options_katukina', array( self::class, 'save_settings' ) );
        add_action( 'admin_post_katukina_record', array( self::class, 'save_record' ) );
        add_action( 'admin_post_katukina_inventory', array( self::class, 'save_inventory' ) );
        add_action( 'show_user_profile', array( self::class, 'customer_credit' ) );
        add_action( 'edit_user_profile', array( self::class, 'customer_credit' ) );
        add_action( 'personal_options_update', array( self::class, 'save_credit' ) );
        add_action( 'edit_user_profile_update', array( self::class, 'save_credit' ) );
        add_action( 'admin_notices', static function () {
            $notice = get_transient( 'katukina_notice_' . get_current_user_id() );
            if ( $notice ) { delete_transient( 'katukina_notice_' . get_current_user_id() ); echo '<div class="notice notice-' . esc_attr( $notice['type'] ) . ' is-dismissible"><p>' . esc_html( $notice['text'] ) . '</p></div>'; }
        } );
        add_action( 'rest_api_init', static function () { register_rest_route( 'katukina/v1', '/modules', array( 'methods' => 'GET', 'permission_callback' => static fn() => current_user_can( 'manage_woocommerce' ), 'callback' => static fn() => rest_ensure_response( Modules::all() ) ) ); } );
    }
    public static function notice( string $message, string $type = 'success' ): void { set_transient( 'katukina_notice_' . get_current_user_id(), array( 'text' => $message, 'type' => $type ), 60 ); }
    private static function check( string $cap ): void { if ( ! current_user_can( $cap ) ) { wp_die( 'You do not have permission to perform this action.', '', array( 'response' => 403 ) ); } }
    private static function fields( array $fields, array $values = array(), string $prefix = 'data' ): void {
        echo '<table class="form-table" role="presentation"><tbody>';
        foreach ( $fields as $key => $field ) {
            $name = $prefix . '[' . $key . ']'; $id = 'kat-' . $prefix . '-' . $key; $value = $values[ $key ] ?? ''; $type = $field['type']; $options = $field['options'] ?? array();
            if ( str_starts_with( $type, 'ref:' ) ) { $options = array( '' => 'Select…' ); foreach ( Registry::all( substr( $type, 4 ) ) as $row ) { if ( ! empty( $row['data']['active'] ) || (string) $row['id'] === (string) $value ) { $options[ $row['id'] ] = $row['data']['name'] . ' (' . $row['code'] . ')'; } } $type = 'select'; }
            if ( 'country' === $type ) { $options = array( '' => 'Select…' ) + WC()->countries->get_countries(); $type = 'select'; }
            if ( 'jurisdiction' === $type ) { $options = array( '' => 'Select…', 'EU' => 'European Union' ) + WC()->countries->get_countries(); $type = 'select'; }
            if ( 'currency' === $type ) { $options = array( '' => 'Select…' ) + get_woocommerce_currencies(); $type = 'select'; }
            echo '<tr><th scope="row"><label for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label></th><td>';
            $attrs = ' id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" ' . ( ! empty( $field['required'] ) ? 'required ' : '' );
            if ( 'boolean' === $type ) { echo '<input type="checkbox" ' . $attrs . ' value="1" ' . checked( (bool) $value, true, false ) . '>'; }
            elseif ( 'select' === $type ) { echo '<select ' . $attrs . '>'; foreach ( $options as $option => $label ) { echo '<option value="' . esc_attr( $option ) . '" ' . selected( (string) $value, (string) $option, false ) . '>' . esc_html( $label ) . '</option>'; } echo '</select>'; }
            elseif ( 'textarea' === $type ) { echo '<textarea class="regular-text" rows="4" ' . $attrs . '>' . esc_textarea( $value ) . '</textarea>'; }
            else { echo '<input class="regular-text" type="' . esc_attr( in_array( $type, array( 'email', 'url', 'date' ), true ) ? $type : 'text' ) . '" ' . $attrs . ' value="' . esc_attr( $value ) . '">'; }
            echo '</td></tr>';
        }
        echo '</tbody></table>';
    }
    private static function record_url( string $kind ): string {
        if ( 'incoming' === $kind ) { return admin_url( 'edit.php?post_type=product&page=katukina-incoming' ); }
        if ( 'hs' === $kind ) { return admin_url( 'edit.php?post_type=product&page=katukina-hs' ); }
        if ( in_array( $kind, self::SETTINGS, true ) ) { return admin_url( 'admin.php?page=wc-settings&tab=katukina&section=' . $kind ); }
        return admin_url( 'supplier' === $kind ? 'edit.php?post_type=product&page=katukina-suppliers' : 'users.php?page=katukina-contacts&section=' . $kind );
    }
    public static function record_page( string $kind ): void {
        self::check( Registry::definitions()[ $kind ]['capability'] );
        echo '<div class="wrap">';
        self::record_heading( $kind );
        if ( self::editing_record() ) {
            echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="katukina_record">';
            self::record_editor( $kind ); submit_button( empty( $_GET['record_id'] ) ? 'Add new' : 'Save changes' ); echo '</form>';
        } else { self::record_table( $kind ); }
        if ( self::editing_record() && ! empty( $_GET['record_id'] ) ) { do_action( 'katukina_record_detail', $kind, absint( $_GET['record_id'] ) ); }
        echo '</div>';
    }
    private static function editing_record(): bool {
        return ! empty( $_GET['record_id'] ) || 'add' === ( $_GET['record_action'] ?? '' );
    }
    private static function record_heading( string $kind, string $tag = 'h1' ): void {
        $label = Registry::definitions()[ $kind ]['label'];
        $title = self::editing_record() ? ( empty( $_GET['record_id'] ) ? 'Add new' : 'Edit record' ) . ' — ' . $label : $label;
        echo '<' . $tag . ' class="wp-heading-inline">' . esc_html( $title ) . '</' . $tag . '> ';
        if ( self::editing_record() ) { echo '<a class="page-title-action" href="' . esc_url( self::record_url( $kind ) ) . '">Back to list</a>'; }
        else { echo '<a class="page-title-action" href="' . esc_url( add_query_arg( 'record_action', 'add', self::record_url( $kind ) ) ) . '">Add new</a>'; }
        echo '<hr class="wp-header-end">';
    }
    private static function record_editor( string $kind ): void {
        $definition = Registry::definitions()[ $kind ]; self::check( $definition['capability'] ); $row = null; $id = absint( $_GET['record_id'] ?? 0 );
        if ( $id ) { try { $row = Registry::get( $id, $kind, false ); } catch ( DomainError $error ) { wp_die( esc_html( $error->getMessage() ), '', array( 'response' => 404 ) ); } }
        wp_nonce_field( 'kat-record-' . $kind, 'kat_record_nonce' );
        foreach ( array( 'kind' => $kind, 'id' => $id, 'version' => $row['version'] ?? 0, 'key' => wp_generate_uuid4() ) as $key => $value ) { echo '<input type="hidden" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '">'; }
        echo '<table class="form-table" role="presentation"><tbody><tr><th scope="row"><label for="kat-code">Reference code</label></th><td><input class="regular-text" id="kat-code" name="code" value="' . esc_attr( $row['code'] ?? '' ) . '" required><p class="description">A unique reference using letters, numbers, dots, hyphens, colons or underscores.</p></td></tr></tbody></table>';
        self::fields( $definition['fields'], $row['data'] ?? array( 'active' => true ) );
    }
    private static function record_table( string $kind ): void {
        $page = max( 1, absint( $_GET['paged'] ?? 1 ) ); $result = Registry::list( $kind, $page );
        echo '<div class="tablenav top"><div class="tablenav-pages"><span class="displaying-num">' . esc_html( sprintf( _n( '%s item', '%s items', $result['total'] ), number_format_i18n( $result['total'] ) ) ) . '</span></div></div>';
        $columns = 'supplier' === $kind ? array( 'name' => 'Name', 'code' => 'Reference code', 'email' => 'Email', 'phone' => 'Phone', 'country' => 'Country', 'active' => 'Status' ) : array( 'name' => 'Name', 'code' => 'Reference code', 'active' => 'Status' );
        echo '<table class="wp-list-table widefat fixed striped"><thead><tr>';
        foreach ( $columns as $label ) { echo '<th scope="col">' . esc_html( $label ) . '</th>'; } echo '</tr></thead><tbody>';
        foreach ( $result['rows'] as $row ) {
            $edit = add_query_arg( 'record_id', $row['id'], self::record_url( $kind ) ); echo '<tr>';
            foreach ( $columns as $key => $label ) {
                echo '<td>';
                if ( 'name' === $key ) { echo '<strong><a class="row-title" href="' . esc_url( $edit ) . '">' . esc_html( $row['data']['name'] ) . '</a></strong><div class="row-actions"><span class="edit"><a href="' . esc_url( $edit ) . '">Edit</a></span></div>'; }
                elseif ( 'active' === $key ) { echo $row['data']['active'] ? 'Active' : 'Inactive'; }
                else { echo esc_html( ( 'code' === $key ? $row['code'] : ( $row['data'][ $key ] ?? '' ) ) ?: '—' ); }
                echo '</td>';
            } echo '</tr>';
        }
        if ( ! $result['rows'] ) { echo '<tr><td colspan="' . count( $columns ) . '">No records found.</td></tr>'; } echo '</tbody></table>';
        echo wp_kses_post( paginate_links( array( 'base' => add_query_arg( 'paged', '%#%', self::record_url( $kind ) ), 'total' => (int) ceil( $result['total'] / 100 ), 'current' => $page ) ) ?? '' );
    }
    private static function persist_record(): array {
        $kind = sanitize_key( $_POST['kind'] ?? '' );
        if ( ! in_array( $kind, array_merge( self::SETTINGS, self::CONTACTS, array( 'supplier', 'incoming' ) ), true ) ) { throw new DomainError( 'Use the standard WooCommerce screens for this record.' ); }
        self::check( Registry::definitions()[ $kind ]['capability'] ); check_admin_referer( 'kat-record-' . $kind, 'kat_record_nonce' );
        $input = array_intersect_key( wp_unslash( $_POST ), array_flip( array( 'kind', 'id', 'version', 'key', 'code', 'data' ) ) );
        return Database::command( 'record.save', $input, array( Registry::class, 'save' ) );
    }
    public static function save_record(): void {
        $kind = sanitize_key( $_POST['kind'] ?? '' );
        try { $row = self::persist_record(); self::notice( 'Record saved.' ); $url = add_query_arg( 'record_id', $row['id'], self::record_url( $kind ) ); }
        catch ( \Throwable $error ) { self::notice( $error->getMessage(), 'error' ); $url = wp_get_referer() ?: admin_url(); }
        wp_safe_redirect( $url ); exit;
    }
    public static function settings_sections(): void {
        self::check( 'katukina_settings' ); $section = sanitize_key( $_GET['section'] ?? '' ); $sections = array( '' => 'Storefront and reservations' ); foreach ( self::SETTINGS as $kind ) { $sections[ $kind ] = Registry::definitions()[ $kind ]['label']; }
        echo '<ul class="subsubsub">'; foreach ( $sections as $key => $label ) { echo '<li><a class="' . ( $section === $key ? 'current' : '' ) . '" href="' . esc_url( admin_url( 'admin.php?page=wc-settings&tab=katukina&section=' . $key ) ) . '">' . esc_html( $label ) . '</a> | </li>'; } echo '</ul><br class="clear">';
    }
    public static function settings(): void {
        self::check( 'katukina_settings' ); $section = sanitize_key( $_GET['section'] ?? '' );
        if ( in_array( $section, self::SETTINGS, true ) ) {
            $GLOBALS['hide_save_button'] = ! self::editing_record();
            self::record_heading( $section, 'h2' );
            if ( self::editing_record() ) { self::record_editor( $section ); } else { self::record_table( $section ); }
            return;
        }
        echo '<h2>Storefront and reservations</h2><p>Manage prices, store currency, selling countries, taxes, shipping and payments in the corresponding WooCommerce settings tabs.</p>';
        self::fields( array( 'channel_id' => array( 'label' => 'Storefront channel', 'type' => 'ref:channel', 'required' => true ), 'reservation_minutes' => array( 'label' => 'Lot reservation duration (minutes)', 'type' => 'integer', 'required' => true ), 'local_checkout' => array( 'label' => 'Local test checkout (no payment or dispatch)', 'type' => 'boolean' ) ), array( 'channel_id' => get_option( 'katukina_storefront_channel' ), 'reservation_minutes' => get_option( 'katukina_reservation_minutes', 60 ), 'local_checkout' => Commerce::local_enabled() ), 'settings' );
    }
    public static function save_settings(): void {
        self::check( 'katukina_settings' );
        try {
            if ( in_array( sanitize_key( $_GET['section'] ?? '' ), self::SETTINGS, true ) ) {
                if ( ! self::editing_record() ) { return; }
                $row = self::persist_record();
                wp_safe_redirect( add_query_arg( array( 'record_id' => $row['id'], 'saved' => 'true' ), self::record_url( $row['kind'] ) ) ); exit;
            }
            $input = wp_unslash( $_POST['settings'] ?? array() ); $channel = Registry::get( absint( $input['channel_id'] ?? 0 ), 'channel' ); $minutes = (int) ( $input['reservation_minutes'] ?? 0 );
            if ( $channel['data']['currency'] !== get_woocommerce_currency() || $channel['data']['display_currency'] !== get_woocommerce_currency() ) { throw new DomainError( 'Channel currencies must match the store currency. Currency conversion is not yet available.' ); }
            if ( $minutes < 1 || $minutes > 10080 ) { throw new DomainError( 'Reservation duration must be between 1 and 10080 minutes.' ); }
            if ( ! empty( $input['local_checkout'] ) && 'local' !== wp_get_environment_type() ) { throw new DomainError( 'Test checkout is only available in the local environment.' ); }
            update_option( 'katukina_storefront_channel', (int) $channel['id'] ); update_option( 'katukina_reservation_minutes', $minutes ); update_option( 'katukina_local_checkout', empty( $input['local_checkout'] ) ? 'no' : 'yes' );
            \WC_Cache_Helper::get_transient_version( 'shipping', true ); Database::audit( 'native-settings.saved', 'storefront', array( 'channel_id' => $channel['id'], 'reservation_minutes' => $minutes ) );
        } catch ( \Throwable $error ) { \WC_Admin_Settings::add_error( $error->getMessage() ); }
    }
    public static function contacts(): void {
        self::check( 'katukina_crm' ); $section = sanitize_key( $_GET['section'] ?? 'contact' ); if ( ! in_array( $section, self::CONTACTS, true ) ) { $section = 'contact'; }
        echo '<div class="wrap"><h1>Contacts and support</h1><p>Manage customers in WordPress Users and WooCommerce Customers. Campaign delivery requires an authorized mailbox and an explicit queue action.</p><nav class="nav-tab-wrapper">';
        foreach ( self::CONTACTS as $kind ) { echo '<a class="nav-tab ' . ( $section === $kind ? 'nav-tab-active' : '' ) . '" href="' . esc_url( self::record_url( $kind ) ) . '">' . esc_html( Registry::definitions()[ $kind ]['label'] ) . '</a>'; } echo '</nav></div>'; self::record_page( $section );
    }
    private static function operation_fields( string $action ): array {
        $f = static fn( $label, $type = 'text', $required = true ) => compact( 'label', 'type', 'required' );
        $fields = match ( $action ) {
            'return-stock' => array( 'reservation_id' => $f( 'Fulfilled reservation ID' ), 'quantity' => $f( 'Quantity physically received' ), 'reference' => $f( 'Unique return receipt reference' ), 'inspected' => $f( 'Physically received and inspected', 'boolean' ) ),
            'issue-sample' => array( 'lot_id' => $f( 'Packaged lot ID' ), 'contact_id' => $f( 'Recipient', 'ref:contact' ), 'quantity' => $f( 'Quantity issued' ), 'reference' => $f( 'Unique sample reference' ) ),
            'receive' => array( 'code' => $f( 'Lot code' ), 'form_id' => $f( 'Product / variation', 'ref:form' ), 'warehouse_id' => $f( 'Warehouse', 'ref:warehouse' ), 'quantity' => $f( 'Quantity received' ), 'supplier_id' => $f( 'Supplier', 'ref:supplier', false ), 'supplier_lot' => $f( 'Supplier lot code', 'text', false ), 'expiry' => $f( 'Expiry date', 'date', false ), 'location' => $f( 'Location', 'text', false ), 'cost_minor' => $f( 'Total cost (currency minor units)', 'text', false ), 'currency' => $f( 'Cost currency', 'currency', false ) ),
            'adjust' => array( 'lot_id' => $f( 'Lot ID' ), 'quantity' => $f( 'Quantity (negative to remove stock)' ), 'reference' => $f( 'Reference' ) ),
            'reserve' => array( 'lot_id' => $f( 'Lot ID' ), 'order_id' => $f( 'WooCommerce order' ), 'line_id' => $f( 'Order item ID' ), 'quantity' => $f( 'Quantity' ), 'expires_at' => $f( 'Expires at (UTC, YYYY-MM-DD HH:MM:SS)' ) ),
            'release' => array( 'reservation_id' => $f( 'Reservation ID' ) ),
            'produce' => array( 'input_lot_id' => $f( 'Bulk lot ID' ), 'form_id' => $f( 'Output product / variation', 'ref:form' ), 'code' => $f( 'Output lot code' ), 'quantity' => $f( 'Number of packs' ), 'loss' => $f( 'Loss in bulk units (0 for none)' ) ),
            'reverse-production' => array( 'production_id' => $f( 'Production ID' ) ), default => array(),
        }; if ( 'receive' === $action ) { $fields['incoming_id'] = $f( 'Expected receipt (optional)', 'ref:incoming', false ); } $fields['reason'] = $f( 'Reason', 'textarea' ); return $fields;
    }
    public static function inventory(): void {
        self::check( 'katukina_inventory' ); $tabs = array( 'lots' => 'Lots', 'receive' => 'Receive lot', 'adjust' => 'Adjust stock', 'produce' => 'Repack', 'production' => 'Repacking runs', 'reverse-production' => 'Reverse repacking', 'reservations' => 'Reservations', 'reserve' => 'Reserve stock', 'release' => 'Release reservation', 'movements' => 'Movements', 'reconciliation' => 'Reconciliation' );
        $tabs['return-stock'] = 'Receive inspected return'; $tabs['issue-sample'] = 'Issue sample';
        $action = sanitize_key( $_GET['operation'] ?? 'lots' ); if ( ! isset( $tabs[ $action ] ) ) { $action = 'lots'; }
        echo '<div class="wrap"><h1>Lots and repacking</h1><p>Manage the catalogue in <a href="' . esc_url( admin_url( 'edit.php?post_type=product' ) ) . '">Products</a>. Products without lots use WooCommerce stock management. Receiving the first lot enables lot-based stock control and locks the packaging identity.</p><nav class="nav-tab-wrapper">';
        $parents = array( 'receive' => 'lots', 'adjust' => 'lots', 'produce' => 'production', 'reverse-production' => 'production', 'reserve' => 'reservations', 'release' => 'reservations' );
        $parents['return-stock'] = 'lots'; $parents['issue-sample'] = 'lots';
        $current = $parents[ $action ] ?? $action;
        $url = static fn( $operation ) => add_query_arg( array( 'operation' => $operation, 'product_id' => absint( $_GET['product_id'] ?? 0 ), 'order_id' => absint( $_GET['order_id'] ?? 0 ) ), admin_url( 'edit.php?post_type=product&page=katukina-lots' ) );
        foreach ( array( 'lots', 'production', 'reservations', 'movements', 'reconciliation' ) as $key ) { echo '<a class="nav-tab ' . ( $key === $current ? 'nav-tab-active' : '' ) . '" href="' . esc_url( $url( $key ) ) . '">' . esc_html( $tabs[ $key ] ) . '</a>'; } echo '</nav>';
        echo '<p>';
        if ( isset( $parents[ $action ] ) ) { echo '<a class="button" href="' . esc_url( $url( $current ) ) . '">Back to list</a>'; }
        else {
            foreach ( $parents as $operation => $parent ) { if ( $parent === $current ) { echo '<a class="button" href="' . esc_url( $url( $operation ) ) . '">' . esc_html( in_array( $operation, array( 'receive', 'produce', 'reserve' ), true ) ? 'Add new — ' . $tabs[ $operation ] : $tabs[ $operation ] ) . '</a> '; } }
        } echo '</p>';
        if ( isset( OperationsApi::ACTIONS[ $action ] ) ) {
            echo '<h2>' . esc_html( $tabs[ $action ] ) . '</h2><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="katukina_inventory"><input type="hidden" name="operation" value="' . esc_attr( $action ) . '"><input type="hidden" name="key" value="' . esc_attr( wp_generate_uuid4() ) . '">'; wp_nonce_field( 'kat-inventory-' . $action );
            self::fields( self::operation_fields( $action ), array( 'form_id' => get_post_meta( absint( $_GET['product_id'] ?? 0 ), '_kat_form_record_id', true ), 'order_id' => absint( $_GET['order_id'] ?? 0 ) ?: '', 'loss' => '0' ) ); submit_button( $tabs[ $action ] ); echo '</form>';
        } else { self::report( $action ); } echo '</div>';
    }
    public static function save_inventory(): void {
        self::check( 'katukina_inventory' ); $action = sanitize_key( $_POST['operation'] ?? '' ); check_admin_referer( 'kat-inventory-' . $action );
        try {
            if ( ! isset( OperationsApi::ACTIONS[ $action ] ) || 'inventory' !== OperationsApi::ACTIONS[ $action ][0] ) { throw new DomainError( 'Unknown operation.' ); }
            $input = wp_unslash( $_POST['data'] ?? array() ); $input['key'] = sanitize_text_field( $_POST['key'] ?? '' ); $method = OperationsApi::ACTIONS[ $action ]; $result = Database::command( $action, $input, array( $method[1], $method[2] ) ); self::notice( 'Operation saved. Reference: ' . ( $result['id'] ?? $result['order_id'] ?? 'OK' ) );
        } catch ( \Throwable $error ) { self::notice( $error->getMessage(), 'error' ); }
        wp_safe_redirect( wp_get_referer() ?: admin_url( 'edit.php?post_type=product&page=katukina-lots' ) ); exit;
    }
    private static function report( string $type ): void {
        self::check( OperationsApi::report_capability( $type ) ); $page = max( 1, absint( $_GET['paged'] ?? 1 ) );
        $result = OperationsApi::report( $type, $page, absint( $_GET['order_id'] ?? 0 ), absint( $_GET['lot_id'] ?? 0 ) ); $rows = $result['rows'] ?? ( array_is_list( $result ) ? $result : array( $result ) ); $product_id = absint( $_GET['product_id'] ?? 0 );
        if ( $product_id && 'lots' === $type ) { $form = (int) get_post_meta( $product_id, '_kat_form_record_id', true ); $rows = array_filter( $rows, static fn( $row ) => (int) ( $row['form_id'] ?? 0 ) === $form ); }
        if ( ! $rows ) { echo '<table class="wp-list-table widefat striped"><thead><tr><th scope="col">Records</th></tr></thead><tbody><tr><td>No records found.</td></tr></tbody></table>'; return; }
        echo '<div style="overflow-x:auto;margin-top:20px"><table class="wp-list-table widefat striped"><thead><tr>'; foreach ( array_keys( reset( $rows ) ) as $column ) { echo '<th scope="col">' . esc_html( self::column_label( $column ) ) . '</th>'; } echo '</tr></thead><tbody>';
        foreach ( $rows as $row ) { echo '<tr>'; foreach ( $row as $column => $value ) {
            echo '<td>'; if ( 'form_id' === $column ) { try { $form = Registry::get( (int) $value, 'form', false ); $id = $form['data']['product_id'] ?? 0; if ( $id && wc_get_product( $id ) ) { echo '<a href="' . esc_url( get_edit_post_link( $id ) ) . '">' . esc_html( $form['data']['name'] ) . '</a>'; } else { echo esc_html( $value ); } } catch ( DomainError $error ) { echo esc_html( $value ); } } else { echo esc_html( is_array( $value ) ? wp_json_encode( $value, JSON_UNESCAPED_UNICODE ) : (string) $value ); } echo '</td>';
        } echo '</tr>'; } echo '</tbody></table></div><p>'; if ( $page > 1 ) { echo '<a class="button" href="' . esc_url( add_query_arg( 'paged', $page - 1 ) ) . '">Previous page</a> '; } if ( count( $rows ) === 100 ) { echo '<a class="button" href="' . esc_url( add_query_arg( 'paged', $page + 1 ) ) . '">Next page</a>'; } echo '</p>';
    }
    private static function column_label( string $column ): string {
        $labels = array( 'id' => 'ID', 'form_id' => 'Product / variation', 'company_id' => 'Company ID', 'warehouse_id' => 'Warehouse ID', 'lot_id' => 'Lot ID', 'order_id' => 'Order ID', 'line_id' => 'Order item ID', 'actor_id' => 'User ID', 'data' => 'Details', 'state' => 'Status', 'reserved_delta' => 'Reserved change', 'input_lot_id' => 'Source lot ID', 'output_lot_id' => 'Output lot ID' );
        return $labels[ $column ] ?? ucfirst( str_replace( '_', ' ', $column ) );
    }
    public static function customer_credit( $user ): void {
        if ( ! current_user_can( 'katukina_finance' ) || ! current_user_can( 'edit_user', $user->ID ) ) { return; } global $wpdb;
        $rows = $wpdb->get_results( $wpdb->prepare( 'SELECT currency,minor_unit,SUM(amount) balance FROM ' . Database::table( 'money' ) . " WHERE customer_id=%d AND kind='credit' GROUP BY currency,minor_unit", $user->ID ), ARRAY_A );
        echo '<h2>Store credit</h2><p>Credit ledger for this customer. Automatic redemption at checkout is not yet available.</p>'; foreach ( $rows as $row ) { echo '<p>' . esc_html( $row['currency'] . ': ' . number_format( $row['balance'] / pow( 10, $row['minor_unit'] ), $row['minor_unit'], '.', '' ) ) . '</p>'; }
        wp_nonce_field( 'kat-credit-' . $user->ID, 'kat_credit_nonce' ); echo '<input type="hidden" name="kat_credit_key" value="' . esc_attr( wp_generate_uuid4() ) . '">'; $f = static fn( $label ) => array( 'label' => $label, 'type' => 'text', 'required' => false );
        self::fields( array( 'amount' => $f( 'Amount in minor units (leave blank for no change)' ), 'currency' => $f( 'Currency (ISO code)' ), 'minor_unit' => $f( 'Currency decimal places' ), 'reference' => $f( 'Unique reference' ), 'reason' => $f( 'Reason' ) ), array(), 'credit' );
    }
    public static function save_credit( int $user_id ): void {
        if ( empty( $_POST['credit']['amount'] ) || ! current_user_can( 'katukina_finance' ) || ! current_user_can( 'edit_user', $user_id ) ) { return; } check_admin_referer( 'kat-credit-' . $user_id, 'kat_credit_nonce' );
        try { $input = wp_unslash( $_POST['credit'] ); $input['customer_id'] = $user_id; $input['kind'] = 'credit'; $input['key'] = sanitize_text_field( $_POST['kat_credit_key'] ?? '' ); Database::command( 'money', $input, array( Finance::class, 'record' ) ); self::notice( 'Credit entry saved.' ); }
        catch ( \Throwable $error ) { self::notice( $error->getMessage(), 'error' ); }
    }
}
