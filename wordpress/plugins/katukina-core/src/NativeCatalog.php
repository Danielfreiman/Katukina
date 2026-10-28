<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** WooCommerce owns products, variants and all catalogue fields. Records only retain ledger foreign keys. */
final class NativeCatalog {
    public static function register(): void {
        add_action( 'woocommerce_after_product_object_save', array( self::class, 'bind' ) );
        add_action( 'woocommerce_after_product_variation_object_save', array( self::class, 'bind' ) );
        add_action( 'woocommerce_before_product_object_save', array( self::class, 'guard' ) );
        add_action( 'woocommerce_before_product_variation_object_save', array( self::class, 'guard' ) );
        add_action( 'before_delete_post', array( self::class, 'archive' ) );
        add_filter( 'woocommerce_duplicate_product_exclude_meta', static function ( $keys, $existing ) {
            $workbook = array_filter( $existing, static fn( $key ) => is_string( $key ) && str_starts_with( $key, '_kat_workbook_' ) );
            return array_values( array_unique( array_merge( $keys, array( '_kat_item_record_id', '_kat_form_record_id', '_kat_lot_identity', '_kat_catalog_migration_source', '_kat_legacy_item_id', '_kat_legacy_form_id' ), $workbook ) ) );
        }, 10, 2 );
        // WooCommerce reuses the parent's exclusion list for children. Remove
        // variation-only provenance from each clone before its first save too.
        add_action( 'woocommerce_product_duplicate_before_save', static function ( $duplicate ) {
            foreach ( $duplicate->get_meta_data() as $meta ) { if ( str_starts_with( $meta->key, '_kat_workbook_' ) ) { $duplicate->delete_meta_data( $meta->key ); } }
        } );
        add_filter( 'woocommerce_product_data_tabs', static function ( $tabs ) {
            $tabs['katukina_details'] = array( 'label' => 'Origin and packaging', 'target' => 'katukina_product_data', 'priority' => 65 ); return $tabs;
        } );
        add_action( 'woocommerce_product_data_panels', static function () {
            global $product_object;
            echo '<div id="katukina_product_data" class="panel woocommerce_options_panel hidden">';
            self::fields( $product_object ); echo '</div>';
        } );
        add_action( 'woocommerce_product_after_variable_attributes', static function ( $index, $data, $post ) {
            echo '<div class="form-row form-row-full"><h4>Origin and packaging</h4>';
            self::fields( wc_get_product( $post->ID ), $index ); echo '</div>';
        }, 10, 3 );
        add_action( 'woocommerce_admin_process_product_object', static fn( $product ) => self::save_fields( $product ) );
        add_action( 'woocommerce_admin_process_variation_object', static fn( $product, $index ) => self::save_fields( $product, $index ), 10, 2 );
    }

    public static function specs(): array {
        return array(
            'type' => array( 'Packaging type', array( 'packaged' => 'Packaged', 'bulk' => 'Bulk' ), 'packaged' ),
            'unit' => array( 'Stock unit', array( 'unit' => 'Unit', 'g' => 'Gram', 'ml' => 'Millilitre' ), 'unit' ),
            'content_unit' => array( 'Content unit', array( 'unit' => 'Unit', 'g' => 'Gram', 'ml' => 'Millilitre' ), 'unit' ),
            'content_quantity' => array( 'Content per pack', null, '1' ),
            'origin_product_id' => array( 'Source product ID', null, '' ),
            'origin_country' => array( 'Country of origin (ISO code)', null, '' ),
            'supplier_id' => array( 'Supplier', array(), '' ),
            'location' => array( 'Storage location', null, '' ),
            'volume_ml' => array( 'Volume (ml)', null, '' ),
            'net_weight_g' => array( 'Net weight (g)', null, '' ),
            'channel_ids' => array( 'Sales channels', null, '' ),
            'hs_group' => array( 'HS group', null, '' ),
            'customs_description' => array( 'Customs description', null, '' ),
            'blocked_countries' => array( 'Blocked destinations', null, '' ),
            'rt_price_original' => array( 'RT PRICE original', null, '' ),
            'legacy_item_id' => array( 'Legacy item ID', null, '' ),
            'legacy_form_id' => array( 'Legacy packaging ID', null, '' ),
            'notes' => array( 'Internal packaging notes', null, '' ),
            'post_shipping_instructions' => array( 'Customer instructions after shipping', null, '' ),
            'channel_prices' => array( 'Fixed prices (channel ID/currency=amount; ...)', null, '' ),
        );
    }
    public static function value( \WC_Product $product, string $field ): string {
        $value = $product->get_meta( '_kat_' . $field, true, 'edit' );
        return '' === $value ? (string) ( self::specs()[ $field ][2] ?? '' ) : (string) $value;
    }
    public static function fields( \WC_Product $product, ?int $index = null ): void {
        echo '<p class="form-field">Manage name, SKU, prices, images, weight, taxes and stock in the standard WooCommerce fields. Use variations for different pack sizes.</p>';
        foreach ( self::specs() as $field => [ $label, $options, $default ] ) {
            if ( 'channel_ids' === $field ) {
                $name = null === $index ? 'kat_product[channel_ids][]' : 'kat_variations[' . $index . '][channel_ids][]';
                $selected = array_values( array_filter( explode( ',', self::value( $product, $field ) ) ) ); if ( ! $selected ) { $selected = array( 'default' ); }
                $choices = array( 'default' => 'Default channel / inherit parent', 'none' => 'Not published on any channel' );
                foreach ( Registry::all( 'channel' ) as $channel ) { if ( $channel['data']['active'] || in_array( (string) $channel['id'], $selected, true ) ) { $choices[ $channel['id'] ] = $channel['data']['name']; } }
                echo '<p class="form-field"><label>Sales channels</label><select multiple name="' . esc_attr( $name ) . '" aria-label="Sales channels" style="min-width:240px">';
                foreach ( $choices as $value => $caption ) { echo '<option value="' . esc_attr( $value ) . '" ' . selected( in_array( (string) $value, $selected, true ), true, false ) . '>' . esc_html( $caption ) . '</option>'; }
                echo '</select><span class="description">Select specific channels, or select only the default/inherit option. Variation publication also requires its parent to be published on that channel.</span></p>'; continue;
            }
            if ( 'supplier_id' === $field ) { $options = array( '' => '—' ); foreach ( Registry::all( 'supplier' ) as $supplier ) { if ( $supplier['data']['active'] ) { $options[ $supplier['id'] ] = $supplier['data']['name']; } } }
            if ( 'hs_group' === $field ) { $options = array( '' => 'Unassigned' ); foreach ( Registry::all( 'hs' ) as $rule ) { if ( $rule['data']['active'] ) { $options[ $rule['data']['group'] ] = $rule['data']['group']; } } $existing = self::value( $product, $field ); if ( $existing && ! isset( $options[ $existing ] ) ) { $options[ $existing ] = $existing . ' (classification not configured)'; } }
            $args = array( 'id' => 'kat_' . $field . ( null === $index ? '' : '_' . $index ), 'name' => null === $index ? 'kat_product[' . $field . ']' : 'kat_variations[' . $index . '][' . $field . ']', 'label' => $label, 'value' => self::value( $product, $field ), 'wrapper_class' => null === $index ? '' : 'form-row form-row-full' );
            if ( 'origin_product_id' === $field ) { $args['description'] = 'Optional: the master product shared by bulk stock and packaged products. Variations already use their parent product.'; $args['desc_tip'] = true; }
            if ( 'blocked_countries' === $field ) { $args['description'] = 'Comma-separated ISO country codes, such as FR,DE. Parent product restrictions also apply to variations.'; $args['desc_tip'] = true; }
            if ( 'hs_group' === $field ) { $args['description'] = 'Validate the classification for the destination and applicable dates.'; $args['desc_tip'] = true; }
            if ( 'channel_ids' === $field ) { $args['description'] = 'Comma-separated channel IDs. Empty: current default channel (variations inherit their parent). Use none to unpublish on all channels. Variations cannot expand parent visibility.'; $args['desc_tip'] = true; }
            if ( null !== $options ) { $args['options'] = $options; woocommerce_wp_select( $args ); }
            else { woocommerce_wp_text_input( $args ); }
        }
        $form_id = (int) $product->get_meta( '_kat_form_record_id' );
        if ( $form_id ) { echo '<p class="form-field"><a class="button" href="' . esc_url( admin_url( 'edit.php?post_type=product&page=katukina-lots&product_id=' . $product->get_id() ) ) . '">View product lots and repacking</a></p>'; }
        self::imported_source_data( $product );
    }
    private static function source_text( mixed $value ): string {
        return is_scalar( $value ) ? (string) $value : '';
    }
    private static function source_table( array $rows, array $columns ): void {
        echo '<div style="overflow-x:auto"><table class="widefat striped"><thead><tr><th scope="col">Source row</th>';
        foreach ( $columns as $label ) { echo '<th scope="col">' . esc_html( $label ) . '</th>'; }
        echo '</tr></thead><tbody>';
        foreach ( $rows as $row ) {
            if ( ! is_array( $row ) || ! isset( $row['data'] ) || ! is_array( $row['data'] ) ) { continue; }
            echo '<tr><th scope="row">' . esc_html( self::source_text( $row['source_row'] ?? '' ) ) . '</th>';
            foreach ( $columns as $field => $label ) {
                $value = self::source_text( $row['data'][ $field ] ?? '' );
                if ( in_array( $field, array( 'retail_active', 'wholesale_active' ), true ) ) { $value = match ( $value ) { '1' => 'Yes', '0' => 'No', default => $value }; }
                echo '<td>' . esc_html( '' === $value ? '—' : $value ) . '</td>';
            }
            echo '</tr>';
        }
        echo '</tbody></table></div>';
    }
    private static function imported_source_data( \WC_Product $product ): void {
        if ( ! current_user_can( 'edit_post', $product->get_id() ) ) { return; }
        $rows = $product->get_meta( '_kat_workbook_source_rows', true, 'edit' );
        $urls = $product->get_meta( '_kat_workbook_source_urls', true, 'edit' );
        $issues = $product->get_meta( '_kat_workbook_issues', true, 'edit' );
        $hash = self::source_text( $product->get_meta( '_kat_workbook_source_sha256', true, 'edit' ) );
        $rows = is_array( $rows ) ? $rows : array();
        $urls = is_array( $urls ) ? $urls : array();
        $issues = is_array( $issues ) ? $issues : array();
        if ( ! $rows && ! $urls && ! $issues && ! $hash ) { return; }
        echo '<div class="options_group" style="clear:both;padding:12px"><details><summary style="cursor:pointer;font-weight:600">Imported source data</summary>';
        echo '<p class="description">Read-only workbook references. Current selling settings remain in the standard WooCommerce fields.</p>';
        if ( $rows ) {
            $quantity = self::source_text( $product->get_meta( '_kat_workbook_sale_quantity', true, 'edit' ) );
            $stock = self::source_text( $product->get_meta( '_kat_workbook_stock_snapshot', true, 'edit' ) );
            $unit = self::source_text( $product->get_meta( '_kat_workbook_stock_unit', true, 'edit' ) );
            echo '<p><strong>Imported sale quantity:</strong> ' . esc_html( '' === $quantity ? '—' : $quantity ) . '</p>';
            echo '<p><strong>Stock snapshot:</strong> ' . esc_html( '' === $stock ? '—' : trim( $stock . ' ' . $unit ) ) . '<br><span class="description">Reference only — not available inventory. Repeated quantity tiers share the same source snapshot.</span></p>';
            echo '<h4>Original price tiers</h4><p class="description">Prices are in GBP for the stated quantity. Active flags describe the source workbook; wholesale tiers are not configured pricing rules.</p>';
            self::source_table( $rows, array( 'quantity_label' => 'Quantity', 'retail_price_gbp' => 'Retail price (GBP)', 'retail_active' => 'Retail active', 'wholesale_price_gbp' => 'Wholesale price (GBP)', 'wholesale_active' => 'Wholesale active' ) );
            echo '<h4>Original measurements and VAT</h4><p class="description">Weight and volume units require validation. These raw values have not been converted to shipping measurements. VAT labels are source references, not configured tax rates.</p>';
            self::source_table( $rows, array( 'quantity_label' => 'Quantity', 'weight' => 'Weight (raw)', 'net_weight' => 'Net weight (raw)', 'gross_weight' => 'Gross weight (raw)', 'volume' => 'Volume (raw)', 'vat_label' => 'VAT label (source)' ) );
        }
        $links = array();
        foreach ( $urls as $url ) {
            $text = self::source_text( $url );
            if ( ! preg_match( '#^https?://#i', $text ) ) { continue; }
            $safe = esc_url( $text, array( 'http', 'https' ) );
            if ( $safe ) { $links[] = '<li><a href="' . $safe . '" target="_blank" rel="noopener noreferrer">' . esc_html( $text ) . '</a></li>'; }
        }
        if ( $links ) { echo '<h4>Source product pages</h4><ul style="overflow-wrap:anywhere">' . implode( '', $links ) . '</ul>'; }
        if ( $issues ) {
            echo '<h4>Import notes</h4><ul class="ul-disc" style="margin-left:20px">';
            foreach ( $issues as $issue ) {
                $message = self::source_text( is_array( $issue ) ? ( $issue['message'] ?? '' ) : $issue );
                if ( '' === $message ) { continue; }
                $numbers = array();
                foreach ( is_array( $issue ) && is_array( $issue['source_rows'] ?? null ) ? $issue['source_rows'] : array() as $number ) {
                    $value = self::source_text( $number );
                    if ( preg_match( '/^[1-9][0-9]*$/D', $value ) ) { $numbers[] = $value; }
                }
                echo '<li>' . esc_html( $message );
                if ( $numbers ) { echo ' <span class="description">' . esc_html( 'Source rows: ' . implode( ', ', $numbers ) . '.' ) . '</span>'; }
                echo '</li>';
            }
            echo '</ul>';
        }
        if ( preg_match( '/^[a-f0-9]{64}$/iD', $hash ) ) { echo '<p class="description">Source SHA-256: <code style="overflow-wrap:anywhere">' . esc_html( $hash ) . '</code></p>'; }
        echo '</details></div>';
    }
    public static function save_fields( \WC_Product $product, ?int $index = null ): void {
        if ( ! current_user_can( 'edit_post', $product->get_id() ) ) { return; }
        // WooCommerce verifies its product/variation nonce before these hooks.
        $input = null === $index ? ( $_POST['kat_product'] ?? null ) : ( $_POST['kat_variations'][ $index ] ?? null );
        if ( ! is_array( $input ) ) { return; }
        $old = array(); foreach ( self::specs() as $field => $spec ) { $old[ $field ] = $product->get_meta( '_kat_' . $field, true, 'edit' ); }
        try {
            if ( isset( $input['channel_ids'] ) && is_array( $input['channel_ids'] ) ) {
                $values = array_values( array_unique( array_map( 'sanitize_text_field', $input['channel_ids'] ) ) );
                if ( count( $values ) > 1 && array_intersect( $values, array( 'default', 'none' ) ) ) { throw new DomainError( 'Choose specific channels or one default/unpublished option.' ); }
                $input['channel_ids'] = in_array( 'default', $values, true ) ? '' : ( implode( ',', $values ) ?: 'none' );
            }
            foreach ( self::specs() as $field => $spec ) { if ( isset( $input[ $field ] ) ) { if ( ! is_scalar( $input[ $field ] ) ) { throw new DomainError( 'Invalid packaging field.' ); } $product->update_meta_data( '_kat_' . $field, sanitize_text_field( wp_unslash( $input[ $field ] ) ) ); } }
            self::guard( $product );
        } catch ( \Throwable $error ) {
            foreach ( $old as $field => $value ) { $product->update_meta_data( '_kat_' . $field, $value ); }
            \WC_Admin_Meta_Boxes::add_error( $error->getMessage() );
        }
    }
    public static function master_id( \WC_Product $product ): int {
        return $product->get_parent_id() ?: ( (int) self::value( $product, 'origin_product_id' ) ?: $product->get_id() );
    }
    public static function identity( \WC_Product $product ): array {
        $data = array( 'master_id' => self::master_id( $product ), 'product_type' => $product->get_type() );
        foreach ( array( 'type', 'unit', 'content_unit', 'content_quantity' ) as $field ) { $data[ $field ] = self::value( $product, $field ); }
        $data['content_quantity'] = Database::number( Database::quantity( $data['content_quantity'] ) );
        return $data;
    }
    public static function guard( \WC_Product $product ): void {
        $prices = PriceLists::parse( self::value( $product, 'channel_prices' ) ); $normalized = array(); foreach ( $prices as $key => $amount ) { $normalized[] = $key . '=' . $amount; } $product->update_meta_data( '_kat_channel_prices', implode( ';', $normalized ) );
        foreach ( self::specs() as $field => [ $label, $options, $default ] ) {
            $value = self::value( $product, $field );
            if ( strlen( $value ) > 2000 ) { throw new DomainError( 'Field is too long: ' . $label ); }
            if ( $options && ! isset( $options[ $value ] ) ) { throw new DomainError( 'Invalid option: ' . $label ); }
        }
        $identity = self::identity( $product );
        if ( 'packaged' === $identity['type'] && 'unit' !== $identity['unit'] ) { throw new DomainError( 'Packaged products use the stock unit: unit.' ); }
        if ( 'bulk' === $identity['type'] && ( 'unit' === $identity['unit'] || $identity['unit'] !== $identity['content_unit'] || '1.000' !== $identity['content_quantity'] ) ) { throw new DomainError( 'Bulk products use g or ml, with content set to 1 in the same unit.' ); }
        foreach ( array( 'origin_country', 'blocked_countries' ) as $field ) {
            $codes = array_filter( array_map( 'trim', explode( ',', strtoupper( self::value( $product, $field ) ) ) ) );
            if ( 'origin_country' === $field && count( $codes ) > 1 ) { throw new DomainError( 'Enter one country of origin.' ); }
            foreach ( $codes as $code ) { if ( ! isset( WC()->countries->get_countries()[ $code ] ) ) { throw new DomainError( 'Invalid country: ' . $code ); } }
            $product->update_meta_data( '_kat_' . $field, implode( ',', array_unique( $codes ) ) );
        }
        if ( self::value( $product, 'supplier_id' ) ) { Registry::get( Registry::positive_id( self::value( $product, 'supplier_id' ) ), 'supplier' ); }
        if ( self::value( $product, 'volume_ml' ) ) { Database::quantity( self::value( $product, 'volume_ml' ) ); }
        if ( self::value( $product, 'net_weight_g' ) ) { Database::quantity( self::value( $product, 'net_weight_g' ) ); }
        $channels = trim( self::value( $product, 'channel_ids' ), ',' );
        if ( '' !== $channels && 'none' !== $channels ) {
            $ids = array_unique( array_map( 'trim', explode( ',', $channels ) ) );
            foreach ( $ids as $id ) { Registry::get( Registry::positive_id( $id ), 'channel' ); }
            $product->update_meta_data( '_kat_channel_ids', ',' . implode( ',', $ids ) . ',' );
        }
        $origin = self::value( $product, 'origin_product_id' );
        if ( $origin ) {
            $master = wc_get_product( Registry::positive_id( $origin ) );
            if ( ! $master || $master->get_parent_id() || (int) self::value( $master, 'origin_product_id' ) || (int) $origin === $product->get_id() || $product->get_parent_id() ) { throw new DomainError( 'The source product must be an independent master product.' ); }
        }
        // Snapshot written on first receipt, never a second editable product record.
        $frozen = $product->get_id() ? get_post_meta( $product->get_id(), '_kat_lot_identity', true ) : '';
        if ( is_array( $frozen ) && ( $identity !== $frozen || $product->managing_stock() ) ) { throw new DomainError( 'This product has lot history. Preserve source, unit and content; physical stock is controlled by lots.', 409 ); }
        if ( is_array( $frozen ) ) { $product->update_meta_data( '_kat_lot_identity', $frozen ); }
    }
    public static function bind( \WC_Product $product ): void {
        if ( ! $product->get_id() || 'auto-draft' === $product->get_status() ) { return; }
        $master_id = self::master_id( $product );
        self::mapping( 'item', $master_id );
        if ( ! $product->is_type( array( 'variable', 'grouped', 'external' ) ) ) { self::mapping( 'form', $product->get_id() ); }
    }
    public static function mapping( string $kind, int $product_id, int $existing_id = 0 ): int {
        global $wpdb;
        $meta = '_kat_' . $kind . '_record_id';
        $id = $existing_id ?: (int) get_post_meta( $product_id, $meta, true );
        if ( $id ) {
            $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'records' ) . ' WHERE id=%d AND kind=%s', $id, $kind ), ARRAY_A );
            if ( ! $row || ( ! $existing_id && (int) ( json_decode( $row['data'], true )['native_product_id'] ?? 0 ) !== $product_id ) ) { $id = 0; }
        }
        if ( ! $id ) {
            $code = 'woo-' . $product_id;
            Database::query( $wpdb->prepare( 'INSERT IGNORE INTO ' . Database::table( 'records' ) . ' (kind,code,data,created_at,updated_at) VALUES (%s,%s,%s,%s,%s)', $kind, $code, wp_json_encode( array( 'native_product_id' => $product_id ) ), gmdate( 'Y-m-d H:i:s' ), gmdate( 'Y-m-d H:i:s' ) ) );
            $id = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . Database::table( 'records' ) . ' WHERE kind=%s AND code=%s', $kind, $code ) );
        } elseif ( $existing_id ) {
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'records' ) . ' SET data=%s WHERE id=%d', wp_json_encode( array( 'native_product_id' => $product_id ) ), $id ) );
        }
        update_post_meta( $product_id, $meta, $id ); return $id;
    }
    public static function project( array $row ): array {
        $product = wc_get_product( (int) ( $row['data']['native_product_id'] ?? 0 ) );
        if ( ! $product ) { $row['data']['active'] = false; return $row; } // Unmapped historical records remain audit-only.
        $data = array(); foreach ( Registry::definitions()[ $row['kind'] ]['fields'] as $key => $field ) { $data[ $key ] = ''; }
        $data['name'] = $product->get_name(); $data['description'] = $product->get_description();
        $data['active'] = ! in_array( $product->get_status(), array( 'trash', 'auto-draft' ), true );
        $data['product_id'] = $product->get_id();
        foreach ( self::specs() as $field => $spec ) { if ( array_key_exists( $field, $data ) ) { $data[ $field ] = self::value( $product, $field ); } }
        $data['legacy_id'] = self::value( $product, 'item' === $row['kind'] ? 'legacy_item_id' : 'legacy_form_id' );
        if ( 'form' === $row['kind'] ) {
            $data['item_id'] = (int) get_post_meta( self::master_id( $product ), '_kat_item_record_id', true );
            $data['gross_weight_g'] = '' === $product->get_weight() ? '' : (string) wc_get_weight( (float) $product->get_weight(), 'g' );
            $data['vat_category'] = $product->get_tax_class(); $data['low_stock'] = $product->get_low_stock_amount();
        }
        $row['code'] = $product->get_sku() ?: 'woo-' . $product->get_id(); $row['data'] = $data; return $row;
    }
    public static function archive( int $product_id ): void {
        if ( ! in_array( get_post_type( $product_id ), array( 'product', 'product_variation' ), true ) ) { return; }
        global $wpdb;
        foreach ( array( 'item', 'form' ) as $kind ) {
            $id = (int) get_post_meta( $product_id, '_kat_' . $kind . '_record_id', true );
            if ( ! $id ) { continue; }
            $row = Registry::get( $id, $kind, false ); $row['data']['active'] = false; $row['data']['deleted_product_id'] = $product_id;
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'records' ) . ' SET data=%s WHERE id=%d', wp_json_encode( $row['data'] ), $id ) );
        }
    }
}
