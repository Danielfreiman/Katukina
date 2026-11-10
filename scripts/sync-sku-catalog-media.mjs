// Preserve the approved November photos in the private portable catalogue.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = path.resolve('wordpress/tools/.imports');
const batch = path.join(root, 'sku-images-2026-11-04');
const catalog = path.join(root, 'sacred-incense-uk');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = read(path.join(batch, 'manifest.json'));
const verified = read(path.join(batch, 'verification.json'));
if (verified.errors.length || !verified.non_image_data_unchanged || verified.images_checked !== manifest.files.length) throw new Error('A successful image application report is required.');
const mediaPath = path.join(catalog, 'media.json');
const media = read(mediaPath);
const mediaItem = key => media.items[manifest.items[key]?.key.replace(/^sacred-incense-uk:item:/, '')];
// Validate every input before modifying the cache.
for (const row of manifest.files) {
  const source = path.resolve(batch, row.file);
  if (!source.startsWith(batch + path.sep) || !/^\d+(?:-\d+_\d+)?\.jpg$/i.test(row.name) || hash(source) !== row.sha256 || !mediaItem(row.item)) throw new Error(`Invalid image mapping: ${row.name}`);
}
const backup = path.join(batch, 'original-cache');
fs.mkdirSync(backup, { recursive: true });
if (!fs.existsSync(path.join(batch, 'media-before.json'))) fs.copyFileSync(mediaPath, path.join(batch, 'media-before.json'));
for (const row of manifest.files) {
  const destination = path.join(catalog, 'images', row.name);
  if (fs.existsSync(destination) && !fs.existsSync(path.join(backup, row.name))) fs.copyFileSync(destination, path.join(backup, row.name));
  fs.copyFileSync(path.join(batch, row.file), destination);
  media.files[row.name] = { ...media.files[row.name], source_url: media.files[row.name]?.source_url || '', sha256: row.sha256, edited_source: 'drive-download-20261104T160519Z-1-001.zip', edited_archive_sha256: manifest.source_sha256 };
}
for (const key of Object.keys(manifest.items)) {
  const rows = manifest.files.filter(row => row.item === key);
  const item = mediaItem(key);
  const cover = rows.find(row => !row.sku);
  item.image_files = [...new Set([...(cover ? [cover.name] : []), ...item.image_files, ...rows.map(row => row.name)])];
  for (const sku of new Set(rows.map(row => row.sku).filter(Boolean))) {
    const replacements = rows.filter(row => row.sku === sku).map(row => row.name).sort();
    const previous = item.forms?.[sku] || [];
    item.forms ||= {};
    item.forms[sku] = [...new Set([...replacements, ...previous.filter(name => name.startsWith(sku + '_'))])];
  }
  item.edited_archive_sha256 = manifest.source_sha256;
}
fs.writeFileSync(mediaPath, JSON.stringify(media, null, 2));
for (const row of manifest.files) if (hash(path.join(catalog, 'images', row.name)) !== row.sha256) throw new Error(`Cache mismatch: ${row.name}`);
console.log(JSON.stringify({ images: manifest.files.length, products: Object.keys(manifest.items).length, source_sha256: manifest.source_sha256, verified: true }));
