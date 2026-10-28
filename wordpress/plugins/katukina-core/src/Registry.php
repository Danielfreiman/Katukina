<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Registry {
    public static function definitions(): array {
        $f = static fn( $label, $type = 'text', $required = false, $options = array() ) => compact( 'label', 'type', 'required', 'options' );
        $groups = array(
            'company' => array( 'Companies', 'settings', array( 'name' => $f( 'Legal name / name', 'text', true ), 'country' => $f( 'Country (ISO code)', 'country', true ), 'currency' => $f( 'Accounting currency', 'currency', true ), 'tax_id' => $f( 'Tax identification number' ) ) ),
            'warehouse' => array( 'Warehouses', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'company_id' => $f( 'Owning company', 'ref:company', true ), 'address' => $f( 'Address', 'textarea' ) ) ),
            'channel' => array( 'Channels', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'company_id' => $f( 'Selling company', 'ref:company', true ), 'warehouse_id' => $f( 'Fulfilment warehouse', 'ref:warehouse', true ), 'url' => $f( 'Website URL', 'url' ), 'language' => $f( 'Language', 'text', true ), 'currency' => $f( 'Payment currency', 'currency', true ), 'display_currency' => $f( 'Display currency', 'currency', true ), 'countries' => $f( 'Served countries (comma-separated ISO codes)', 'countries', true ) ) ),
            'supplier' => array( 'Suppliers', 'crm', array( 'name' => $f( 'Name', 'text', true ), 'email' => $f( 'E-mail', 'email' ), 'phone' => $f( 'Phone' ), 'country' => $f( 'Country (ISO code)', 'country' ), 'address' => $f( 'Address', 'textarea' ), 'terms' => $f( 'Purchasing terms', 'textarea' ) ) ),
            'contact' => array( 'Contacts', 'crm', array( 'name' => $f( 'Name', 'text', true ), 'email' => $f( 'E-mail', 'email' ), 'phone' => $f( 'Phone' ), 'supplier_id' => $f( 'Supplier', 'ref:supplier' ), 'customer_id' => $f( 'WordPress user ID', 'user' ), 'consent' => $f( 'Consent recorded', 'boolean' ), 'consent_reference' => $f( 'Consent source and date', 'textarea' ) ) ),
            'item' => array( 'Master items', 'catalog', array( 'name' => $f( 'Name', 'text', true ), 'description' => $f( 'Description', 'textarea' ), 'supplier_id' => $f( 'Supplier', 'ref:supplier' ), 'origin_country' => $f( 'Country of origin', 'country' ), 'rt_price_original' => $f( 'Original RT PRICE (no conversion)' ), 'related_items' => $f( 'Related item codes' ) ) ),
            'form' => array( 'Packaging / SKU', 'catalog', array( 'name' => $f( 'Packaging name', 'text', true ), 'item_id' => $f( 'Master item', 'ref:item', true ), 'product_id' => $f( 'WooCommerce product / variation ID', 'product' ), 'type' => $f( 'Type', 'select', true, array( 'bulk' => 'Bulk', 'packaged' => 'Packaged' ) ), 'unit' => $f( 'Stock unit', 'select', true, array( 'g' => 'Gram', 'ml' => 'Millilitre', 'unit' => 'Unit' ) ), 'content_unit' => $f( 'Content unit', 'select', true, array( 'g' => 'Gram', 'ml' => 'Millilitre', 'unit' => 'Unit' ) ), 'content_quantity' => $f( 'Content per pack', 'quantity', true ), 'gross_weight_g' => $f( 'Gross weight (g)', 'quantity' ), 'volume_ml' => $f( 'Volume (ml)', 'quantity' ), 'low_stock' => $f( 'Low stock threshold', 'quantity' ), 'location' => $f( 'Storage location' ), 'vat_category' => $f( 'VAT category' ), 'hs_group' => $f( 'HS group' ), 'customs_description' => $f( 'Customs description', 'textarea' ), 'blocked_countries' => $f( 'Blocked countries', 'countries' ) ) ),
            'publication' => array( 'Channel listings', 'catalog', array( 'name' => $f( 'Name', 'text', true ), 'form_id' => $f( 'Packaging', 'ref:form', true ), 'channel_id' => $f( 'Channel', 'ref:channel', true ), 'language' => $f( 'Language', 'text', true ), 'title' => $f( 'Channel title' ), 'description' => $f( 'Channel description', 'textarea' ), 'price_minor' => $f( 'Price in currency minor units', 'integer' ), 'currency' => $f( 'Currency', 'currency', true ) ) ),
            'country' => array( 'Countries and notices', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'country' => $f( 'Country (ISO code)', 'country', true ), 'channel_id' => $f( 'Channel', 'ref:channel', true ), 'backoffice_note' => $f( 'BACKOFFICE NOTE — internal', 'textarea' ), 'shipping_note' => $f( 'SHIPPING NOTE — picking', 'textarea' ), 'checkout_note' => $f( 'CHECKOUT NOTE — public', 'textarea' ), 'checkout_warning' => $f( 'CHECKOUT WARNING — public', 'textarea' ), 'requires_acceptance' => $f( 'Require notice acceptance', 'boolean' ) ) ),
            'carrier' => array( 'Carriers and services', 'settings', array( 'name' => $f( 'Service name', 'text', true ), 'carrier' => $f( 'Carrier', 'text', true ), 'channel_id' => $f( 'Channel', 'ref:channel', true ), 'countries' => $f( 'Served countries', 'countries', true ), 'service_code' => $f( 'Service code' ), 'insurance' => $f( 'Insurance', 'select', true, array( 'unconfigured' => 'Not configured', 'included' => 'Included under contract', 'optional' => 'Optional under contract', 'none' => 'No insurance' ) ), 'estimated_days' => $f( 'Estimated delivery time' ), 'contract_reference' => $f( 'Contract reference', 'textarea' ) ) ),
            'tax' => array( 'VAT rules for validation', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'company_id' => $f( 'Company', 'ref:company', true ), 'country' => $f( 'Jurisdiction (ISO code)', 'country', true ), 'category' => $f( 'VAT category', 'text', true ), 'rate' => $f( 'Declared rate (%)', 'rate', true ), 'valid_from' => $f( 'Valid from', 'date', true ), 'valid_to' => $f( 'Valid until', 'date' ), 'verification' => $f( 'Validation source and responsible person', 'textarea', true ) ) ),
            'hs' => array( 'HS classifications for validation', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'group' => $f( 'HS group', 'text', true ), 'country' => $f( 'Destination (ISO code)', 'country', true ), 'hs_code' => $f( 'Validated code', 'text', true ), 'valid_from' => $f( 'Valid from', 'date', true ), 'valid_to' => $f( 'Valid until', 'date' ), 'verification' => $f( 'Validation source and responsible person', 'textarea', true ) ) ),
            'payment_method' => array( 'Payment methods by destination', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'channel_id' => $f( 'Channel', 'ref:channel', true ), 'gateway_id' => $f( 'WooCommerce gateway ID', 'text', true ), 'countries' => $f( 'Countries', 'countries', true ), 'currency' => $f( 'Payment currency', 'currency', true ), 'settlement_currency' => $f( 'Settlement currency', 'currency', true ), 'reference' => $f( 'Public configuration reference (no credentials)' ) ) ),
            'transition' => array( 'Allowed transitions', 'settings', array( 'name' => $f( 'Name', 'text', true ), 'from' => $f( 'From stage', 'select', true, Workflow::STATES ), 'to' => $f( 'To stage', 'select', true, Workflow::STATES ), 'approval_reference' => $f( 'Decision owner / reference', 'textarea', true ) ) ),
            'shipment' => array( 'Shipments and tracking', 'orders', array( 'name' => $f( 'Reference', 'text', true ), 'order_id' => $f( 'WooCommerce order', 'order', true ), 'carrier_id' => $f( 'Service', 'ref:carrier', true ), 'tracking_code' => $f( 'Tracking number', 'text', true ), 'tracking_url' => $f( 'Tracking URL', 'url' ), 'shipped_at' => $f( 'Shipping date', 'date', true ), 'insurance_reference' => $f( 'Insurance reference' ) ) ),
            'mailbox' => array( 'Support mailboxes', 'crm', array( 'name' => $f( 'Name', 'text', true ), 'email' => $f( 'Address', 'email', true ), 'channel_id' => $f( 'Channel', 'ref:channel' ), 'provider' => $f( 'Provider (no credentials)' ) ) ),
            'template' => array( 'Message templates', 'crm', array( 'name' => $f( 'Name', 'text', true ), 'language' => $f( 'Language', 'text', true ), 'subject' => $f( 'Subject', 'text', true ), 'body' => $f( 'Message (plain text)', 'textarea', true ) ) ),
            'message' => array( 'Support messages and drafts', 'crm', array( 'name' => $f( 'Subject', 'text', true ), 'mailbox_id' => $f( 'Source mailbox', 'ref:mailbox', true ), 'direction' => $f( 'Type', 'select', true, array( 'incoming' => 'Incoming — manual record', 'draft' => 'Reply draft' ) ), 'contact_id' => $f( 'Contact', 'ref:contact' ), 'supplier_id' => $f( 'Supplier', 'ref:supplier' ), 'order_id' => $f( 'Order', 'order' ), 'template_id' => $f( 'Insert template', 'ref:template' ), 'body' => $f( 'Message', 'textarea', true ), 'external_id' => $f( 'Provider identifier' ) ) ),
            'subscription' => array( 'Consent and subscriptions', 'crm', array( 'name' => $f( 'Name', 'text', true ), 'email' => $f( 'E-mail', 'email', true ), 'channel_id' => $f( 'Channel', 'ref:channel', true ), 'purpose' => $f( 'Purpose', 'select', true, array( 'marketing' => 'Newsletter', 'back_in_stock' => 'Back in stock' ) ), 'form_id' => $f( 'Packaging', 'ref:form' ), 'consent' => $f( 'Active consent', 'boolean' ), 'consent_reference' => $f( 'Consent source and date', 'textarea', true ) ) ),
            'campaign' => array( 'Campaign drafts', 'crm', array( 'name' => $f( 'Name', 'text', true ), 'channel_id' => $f( 'Channel', 'ref:channel', true ), 'template_id' => $f( 'Template', 'ref:template', true ), 'purpose' => $f( 'Purpose', 'select', true, array( 'marketing' => 'Newsletter', 'back_in_stock' => 'Back in stock' ) ), 'form_id' => $f( 'Packaging', 'ref:form' ) ) ),
            'sample' => array( 'Samples', 'inventory', array( 'name' => $f( 'Reference', 'text', true ), 'form_id' => $f( 'Packaging', 'ref:form', true ), 'contact_id' => $f( 'Recipient', 'ref:contact', true ), 'quantity' => $f( 'Quantity', 'quantity', true ), 'movement_reference' => $f( 'Stock movement reference (record using Adjust stock)' ) ) ),
        );
        $result = array();
        $groups['channel'][2]['currencies'] = $f( 'Additional fixed-price currencies (GBP,EUR)', 'text' );
        $groups['incoming'] = array( 'Expected receipts', 'inventory', array( 'name' => $f( 'Purchase reference', 'text', true ), 'form_id' => $f( 'Product / presentation', 'ref:form', true ), 'warehouse_id' => $f( 'Warehouse', 'ref:warehouse', true ), 'supplier_id' => $f( 'Supplier', 'ref:supplier', true ), 'quantity' => $f( 'Expected quantity (product stock unit)', 'quantity', true ), 'expected_at' => $f( 'Expected receipt date', 'date', true ) ) );
        $groups['hs'][2]['country']['type'] = 'jurisdiction';
        foreach ( $groups as $kind => [ $label, $cap, $fields ] ) {
            $result[ $kind ] = array( 'label' => $label, 'capability' => 'katukina_' . $cap, 'fields' => $fields + array( 'active' => $f( 'Active', 'boolean' ), 'legacy_id' => $f( 'Legacy ID' ), 'notes' => $f( 'Internal notes', 'textarea' ) ) );
        }
        return $result;
    }
    public static function get( int $id, ?string $kind = null, bool $active = true ): array {
        global $wpdb;
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'records' ) . ' WHERE id=%d', $id ), ARRAY_A );
        if ( ! $row || ( $kind && $row['kind'] !== $kind ) ) { throw new DomainError( 'Related record not found.', 404 ); }
        $row['data'] = json_decode( $row['data'], true );
        if ( in_array( $row['kind'], array( 'item', 'form' ), true ) ) { $row = NativeCatalog::project( $row ); }
        if ( $active && ! $row['data']['active'] ) { throw new DomainError( 'Related record is inactive.', 409 ); }
        return $row;
    }
    public static function list( string $kind, int $page = 1, string $search = '' ): array {
        global $wpdb;
        if ( ! isset( self::definitions()[ $kind ] ) ) { throw new DomainError( 'Unknown record type.' ); }
        $where = $wpdb->prepare( 'kind=%s AND (code LIKE %s OR data LIKE %s)', $kind, '%' . $wpdb->esc_like( $search ) . '%', '%' . $wpdb->esc_like( $search ) . '%' );
        $rows = $wpdb->get_results( 'SELECT * FROM ' . Database::table( 'records' ) . " WHERE $where ORDER BY id DESC LIMIT 100 OFFSET " . ( max( 1, $page ) - 1 ) * 100, ARRAY_A );
        foreach ( $rows as &$row ) { $row['data'] = json_decode( $row['data'], true ); if ( in_array( $kind, array( 'item', 'form' ), true ) ) { $row = NativeCatalog::project( $row ); } }
        return array( 'rows' => $rows, 'total' => (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . Database::table( 'records' ) . " WHERE $where" ) );
    }
    public static function all( string $kind ): array {
        global $wpdb;
        return array_map( static function ( $row ) use ( $kind ) { $row['data'] = json_decode( $row['data'], true ); return in_array( $kind, array( 'item', 'form' ), true ) ? NativeCatalog::project( $row ) : $row; }, $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'records' ) . ' WHERE kind=%s ORDER BY id', $kind ), ARRAY_A ) );
    }
    public static function validate( string $kind, array $input ): array {
        $definition = self::definitions()[ $kind ] ?? null;
        if ( ! $definition ) { throw new DomainError( 'Unknown record type.' ); }
        if ( array_diff( array_keys( $input ), array_keys( $definition['fields'] ) ) ) { throw new DomainError( 'The record contains unknown fields.' ); }
        $data = array();
        foreach ( $definition['fields'] as $key => $field ) {
            $value = $input[ $key ] ?? ( 'boolean' === $field['type'] ? false : '' );
            if ( ! is_scalar( $value ) || strlen( (string) $value ) > ( 'textarea' === $field['type'] ? 12000 : 500 ) ) { throw new DomainError( 'Invalid field: ' . $field['label'] ); }
            if ( $field['required'] && '' === trim( (string) $value ) ) { throw new DomainError( 'Required field: ' . $field['label'] ); }
            $type = $field['type'];
            if ( 'boolean' === $type ) { $value = filter_var( $value, FILTER_VALIDATE_BOOLEAN ); }
            elseif ( '' !== (string) $value ) {
                if ( str_starts_with( $type, 'ref:' ) ) { $value = self::positive_id( $value ); self::get( $value, substr( $type, 4 ) ); }
                elseif ( in_array( $type, array( 'user', 'product', 'order' ), true ) ) {
                    $value = self::positive_id( $value );
                    $exists = match ( $type ) { 'user' => get_user_by( 'id', $value ), 'product' => wc_get_product( $value ), 'order' => wc_get_order( $value ) };
                    if ( ! $exists ) { throw new DomainError( 'Reference not found: ' . $field['label'] ); }
                } elseif ( 'select' === $type && ! array_key_exists( $value, $field['options'] ) ) { throw new DomainError( 'Invalid option: ' . $field['label'] ); }
                elseif ( 'quantity' === $type ) { $value = Database::number( Database::quantity( $value ) ); }
                elseif ( 'integer' === $type ) { if ( ! preg_match( '/^\d{1,12}$/D', (string) $value ) ) { throw new DomainError( 'Enter a non-negative integer.' ); } $value = (int) $value; }
                elseif ( 'currency' === $type ) { $value = strtoupper( $value ); if ( ! isset( get_woocommerce_currencies()[ $value ] ) ) { throw new DomainError( 'Invalid currency.' ); } }
                elseif ( in_array( $type, array( 'country', 'countries' ), true ) ) {
                    $codes = array_values( array_unique( array_filter( array_map( 'trim', explode( ',', strtoupper( $value ) ) ) ) ) );
                    if ( 'country' === $type && count( $codes ) !== 1 ) { throw new DomainError( 'Enter one ISO country code.' ); }
                    foreach ( $codes as $code ) { if ( ! isset( WC()->countries->get_countries()[ $code ] ) ) { throw new DomainError( 'Invalid country: ' . $code ); } }
                    $value = implode( ',', $codes );
                } elseif ( 'jurisdiction' === $type ) { $value = strtoupper( $value ); if ( 'EU' !== $value && ! isset( WC()->countries->get_countries()[ $value ] ) ) { throw new DomainError( 'Select EU or an ISO destination country.' ); } }
                elseif ( 'email' === $type ) { if ( ! is_email( $value ) ) { throw new DomainError( 'Invalid email address.' ); } $value = sanitize_email( $value ); }
                elseif ( 'url' === $type ) { if ( ! preg_match( '~^https?://~i', $value ) || ! wp_http_validate_url( $value ) ) { throw new DomainError( 'Enter a valid public HTTP or HTTPS URL.' ); } $value = esc_url_raw( $value ); }
                elseif ( 'date' === $type ) { $date = \DateTimeImmutable::createFromFormat( '!Y-m-d', $value ); if ( ! $date || $date->format( 'Y-m-d' ) !== $value ) { throw new DomainError( 'Invalid date.' ); } }
                elseif ( 'rate' === $type ) { if ( ! preg_match( '/^\d{1,3}(\.\d{1,4})?$/D', $value ) || (float) $value > 100 ) { throw new DomainError( 'Invalid tax rate.' ); } }
                else { $value = 'textarea' === $type ? sanitize_textarea_field( $value ) : sanitize_text_field( $value ); }
            }
            $data[ $key ] = $value;
        }
        if ( ! empty( $data['valid_to'] ) && $data['valid_to'] < $data['valid_from'] ) { throw new DomainError( 'The end date cannot be earlier than the start date.' ); }
        if ( ! empty( $data['consent'] ) && empty( $data['consent_reference'] ) ) { throw new DomainError( 'Record the source of consent.' ); }
        if ( 'channel' === $kind && (int) self::get( $data['warehouse_id'], 'warehouse' )['data']['company_id'] !== (int) $data['company_id'] ) { throw new DomainError( 'The warehouse belongs to another company.' ); }
        if ( 'publication' === $kind && self::get( (int) $data['channel_id'], 'channel' )['data']['currency'] !== $data['currency'] ) { throw new DomainError( 'The listing currency differs from the channel currency.' ); }
        if ( 'carrier' === $kind && in_array( $data['insurance'], array( 'included', 'optional' ), true ) && empty( $data['contract_reference'] ) ) { throw new DomainError( 'Enter the contract reference for insurance.' ); }
        if ( 'shipment' === $kind && (int) Workflow::get( (int) $data['order_id'] )['channel_id'] !== (int) self::get( (int) $data['carrier_id'], 'carrier' )['data']['channel_id'] ) { throw new DomainError( 'The shipping service belongs to another channel.' ); }
        if ( 'form' === $kind ) {
            if ( 'packaged' === $data['type'] && 'unit' !== $data['unit'] ) { throw new DomainError( 'Packaged products must be counted in units.' ); }
            if ( 'bulk' === $data['type'] && ( $data['unit'] !== $data['content_unit'] || '1.000' !== $data['content_quantity'] ) ) { throw new DomainError( 'Bulk content must be 1 in the same unit as stock.' ); }
        }
        if ( in_array( $kind, array( 'subscription', 'campaign' ), true ) && 'back_in_stock' === $data['purpose'] && empty( $data['form_id'] ) ) { throw new DomainError( 'Select the product packaging for the stock notification.' ); }
        return $data;
    }
    public static function positive_id( mixed $value ): int {
        if ( ! preg_match( '/^[1-9]\d{0,12}$/D', (string) $value ) ) { throw new DomainError( 'Invalid identifier.' ); }
        return (int) $value;
    }
    public static function save( array $input ): array {
        global $wpdb;
        $kind = (string) ( $input['kind'] ?? '' ); $code = trim( (string) ( $input['code'] ?? '' ) );
        if ( in_array( $kind, array( 'item', 'form', 'publication', 'tax', 'payment_method' ), true ) ) { throw new DomainError( 'Use WooCommerce products, variations and settings. This separate record type has been discontinued.', 410 ); }
        if ( ! preg_match( '/^[\pL\pN_.:-]{1,100}$/uD', $code ) ) { throw new DomainError( 'Reference code: use letters, numbers, dots, hyphens, colons or underscores.' ); }
        $data = self::validate( $kind, $input['data'] ?? array() );
        if ( 'channel' === $kind ) { $currencies = array_values( array_unique( array_filter( array_map( 'trim', explode( ',', strtoupper( $data['currencies'] ) ) ) ) ) ); if ( array_diff( $currencies, array( 'GBP', 'EUR' ) ) ) { throw new DomainError( 'Additional currencies must be GBP and/or EUR.' ); } $data['currencies'] = implode( ',', $currencies ); }
        $id = (int) ( $input['id'] ?? 0 ); $now = gmdate( 'Y-m-d H:i:s' );
        if ( 'hs' === $kind ) { Customs::validate_rule( $data, $id ); }
        $old = $id ? self::get( $id, $kind, false ) : null;
        if ( $old && 'incoming' === $kind && Inventory::incoming_received( $id ) ) {
            foreach ( array( 'form_id', 'warehouse_id', 'supplier_id' ) as $field ) { if ( (string) $old['data'][ $field ] !== (string) $data[ $field ] ) { throw new DomainError( 'Expected receipt identity is locked after the first physical receipt.', 409 ); } }
            if ( Database::quantity( $data['quantity'] ) < Inventory::incoming_received( $id ) ) { throw new DomainError( 'Expected quantity cannot be less than received quantity.', 409 ); }
        }
        if ( $old && (int) $old['version'] !== (int) ( $input['version'] ?? 0 ) ) { throw new DomainError( 'Another session changed this record. Reload before saving.', 409 ); }
        $identity_fields = match ( $kind ) { 'country' => array( 'channel_id', 'country' ), 'publication' => array( 'form_id', 'channel_id', 'language' ), 'transition' => array( 'from', 'to' ), default => array() };
        if ( $identity_fields ) { foreach ( self::all( $kind ) as $existing ) { if ( (int) $existing['id'] === $id ) { continue; } $same = true; foreach ( $identity_fields as $field ) { if ( (string) $existing['data'][ $field ] !== (string) $data[ $field ] ) { $same = false; break; } } if ( $same ) { throw new DomainError( 'This combination is already configured. Edit the existing record.', 409 ); } } }
        if ( 'form' === $kind && ! empty( $data['product_id'] ) ) {
            foreach ( self::all( 'form' ) as $form ) { if ( (int) $form['id'] !== $id && (int) $form['data']['product_id'] === (int) $data['product_id'] ) { throw new DomainError( 'The WooCommerce product is already linked to another packaging record.', 409 ); } }
        }
        if ( $old && 'form' === $kind && $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . Database::table( 'lots' ) . ' WHERE form_id=%d LIMIT 1', $id ) ) ) {
            foreach ( array( 'item_id', 'product_id', 'type', 'unit', 'content_unit', 'content_quantity' ) as $field ) { if ( (string) $old['data'][ $field ] !== (string) $data[ $field ] ) { throw new DomainError( 'Packaging with lots: identity, unit and content cannot be changed.', 409 ); } }
        }
        if ( $old && 'warehouse' === $kind && (int) $old['data']['company_id'] !== (int) $data['company_id'] ) { throw new DomainError( 'Create a new warehouse for another company.', 409 ); }
        if ( $old && 'channel' === $kind ) { foreach ( array( 'company_id', 'warehouse_id', 'currency' ) as $field ) { if ( (string) $old['data'][ $field ] !== (string) $data[ $field ] ) { throw new DomainError( 'Create another channel to change company, warehouse or currency.', 409 ); } } }
        if ( $old ) {
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'records' ) . ' SET code=%s,data=%s,version=version+1,updated_at=%s WHERE id=%d', $code, wp_json_encode( $data ), $now, $id ) );
        } else { $id = Database::insert( 'records', array( 'kind' => $kind, 'code' => $code, 'data' => wp_json_encode( $data ), 'created_at' => $now, 'updated_at' => $now ) ); }
        Database::audit( 'record.saved', $kind . ':' . $id, array( 'version' => $old ? (int) $old['version'] + 1 : 1, 'changed_fields' => array_keys( array_diff_assoc( $data, $old['data'] ?? array() ) ) ) );
        return self::get( $id, $kind, false );
    }
}
