import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { discoverRuntime, runWp, wordpressRoot } from './local-runtime.mjs';
const mode=process.argv[2] || 'inspect';
if (!['inspect','apply','verify'].includes(mode)) throw new Error('Use inspect, apply or verify.');
const root=resolve(wordpressRoot,'tools/.imports/sacred-incense-uk');
const bytes=readFileSync(resolve(root,'usd-prices.json'));
const source=JSON.parse(bytes);
if(source.missing.length || source.prices.length!==908) throw new Error('Resolve missing source prices first.');
const receipt=resolve(root,`usd-backup-${createHash('sha256').update(bytes).digest('hex')}.json`);
if(mode==='apply' && !existsSync(receipt)) {
  const backup=JSON.parse(execFileSync(process.execPath,[resolve(wordpressRoot,'scripts/backup-local.mjs')],{encoding:'utf8'}));
  if(!existsSync(backup.file) || !backup.bytes) throw new Error('Backup failed.');
  writeFileSync(receipt,JSON.stringify(backup,null,2));
  console.log('Pre-update SQL backup saved.');
}
runWp(discoverRuntime(),['eval-file','/var/www/html/wp-content/katukina-tools/update-usd-prices.php',mode],{stdio:['ignore','inherit','pipe']});
