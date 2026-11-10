import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {discoverRuntime,runWp,wordpressRoot} from './local-runtime.mjs';
import {buildPhotoUpdatePlan} from './photo-update-plan.mjs';
const mode=process.argv[2]||'inspect';
if(!['inspect','apply','verify'].includes(mode))throw new Error('Use inspect, apply or verify');
const name='catalog-webp-watermark-2026-11-09';
const batch=path.join(wordpressRoot,'tools/.imports',name);
const read=file=>JSON.parse(fs.readFileSync(path.join(batch,file),'utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=read('source.json');
if(source.conflicts.length)throw new Error('Unresolved source conflicts');
const runtime=discoverRuntime();
const run=action=>runWp(runtime,['eval-file','/var/www/html/wp-content/katukina-tools/update-watermark-media.php',action,name],{stdio:['ignore','inherit','pipe']});
if(mode==='verify'){run('verify');process.exit(0);}
if(fs.existsSync(path.join(batch,'before.json'))) {
 if(read('manifest.json').package_sha256!==source.archive_sha256)throw new Error('Source changed');
 if(mode==='inspect'){run('verify');process.exit(0);}
}else{
 run('inventory');
 const inventory=read('wordpress-inventory.json');
 const plan=buildPhotoUpdatePlan(inventory,source.photos);
 console.log(JSON.stringify(plan.summary));
 fs.writeFileSync(path.join(batch,'preflight.json'),JSON.stringify(plan.summary,null,2));
 if(mode==='inspect')process.exit(0);
 fs.writeFileSync(path.join(batch,'manifest.json'),JSON.stringify({package_sha256:source.archive_sha256,attachments:plan.attachments},null,2));
 const backup=JSON.parse(execFileSync(process.execPath,[path.join(wordpressRoot,'scripts/backup-local.mjs'),'--verify-restore'],{encoding:'utf8',maxBuffer:64*1024*1024}));
 fs.writeFileSync(path.join(batch,'backup.json'),JSON.stringify(backup,null,2));
}
const backup=read('backup.json'),bytes=fs.readFileSync(backup.file);
if(!backup.isolated_restore||bytes.length!==backup.bytes||digest(bytes)!==backup.sha256)throw new Error('Backup invalid');
run('apply');
