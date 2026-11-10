<?php
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') { throw new RuntimeException('Local only'); }
global $wpdb;
$rows=$wpdb->get_results("SELECT p.ID,p.post_parent,p.post_type,p.post_status,s.meta_value sku,k.meta_value workbook_key FROM {$wpdb->posts} p LEFT JOIN {$wpdb->postmeta} s ON s.post_id=p.ID AND s.meta_key='_sku' LEFT JOIN {$wpdb->postmeta} k ON k.post_id=p.ID AND k.meta_key='_kat_workbook_key' WHERE p.post_type IN ('product','product_variation')",ARRAY_A);
file_put_contents(__DIR__.'/.imports/sku-images-2026-11-04/catalog.json',wp_json_encode($rows,JSON_PRETTY_PRINT));
echo count($rows)." catalog records exported\n";
