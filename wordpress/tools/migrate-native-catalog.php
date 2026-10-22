<?php
/** One-time, local migration; run only after a database backup. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException( 'Local CLI only.' ); }
use Katukina\Core\Database as D;
use Katukina\Core\NativeCatalog as N;
global $wpdb;
if ( get_option( 'katukina_native_catalog_migrated' ) ) { WP_CLI::success( 'Migration already applied.' ); return; }
remove_action( 'woocommerce_after_product_object_save', array( N::class, 'bind' ) );
remove_action( 'woocommerce_after_product_variation_object_save', array( N::class, 'bind' ) );
$rows = $wpdb->get_results( 'SELECT * FROM ' . D::table( 'records' ) . " WHERE kind IN ('item','form')", ARRAY_A );
$items = array(); $count = 0;
foreach ( $rows as $row ) { if ( 'item' === $row['kind'] ) { $items[ $row['id'] ] = json_decode( $row['data'], true ); } }
D::query( 'START TRANSACTION' );
try {
    foreach ( $rows as $row ) {
        if ( 'form' !== $row['kind'] ) { continue; }
        $form = json_decode( $row['data'], true ); $product = wc_get_product( (int) ( $form['product_id'] ?? 0 ) );
        if ( ! $product ) { continue; } // Retain orphaned test history without making products for it.
        $item = $items[ $form['item_id'] ] ?? array();
        foreach ( N::specs() as $field => $spec ) {
            $value = $form[ $field ] ?? $item[ $field ] ?? null;
            if ( null !== $value && '' !== (string) $value ) { $product->update_meta_data( '_kat_' . $field, $value ); }
        }
        $product->update_meta_data( '_kat_legacy_item_id', $item['legacy_id'] ?? '' );
        $product->update_meta_data( '_kat_legacy_form_id', $form['legacy_id'] ?? '' );
        // Preserve migration source without treating it as editable catalogue data.
        $product->update_meta_data( '_kat_catalog_migration_source', array( 'item' => $item, 'form' => $form, 'at' => gmdate( DATE_ATOM ) ) );
        $product->save();
        N::mapping( 'item', N::master_id( $product ), (int) $form['item_id'] );
        N::mapping( 'form', $product->get_id(), (int) $row['id'] );
        if ( $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . D::table( 'lots' ) . ' WHERE form_id=%d LIMIT 1', $row['id'] ) ) ) { update_post_meta( $product->get_id(), '_kat_lot_identity', N::identity( $product ) ); }
        D::audit( 'catalog.migrated_to_woo', 'product:' . $product->get_id(), array( 'item_record' => $form['item_id'], 'form_record' => $row['id'] ) );
        $count++;
    }
    update_option( 'katukina_native_catalog_migrated', gmdate( DATE_ATOM ), false ); D::query( 'COMMIT' );
} catch ( Throwable $error ) { $wpdb->query( 'ROLLBACK' ); wp_cache_flush(); throw $error; }
WP_CLI::success( 'Migrated ' . $count . ' products to native WooCommerce metadata; prices, media, IDs and stock movements preserved.' );
