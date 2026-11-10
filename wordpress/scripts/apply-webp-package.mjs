// Apply the supplied WebP package while retaining newer photos absent from it.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {discoverRuntime,runWp,wordpressRoot} from './local-runtime.mjs';
import {buildPhotoUpdatePlan} from './photo-update-plan.mjs';
const mode=process.argv[2] || 'inspect';
if(!['inspect','apply'].includes(mode)) throw new Error('Use inspect or apply');
const folder=path.join(wordpressRoot,'backups/katukina-atualizacao-fotos-webp-2026-11-06');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const integrity=read(path.join(folder,'integridade.json'));
for(const [name,hash] of Object.entries(integrity.files)) {
 const file=path.resolve(folder,name);
 if(!file.startsWith(folder+path.sep)||digest(fs.readFileSync(file))!==hash) throw new Error('Package integrity: '+name);
}
const sourceBytes=fs.readFileSync(path.join(folder,'photos.json'));
const source=JSON.parse(sourceBytes);
if(source.batch!=='catalog-webp-transfer-2026-11-06') throw new Error('Unexpected batch');
const batch=path.join(wordpressRoot,'tools/.imports',source.batch);
const runtime=discoverRuntime();
const php='/var/www/html/wp-content/katukina-tools/.imports/'+source.batch+'/update-media.php';
const run=action=>runWp(runtime,['eval-file',php,action,source.batch],{stdio:['ignore','inherit','pipe']});
const manifestPath=path.join(batch,'manifest.json');
if(fs.existsSync(path.join(batch,'before.json'))) {
 if(read(manifestPath).package_sha256!==digest(sourceBytes)) throw new Error('Different active package');
 if(mode==='inspect'){run('verify');process.exit(0);}
} else {
 run('inventory');
 const inventory=read(path.join(batch,'wordpress-inventory.json'));
 const stem=value=>path.posix.basename(decodeURIComponent(String(value||'').split(/[?#]/)[0]).replaceAll('\\','/')).replace(/\.[^.]+$/,'');
 const names=new Set(source.photos.map(photo=>stem(photo.name)));
 const hashes=new Set(source.photos.flatMap(photo=>[photo.sha256,...(photo.legacy_sha256||[])]));
 const unmatched=inventory.attachments.filter(row=>![row.edited_name,row.source_url,row.sample_url,row.file].some(value=>names.has(stem(value)))&&!hashes.has(row.sha256));
 const preserved=new Set(unmatched.map(row=>row.id));
 const references=inventory.references.map(row=>({...row,cover:preserved.has(row.cover)?0:row.cover,gallery:row.gallery.filter(id=>!preserved.has(id))}));
 // The original planner still rejects ambiguous hashes and missing mapped files.
 const plan=buildPhotoUpdatePlan({...inventory,references},source.photos);
 const used=new Set(inventory.references.flatMap(row=>[row.cover,...row.gallery]));
 const report={...plan.summary,preserved_referenced:unmatched.filter(row=>used.has(row.id)).map(row=>({id:row.id,name:row.edited_name||row.file}))};
 fs.writeFileSync(path.join(batch,'preflight-preserved.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({...plan.summary,preserved_referenced:report.preserved_referenced.length}));
 if(mode==='inspect')process.exit(0);
 fs.mkdirSync(path.join(batch,'images'),{recursive:true});
 for(const row of plan.attachments) {
  if(!/^images\/[a-zA-Z0-9_-]+\.webp$/.test(row.file)||integrity.files[row.file]!==row.sha256)throw new Error('Invalid source');
  fs.copyFileSync(path.join(folder,row.file),path.join(batch,row.file));
 }
 fs.writeFileSync(manifestPath,JSON.stringify({package_sha256:digest(sourceBytes),attachments:plan.attachments},null,2));
 const backup=JSON.parse(execFileSync(process.execPath,[path.join(wordpressRoot,'scripts/backup-local.mjs'),'--verify-restore'],{encoding:'utf8',maxBuffer:64*1024*1024}));
 fs.writeFileSync(path.join(batch,'backup.json'),JSON.stringify(backup,null,2));
}
const backup=read(path.join(batch,'backup.json'));
const bytes=fs.readFileSync(backup.file);
if(!backup.isolated_restore||bytes.length!==backup.bytes||digest(bytes)!==backup.sha256)throw new Error('Invalid verified backup');
run('apply');
