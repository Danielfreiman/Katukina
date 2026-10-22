<?php
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException( 'Local CLI only.' ); }
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;
global $wpdb;
$manifest = json_decode( file_get_contents( __DIR__ . '/fixtures/catalog-samples.json' ), true ); $summary = array();
foreach ( $manifest['products'] as $source ) {
    $id = wc_get_product_id_by_sku( $source['sku'] ); $product = wc_get_product( $id );
    if ( ! $product || ! $product->get_image_id() || 'publish' !== $product->get_status() || 'simple' !== $product->get_type() ) { throw new RuntimeException( 'Sample product not preserved.' ); }
    $form_id = (int) get_post_meta( $id, '_kat_form_record_id', true ); $item_id = (int) get_post_meta( $id, '_kat_item_record_id', true );
    $form = R::get( $form_id, 'form' );
    if ( (int) $form['data']['product_id'] !== $id || (int) $form['data']['item_id'] !== $item_id || $form['data']['name'] !== $product->get_name() ) { throw new RuntimeException( 'Native mapping mismatch.' ); }
    foreach ( array( $item_id, $form_id ) as $mapping ) { $data = json_decode( $wpdb->get_var( $wpdb->prepare( 'SELECT data FROM ' . D::table( 'records' ) . ' WHERE id=%d', $mapping ) ), true ); if ( array_keys( $data ) !== array( 'native_product_id' ) ) { throw new RuntimeException( 'Duplicate catalogue data still authoritative.' ); } }
    if ( (string) $product->get_meta( '_kat_legacy_form_id' ) !== (string) $source['legacy_form_id'] || (string) $product->get_meta( '_kat_legacy_item_id' ) !== (string) $source['legacy_item_id'] ) { throw new RuntimeException( 'Legacy IDs not preserved.' ); }
    $summary[] = array( 'id' => $id, 'sku' => $product->get_sku(), 'price' => $product->get_price(), 'image_id' => $product->get_image_id(), 'native_identity' => true );
}
if ( Katukina\Core\Inventory::reconcile() ) { throw new RuntimeException( 'Stock reconciliation failed.' ); }
WP_CLI::line( wp_json_encode( $summary ) ); WP_CLI::success( 'Six native products verified, legacy IDs/media preserved, mappings contain only native IDs, ledger reconciled.' );
