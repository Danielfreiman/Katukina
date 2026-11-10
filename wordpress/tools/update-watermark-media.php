<?php
/** Replace local attachment files while preserving IDs and every product reference. */
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') {
    throw new RuntimeException('Local WP-CLI only.');
}
global $wpdb;
$mode = $args[0] ?? 'inventory';
$batch = $args[1] ?? 'catalog-webp-2026-11-06';
if (!preg_match('/^catalog-webp-[a-z0-9-]+$/D', $batch)) { WP_CLI::error('Invalid batch.'); }
$root = __DIR__ . '/.imports/' . $batch;
if (!is_dir($root)) { mkdir($root, 0775, true); }
$write = static function ($name, $value) use ($root) {
    $temp = $root . '/' . $name . '.tmp';
    if (file_put_contents($temp, wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false || !rename($temp, $root . '/' . $name)) {
        throw new RuntimeException('Cannot save batch receipt.');
    }
};
$snapshot = static function () use ($wpdb) {
    $hashes = [];
    $hashes['products'] = hash('sha256', wp_json_encode($wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE post_type IN ('product','product_variation','shop_order','shop_order_refund') ORDER BY ID", ARRAY_A)));
    $hashes['product_order_meta'] = hash('sha256', wp_json_encode($wpdb->get_results("SELECT m.* FROM {$wpdb->postmeta} m JOIN {$wpdb->posts} p ON p.ID=m.post_id WHERE p.post_type IN ('product','product_variation','shop_order','shop_order_refund') ORDER BY m.meta_id", ARRAY_A)));
    foreach ($wpdb->get_col('SHOW TABLES') as $table) {
        if (str_starts_with($table, $wpdb->prefix . 'kat_') || preg_match('/^' . preg_quote($wpdb->prefix, '/') . '(wc_orders|wc_order_addresses|wc_order_operational_data|wc_orders_meta|woocommerce_order_items|woocommerce_order_itemmeta)$/D', $table)) {
            $hashes[$table] = hash('sha256', wp_json_encode($wpdb->get_results("SELECT * FROM `{$table}` ORDER BY 1", ARRAY_A)));
        }
    }
    return $hashes;
};
if ($mode === 'inventory') {
    $rows = [];
    foreach ($wpdb->get_results("SELECT ID,post_mime_type FROM {$wpdb->posts} WHERE post_type='attachment' ORDER BY ID") as $post) {
        $path = get_attached_file($post->ID);
        $rows[] = ['id'=>(int)$post->ID, 'mime'=>$post->post_mime_type, 'file'=>get_post_meta($post->ID, '_wp_attached_file', true),
            'source_url'=>get_post_meta($post->ID, '_kat_workbook_image_source_url', true),
            'sample_url'=>get_post_meta($post->ID, '_katukina_sample_image_url', true),
            'edited_name'=>get_post_meta($post->ID, '_kat_edited_image_filename', true),
            'sha256'=>is_file($path) ? hash_file('sha256', $path) : null];
    }
    $references = [];
    foreach ($wpdb->get_results("SELECT ID,post_type,post_name,post_status FROM {$wpdb->posts} WHERE post_type IN ('product','product_variation') ORDER BY ID") as $post) {
        $gallery = array_values(array_filter(array_map('intval', explode(',', get_post_meta($post->ID, '_product_image_gallery', true)))));
        $references[] = ['id'=>(int)$post->ID, 'type'=>$post->post_type, 'slug'=>$post->post_name, 'status'=>$post->post_status,
            'cover'=>(int)get_post_meta($post->ID, '_thumbnail_id', true), 'gallery'=>$gallery];
    }
    $embedded = [];
    foreach ($wpdb->get_results("SELECT ID,post_type,post_content FROM {$wpdb->posts} WHERE post_type IN ('product','page','post') AND post_content LIKE '%<img%'") as $post) {
        preg_match_all('/<img[^>]+src=[\x22\x27]([^\x22\x27]+)[\x22\x27]/i', $post->post_content, $matches);
        $embedded[] = ['id'=>(int)$post->ID, 'type'=>$post->post_type, 'sources'=>$matches[1]];
    }
    $write('wordpress-inventory.json', ['attachments'=>$rows, 'references'=>$references, 'embedded_images'=>$embedded]);
    WP_CLI::success(count($rows) . ' attachments; ' . count($references) . ' product/variation records inventoried.');
    return;
}
if (!in_array($mode, ['apply','verify','rollback'], true)) { WP_CLI::error('Use inventory, apply, verify or rollback.'); }
if (file_exists($root . '/cleanup.json') && $mode !== 'verify') { WP_CLI::error('Old uploads were retired. Verify only; restore archived files before rolling back.'); }
$manifest = json_decode(file_get_contents($root . '/manifest.json'), true, 512, JSON_THROW_ON_ERROR);
$keys = ['_wp_attached_file','_wp_attachment_metadata','_wp_attachment_backup_sizes','_kat_workbook_image_sha256','_kat_edited_image_sha256','_kat_edited_image_filename','_kat_webp_batch'];
$restore = static function ($before) use ($keys, $wpdb) {
    foreach ($before['attachments'] as $id => $row) {
        $wpdb->update($wpdb->posts, ['post_mime_type'=>$row['mime']], ['ID'=>(int)$id]);
        foreach ($keys as $key) {
            delete_post_meta($id, $key);
            foreach ($row['meta'][$key] as $value) { add_post_meta($id, $key, maybe_unserialize($value)); }
        }
        clean_post_cache($id);
    }
};
$verify = static function () use ($manifest, $root, $snapshot) {
    $errors = []; $urls = [];
    foreach ($manifest['attachments'] as $row) {
        $id = $row['id']; $path = get_attached_file($id); $size = is_file($path) ? getimagesize($path) : false;
        if (!$size || $size[0] !== 900 || $size[1] !== 900 || $size['mime'] !== 'image/webp' || hash_file('sha256', $path) !== $row['sha256'] || get_post_mime_type($id) !== 'image/webp') { $errors[] = $id; }
        $metadata = wp_get_attachment_metadata($id);
        if (($metadata['width'] ?? 0) !== 900 || ($metadata['height'] ?? 0) !== 900) { $errors[] = 'metadata:' . $id; }
        foreach ($metadata['sizes'] ?? [] as $size_data) {
            if (!is_file(dirname($path) . '/' . $size_data['file'])) { $errors[] = 'thumbnail:' . $id; }
        }
        $urls[] = ['id'=>$id, 'url'=>wp_get_attachment_url($id), 'sha256'=>$row['sha256']];
    }
    $before = json_decode(file_get_contents($root . '/before.json'), true, 512, JSON_THROW_ON_ERROR);
    $unchanged = $snapshot() === $before['non_image_hashes'];
    $uploads = wp_get_upload_dir(); $old_retained = true;
    foreach ($manifest['attachments'] as $row) {
        $saved = $before['attachments'][$row['id']]['meta']['_wp_attached_file'][0];
        $original = $uploads['basedir'] . '/' . maybe_unserialize($saved);
        if (!is_file($original)) {
            $old_retained = false;
            $archived = $root . '/retired-files/' . maybe_unserialize($saved);
            if (!file_exists($root . '/cleanup.json') || !is_file($archived) || hash_file('sha256', $archived) !== $row['old_sha256']) { $errors[] = 'original:' . $row['id']; }
        } elseif (hash_file('sha256', $original) !== $row['old_sha256']) { $old_retained = false; $errors[] = 'original:' . $row['id']; }
    }
    return ['checked'=>count($manifest['attachments']), 'errors'=>array_values(array_unique($errors)), 'non_image_data_unchanged'=>$unchanged, 'old_files_retained'=>$old_retained, 'urls'=>$urls];
};
if ($mode === 'verify') {
    $report = $verify(); $write('verification.json', $report);
    WP_CLI::line(wp_json_encode(array_diff_key($report, ['urls'=>true])));
    if ($report['errors'] || !$report['non_image_data_unchanged']) { WP_CLI::error('Verification failed.'); }
    return;
}
if (1 !== (int)$wpdb->get_var("SELECT GET_LOCK('katukina-workbook-import',0)")) { WP_CLI::error('Another import is running.'); }
try {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    if ($mode === 'rollback') {
        $original = json_decode(file_get_contents($root . '/before.json'), true, 512, JSON_THROW_ON_ERROR);
        $restore($original);
        $errors = [];
        foreach ($original['attachments'] as $id => $saved) {
            if (get_post_mime_type($id) !== $saved['mime']) { $errors[] = 'mime:' . $id; }
            foreach ($keys as $key) {
                $actual = $wpdb->get_col($wpdb->prepare("SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id=%d AND meta_key=%s ORDER BY meta_id", $id, $key));
                if ($actual !== $saved['meta'][$key]) { $errors[] = $key . ':' . $id; }
            }
        }
        $report = ['restored'=>count($original['attachments']), 'errors'=>$errors, 'non_image_data_unchanged'=>$snapshot() === $original['non_image_hashes']];
        $write('rollback.json', $report);
        if ($errors || !$report['non_image_data_unchanged']) { throw new RuntimeException('Rollback verification failed.'); }
        WP_CLI::line(wp_json_encode($report));
        return;
    }
    // Validate every input before making the first database change.
    foreach ($manifest['attachments'] as $row) {
        $path = realpath($root . '/' . $row['file']);
        $size = $path ? getimagesize($path) : false;
        if (!$path || !str_starts_with($path, realpath($root) . '/') || !$size || $size[0] !== 900 || $size[1] !== 900 || $size['mime'] !== 'image/webp' || hash_file('sha256', $path) !== $row['sha256'] || get_post_type($row['id']) !== 'attachment') {
            throw new RuntimeException('Invalid source/target: ' . $row['id']);
        }
        if (!file_exists($root . '/before.json') && (!is_file(get_attached_file($row['id'])) || hash_file('sha256', get_attached_file($row['id'])) !== $row['old_sha256'])) {
            throw new RuntimeException('Attachment changed since preflight: ' . $row['id']);
        }
    }
    if (file_exists($root . '/before.json')) {
        $before = json_decode(file_get_contents($root . '/before.json'), true, 512, JSON_THROW_ON_ERROR);
        if (($before['manifest_sha256'] ?? '') !== hash_file('sha256', $root . '/manifest.json')) { throw new RuntimeException('Batch manifest changed.'); }
    } else {
        $receipt = json_decode(file_get_contents($root . '/backup.json'), true, 512, JSON_THROW_ON_ERROR);
        if (empty($receipt['bytes']) || empty($receipt['sha256']) || empty($receipt['isolated_restore'])) { throw new RuntimeException('Verified SQL backup required.'); }
        $before = ['manifest_sha256'=>hash_file('sha256', $root . '/manifest.json'), 'non_image_hashes'=>$snapshot(), 'attachments'=>[]];
        foreach ($manifest['attachments'] as $row) {
            $id = $row['id']; $meta = [];
            foreach ($keys as $key) { $meta[$key] = $wpdb->get_col($wpdb->prepare("SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id=%d AND meta_key=%s ORDER BY meta_id", $id, $key)); }
            $before['attachments'][$id] = ['mime'=>get_post_mime_type($id), 'meta'=>$meta];
        }
        $write('before.json', $before);
    }
    $done = 0; $changed = 0;
    foreach ($manifest['attachments'] as $row) {
        $id = $row['id']; $old = get_attached_file($id);
        if (is_file($old) && hash_file('sha256', $old) === $row['sha256'] && get_post_mime_type($id) === 'image/webp') { ++$done; continue; }
        $name = 'watermark-' . substr($row['sha256'], 0, 12) . '-' . basename($row['name']);
        $upload = wp_upload_bits($name, null, file_get_contents($root . '/' . $row['file']));
        if ($upload['error']) { throw new RuntimeException($upload['error']); }
        if (hash_file('sha256', $upload['file']) !== $row['sha256']) { throw new RuntimeException('Upload hash mismatch.'); }
        update_attached_file($id, $upload['file']);
        $result = $wpdb->update($wpdb->posts, ['post_mime_type'=>'image/webp'], ['ID'=>$id]);
        if ($result === false) { throw new RuntimeException('Cannot update MIME type.'); }
        clean_post_cache($id);
        $metadata = wp_generate_attachment_metadata($id, $upload['file']);
        if (empty($metadata['width']) || empty($metadata['sizes'])) { throw new RuntimeException('Thumbnail generation failed: ' . $id); }
        wp_update_attachment_metadata($id, $metadata);
        update_post_meta($id, '_kat_workbook_image_sha256', $row['sha256']);
        update_post_meta($id, '_kat_edited_image_sha256', $row['sha256']);
        update_post_meta($id, '_kat_edited_image_filename', $row['name']);
        update_post_meta($id, '_kat_webp_batch', $batch);
        ++$changed; ++$done;
        if ($done % 50 === 0) { $write('progress.json', ['done'=>$done, 'total'=>count($manifest['attachments'])]); WP_CLI::line('Updated ' . $done . '/' . count($manifest['attachments'])); }
    }
    $report = $verify(); $report['changed_this_run'] = $changed;
    $write('verification.json', $report);
    if ($report['errors'] || !$report['non_image_data_unchanged']) { throw new RuntimeException('Post-update verification failed.'); }
    WP_CLI::line(wp_json_encode(array_diff_key($report, ['urls'=>true])));
} catch (Throwable $error) {
    if (isset($before)) { $restore($before); }
    WP_CLI::error($error->getMessage() . ' Previous attachment state restored when available.');
} finally {
    $wpdb->get_var("SELECT RELEASE_LOCK('katukina-workbook-import')");
}
