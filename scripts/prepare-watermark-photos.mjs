import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const archive=process.argv[2]||'C:/Users/danie/Downloads/Editadas com marca dagua.rar';
const root=path.resolve('wordpress/tools/.imports/catalog-webp-watermark-2026-11-09');
const extracted=path.join(root,'extracted');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const names=execFileSync('tar',['-tf',archive],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split(/\r?\n/);
const details=execFileSync('tar',['-tvf',archive],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split(/\r?\n/);
if(details.some(line=>!['-','d'].includes(line[0])))throw new Error('Only regular files and directories are accepted');
for(const name of names) {
 const target=path.resolve(extracted,name);
 if(!target.startsWith(extracted+path.sep)||name.includes('\\')||name.includes(':')||name.split('/').includes('..'))throw new Error('Unsafe archive path');
}
fs.mkdirSync(extracted,{recursive:true});
execFileSync('tar',['-xf',archive,'-C',extracted],{stdio:'inherit'});
const rows=[];
for(const entry of fs.readdirSync(extracted,{recursive:true,withFileTypes:true})) {
 if(entry.isSymbolicLink())throw new Error('Unexpected extracted link');
 if(!entry.isFile()||!/\.webp$/i.test(entry.name))continue;
 const file=path.join(entry.parentPath,entry.name);
 const name=path.relative(extracted,file).replaceAll('\\','/');
 rows.push({name:entry.name,source:name.split('/').slice(1).join('/'),file:path.relative(root,file).replaceAll('\\','/'),sha256:digest(fs.readFileSync(file))});
}
const groups=new Map();for(const row of rows){const list=groups.get(row.name)||[];list.push(row);groups.set(row.name,list);}
const photos=[],conflicts=[];
const catalog=JSON.parse(fs.readFileSync('wordpress/tools/.imports/sacred-incense-uk/media.json','utf8'));
const slug=value=>value.toLowerCase().replaceAll('&','and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const [name,group] of groups){let candidates=group;
 const gallery=candidates.filter(row=>row.source.split('/').length===3);
 if(gallery.length)candidates=gallery;
 if(new Set(candidates.map(row=>row.sha256)).size>1){
  const specific=candidates.filter(row=>!['Exclusive Sale','Expected Stock'].includes(row.source.split('/')[0]));
  if(specific.length)candidates=specific;
  if(/^172[02](?:-|\.)/.test(name))candidates=candidates.filter(row=>row.source.startsWith('Aromatherapy Pendants/'));
  if(/^1995(?:-|\.)/.test(name))candidates=candidates.filter(row=>row.source.startsWith('Aromatics/Palo Santo beads/'));
  const key=String(Number(name.match(/^\d+/)?.[0]));
  const origin=catalog.items[key]?.source_url?.split('/')[4];
  const primary=candidates.filter(row=>slug(row.source.split('/')[0])===origin);
  if(primary.length)candidates=primary;
 }
 if(new Set(candidates.map(row=>row.sha256)).size!==1){conflicts.push({name,sources:candidates});continue;}
 photos.push(candidates[0]);
}
fs.writeFileSync(path.join(root,'source.json'),JSON.stringify({archive_sha256:digest(fs.readFileSync(archive)),photos,conflicts},null,2));
console.log(JSON.stringify({entries:names.length,images:rows.length,unique:groups.size,selected:photos.length,conflicts:conflicts.length,examples:photos.slice(0,3)}));
if(conflicts.length)process.exitCode=1;
