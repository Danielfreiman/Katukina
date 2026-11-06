<?php
/** Archive and remove only superseded files recorded by the local photo update. */
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') {
    throw new RuntimeException('Local WP-CLI only.');
}
global $wpdb;
$mode = $args[0] ?? 'inspect';
if (!in_array($mode, ['inspect', 'apply', 'verify'], true)) { WP_CLI::error('Use inspect, apply or verify.'); }
$root = __DIR__ . '/.imports/catalog-webp-transfer-2026-11-06';
$read = static fn($name) => json_decode(file_get_contents($root . '/' . $name), true, 512, JSON_THROW_ON_ERROR);
$before = $read('before.json');
$manifest = $read('manifest.json');
$verification = $read('verification.json');
if ($verification['errors'] || !$verification['non_image_data_unchanged'] || $verification['checked'] !== count($manifest['attachments'])) {
    WP_CLI::error('A successful photo update verification is required.');
}
$uploads = realpath(wp_get_upload_dir()['basedir']);
if (!$uploads || !str_ends_with($uploads, '/wp-content/uploads')) { WP_CLI::error('Unexpected upload directory.'); }
$safe = static function ($relative) use ($uploads) {
    if (!is_string($relative) || !$relative || str_contains($relative, '..') || str_contains($relative, '\\') || str_starts_with($relative, '/')) {
        throw new RuntimeException('Invalid relative upload path.');
    }
    $path = $uploads . '/' . $relative;
    if (file_exists($path) && (!is_file($path) || !str_starts_with(realpath($path), $uploads . '/'))) {
        throw new RuntimeException('Upload path escapes expected directory.');
    }
    return $path;
};
$file_set = static function ($file, $metadata, $backup = []) {
    if (!$file) { return []; }
    $directory = dirname($file);
    $prefix = $directory === '.' ? '' : $directory . '/';
    $files = [$file];
    foreach (array_merge($metadata['sizes'] ?? [], $backup) as $size) {
        if (!empty($size['file'])) { $files[] = $prefix . $size['file']; }
    }
    if (!empty($metadata['original_image'])) { $files[] = $prefix . $metadata['original_image']; }
    return array_unique($files);
};
$active = [];
foreach ($wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type='attachment'") as $id) {
    foreach ($file_set(get_post_meta($id, '_wp_attached_file', true), wp_get_attachment_metadata($id) ?: [], get_post_meta($id, '_wp_attachment_backup_sizes', true) ?: []) as $file) {
        $safe($file); $active[$file] = true;
    }
}
// Recheck every replacement before retiring any of its previous files.
foreach ($manifest['attachments'] as $row) {
    $path = get_attached_file($row['id']);
    if (!is_file($path) || hash_file('sha256', $path) !== $row['sha256'] || get_post_mime_type($row['id']) !== 'image/webp') {
        WP_CLI::error('Replacement changed or missing: ' . $row['id']);
    }
}
$candidates = [];
foreach ($before['attachments'] as $saved) {
    $meta = $saved['meta'];
    $old = maybe_unserialize($meta['_wp_attached_file'][0]);
    $metadata = maybe_unserialize($meta['_wp_attachment_metadata'][0] ?? '') ?: [];
    $backup = maybe_unserialize($meta['_wp_attachment_backup_sizes'][0] ?? '') ?: [];
    foreach ($file_set($old, $metadata, $backup) as $file) {
        $safe($file);
        if (!isset($active[$file])) { $candidates[$file] = true; }
    }
}
// Directly embedded URLs must not become broken references.
foreach ($wpdb->get_col("SELECT post_content FROM {$wpdb->posts} WHERE post_type IN ('post','page','product') AND post_content LIKE '%uploads/%'") as $content) {
    foreach ($candidates as $file => $_) {
        if (str_contains($content, $file)) { WP_CLI::error('Old file still embedded in content: ' . $file); }
    }
}
$receipt_path = $root . '/retirement.json';
$archive_path = $root . '/superseded-uploads.tar';
if ($mode === 'inspect') {
    WP_CLI::line(wp_json_encode(['replacements'=>count($manifest['attachments']), 'superseded_files'=>count($candidates), 'active_files_preserved'=>count($active)]));
    return;
}
if (1 !== (int)$wpdb->get_var("SELECT GET_LOCK('katukina-workbook-import',0)")) { WP_CLI::error('Another import is running.'); }
try {
    if (file_exists($receipt_path)) {
        $receipt = $read('retirement.json');
        if ($receipt['manifest_sha256'] !== hash_file('sha256', $root . '/manifest.json') || array_keys($receipt['files']) !== array_keys($candidates)) {
            throw new RuntimeException('Retirement scope changed.');
        }
    } else {
        if ($mode === 'verify') { throw new RuntimeException('No retirement receipt.'); }
        $receipt = ['manifest_sha256'=>hash_file('sha256', $root . '/manifest.json'), 'files'=>[]];
        foreach ($candidates as $file => $_) {
            $path = $safe($file);
            if (!is_file($path)) { throw new RuntimeException('Original missing before backup: ' . $file); }
            $receipt['files'][$file] = hash_file('sha256', $path);
        }
        $archive = new PharData($archive_path);
        $entries = [];
        foreach ($receipt['files'] as $file => $hash) { $entries[$file] = $safe($file); }
        $archive->buildFromIterator(new ArrayIterator($entries));
        unset($archive);
    }
    // Verify the complete private archive before the first removal, including on resume.
    $archive = new PharData($archive_path);
    foreach ($receipt['files'] as $file => $hash) {
        if (!isset($archive[$file]) || hash('sha256', $archive[$file]->getContent()) !== $hash) {
            throw new RuntimeException('Archive integrity failure: ' . $file);
        }
        $path = $safe($file);
        if (is_file($path) && hash_file('sha256', $path) !== $hash) { throw new RuntimeException('Old file changed: ' . $file); }
    }
    if ($mode === 'apply') {
        if (file_put_contents($receipt_path, wp_json_encode($receipt, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
            throw new RuntimeException('Cannot save retirement receipt.');
        }
        foreach ($receipt['files'] as $file => $_) {
            $path = $safe($file);
            if (is_file($path) && !unlink($path)) { throw new RuntimeException('Cannot retire: ' . $file); }
        }
    }
    $remaining = array_values(array_filter(array_keys($receipt['files']), static fn($file) => file_exists($safe($file))));
    $report = ['archived_files'=>count($receipt['files']), 'remaining_old_files'=>$remaining, 'archive_sha256'=>hash_file('sha256', $archive_path), 'replacements_checked'=>count($manifest['attachments'])];
    file_put_contents($root . '/retirement-verification.json', wp_json_encode($report, JSON_PRETTY_PRINT));
    WP_CLI::line(wp_json_encode($report));
    if ($remaining) { throw new RuntimeException('Superseded files remain in uploads.'); }
} finally {
    $wpdb->get_var("SELECT RELEASE_LOCK('katukina-workbook-import')");
}
