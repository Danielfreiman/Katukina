/** Keep the private catalogue cache aligned with the verified WebP update. */
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';

const imports = resolve('wordpress/tools/.imports');
const source = resolve(imports, 'photos-webp-2026-11-06');
const batch = resolve(imports, 'catalog-webp-transfer-2026-11-06');
const catalog = resolve(imports, 'sacred-incense-uk');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const report = json(resolve(batch, 'verification.json'));
const manifest = json(resolve(batch, 'manifest.json'));
if (report.errors.length || !report.non_image_data_unchanged || report.checked !== manifest.attachments.length) {
  throw Error('Verify the WordPress photo update first.');
}
const photos = json(resolve(source, 'photos.json'));
const byStem = new Map(photos.photos.map(row => [row.name.replace(/\.[^.]+$/, ''), row]));
const mediaPath = resolve(catalog, 'media.json');
const media = json(mediaPath);
const backup = resolve(batch, 'original-cache');
const safeImage = (directory, name) => {
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(name)) throw Error('Invalid photo filename');
  const path = resolve(directory, name);
  if (!path.startsWith(resolve(directory) + sep)) throw Error('Invalid image path');
  return path;
};
const replacements = new Map();
for (const [name, old] of Object.entries(media.files)) {
  const photo = byStem.get(name.replace(/\.[^.]+$/, ''));
  if (!photo || photo.file !== `images/${photo.name}` || digest(safeImage(resolve(source, 'images'), photo.name)) !== photo.sha256) {
    throw Error(`Unverified replacement: ${name}`);
  }
  const current = safeImage(resolve(catalog, 'images'), name);
  if (!existsSync(current) || digest(current) !== old.sha256) throw Error(`Cache changed: ${name}`);
  replacements.set(name, photo);
}
const remap = names => names.map(name => {
  const photo = replacements.get(name);
  if (!photo) throw Error(`Unmapped catalogue reference: ${name}`);
  return photo.name;
});
for (const item of [...Object.values(media.items), ...Object.values(media.unmatched)]) {
  item.image_files = remap(item.image_files || []);
  for (const [sku, names] of Object.entries(item.forms || {})) item.forms[sku] = remap(names);
}
mkdirSync(backup, { recursive: true });
if (!existsSync(resolve(backup, 'media-before.json'))) copyFileSync(mediaPath, resolve(backup, 'media-before.json'));
const files = {};
for (const [name, photo] of replacements) {
  const old = safeImage(resolve(catalog, 'images'), name);
  const saved = safeImage(backup, name);
  if (!existsSync(saved)) copyFileSync(old, saved);
  if (digest(saved) !== media.files[name].sha256) throw Error(`Backup mismatch: ${name}`);
  const target = safeImage(resolve(catalog, 'images'), photo.name);
  if (old !== target) copyFileSync(safeImage(resolve(source, 'images'), photo.name), target);
  if (digest(target) !== photo.sha256) throw Error(`Replacement mismatch: ${name}`);
  files[photo.name] = { ...media.files[name], sha256: photo.sha256, photo_update_batch: photos.batch };
}
media.files = files;
writeFileSync(mediaPath + '.tmp', JSON.stringify(media, null, 2));
renameSync(mediaPath + '.tmp', mediaPath);
const originalMedia = json(resolve(backup, 'media-before.json'));
for (const [name, old] of Object.entries(originalMedia.files)) {
  const photo = byStem.get(name.replace(/\.[^.]+$/, ''));
  const path = safeImage(resolve(catalog, 'images'), name);
  if (name !== photo.name && existsSync(path)) {
    if (digest(path) !== old.sha256 || digest(safeImage(backup, name)) !== old.sha256) throw Error(`Retirement mismatch: ${name}`);
    unlinkSync(path);
  }
}
console.log(JSON.stringify({ cached_webp_photos: replacements.size, old_cache_archived: backup }));
