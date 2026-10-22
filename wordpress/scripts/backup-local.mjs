import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { discoverRuntime, runCompose, runWp, wordpressRoot } from './local-runtime.mjs';

const runtime = discoverRuntime();
const local = runWp(runtime, ['eval', 'echo wp_get_environment_type();']).trim();
if (local !== 'local') throw new Error('This script only backs up the local Katukina development instance.');
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const directory = resolve(wordpressRoot, 'backups'); mkdirSync(directory, { recursive: true });
const file = resolve(directory, `katukina-${stamp}.sql`);
const temporary = `/tmp/katukina-${stamp}-${randomBytes(6).toString('hex')}.sql`;

try {
  runWp(runtime, ['db', 'export', temporary]);
  runCompose(runtime, ['cp', `cli:${temporary}`, file]);
} finally {
  runCompose(runtime, ['exec', '-T', 'cli', 'rm', '-f', temporary]);
}
const bytes = readFileSync(file);
if (/^\s*(CREATE DATABASE|USE\s)/im.test(bytes.toString('utf8'))) throw new Error('Backup contains database switching commands; refusing isolated restore.');
const report = { file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), isolated_restore: false };
if (process.argv.includes('--verify-restore')) {
  const database = `katukina_restore_${randomBytes(6).toString('hex')}`;
  if (!/^katukina_restore_[a-f0-9]{12}$/.test(database)) throw new Error('Invalid verification database name.');
  let created = false;
  try {
    runCompose(runtime, ['exec', '-T', 'mysql', 'sh', '-c', `mariadb --user=root --password="$MYSQL_ROOT_PASSWORD" -e 'CREATE DATABASE ${database}'`]); created = true;
    runCompose(runtime, ['cp', file, `mysql:${temporary}`]);
    runCompose(runtime, ['exec', '-T', 'mysql', 'sh', '-c', `mariadb --user=root --password="$MYSQL_ROOT_PASSWORD" ${database} < ${temporary}`]);
    const counts = runCompose(runtime, ['exec', '-T', 'mysql', 'sh', '-c', `mariadb --user=root --password="$MYSQL_ROOT_PASSWORD" --batch --skip-column-names ${database} -e 'SELECT COUNT(*) FROM wp_kat_records; SELECT COUNT(*) FROM wp_posts; SELECT COUNT(*) FROM wp_kat_lots; SELECT COUNT(*) FROM wp_kat_movements;'`]).trim().split(/\s+/).map(Number);
    if (counts.length !== 4 || counts.some(n => !Number.isFinite(n))) throw new Error('Restore row counts unavailable.');
    report.isolated_restore = true; report.restored_counts = { records: counts[0], posts: counts[1], lots: counts[2], movements: counts[3] };
  } finally {
    try {
      if (created) runCompose(runtime, ['exec', '-T', 'mysql', 'sh', '-c', `mariadb --user=root --password="$MYSQL_ROOT_PASSWORD" -e 'DROP DATABASE ${database}'`]);
    } finally {
      runCompose(runtime, ['exec', '-T', 'mysql', 'rm', '-f', temporary]);
    }
  }
}
writeFileSync(file + '.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
