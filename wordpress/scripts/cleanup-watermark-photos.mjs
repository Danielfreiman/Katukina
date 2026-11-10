// Use native filesystem I/O for the reviewed upload plan on Docker/Windows.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {discoverRuntime,wordpressRoot} from './local-runtime.mjs';
const batch=path.join(wordpressRoot,'tools/.imports/catalog-webp-watermark-2026-11-09');
const read=name=>JSON.parse(fs.readFileSync(path.join(batch,name),'utf8'));
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const runtime=discoverRuntime();
const uploads=fs.realpathSync(path.join(path.dirname(runtime.composeFile),'wordpress-7/wp-content/uploads'));
const workspace=fs.realpathSync(path.resolve(wordpressRoot,'..'));
if(!uploads.startsWith(workspace+path.sep))throw new Error('Uploads outside this workspace');
const report=read('verification.json'),manifest=read('manifest.json'),plan=read('cleanup-plan.json');
if(report.errors.length||!report.non_image_data_unchanged||report.checked!==manifest.attachments.length)throw new Error('Successful verification required');
if(fs.existsSync(path.join(batch,'cleanup.json')))throw new Error('Cleanup already completed');
const resolveUpload=relative=>{
 if(!/^(?:\d{4}\/\d{2}\/)?[^/\\:]+\.(?:jpe?g|png|webp)$/i.test(relative)||relative.includes('..'))throw new Error('Invalid relative upload path');
 const file=path.resolve(uploads,relative);
 if(!file.startsWith(uploads+path.sep)||fs.lstatSync(file).isSymbolicLink()||!fs.realpathSync(file).startsWith(uploads+path.sep))throw new Error('Unsafe resolved upload');
 return file;
};
const current=new Set();
for(const row of report.urls){const url=new URL(row.url);const relative=decodeURIComponent(url.pathname.split('/wp-content/uploads/')[1]||'');const file=resolveUpload(relative);if(digest(file)!==row.sha256)throw new Error('Current replacement mismatch');current.add(relative);}
const archiveRoot=path.join(batch,'retired-files');
fs.mkdirSync(archiveRoot,{recursive:true});
const seen=new Set();let archived=0;
// Validate and archive everything before deleting anything.
for(const row of plan.files){
 if(current.has(row.file)||seen.has(row.file))throw new Error('Active or duplicate deletion target');
 seen.add(row.file);
 const file=resolveUpload(row.file),backup=path.resolve(archiveRoot,row.file);
 if(!backup.startsWith(archiveRoot+path.sep)||fs.statSync(file).size!==row.bytes||digest(file)!==row.sha256)throw new Error('Old file changed');
 fs.mkdirSync(path.dirname(backup),{recursive:true});
 if(!fs.existsSync(backup))fs.copyFileSync(file,backup,fs.constants.COPYFILE_EXCL);
 if(digest(backup)!==row.sha256)throw new Error('Backup hash mismatch');
 if(++archived%4000===0)console.log(`Archived ${archived}/${plan.files.length}`);
}
let deleted=0;
for(const row of plan.files){const file=resolveUpload(row.file);if(digest(file)!==row.sha256)throw new Error('File changed before deletion');fs.unlinkSync(file);if(++deleted%4000===0)console.log(`Deleted ${deleted}/${plan.files.length}`);}
const errors=plan.files.filter(row=>fs.existsSync(path.join(uploads,row.file))).map(row=>row.file);
const result={deleted,protected:plan.protected.length,bytes:plan.bytes,errors};
fs.writeFileSync(path.join(batch,'cleanup.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
if(errors.length)process.exitCode=1;
