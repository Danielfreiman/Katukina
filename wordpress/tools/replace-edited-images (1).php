<?php
/** User-supplied catalogue photos; only the local CLI may apply them. */
if (!defined('WP_CLI') || !WP_CLI || 'local' !== wp_get_environment_type()) {
    throw new RuntimeException('Local CLI only.');
}
global $wpdb;
$root = __DIR__ . '/.imports/edited-images-2026-10-27';
$manifest = json_decode(file_get_contents($root . '/manifest.json'), true, 512, JSON_THROW_ON_ERROR);
$mode = $args[0] ?? 'inspect';
if (!in_array($mode, ['inspect', 'apply', 'verify'], true)) { WP_CLI::error('Use inspect, apply or verify.'); }
$parents = []; $variations = []; $files = []; $groups = [];
foreach ($manifest['items'] as $key => $item) {
    $ids = $wpdb->get_col($wpdb->prepare("SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key='_kat_workbook_key' AND meta_value=%s", $item['key']));
    if (count($ids) !== 1 || !($parent = wc_get_product($ids[0]))) { WP_CLI::error('Ambiguous product: ' . $key); }
    if (!in_array($parent->get_type(), ['variable', 'simple'], true)) { WP_CLI::error('Unexpected product type.'); }
    $parents[$key] = $parent;
}
foreach ($manifest['files'] as $row) {
    $name = basename($row['file']); $path = realpath($root . '/' . $row['file']);
    if (!$path || !str_starts_with($path, realpath($root) . '/') || !preg_match('/^(\d+)(?:-(\d+)_(\d+))?\.jpg$/D', $name, $match)
        || isset($files[$name]) || $match[1] !== (string)$row['item'] || hash_file('sha256', $path) !== $row['sha256']) {
        WP_CLI::error('Invalid or changed source: ' . $name);
    }
    $dimensions = getimagesize($path);
    if (!$dimensions || $dimensions['mime'] !== 'image/jpeg') { WP_CLI::error('Invalid JPEG: ' . $name); }
    $parent = $parents[$row['item']] ?? null;
    if (!$parent) { WP_CLI::error('Unmapped source: ' . $name); }
    if ($row['sku'] && $parent->is_type('variable')) {
        $variation = wc_get_product(wc_get_product_id_by_sku($row['sku']));
        if (!$variation || !$variation->is_type('variation') || $variation->get_parent_id() !== $parent->get_id()) { WP_CLI::error('Variation mismatch: ' . $name); }
        $variations[$row['sku']] = $variation;
    } elseif ($row['sku'] && ('draft' !== $parent->get_status() || $parent->get_meta('_kat_workbook_key') !== 'sacred-incense-uk:unmatched:muna')) {
        WP_CLI::error('Unexpected unmatched product.');
    }
    $files[$name] = $row + ['path' => $path]; $groups[$row['item']][] = $name;
}
foreach ($parents as $key => $parent) {
    if (!isset($files[$key . '.jpg'])) { WP_CLI::error('Missing cover for ' . $key); }
}
$snapshot = static function () use ($wpdb) {
    $result = [];
    $result['products'] = $wpdb->get_results("SELECT ID,post_type,post_parent,post_status,post_title,post_content,post_excerpt FROM {$wpdb->posts} WHERE post_type IN ('product','product_variation') ORDER BY ID", ARRAY_A);
    $result['commercial_meta'] = $wpdb->get_results("SELECT m.post_id,m.meta_key,m.meta_value FROM {$wpdb->postmeta} m JOIN {$wpdb->posts} p ON p.ID=m.post_id WHERE p.post_type IN ('product','product_variation') AND m.meta_key NOT IN ('_thumbnail_id','_product_image_gallery','_edit_lock','_edit_last') ORDER BY m.meta_id", ARRAY_A);
    foreach (['lots','movements','reservations','production','money','orders'] as $table) {
        $result[$table] = $wpdb->get_results('SELECT * FROM ' . \Katukina\Core\Database::table($table) . ' ORDER BY 1', ARRAY_A);
    }
    return hash('sha256', wp_json_encode($result));
};
$attachment_name = static function ($id) {
    $edited = get_post_meta($id, '_kat_edited_image_filename', true);
    if ($edited) { return $edited; }
    $url = get_post_meta($id, '_kat_workbook_image_source_url', true);
    return $url ? basename(wp_parse_url($url, PHP_URL_PATH)) : '';
};
$find_attachment = static function ($row) use ($wpdb) {
    return (int)$wpdb->get_var($wpdb->prepare("SELECT p.ID FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} m ON m.post_id=p.ID WHERE p.post_type='attachment' AND m.meta_key='_kat_edited_image_sha256' AND m.meta_value=%s ORDER BY p.ID LIMIT 1", $row['sha256']));
};
$verify = static function () use ($files, $parents, $variations, $find_attachment) {
    $errors = []; $count = 0;
    foreach ($files as $name => $row) {
        $id = $find_attachment($row); $path = $id ? wp_get_original_image_path($id) : false;
        if (!$path || !is_file($path) || hash_file('sha256', $path) !== $row['sha256']) { $errors[] = 'Image mismatch: ' . $name; continue; }
        $parent = wc_get_product($parents[$row['item']]->get_id());
        $references = array_map('intval', array_merge([$parent->get_image_id()], $parent->get_gallery_image_ids()));
        if (!in_array($id, $references, true)) { $errors[] = 'Missing gallery reference: ' . $name; }
        if (!$row['sku'] && (int)$parent->get_image_id() !== $id) { $errors[] = 'Cover mismatch: ' . $name; }
        if ($row['sku'] && str_ends_with($name, '_01.jpg') && isset($variations[$row['sku']])) {
            if ((int)wc_get_product($variations[$row['sku']]->get_id())->get_image_id('edit') !== $id) { $errors[] = 'Variation mismatch: ' . $name; }
        }
        ++$count;
    }
    return ['images_checked' => $count, 'products' => count($parents), 'variations' => count($variations), 'errors' => $errors];
};
if ($mode === 'inspect') {
    WP_CLI::line(wp_json_encode(['images'=>count($files),'products'=>count($parents),'variations'=>count($variations),'targets'=>array_map(static fn($p)=>['id'=>$p->get_id(),'name'=>$p->get_name(),'status'=>$p->get_status()],$parents)], JSON_PRETTY_PRINT));
    return;
}
if ($mode === 'verify') {
    $report = $verify(); WP_CLI::line(wp_json_encode($report, JSON_PRETTY_PRINT));
    if ($report['errors']) { WP_CLI::error('Image verification failed.'); } return;
}
if (1 !== (int)$wpdb->get_var("SELECT GET_LOCK('katukina-workbook-import',0)")) { WP_CLI::error('Another import is running.'); }
try {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $before = ['snapshot'=>$snapshot(), 'images'=>[]];
    foreach (array_merge(array_values($parents), array_values($variations)) as $p) {
        $before['images'][$p->get_id()] = ['featured'=>$p->get_image_id('edit'),'gallery'=>$p->get_gallery_image_ids()];
    }
    if (!file_exists($root . '/before.json')) { file_put_contents($root . '/before.json', wp_json_encode($before, JSON_PRETTY_PRINT)); }
    $imported = []; $created = 0;
    foreach ($files as $name => $row) {
        $id = $find_attachment($row);
        if (!$id) {
            $temp = wp_tempnam($name);
            if (!$temp || !copy($row['path'], $temp)) { throw new RuntimeException('Cannot copy ' . $name); }
            $title = $parents[$row['item']]->get_name();
            $id = media_handle_sideload(['name'=>'edited-' . substr($row['sha256'],0,10) . '-' . $name,'tmp_name'=>$temp], $parents[$row['item']]->get_id(), $title);
            if (is_wp_error($id)) { @unlink($temp); throw new RuntimeException($id->get_error_message()); }
            update_post_meta($id, '_kat_edited_image_sha256', $row['sha256']);
            update_post_meta($id, '_kat_edited_image_filename', $name);
            update_post_meta($id, '_kat_edited_archive_sha256', $manifest['source_sha256']);
            update_post_meta($id, '_kat_workbook_image_sha256', $row['sha256']);
            update_post_meta($id, '_wp_attachment_image_alt', $title);
            ++$created;
        }
        $imported[$name] = $id;
    }
    foreach ($parents as $key => $parent) {
        $cover = $imported[$key . '.jpg']; $gallery = [];
        foreach (array_map('intval', array_merge([$parent->get_image_id()], $parent->get_gallery_image_ids())) as $old_id) {
            if (!$old_id) { continue; }
            $name = $attachment_name($old_id); $replacement = $imported[$name] ?? $old_id;
            if ($replacement !== $cover) { $gallery[] = $replacement; }
        }
        foreach ($groups[$key] as $name) { if ($imported[$name] !== $cover) { $gallery[] = $imported[$name]; } }
        $parent->set_image_id($cover); $parent->set_gallery_image_ids(array_values(array_unique($gallery))); $parent->save();
        wc_delete_product_transients($parent->get_id());
    }
    foreach ($variations as $sku => $variation) {
        if (!isset($imported[$sku . '_01.jpg'])) { throw new RuntimeException('Missing variation cover: ' . $sku); }
        $variation->set_image_id($imported[$sku . '_01.jpg']); $variation->save();
    }
    $report = $verify(); $report['created_attachments'] = $created;
    $report['non_image_data_unchanged'] = $snapshot() === $before['snapshot'];
    file_put_contents($root . '/verification.json', wp_json_encode($report, JSON_PRETTY_PRINT));
    if ($report['errors'] || !$report['non_image_data_unchanged']) { throw new RuntimeException('Image or non-image data verification failed; see the report.'); }
    WP_CLI::line(wp_json_encode($report, JSON_PRETTY_PRINT));
} catch (Throwable $error) { $failure = $error; }
finally { $wpdb->get_var("SELECT RELEASE_LOCK('katukina-workbook-import')"); }
if (isset($failure)) { WP_CLI::error($failure->getMessage()); }
