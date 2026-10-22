<?php
/** Explicit fictional channel for local checkout; never executed outside local development. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException( 'Local CLI only.' ); }
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;
global $wpdb;
wp_set_current_user( (int) get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) )[0] );
$save = static function ( $kind, $code, $data ) use ( $wpdb ) {
    $existing = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . D::table( 'records' ) . ' WHERE kind=%s AND code=%s', $kind, $code ) );
    if ( $existing ) { return R::get( (int) $existing, $kind, false ); }
    return D::command( 'record.save', array( 'key' => 'seed-local-' . $kind . '-' . $code, 'kind' => $kind, 'code' => $code, 'data' => $data + array( 'active' => true ) ), array( R::class, 'save' ) );
};
$company = $save( 'company', 'LOCAL-DEMO', array( 'name' => 'Empresa fictícia — testes locais', 'country' => 'GB', 'currency' => get_woocommerce_currency(), 'notes' => 'Dado fictício. Não representa a entidade legal da Katukina.' ) );
$warehouse = $save( 'warehouse', 'LOCAL-DEMO', array( 'name' => 'Depósito de testes — sem estoque inicial', 'company_id' => $company['id'] ) );
$channel = $save( 'channel', 'LOCAL-DEMO', array( 'name' => 'Katukina — demonstração local', 'company_id' => $company['id'], 'warehouse_id' => $warehouse['id'], 'language' => 'en', 'currency' => get_woocommerce_currency(), 'display_currency' => get_woocommerce_currency(), 'countries' => 'GB', 'notes' => 'Destino GB apenas para testar endereços. Frete de teste zero, sem despacho. Não aprova mercados, moedas ou tributação reais.' ) );
$save( 'country', 'LOCAL-DEMO-GB', array( 'name' => 'United Kingdom — teste local', 'country' => 'GB', 'channel_id' => $channel['id'], 'checkout_note' => 'Local test destination. No physical delivery or payment.', 'backoffice_note' => 'Internal local test note; never expose to customers.', 'shipping_note' => 'TEST ORDER — DO NOT DISPATCH', 'requires_acceptance' => false ) );
$manifest = json_decode( file_get_contents( __DIR__ . '/fixtures/catalog-samples.json' ), true );
$origins = array( 'Peru' => 'PE', 'Kenya' => 'KE', 'Indonesia' => 'ID', 'China' => 'CN', 'Netherlands' => 'NL' );
foreach ( $manifest['products'] as $product ) {
    $product_id = wc_get_product_id_by_sku( $product['sku'] ); if ( ! $product_id ) { continue; }
    $native = wc_get_product( $product_id );
    if ( $native->get_meta( '_kat_legacy_form_id' ) ) { continue; }
    $content = array( 'content_unit' => 'unit', 'content_quantity' => '1' );
    if ( preg_match( '/(\d+) g\b/', $product['presentation'], $match ) ) { $content = array( 'content_unit' => 'g', 'content_quantity' => $match[1] ); }
    elseif ( preg_match( '/Tube of (\d+) discs/', $product['presentation'], $match ) ) { $content['content_quantity'] = $match[1]; }
    foreach ( $content + array( 'type' => 'packaged', 'unit' => 'unit', 'legacy_item_id' => $product['legacy_item_id'], 'legacy_form_id' => $product['legacy_form_id'], 'origin_country' => $origins[ $product['origin'] ] ?? '', 'notes' => 'Fonte pública: ' . $product['source_url'] . '. Nenhuma quantidade de estoque foi importada.' ) as $field => $value ) { $native->update_meta_data( '_kat_' . $field, $value ); }
    $native->save();
}
// The fictional configuration is installed once; later operator changes are preserved.
if ( ! get_option( 'katukina_operations_local_seeded' ) ) {
    update_option( 'katukina_storefront_channel', (int) $channel['id'] );
    update_option( 'katukina_reservation_minutes', 60 );
    update_option( 'katukina_local_checkout', 'yes' );
    update_option( 'katukina_operations_local_seeded', 'yes' );
    WC_Cache_Helper::get_transient_version( 'shipping', true );
}
if ( ! get_option( 'katukina_local_shipping_zone' ) ) {
    $zone = new WC_Shipping_Zone(); $zone->set_zone_name( 'Katukina LOCAL TEST — no dispatch' ); $zone->add_location( 'GB', 'country' ); $zone->save();
    $zone->add_shipping_method( 'katukina_test' ); update_option( 'katukina_local_shipping_zone', $zone->get_id() ); WC_Cache_Helper::get_transient_version( 'shipping', true );
}
WP_CLI::success( 'Local demo channel, native test shipping and native product metadata installed. No stock quantities, tax rules or operational transitions were invented.' );
