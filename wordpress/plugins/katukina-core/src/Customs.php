<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Select configured, dated evidence. Never supplies default tariff codes. */
final class Customs {
    public static function resolve( string $group, string $destination, string $date ): array {
        if ( ! isset( WC()->countries->get_countries()[ $destination ] ) || ! preg_match( '/^\d{4}-\d{2}-\d{2}$/D', $date ) ) { throw new DomainError( 'Invalid customs destination or date.' ); }
        $exact = array(); $regional = array();
        foreach ( Registry::all( 'hs' ) as $row ) {
            $data = $row['data'];
            if ( ! $data['active'] || $group !== $data['group'] || $data['valid_from'] > $date || ( $data['valid_to'] && $data['valid_to'] < $date ) ) { continue; }
            if ( $data['country'] === $destination ) { $exact[] = $row; }
            elseif ( 'EU' === $data['country'] && in_array( $destination, WC()->countries->get_european_union_countries(), true ) ) { $regional[] = $row; }
        }
        $matches = $exact ?: $regional;
        if ( count( $matches ) !== 1 ) { throw new DomainError( count( $matches ) ? 'Ambiguous customs classifications. Review overlapping rules.' : 'No validated customs classification for this group, destination and date.', 409 ); }
        $rule = $matches[0];
        return array( 'rule_id' => (int) $rule['id'], 'version' => (int) $rule['version'], 'group' => $group, 'destination' => $destination, 'jurisdiction' => $rule['data']['country'], 'hs_code' => $rule['data']['hs_code'], 'as_of' => $date, 'verification' => $rule['data']['verification'] );
    }

    public static function validate_rule( array $data, int $id ): void {
        if ( ! preg_match( '/^\d{6}(\d{2})?(\d{2})?$/D', $data['hs_code'] ) ) { throw new DomainError( 'Use a verified classification of 6, 8 or 10 digits.' ); }
        if ( ! $data['active'] ) { return; }
        foreach ( Registry::all( 'hs' ) as $row ) {
            $other = $row['data'];
            if ( (int) $row['id'] === $id || ! $other['active'] || $other['group'] !== $data['group'] || $other['country'] !== $data['country'] ) { continue; }
            if ( $data['valid_from'] <= ( $other['valid_to'] ?: '9999-12-31' ) && $other['valid_from'] <= ( $data['valid_to'] ?: '9999-12-31' ) ) { throw new DomainError( 'An active classification already covers this group, jurisdiction and date range.', 409 ); }
        }
    }

    public static function snapshot( \WC_Order $order ): void {
        $destination = $order->get_shipping_country() ?: $order->get_billing_country();
        foreach ( $order->get_items() as $line ) {
            $prior = $line->get_meta( '_kat_customs' );
            if ( $prior && ( $prior['destination'] ?? '' ) === $destination ) { continue; }
            if ( $prior && ! in_array( $order->get_status(), array( 'checkout-draft', 'pending' ), true ) ) { throw new DomainError( 'Customs snapshot destination changed. Review the order before shipping.', 409 ); }
            $product = $line->get_product(); if ( ! $product ) { throw new DomainError( 'Customs product no longer exists.' ); }
            $group = NativeCatalog::value( $product, 'hs_group' );
            $parent = $product->get_parent_id() ? wc_get_product( $product->get_parent_id() ) : null;
            if ( ! $group && $parent ) { $group = NativeCatalog::value( $parent, 'hs_group' ); }
            if ( ! $group ) { $line->delete_meta_data( '_kat_customs' ); continue; }
            $data = self::resolve( $group, $destination, gmdate( 'Y-m-d' ) );
            foreach ( array( 'origin_country', 'customs_description', 'net_weight_g' ) as $field ) { $data[ $field ] = NativeCatalog::value( $product, $field ) ?: ( $parent ? NativeCatalog::value( $parent, $field ) : '' ); }
            $data['sku'] = $product->get_sku();
            $data['gross_weight_g'] = '' !== $product->get_weight() ? (string) wc_get_weight( $product->get_weight(), 'g' ) : '';
            $line->update_meta_data( '_kat_customs', $data );
        }
    }

    public static function manifest( \WC_Order $order ): array {
        $rows = array(); $destination = $order->get_shipping_country() ?: $order->get_billing_country();
        foreach ( $order->get_items() as $line ) {
            $data = $line->get_meta( '_kat_customs' );
            if ( ! is_array( $data ) || empty( $data['hs_code'] ) || empty( $data['origin_country'] ) || empty( $data['customs_description'] ) || $data['destination'] !== $destination ) { throw new DomainError( 'Every shipped item requires a validated customs snapshot, origin and description.', 409 ); }
            $rows[] = array( 'line_id' => $line->get_id(), 'sku' => $data['sku'], 'description' => $data['customs_description'], 'quantity' => $line->get_quantity(), 'hs_code' => $data['hs_code'], 'origin_country' => $data['origin_country'], 'net_weight_g' => $data['net_weight_g'], 'gross_weight_g' => $data['gross_weight_g'], 'line_total' => $line->get_total(), 'line_tax' => $line->get_total_tax() );
        }
        return array( 'order_id' => $order->get_id(), 'currency' => $order->get_currency(), 'destination' => $destination, 'items' => $rows, 'shipping' => $order->get_shipping_total(), 'tax' => $order->get_total_tax(), 'total' => $order->get_total() );
    }

    public static function register(): void {
        add_action( 'woocommerce_admin_order_data_after_order_details', static function ( $order ) {
            if ( current_user_can( 'katukina_orders' ) ) { echo '<p><a class="button" target="_blank" rel="noopener" href="' . esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=katukina_invoice&order_id=' . $order->get_id() ), 'kat-invoice-' . $order->get_id() ) ) . '">Commercial invoice / customs document</a></p>'; }
        } );
        add_action( 'admin_post_katukina_invoice', array( self::class, 'invoice' ) );
        add_action( 'woocommerce_store_api_checkout_update_order_from_request', static function ( $order ) {
            try { self::snapshot( $order ); }
            catch ( DomainError $error ) { throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException( 'katukina_customs', $error->getMessage(), $error->status ); }
        }, 20 );
        add_action( 'rest_api_init', static function () {
            register_rest_route( 'katukina/v1', '/customs/orders/(?P<id>\d+)', array( 'methods' => 'GET', 'permission_callback' => static fn() => current_user_can( 'katukina_orders' ), 'callback' => static fn( $r ) => OperationsApi::response( static function () use ( $r ) {
                $order = wc_get_order( (int) $r['id'] ); if ( ! $order ) { throw new DomainError( 'Order not found.', 404 ); }
                return self::manifest( $order );
            } ) ) );
        } );
    }

    public static function invoice(): void {
        if ( ! current_user_can( 'katukina_orders' ) ) { wp_die( 'Order permission required.', '', array( 'response' => 403 ) ); }
        $id = absint( $_GET['order_id'] ?? 0 ); check_admin_referer( 'kat-invoice-' . $id );
        try { $order = wc_get_order( $id ); if ( ! $order ) { throw new DomainError( 'Order not found.', 404 ); } $manifest = self::manifest( $order ); $workflow = Workflow::get( $id ); $channel = Registry::get( (int) $workflow['channel_id'], 'channel', false ); $company = Registry::get( (int) $channel['data']['company_id'], 'company', false ); }
        catch ( DomainError $error ) { wp_die( esc_html( $error->getMessage() ), '', array( 'response' => $error->status ) ); }
        nocache_headers(); header( 'Content-Type: text/html; charset=utf-8' ); header( 'Referrer-Policy: no-referrer' );
        echo '<!doctype html><html lang="en"><meta charset="utf-8"><title>Commercial invoice ' . esc_html( $order->get_order_number() ) . '</title><style>body{font:14px sans-serif;margin:32px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:8px;text-align:left}@media print{button{display:none}}</style><body><button onclick="window.print()">Print / Save PDF</button><h1>Commercial invoice #' . esc_html( $order->get_order_number() ) . '</h1><p>Seller: ' . esc_html( $company['data']['name'] ) . ' · Tax ID: ' . esc_html( $company['data']['tax_id'] ) . '</p><p>Date: ' . esc_html( $order->get_date_created()?->date( 'Y-m-d' ) ) . ' · Currency: ' . esc_html( $manifest['currency'] ) . '</p><h2>Ship to</h2>' . wp_kses_post( $order->get_formatted_shipping_address() ) . '<table><thead><tr>';
        foreach ( array( 'SKU', 'Description', 'Qty', 'HS', 'Origin', 'Net g / unit', 'Gross g / unit', 'Line total', 'Line tax' ) as $label ) { echo '<th>' . esc_html( $label ) . '</th>'; } echo '</tr></thead><tbody>';
        foreach ( $manifest['items'] as $line ) { echo '<tr>'; foreach ( array( 'sku', 'description', 'quantity', 'hs_code', 'origin_country', 'net_weight_g', 'gross_weight_g', 'line_total', 'line_tax' ) as $field ) { echo '<td>' . esc_html( $line[ $field ] ) . '</td>'; } echo '</tr>'; }
        echo '</tbody></table><p>Shipping: ' . esc_html( $manifest['shipping'] ) . ' · Tax: ' . esc_html( $manifest['tax'] ) . ' · Total: ' . esc_html( $manifest['total'] ) . '</p><p>Classification uses the saved order-line evidence. Carrier-specific declarations and local invoice requirements must be validated before live use.</p></body></html>'; exit;
    }
}
