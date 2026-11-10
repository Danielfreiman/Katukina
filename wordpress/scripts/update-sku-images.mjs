import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { discoverRuntime, runWp, wordpressRoot } from './local-runtime.mjs';
const mode=process.argv[2]||'inspect';
if(!['export','inspect','apply','verify'].includes(mode)) throw new Error('Use export, inspect, apply or verify');
if(mode==='apply') execFileSync(process.execPath,[resolve(wordpressRoot,'scripts/backup-local.mjs')],{stdio:'inherit'});
runWp(discoverRuntime(),['eval-file',`/var/www/html/wp-content/katukina-tools/${mode==='export'?'export-catalog-image-map.php':'replace-edited-images.php'}`,...(mode==='export'?[]:[mode,'sku-images-2026-11-04'])],{stdio:['ignore','inherit','pipe']});
