import {readFileSync,writeFileSync} from 'node:fs';
const root='wordpress/tools/.imports/sku-images-2026-11-04';
const read=name=>JSON.parse(readFileSync(`${root}/${name}`,'utf8').replace(/^\uFEFF/,''));
const inventory=read('inventory.json'), catalog=read('catalog.json');
const items={}, files=[], skipped=[], groups=new Map();
for(const row of inventory.files){const list=groups.get(row.name)||[];list.push(row);groups.set(row.name,list);}
for(const [name,rows] of groups){
 const match=/^(\d+)(?:-(\d+)_(\d+))?\.jpg$/.exec(name);
 let reason;
 const parents=match?catalog.filter(p=>p.post_type==='product'&&p.sku===match[1]):[];
 const sku=match?.[2]?`${match[1]}-${match[2]}`:null;
 const variants=sku?catalog.filter(p=>p.sku===sku&&p.post_type==='product_variation'&&p.post_parent===parents[0]?.ID):[];
 if(!match)reason='filename_without_sku';
 else if(new Set(rows.map(r=>r.sha256)).size!==1){
  // User approved specific categories over sale/expected-stock folders on 2026-11-04.
  let candidates=rows.filter(r=>!['Exclusive Sale','Expected Stock'].includes(r.source.split('/')[0]));
  if(['1720','1722'].includes(match[1])) candidates=candidates.filter(r=>r.source.startsWith('Aromatherapy Pendants/'));
  // Explicit follow-up selection by the user for Palo Santo beads.
  if(match[1]==='1995') candidates=candidates.filter(r=>r.source.startsWith('Aromatics/Palo Santo beads/'));
  if(candidates.length===1) rows.splice(0,rows.length,candidates[0]);
  else reason='conflicting_images_for_same_filename';
 }
 if(!reason&&(parents.length!==1||!parents[0].workbook_key))reason='parent_not_found_or_ambiguous';
 if(!reason&&sku&&variants.length!==1)reason='variation_not_found_or_ambiguous';
 if(reason){skipped.push({name,reason,sources:rows.map(r=>r.source)});continue;}
 items[match[1]]={key:parents[0].workbook_key};
 files.push({...rows[0],item:match[1],sku});
}
files.sort((a,b)=>a.name.localeCompare(b.name));
const suffix=process.argv.includes('--preview')?'-next':'';
writeFileSync(`${root}/manifest${suffix}.json`,JSON.stringify({source_sha256:inventory.source_sha256,items,files},null,2));
writeFileSync(`${root}/skipped${suffix}.json`,JSON.stringify(skipped,null,2));
console.log(JSON.stringify({archive_images:inventory.files.length,unique_filenames:groups.size,matched_images:files.length,products:Object.keys(items).length,variations:new Set(files.map(r=>r.sku).filter(Boolean)).size,skipped:skipped.length,reasons:skipped.reduce((a,r)=>(a[r.reason]=(a[r.reason]||0)+1,a),{})},null,2));
