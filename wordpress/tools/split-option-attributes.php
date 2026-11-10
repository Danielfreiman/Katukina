<?php
/** Local, reversible migration of native WooCommerce variation attributes. */
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') { throw new RuntimeException('Local CLI only.'); }
global $wpdb;
$mode = $args[0] ?? 'inspect';
if (!in_array($mode, ['inspect','apply','verify','rollback'], true)) { throw new RuntimeException('Invalid mode.'); }
$root = __DIR__ . '/.imports/sacred-incense-uk';
$plan = json_decode(file_get_contents($root.'/option-attribute-plan.json'), true, 512, JSON_THROW_ON_ERROR);
$state_path = $root.'/option-attribute-state.json';
$state = is_file($state_path) ? json_decode(file_get_contents($state_path), true, 512, JSON_THROW_ON_ERROR) : null;
if ($plan['version'] !== 1 || !$plan['products']) { throw new RuntimeException('Invalid plan.'); }
if ($state && $state['plan_hash'] !== hash('sha256', wp_json_encode($plan))) { throw new RuntimeException('Plan changed.'); }
if (1 !== (int)$wpdb->get_var("SELECT GET_LOCK('katukina-workbook-import',0)")) { throw new RuntimeException('Another catalogue migration is running.'); }
$transaction = false;
try {
    $parents = []; $children = []; $targets = []; $originals = []; $defaults = [];
    foreach ($plan['products'] as $item) {
        $p = wc_get_product(wc_get_product_id_by_sku($item['sku']));
        if (!$p || !$p->is_type('variable') || !$p->get_meta('_kat_workbook_complete')) { throw new RuntimeException('Unexpected parent: '.$item['sku']); }
        $id = $p->get_id(); $parents[$id] = $p; $targets[$id] = []; $originals[$id] = [];
        $ids = [];
        foreach ($item['rows'] as $row) {
            $v = wc_get_product(wc_get_product_id_by_sku($row['sku']));
            if (!$v || !$v->is_type('variation') || $v->get_parent_id() !== $id) { throw new RuntimeException('Variation identity mismatch.'); }
            $vid = $v->get_id(); $ids[] = $vid; $children[$vid] = $v;
            $targets[$id][$vid] = $row['attributes'];
            $originals[$id][$vid] = ['presentation' => $row['original']];
        }
        $actual = $p->get_children(); sort($actual); sort($ids);
        if ($actual !== $ids) { throw new RuntimeException('Unexpected child variations.'); }
        $attributes = $p->get_attributes();
        $split = isset($attributes['type'], $attributes['weight']) && count($attributes) === 2;
        $legacy = isset($attributes['presentation']) && count($attributes) === 1;
        if (!$split && !$legacy) { throw new RuntimeException('Custom parent attributes require review.'); }
        if ($split && !$state) { throw new RuntimeException('Split attributes without migration state.'); }
        foreach ($targets[$id] as $vid => $target) {
            $expected = $split ? $target : $originals[$id][$vid];
            $current = $children[$vid]->get_attributes(); ksort($current); ksort($expected);
            if ($current !== $expected) { throw new RuntimeException('Edited variation requires review: '.$vid); }
        }
        $defaults[$id] = $p->get_default_attributes();
    }
    $snapshot = static function() use (&$parents, &$children, $wpdb) {
        $result = ['currency' => get_woocommerce_currency(), 'products' => [], 'history' => []];
        foreach (array_merge(array_values($parents), array_values($children)) as $p) {
            $meta = [];
            foreach ($p->get_meta_data() as $m) { $d = $m->get_data(); if (str_starts_with($d['key'], '_kat')) { $meta[$d['key']] = $d['value']; } }
            ksort($meta);
            $result['products'][$p->get_id()] = [$p->get_sku(), $p->get_parent_id(), $p->get_status(), $p->get_regular_price(), $p->get_sale_price(), $p->get_price(), $p->get_stock_status(), $p->get_manage_stock(), $p->get_stock_quantity(), $p->get_backorders(), $p->get_image_id('edit'), $p->get_gallery_image_ids(), $p->get_weight(), $p->get_dimensions(false), $meta];
        }
        foreach (['lots','movements','reservations','production','money','orders'] as $table) { $result['history'][$table] = hash('sha256', wp_json_encode($wpdb->get_results('SELECT * FROM '.Katukina\Core\Database::table($table).' ORDER BY 1', ARRAY_A))); }
        $orders = []; foreach (wc_get_orders(['limit'=>-1]) as $o) { $orders[] = [$o->get_id(), $o->get_currency(), $o->get_total(), $o->get_status()]; }
        $result['history']['wc_orders'] = hash('sha256', wp_json_encode($orders));
        return hash('sha256', wp_json_encode($result));
    };
    $protected = $snapshot();
    if ($state && $state['protected'] !== $protected) { throw new RuntimeException('Protected catalogue data changed since snapshot; reconcile before continuing.'); }
    if ($mode === 'inspect') {
        WP_CLI::line(wp_json_encode(['parents'=>count($parents), 'variations'=>count($children), 'preserved_products'=>count($plan['skipped']), 'example'=>array_values(array_filter($plan['products'], static fn($p)=>$p['name']==='Emburana bark'))], JSON_PRETTY_PRINT));
        return;
    }
    if (!$state && $mode !== 'apply') { throw new RuntimeException('Run apply first.'); }
    if (!$state) {
        if (!is_file($root.'/option-attribute-backup.json')) { throw new RuntimeException('SQL backup required.'); }
        $state = ['plan_hash'=>hash('sha256', wp_json_encode($plan)), 'protected'=>$protected, 'parents'=>[], 'children'=>[]];
        foreach ($parents as $id=>$p) { $state['parents'][$id] = ['attributes'=>array_map(static fn($a)=>$a->get_data(), array_values($p->get_attributes())), 'defaults'=>$p->get_default_attributes()]; }
        foreach ($children as $id=>$p) { $state['children'][$id] = $p->get_attributes(); }
        if (false === file_put_contents($state_path, wp_json_encode($state, JSON_PRETTY_PRINT))) { throw new RuntimeException('Cannot save rollback state.'); }
    }
    $attribute_objects = static function($data) {
        $result = [];
        foreach ($data as $row) {
            $a = new WC_Product_Attribute(); $a->set_id($row['id'] ?? 0); $a->set_name($row['name']); $a->set_options($row['options']); $a->set_position($row['position'] ?? 0); $a->set_visible($row['visible'] ?? true); $a->set_variation($row['variation'] ?? true); $result[] = $a;
        }
        return $result;
    };
    if ($mode !== 'verify') {
        $wpdb->query('START TRANSACTION'); $transaction = true;
        foreach ($parents as $id=>$p) {
            if ($mode === 'apply' && isset($p->get_attributes()['type'], $p->get_attributes()['weight'])) { continue; }
            $old_defaults = $state['parents'][$id]['defaults']; $new_defaults = [];
            foreach ($targets[$id] as $vid=>$target) {
                $v = $children[$vid];
                $attrs = $mode === 'rollback' ? $state['children'][$vid] : $target;
                $v->set_attributes($attrs); $v->save();
                if (($old_defaults['presentation'] ?? null) === $originals[$id][$vid]['presentation']) { $new_defaults = $target; }
            }
            if ($mode === 'rollback') {
                $data = $state['parents'][$id]['attributes']; $new_defaults = $old_defaults;
            } else {
                if ($old_defaults && !$new_defaults) { throw new RuntimeException('Unrecognized default option.'); }
                $types = array_values(array_unique(array_column($targets[$id], 'type')));
                $weights = array_values(array_unique(array_column($targets[$id], 'weight')));
                $grams = static function($value) { [$number,$unit] = explode(' ', $value); return (float)$number * (['mg'=>0.001,'g'=>1,'kg'=>1000][$unit]); };
                usort($weights, static fn($a,$b)=>$grams($a)<=>$grams($b));
                $data = [['name'=>'Type','options'=>$types,'position'=>0], ['name'=>'Weight','options'=>$weights,'position'=>1]];
            }
            $p->set_attributes($attribute_objects($data)); $p->set_default_attributes($new_defaults); $p->save();
            WC_Product_Variable::sync($id); wc_delete_product_transients($id);
        }
    }
    foreach ($parents as $id=>$p) {
        clean_post_cache($id); $parents[$id] = wc_get_product($id);
        foreach ($targets[$id] as $vid=>$target) {
            clean_post_cache($vid); $children[$vid] = wc_get_product($vid);
            $expected = $mode === 'rollback' ? $state['children'][$vid] : $target;
            $actual = $children[$vid]->get_attributes(); ksort($expected); ksort($actual);
            if ($actual !== $expected) { throw new RuntimeException('Attribute verification failed.'); }
            $matched = WC_Data_Store::load('product')->find_matching_product_variation($parents[$id], array_combine(array_map(static fn($k)=>'attribute_'.$k, array_keys($expected)), array_values($expected)));
            if ($matched !== $vid) { throw new RuntimeException('Variation resolution changed: '.$vid); }
        }
        if ($mode !== 'rollback') {
            $attributes = $parents[$id]->get_attributes();
            if (array_keys($attributes) !== ['type','weight']) { throw new RuntimeException('Parent attributes not migrated.'); }
            foreach ($attributes as $key=>$attribute) {
                $actual = $attribute->get_options(); $expected = array_values(array_unique(array_column($targets[$id], $key))); sort($actual); sort($expected);
                if ($actual !== $expected || !$attribute->get_variation()) { throw new RuntimeException('Parent options mismatch.'); }
            }
        }
    }
    // Recreate snapshot closure variables with fresh product objects above.
    $after = $snapshot();
    if ($protected !== $after) { throw new RuntimeException('Protected data changed.'); }
    if ($transaction) { $wpdb->query('COMMIT'); $transaction = false; }
    $report = ['status'=>'passed','mode'=>$mode,'parents'=>count($parents),'variations'=>count($children),'preserved_products'=>count($plan['skipped']),'protected_data_unchanged'=>true];
    file_put_contents($root.'/option-attribute-verification.json', wp_json_encode($report, JSON_PRETTY_PRINT));
    WP_CLI::line(wp_json_encode($report, JSON_PRETTY_PRINT));
} catch (Throwable $error) {
    if ($transaction) { $wpdb->query('ROLLBACK'); wp_cache_flush(); }
    throw $error;
} finally { $wpdb->get_var("SELECT RELEASE_LOCK('katukina-workbook-import')"); }
