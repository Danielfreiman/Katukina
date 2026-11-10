<?php
/** Delete only replaced upload files, after archiving and checking live usage. */
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') { throw new RuntimeException('Local CLI only'); }
global $wpdb;
$root = __DIR__ . '/.imports/catalog-webp-watermark-2026-11-09';
$mode = $args[0] ?? 'inspect';
if (!in_array($mode, ['inspect', 'apply'], true)) { WP_CLI::error('Use inspect or apply'); }
$read = static fn($file) => json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
$verified = $read($root . '/verification.json');
if ($verified['errors'] || !$verified['non_image_data_unchanged']) { WP_CLI::error('Successful replacement verification required'); }
$manifest = $read($root . '/manifest.json');
$targets = array_fill_keys(array_column($manifest['attachments'], 'id'), true);
$uploads = wp_get_upload_dir();
$base = realpath($uploads['basedir']);
$relative = static function ($file) {
    $file = str_replace('\\', '/', (string)$file);
    if (!preg_match('~^(?:\d{4}/\d{2}/)?[^/:]+\.(?:jpe?g|png|webp)$~iD', $file) || str_contains($file, '..')) { throw new RuntimeException('Unsafe upload file: ' . $file); }
    return $file;
};
$files_from_meta = static function ($file, $metadata, $backups) use ($relative) {
    if (!$file) { return []; }
    $result = [$relative($file)]; $dir = dirname($file) === '.' ? '' : dirname($file) . '/';
    foreach ($metadata['sizes'] ?? [] as $size) { $result[] = $relative($dir . $size['file']); }
    if (!empty($metadata['original_image'])) { $result[] = $relative($dir . $metadata['original_image']); }
    foreach ($backups ?: [] as $size) { if (!empty($size['file'])) { $result[] = $relative($dir . $size['file']); } }
    return $result;
};
// Protect the current file and every thumbnail of ALL attachments, not just targets.
$live = [];
foreach ($wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type='attachment'") as $id) {
    $file = get_post_meta($id, '_wp_attached_file', true);
    if (!$file || !preg_match('~\.(?:jpe?g|png|webp)$~i', $file)) { continue; }
    foreach ($files_from_meta($file, wp_get_attachment_metadata($id) ?: [], get_post_meta($id, '_wp_attachment_backup_sizes', true)) as $path) { $live[$path] = true; }
}
$content = implode("\n", $wpdb->get_col("SELECT CONCAT(post_content, ' ', post_excerpt) FROM {$wpdb->posts} WHERE post_type <> 'attachment'"));
$candidates = [];
foreach ([$root . '/before.json', __DIR__ . '/.imports/catalog-webp-transfer-2026-11-06/before.json'] as $snapshot) {
    if (!file_exists($snapshot)) { continue; }
    foreach ($read($snapshot)['attachments'] as $id => $row) {
        if (!isset($targets[$id])) { continue; }
        $meta = $row['meta'];
        $file = maybe_unserialize($meta['_wp_attached_file'][0] ?? '');
        $metadata = maybe_unserialize($meta['_wp_attachment_metadata'][0] ?? '') ?: [];
        $backups = maybe_unserialize($meta['_wp_attachment_backup_sizes'][0] ?? '') ?: [];
        foreach ($files_from_meta($file, $metadata, $backups) as $path) { $candidates[$path] = true; }
    }
}
$deletable = []; $protected = [];
foreach (array_keys($candidates) as $path) {
    if (isset($live[$path]) || str_contains($content, $path)) { $protected[] = $path; continue; }
    $absolute = realpath($base . '/' . $path);
    if (!$absolute) { continue; }
    if (!str_starts_with($absolute, $base . '/') || !is_file($absolute) || is_link($base . '/' . $path)) { throw new RuntimeException('Unsafe resolved target'); }
    $deletable[] = ['file'=>$path, 'sha256'=>hash_file('sha256', $absolute), 'bytes'=>filesize($absolute)];
}
$plan = ['files'=>$deletable, 'protected'=>$protected, 'count'=>count($deletable), 'bytes'=>array_sum(array_column($deletable, 'bytes'))];
file_put_contents($root . '/cleanup-plan.json', wp_json_encode($plan, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
if ($mode === 'inspect') { WP_CLI::line(wp_json_encode(['delete'=>$plan['count'], 'protected'=>count($protected), 'bytes'=>$plan['bytes']])); return; }
if (1 !== (int)$wpdb->get_var("SELECT GET_LOCK('katukina-workbook-import',0)")) { WP_CLI::error('Another import is running'); }
try {
    // Verify every current replacement before removing a single previous file.
    foreach ($manifest['attachments'] as $row) {
        $file = get_attached_file($row['id']);
        if (!is_file($file) || hash_file('sha256', $file) !== $row['sha256']) { throw new RuntimeException('Replacement changed'); }
    }
    $archived_count = 0;
    foreach ($deletable as $row) {
        $old = $base . '/' . $row['file']; $backup = $root . '/retired-files/' . $row['file'];
        if (!wp_mkdir_p(dirname($backup))) { throw new RuntimeException('Cannot create backup directory'); }
        if (is_file($backup) && hash_file('sha256', $backup) !== $row['sha256']) { throw new RuntimeException('Backup collision'); }
        if (!is_file($backup) && !copy($old, $backup)) { throw new RuntimeException('Cannot archive previous file'); }
        if (hash_file('sha256', $backup) !== $row['sha256']) { throw new RuntimeException('Archived hash mismatch'); }
        if (++$archived_count % 2000 === 0) { WP_CLI::line('Archived ' . $archived_count . '/' . count($deletable)); }
    }
    $deleted = 0;
    foreach ($deletable as $row) {
        $old = $base . '/' . $row['file'];
        if (hash_file('sha256', $old) !== $row['sha256'] || !unlink($old)) { throw new RuntimeException('Delete failed: ' . $row['file']); }
        ++$deleted;
        if ($deleted % 2000 === 0) { WP_CLI::line('Deleted ' . $deleted . '/' . count($deletable)); }
    }
    $report = ['deleted'=>$deleted, 'protected'=>count($protected), 'bytes'=>$plan['bytes'], 'errors'=>[]];
    foreach ($deletable as $row) { if (file_exists($base . '/' . $row['file'])) { $report['errors'][] = $row['file']; } }
    file_put_contents($root . '/cleanup.json', wp_json_encode($report, JSON_PRETTY_PRINT));
    WP_CLI::line(wp_json_encode($report));
} finally { $wpdb->get_var("SELECT RELEASE_LOCK('katukina-workbook-import')"); }
