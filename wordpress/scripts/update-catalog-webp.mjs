import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { runWp, discoverRuntime, wordpressRoot } from './local-runtime.mjs';
const mode = process.argv[2] || 'inventory';
const batch = process.argv[3] || 'catalog-webp-2026-11-06';
if (!['inventory', 'apply', 'verify', 'rollback', 'lint'].includes(mode) || !/^catalog-webp-[a-z0-9-]+$/.test(batch)) throw new Error('Invalid mode or batch.');
const runtime = discoverRuntime();
if (mode === 'apply') {
  const backup = JSON.parse(readFileSync(resolve(wordpressRoot, 'tools/.imports', batch, 'backup.json'), 'utf8'));
  const bytes = readFileSync(backup.file);
  if (!backup.isolated_restore || bytes.length !== backup.bytes || createHash('sha256').update(bytes).digest('hex') !== backup.sha256) throw new Error('SQL backup is missing, changed, or not restore-verified.');
}
console.log(runWp(runtime, mode === 'lint'
  ? ['eval', "passthru('php -l /var/www/html/wp-content/katukina-tools/update-catalog-webp.php', $code); if ($code) { exit($code); }"]
  : ['eval-file', '/var/www/html/wp-content/katukina-tools/update-catalog-webp.php', mode, batch],
  { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'inherit', 'pipe'] }));
