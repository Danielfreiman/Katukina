<?php
/** Explicit local import. The XLSX is data; this CLI never executes source instructions. */
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;

if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() || ! class_exists( R::class ) ) {
    throw new RuntimeException( 'Local Katukina CLI only.' );
}

final class KatukinaWorkbookImport {
    private string $root;
    private array $manifest;
    private string $hash;
    private array $media = array();
    private array $attachments = array();
    private const PREFIX = 'sacred-incense-uk:';

    public function __construct() {
        $this->root = __DIR__ . '/.imports/sacred-incense-uk';
        $this->manifest = json_decode( file_get_contents( $this->root . '/manifest.json' ), true, 512, JSON_THROW_ON_ERROR );
        if ( 1 !== $this->manifest['schema_version'] || 'GBP' !== $this->manifest['currency'] ) { throw new RuntimeException( 'Unsupported manifest.' ); }
        $this->hash = $this->manifest['source']['sha256'];
        if ( ! preg_match( '/^[a-f0-9]{64}$/D', $this->hash ) ) { throw new RuntimeException( 'Invalid source hash.' ); }
        if ( is_file( $this->root . '/media.json' ) ) { $this->media = json_decode( file_get_contents( $this->root . '/media.json' ), true, 512, JSON_THROW_ON_ERROR ); }
    }

    private function id( string $key ): int {
        global $wpdb;
        return (int) $wpdb->get_var( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key='_kat_workbook_key' AND meta_value=%s LIMIT 1", self::PREFIX . $key ) );
    }

    private function unmatched_sku( string $key ): string {
        return 'REVIEW-' . strtoupper( substr( hash( 'sha256', $key ), 0, 8 ) );
    }

    private function snapshot(): array {
        global $wpdb;
        $snapshot = array( 'currency' => get_woocommerce_currency(), 'products' => $wpdb->get_results( "SELECT post_type,post_status,COUNT(*) total FROM {$wpdb->posts} WHERE post_type IN ('product','product_variation') GROUP BY post_type,post_status", ARRAY_A ) );
        foreach ( array( 'lots', 'movements', 'reservations', 'production', 'money', 'orders' ) as $table ) {
            $name = D::table( $table );
            if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $name ) ) ) {
                $snapshot['ledger'][ $table ] = array( 'count' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM $name" ), 'checksum' => hash( 'sha256', wp_json_encode( $wpdb->get_results( "SELECT * FROM $name ORDER BY 1", ARRAY_A ) ) ) );
            }
        }
        $order_data = array();
        foreach ( wc_get_orders( array( 'limit' => -1, 'return' => 'objects' ) ) as $order ) { $order_data[] = array( $order->get_id(), $order->get_currency(), $order->get_total(), $order->get_status() ); }
        $snapshot['orders'] = array( 'count' => count( $order_data ), 'checksum' => hash( 'sha256', wp_json_encode( $order_data ) ) );
        $snapshot['channel'] = (int) get_option( 'katukina_storefront_channel' );
        return $snapshot;
    }

    private function write_report( string $name, array $data ): void {
        if ( false === file_put_contents( $this->root . '/' . $name . '.json', wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) ) ) { throw new RuntimeException( 'Cannot save import report.' ); }
    }

    public function inspect(): array {
        global $wpdb;
        $conflicts = array(); $existing = array(); $known = array(); $seen = array();
        foreach ( $this->manifest['items'] as $item ) {
            foreach ( array_merge( array( array( 'sku' => $item['sku'], 'key' => 'item:' . $item['key'] ) ), array_map( static fn( $form ) => array( 'sku' => $form['sku'], 'key' => 'form:' . $form['sku'] ), $item['forms'] ) ) as $row ) {
                if ( isset( $seen[ $row['sku'] ] ) ) { $conflicts[] = 'Duplicate manifest SKU: ' . $row['sku']; }
                $seen[ $row['sku'] ] = true;
                $id = wc_get_product_id_by_sku( $row['sku'] );
                if ( ! $id ) { continue; }
                $known[] = $id;
                $product = wc_get_product( $id );
                $is_import = self::PREFIX . $row['key'] === $product->get_meta( '_kat_workbook_key' );
                $is_sample = $product->get_meta( '_katukina_sample_source_url' ) && (string) $product->get_meta( '_katukina_legacy_item_id' ) === (string) $item['key'];
                if ( ! $is_import && ! $is_sample ) { $conflicts[] = 'Unrelated existing SKU: ' . $row['sku']; }
                $will_write = ! $is_import || $product->get_meta( '_kat_workbook_complete' ) !== $this->hash;
                if ( $will_write && ( $product->get_meta( '_kat_lot_identity' ) || $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . D::table( 'lots' ) . ' WHERE form_id=%d LIMIT 1', (int) $product->get_meta( '_kat_form_record_id' ) ) ) ) ) { $conflicts[] = 'SKU has lot history: ' . $row['sku']; }
                if ( ! $is_import ) { $existing[] = array( 'id' => $id, 'sku' => $row['sku'], 'type' => $product->get_type(), 'sample' => (bool) $is_sample ); }
            }
            foreach ( $item['forms'] as $form ) { if ( ! preg_match( '/^\d+(\.\d+)?$/D', $form['retail_price_gbp'] ) ) { $conflicts[] = 'Invalid price: ' . $form['sku']; } }
        }
        foreach ( $this->manifest['unmatched'] as $row ) {
            $sku = $this->unmatched_sku( $row['key'] ); $id = wc_get_product_id_by_sku( $sku );
            if ( $id && $id !== $this->id( 'unmatched:' . $row['key'] ) ) { $conflicts[] = 'Unmatched SKU collision: ' . $sku; }
            if ( $id ) { $known[] = $id; }
        }
        if ( 'GBP' !== get_woocommerce_currency() ) {
            $priced = $wpdb->get_col( "SELECT DISTINCT p.ID FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} m ON p.ID=m.post_id WHERE p.post_type IN ('product','product_variation') AND p.post_status NOT IN ('trash','auto-draft') AND m.meta_key='_price' AND m.meta_value<>''" );
            $unknown = array_diff( array_map( 'intval', $priced ), $known );
            if ( $unknown ) { $conflicts[] = 'Unrelated priced products would change currency: ' . implode( ',', $unknown ); }
        }
        $channel = Katukina\Core\Commerce::channel();
        if ( $channel && ! in_array( $channel['code'], array( 'LOCAL-DEMO', 'LOCAL-DEMO-GBP' ), true ) ) { $conflicts[] = 'Current channel is not the local demo.'; }
        return array( 'source_sha256' => $this->hash, 'source' => $this->manifest['summary'], 'existing_samples' => $existing, 'conflicts' => $conflicts, 'before' => $this->snapshot() );
    }

    private function configure_gbp(): void {
        // Channel currency is immutable: keep the old channel and its historical orders intact.
        $channel = Katukina\Core\Commerce::channel();
        if ( ! $channel ) { throw new RuntimeException( 'Configure the local demo channel first.' ); }
        if ( 'GBP' !== $channel['data']['currency'] ) {
            $gbp = null;
            foreach ( R::all( 'channel' ) as $candidate ) { if ( 'LOCAL-DEMO-GBP' === $candidate['code'] ) { $gbp = $candidate; break; } }
            if ( ! $gbp ) {
                $data = $channel['data']; $data['name'] = 'Katukina local test - GBP'; $data['currency'] = 'GBP'; $data['display_currency'] = 'GBP'; $data['notes'] = 'Local workbook import. GBP prices explicitly approved on 2026-10-27. No real dispatch or payments.';
                $gbp = R::save( array( 'kind' => 'channel', 'code' => 'LOCAL-DEMO-GBP', 'data' => $data ) );
            }
            if ( 'GBP' !== $gbp['data']['currency'] ) { throw new RuntimeException( 'GBP demo channel currency conflict.' ); }
            $notices = R::all( 'country' );
            foreach ( $notices as $notice ) {
                if ( (int) $notice['data']['channel_id'] !== (int) $channel['id'] ) { continue; }
                $code = 'WORKBOOK-GBP-' . $notice['id']; $exists = false;
                foreach ( $notices as $candidate ) { if ( $candidate['code'] === $code ) { $exists = true; break; } }
                if ( ! $exists ) {
                    $data = $notice['data']; $data['channel_id'] = (int) $gbp['id'];
                    R::save( array( 'kind' => 'country', 'code' => $code, 'data' => $data ) );
                }
            }
            update_option( 'katukina_storefront_channel', (int) $gbp['id'] );
        }
        update_option( 'woocommerce_currency', 'GBP' );
    }

    private function provenance( WC_Product $product, string $key, array $urls ): void {
        $product->update_meta_data( '_kat_workbook_key', self::PREFIX . $key );
        $product->update_meta_data( '_kat_workbook_source_sha256', $this->hash );
        $product->update_meta_data( '_kat_workbook_source_urls', $urls );
    }

    private function categories( array $rows ): array {
        $ids = array();
        foreach ( $rows as $row ) {
            $term = term_exists( $row['slug'], 'product_cat' );
            if ( ! $term ) { $term = wp_insert_term( $row['name'], 'product_cat', array( 'slug' => $row['slug'] ) ); }
            if ( is_wp_error( $term ) ) { throw new RuntimeException( $term->get_error_message() ); }
            $ids[] = (int) $term['term_id'];
        }
        return $ids;
    }

    public function apply(): array {
        if ( get_option( 'katukina_usd_catalog_prices' ) ) { throw new RuntimeException( 'The catalogue now uses public USD prices. Use update-usd-prices.php; the GBP workbook import cannot change its currency.' ); }
        $inspection = $this->inspect();
        if ( $inspection['conflicts'] ) { throw new RuntimeException( implode( '; ', $inspection['conflicts'] ) ); }
        $baseline_path = $this->root . '/before.json';
        if ( ! is_file( $baseline_path ) ) { $this->write_report( 'before', $inspection ); }
        $this->configure_gbp(); $changed = 0; $preserved = 0;
        foreach ( $this->manifest['items'] as $item ) {
            $id = $this->id( 'item:' . $item['key'] );
            if ( $id && get_post_meta( $id, '_kat_workbook_complete', true ) === $this->hash ) { ++$preserved; continue; }
            $parent = $id ? new WC_Product_Variable( $id ) : new WC_Product_Variable();
            $parent->set_name( $item['name'] ); $parent->set_sku( $item['sku'] );
            $parent->set_status( 'draft' ); $parent->set_catalog_visibility( 'visible' );
            $parent->set_category_ids( $this->categories( $item['categories'] ) );
            $parent->update_meta_data( '_kat_legacy_item_id', $item['key'] );
            $this->provenance( $parent, 'item:' . $item['key'], $item['urls'] );
            $labels = array();
            foreach ( $item['forms'] as $form ) { $labels[ $form['sku'] ] = $form['label'] . ' - ' . $form['sale_quantity']; }
            $counts = array_count_values( $labels );
            foreach ( $labels as $sku => &$label ) { if ( $counts[ $label ] > 1 ) { $label .= ' (' . $sku . ')'; } } unset( $label );
            $attribute = new WC_Product_Attribute(); $attribute->set_name( 'Presentation' ); $attribute->set_options( array_values( $labels ) ); $attribute->set_visible( true ); $attribute->set_variation( true );
            $parent->set_attributes( array( $attribute ) ); $id = $parent->save();
            foreach ( $item['forms'] as $form ) {
                $child_id = wc_get_product_id_by_sku( $form['sku'] );
                if ( $child_id && get_post_meta( $child_id, '_kat_workbook_complete', true ) === $this->hash ) { continue; }
                if ( $child_id && 'product' === get_post_type( $child_id ) ) {
                    $old = wc_get_product( $child_id );
                    update_post_meta( $child_id, '_kat_workbook_previous_product', $old->get_data() );
                    if ( ! $parent->get_description() ) { $parent->set_description( $old->get_description() ); $parent->set_short_description( $old->get_short_description() ); }
                    if ( ! $parent->get_image_id() ) { $parent->set_image_id( $old->get_image_id() ); }
                    $result = wp_update_post( array( 'ID' => $child_id, 'post_type' => 'product_variation', 'post_parent' => $id ), true );
                    if ( is_wp_error( $result ) ) { throw new RuntimeException( $result->get_error_message() ); }
                    wp_set_object_terms( $child_id, array(), 'product_type' ); clean_post_cache( $child_id ); wc_delete_product_transients( $child_id );
                }
                $variation = $child_id ? new WC_Product_Variation( $child_id ) : new WC_Product_Variation();
                $variation->set_parent_id( $id ); $variation->set_status( 'publish' ); $variation->set_sku( $form['sku'] );
                $variation->set_name( $item['name'] . ' - ' . $labels[ $form['sku'] ] );
                $variation->set_attributes( array( 'presentation' => $labels[ $form['sku'] ] ) );
                $variation->set_regular_price( $form['retail_price_gbp'] ); $variation->set_sale_price( '' ); $variation->set_price( $form['retail_price_gbp'] );
                // Workbook balances lack reservations, lots and a verified opening date.
                $variation->set_manage_stock( false ); $variation->set_stock_status( 'outofstock' ); $variation->set_backorders( 'no' );
                $variation->update_meta_data( '_kat_legacy_item_id', $item['key'] ); $variation->update_meta_data( '_kat_legacy_form_id', $form['key'] );
                $variation->update_meta_data( '_kat_location', $form['location'] );
                $country = strtoupper( $form['origin_country'] );
                if ( isset( WC()->countries->get_countries()[ $country ] ) ) { $variation->update_meta_data( '_kat_origin_country', $country ); }
                $this->provenance( $variation, 'form:' . $form['sku'], $item['urls'] );
                foreach ( array( 'source_rows', 'stock_snapshot', 'stock_unit', 'sale_quantity', 'issues' ) as $field ) { $variation->update_meta_data( '_kat_workbook_' . $field, $form[ $field ] ); }
                $variation->update_meta_data( '_kat_workbook_inventory_note', 'Reference only. No physical inventory, reservation or lot was imported.' );
                $variation->update_meta_data( '_kat_workbook_complete', $this->hash ); $variation->save();
            }
            if ( $item['urls'] ) { $parent->set_slug( basename( wp_parse_url( $item['urls'][0], PHP_URL_PATH ) ) ); }
            $parent->set_status( 'publish' ); $parent->update_meta_data( '_kat_workbook_complete', $this->hash ); $parent->save();
            WC_Product_Variable::sync( $id ); wc_delete_product_transients( $id ); ++$changed;
            if ( 0 === $changed % 25 ) { WP_CLI::log( 'Imported ' . $changed . ' parent products.' ); }
        }
        foreach ( $this->manifest['unmatched'] as $row ) {
            $id = $this->id( 'unmatched:' . $row['key'] );
            if ( $id ) {
                $existing = wc_get_product( $id );
                if ( $existing->get_sku() === 'unmatched-' . $row['key'] ) { $existing->set_sku( $this->unmatched_sku( $row['key'] ) ); $existing->save(); }
                continue;
            }
            $product = new WC_Product_Simple(); $product->set_name( $this->media['unmatched'][ $row['key'] ]['name'] ?? $row['name'] );
            $product->set_sku( $this->unmatched_sku( $row['key'] ) ); $product->set_status( 'draft' ); $product->set_stock_status( 'outofstock' );
            $this->provenance( $product, 'unmatched:' . $row['key'], $row['urls'] );
            $product->update_meta_data( '_kat_workbook_reference_skus', $row['source_skus'] );
            $product->update_meta_data( '_kat_workbook_issues', array( 'Source SKU association requires review; no price or physical stock was inferred.' ) );
            $product->save();
        }
        $report = array( 'changed_parents' => $changed, 'preserved_parents' => $preserved, 'verification' => $this->verify() );
        $this->write_report( 'apply', $report ); return $report;
    }

    private function attachment( string $file, int $parent, string $title ): int {
        global $wpdb;
        if ( isset( $this->attachments[ $file ] ) ) { return $this->attachments[ $file ]; }
        $source = $this->media['files'][ $file ] ?? null;
        $path = $this->root . '/images/' . $file;
        if ( basename( $file ) !== $file || ! $source || ! is_file( $path ) || hash_file( 'sha256', $path ) !== $source['sha256'] ) { throw new RuntimeException( 'Invalid media file: ' . $file ); }
        $id = (int) $wpdb->get_var( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE (meta_key='_kat_workbook_image_sha256' AND meta_value=%s) OR (meta_key='_katukina_sample_image_url' AND meta_value=%s) LIMIT 1", $source['sha256'], $source['source_url'] ) );
        if ( ! $id ) {
            $temp = wp_tempnam( $file ); if ( ! $temp || ! copy( $path, $temp ) ) { throw new RuntimeException( 'Cannot prepare media.' ); }
            $id = media_handle_sideload( array( 'name' => $file, 'tmp_name' => $temp ), $parent, $title );
            if ( is_wp_error( $id ) ) { @unlink( $temp ); throw new RuntimeException( $id->get_error_message() ); }
            update_post_meta( $id, '_kat_workbook_image_sha256', $source['sha256'] ); update_post_meta( $id, '_kat_workbook_image_source_url', esc_url_raw( $source['source_url'] ) ); update_post_meta( $id, '_wp_attachment_image_alt', $title );
        }
        $this->attachments[ $file ] = $id; return $id;
    }

    public function media(): array {
        if ( ! $this->media ) { throw new RuntimeException( 'Run the media downloader first.' ); }
        require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php'; require_once ABSPATH . 'wp-admin/includes/image.php';
        $report = array( 'parents' => 0, 'variations' => 0, 'errors' => $this->media['errors'] ?? array(), 'missing_parent_images' => array(), 'missing_form_images' => array() );
        foreach ( $this->manifest['items'] as $item ) {
            $row = $this->media['items'][ $item['key'] ] ?? array();
            if ( empty( $row['image_files'] ) ) { $report['missing_parent_images'][] = $item['key']; }
            foreach ( $item['forms'] as $form ) { if ( empty( $row['forms'][ $form['sku'] ] ) ) { $report['missing_form_images'][] = $form['sku']; } }
        }
        foreach ( $this->manifest['items'] as $item ) {
            $id = $this->id( 'item:' . $item['key'] ); if ( ! $id ) { throw new RuntimeException( 'Import products before media.' ); }
            $row = $this->media['items'][ $item['key'] ] ?? array();
            $fingerprint = hash( 'sha256', wp_json_encode( $row ) );
            if ( get_post_meta( $id, '_kat_workbook_media_complete', true ) === $fingerprint ) { continue; }
            try {
                $images = array(); foreach ( $row['image_files'] ?? array() as $file ) { $images[] = $this->attachment( $file, $id, $item['name'] ); }
                $images = array_values( array_unique( $images ) );
                $parent = wc_get_product( $id );
                if ( $images ) { $parent->set_image_id( $images[0] ); $parent->set_gallery_image_ids( array_slice( $images, 1 ) ); }
                foreach ( $item['forms'] as $form ) {
                    $files = $row['forms'][ $form['sku'] ] ?? array();
                    if ( ! $files ) { continue; }
                    $variation = wc_get_product( wc_get_product_id_by_sku( $form['sku'] ) );
                    $variation->set_image_id( $this->attachment( $files[0], $id, $item['name'] . ' - ' . $form['label'] ) ); $variation->save(); ++$report['variations'];
                }
                $parent->update_meta_data( '_kat_workbook_media_complete', $fingerprint ); $parent->save(); ++$report['parents'];
                if ( 0 === $report['parents'] % 20 ) { WP_CLI::log( 'Media assigned to ' . $report['parents'] . ' parent products.' ); }
            } catch ( Throwable $error ) { $report['errors'][] = array( 'item' => $item['key'], 'message' => $error->getMessage() ); }
            $this->write_report( 'media-import', $report );
        }
        foreach ( $this->manifest['unmatched'] as $item ) {
            $id = $this->id( 'unmatched:' . $item['key'] ); $row = $this->media['unmatched'][ $item['key'] ] ?? array();
            if ( ! $id ) { continue; }
            try {
                $images = array(); foreach ( $row['image_files'] ?? array() as $file ) { $images[] = $this->attachment( $file, $id, $item['name'] ); }
                $images = array_values( array_unique( $images ) );
                if ( $images ) { $product = wc_get_product( $id ); $product->set_image_id( $images[0] ); $product->set_gallery_image_ids( array_slice( $images, 1 ) ); $product->save(); }
            } catch ( Throwable $error ) { $report['errors'][] = array( 'unmatched' => $item['key'], 'message' => $error->getMessage() ); }
        }
        $this->write_report( 'media-import', $report ); return $report;
    }

    public function verify(): array {
        global $wpdb;
        $report = array( 'parents' => 0, 'variations' => 0, 'unmatched_drafts' => 0, 'unmatched_with_image' => 0, 'source_rows' => 0, 'parents_with_image' => 0, 'variations_with_image' => 0, 'errors' => array(), 'after' => $this->snapshot() );
        if ( 'GBP' !== get_woocommerce_currency() || 'GBP' !== ( Katukina\Core\Commerce::channel()['data']['currency'] ?? '' ) ) { $report['errors'][] = 'Currency mismatch.'; }
        foreach ( $this->manifest['items'] as $item ) {
            $id = $this->id( 'item:' . $item['key'] ); $parent = $id ? wc_get_product( $id ) : null;
            if ( ! $parent || ! $parent->is_type( 'variable' ) || $parent->get_sku() !== $item['sku'] ) { $report['errors'][] = 'Missing/invalid parent: ' . $item['key']; continue; }
            ++$report['parents']; if ( $parent->get_image_id() ) { ++$report['parents_with_image']; }
            foreach ( $item['forms'] as $form ) {
                $variation = wc_get_product( wc_get_product_id_by_sku( $form['sku'] ) );
                if ( ! $variation || ! $variation->is_type( 'variation' ) || $variation->get_parent_id() !== $id ) { $report['errors'][] = 'Invalid variation: ' . $form['sku']; continue; }
                ++$report['variations']; if ( $variation->get_image_id( 'edit' ) ) { ++$report['variations_with_image']; }
                if ( wc_format_decimal( $variation->get_regular_price(), 2 ) !== wc_format_decimal( $form['retail_price_gbp'], 2 ) ) { $report['errors'][] = 'Price mismatch: ' . $form['sku']; }
                if ( ! str_contains( $variation->get_attribute( 'presentation' ), $form['sale_quantity'] ) ) { $report['errors'][] = 'Sale quantity missing from presentation: ' . $form['sku']; }
                if ( $variation->managing_stock() || 'outofstock' !== $variation->get_stock_status() ) { $report['errors'][] = 'Inventory requires review: ' . $form['sku']; }
                $rows = $variation->get_meta( '_kat_workbook_source_rows' ); $report['source_rows'] += is_array( $rows ) ? count( $rows ) : 0;
                if ( $rows !== $form['source_rows'] || $variation->get_meta( '_kat_workbook_sale_quantity' ) !== $form['sale_quantity'] ) { $report['errors'][] = 'Source data mismatch: ' . $form['sku']; }
                if ( $variation->get_meta( '_kat_workbook_stock_snapshot' ) !== $form['stock_snapshot'] || $variation->get_meta( '_kat_workbook_stock_unit' ) !== $form['stock_unit'] ) { $report['errors'][] = 'Stock reference mismatch: ' . $form['sku']; }
            }
        }
        foreach ( $this->manifest['unmatched'] as $row ) {
            $id = $this->id( 'unmatched:' . $row['key'] );
            if ( $id && 'draft' === get_post_status( $id ) ) {
                ++$report['unmatched_drafts']; if ( wc_get_product( $id )->get_image_id() ) { ++$report['unmatched_with_image']; }
            } else { $report['errors'][] = 'Missing draft: ' . $row['key']; }
        }
        $report['duplicate_skus'] = $wpdb->get_results( "SELECT m.meta_value sku,COUNT(*) total FROM {$wpdb->postmeta} m JOIN {$wpdb->posts} p ON p.ID=m.post_id WHERE m.meta_key='_sku' AND m.meta_value<>'' AND p.post_type IN ('product','product_variation') AND p.post_status<>'trash' GROUP BY m.meta_value HAVING COUNT(*)>1", ARRAY_A );
        if ( $report['duplicate_skus'] ) { $report['errors'][] = 'Duplicate SKUs.'; }
        if ( is_file( $this->root . '/before.json' ) ) {
            $inspection = json_decode( file_get_contents( $this->root . '/before.json' ), true );
            $before = $inspection['before'];
            foreach ( array( 'ledger', 'orders' ) as $key ) { if ( $before[ $key ] !== $report['after'][ $key ] ) { $report['errors'][] = 'Historical data changed: ' . $key; } }
            $report['existing_sample_ids_preserved'] = 0;
            foreach ( $inspection['existing_samples'] as $old ) {
                $product = wc_get_product( $old['id'] );
                if ( $product && $product->is_type( 'variation' ) && $product->get_sku() === $old['sku'] ) { ++$report['existing_sample_ids_preserved']; }
                else { $report['errors'][] = 'Existing sample identity changed: ' . $old['sku']; }
            }
        }
        $this->write_report( 'verification', $report ); return $report;
    }
}

$mode = $args[0] ?? 'inspect';
if ( ! in_array( $mode, array( 'inspect', 'apply', 'media', 'verify' ), true ) ) { WP_CLI::error( 'Use inspect, apply, media or verify.' ); }
global $wpdb;
$lock = 'katukina-workbook-import';
if ( 1 !== (int) $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK(%s,0)', $lock ) ) ) { WP_CLI::error( 'Another workbook import is running.' ); }
try {
    $importer = new KatukinaWorkbookImport(); $report = $importer->$mode(); WP_CLI::line( wp_json_encode( $report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
    if ( ! empty( $report['errors'] ) || ! empty( $report['verification']['errors'] ) ) { throw new RuntimeException( 'Import verification requires attention; see the saved report.' ); }
} catch ( Throwable $error ) { $failure = $error; }
finally { $wpdb->get_var( $wpdb->prepare( 'SELECT RELEASE_LOCK(%s)', $lock ) ); }
if ( isset( $failure ) ) { WP_CLI::error( $failure->getMessage() ); }
