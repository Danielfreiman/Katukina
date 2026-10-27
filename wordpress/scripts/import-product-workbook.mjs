import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { discoverRuntime, runCompose, runWp, wordpressRoot } from './local-runtime.mjs';

const mode = process.argv[2] || 'inspect';
if (!['inspect', 'apply', 'media', 'verify', 'lint'].includes(mode)) throw new Error('Use inspect, apply, media, verify or lint.');
const runtime = discoverRuntime();
const target = resolve(wordpressRoot, 'tools/.imports/sacred-incense-uk');
mkdirSync(target, { recursive: true });
const manifest = resolve(wordpressRoot, '.runtime/catalog-import/manifest.json');
if (existsSync(manifest)) copyFileSync(manifest, resolve(target, 'manifest.json'));
if (mode === 'apply') {
  const source = JSON.parse(readFileSync(resolve(target, 'manifest.json'), 'utf8'));
  const receipt = resolve(target, `backup-${source.source.sha256}.json`);
  if (!existsSync(receipt)) {
    const report = execFileSync(process.execPath, [resolve(wordpressRoot, 'scripts/backup-local.mjs')], { encoding: 'utf8' });
    const backup = JSON.parse(report.trim());
    if (!existsSync(backup.file) || !backup.bytes) throw new Error('Pre-import backup could not be verified.');
    writeFileSync(receipt, JSON.stringify(backup, null, 2));
    console.log('Pre-import local SQL backup saved.');
  }
}
if (mode === 'lint') {
  console.log(runCompose(runtime, ['exec', '-T', 'cli', 'php', '-l', '/var/www/html/wp-content/katukina-tools/import-product-workbook.php']));
} else {
  runWp(runtime, ['eval-file', '/var/www/html/wp-content/katukina-tools/import-product-workbook.php', mode], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'inherit', 'pipe'] });
}
