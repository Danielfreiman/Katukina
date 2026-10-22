<?php
/** Explicit, repeatable import of reviewed local catalogue samples. */
defined( 'ABSPATH' ) || exit;
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) {
    return;
}
if ( ! class_exists( 'WooCommerce' ) ) {
    WP_CLI::error( 'Activate WooCommerce before importing samples.' );
}
$manifest = json_decode( file_get_contents( __DIR__ . '/fixtures/catalog-samples.json' ), true, 512, JSON_THROW_ON_ERROR );
if ( get_woocommerce_currency() !== $manifest['currency'] ) {
    WP_CLI::error( 'Sample currency does not match WooCommerce; no automatic conversion is allowed.' );
}
foreach ( $manifest['products'] as $row ) {
    if ( basename( $row['image_file'] ) !== $row['image_file'] || ! is_file( __DIR__ . '/fixtures/images/' . $row['image_file'] ) ) {
        WP_CLI::error( 'Missing local image for ' . $row['sku'] );
    }
    $existing = wc_get_product_id_by_sku( $row['sku'] );
    if ( $existing && get_post_meta( $existing, '_katukina_sample_source_url', true ) !== $row['source_url'] ) {
        WP_CLI::error( 'SKU conflict: ' . $row['sku'] . '. Existing product was not changed.' );
    }
}
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
$report = array();
foreach ( $manifest['products'] as $row ) {
    $id = wc_get_product_id_by_sku( $row['sku'] );
    if ( $id && get_post_meta( $id, '_katukina_sample_import_complete', true ) ) {
        $report[] = array( 'id' => $id, 'sku' => $row['sku'], 'action' => 'preserved' );
        continue;
    }
    $product = $id ? wc_get_product( $id ) : new WC_Product_Simple();
    $product->set_name( $row['name'] );
    $product->set_slug( $row['slug'] );
    $product->set_sku( $row['sku'] );
    $product->set_status( 'draft' );
    $product->set_description( '<p>' . esc_html( $row['description'] ) . '</p>' );
    $product->set_short_description( '<p>' . esc_html( $row['short_description'] ) . '</p>' );
    $product->set_regular_price( $row['price'] );
    // Demonstration availability only: no quantity, lot, reservation or stock movement.
    $product->set_manage_stock( false );
    $product->set_stock_status( 'instock' );
    $product->set_catalog_visibility( 'visible' );
    $attributes = array();
    foreach ( array( 'Presentation' => $row['presentation'], 'Origin' => $row['origin'] ) as $name => $value ) {
        $attribute = new WC_Product_Attribute();
        $attribute->set_name( $name );
        $attribute->set_options( array( $value ) );
        $attribute->set_visible( true );
        $attribute->set_variation( false );
        $attributes[] = $attribute;
    }
    $product->set_attributes( $attributes );
    $category = term_exists( $row['category'], 'product_cat' );
    if ( ! $category ) {
        $category = wp_insert_term( $row['category'], 'product_cat' );
    }
    if ( is_wp_error( $category ) ) {
        WP_CLI::error( $category->get_error_message() );
    }
    $product->set_category_ids( array( (int) $category['term_id'] ) );
    $product->update_meta_data( '_katukina_sample_source_url', $row['source_url'] );
    $product->update_meta_data( '_katukina_sample_captured_at', $manifest['captured_at'] );
    $product->update_meta_data( '_katukina_sample_currency', $manifest['currency'] );
    $product->update_meta_data( '_katukina_sample_price_note', $row['price_note'] ?? 'Observed unit display price; commercial policy remains unvalidated.' );
    $product->update_meta_data( '_katukina_legacy_item_id', $row['legacy_item_id'] );
    $product->update_meta_data( '_katukina_legacy_form_id', $row['legacy_form_id'] );
    $product->update_meta_data( '_katukina_sample_inventory', 'demonstration-only; no physical quantities imported' );
    $id = $product->save();
    $images = get_posts( array(
        'post_type' => 'attachment', 'post_status' => 'inherit', 'fields' => 'ids',
        'posts_per_page' => 1, 'meta_key' => '_katukina_sample_image_url', 'meta_value' => $row['image_url'],
    ) );
    $image_id = $images[0] ?? 0;
    if ( ! $image_id ) {
        $temporary = wp_tempnam( $row['image_file'] );
        if ( ! $temporary || ! copy( __DIR__ . '/fixtures/images/' . $row['image_file'], $temporary ) ) {
            WP_CLI::error( 'Could not prepare image for ' . $row['sku'] );
        }
        $image_id = media_handle_sideload( array( 'name' => $row['image_file'], 'tmp_name' => $temporary ), $id, $row['name'] );
        if ( is_wp_error( $image_id ) ) {
            @unlink( $temporary );
            WP_CLI::error( $image_id->get_error_message() );
        }
        update_post_meta( $image_id, '_katukina_sample_image_url', $row['image_url'] );
        update_post_meta( $image_id, '_wp_attachment_image_alt', $row['name'] . ' — ' . $row['presentation'] );
    }
    $product->set_image_id( $image_id );
    $product->set_status( 'publish' );
    $product->update_meta_data( '_katukina_sample_import_complete', true );
    $product->save();
    $report[] = array( 'id' => $id, 'sku' => $row['sku'], 'action' => 'imported' );
}
WP_CLI\Utils\format_items( 'table', $report, array( 'id', 'sku', 'action' ) );
WP_CLI::success( 'Local samples ready. Existing completed imports are preserved on rerun.' );
