import { basename, extname } from 'node:path';

function stem(value) {
  if (!value) return '';
  const path = decodeURIComponent(String(value).split(/[?#]/)[0]).replaceAll('\\', '/');
  const name = basename(path);
  return name.slice(0, name.length - extname(name).length);
}

export function buildPhotoUpdatePlan(inventory, photos) {
  const names = new Map(), hashes = new Map();
  for (const photo of photos) {
    const key = stem(photo.name);
    if (names.has(key) && names.get(key).sha256 !== photo.sha256) throw new Error(`Nome ambiguo no pacote: ${photo.name}`);
    names.set(key, photo);
    for (const hash of [photo.sha256, ...(photo.legacy_sha256 || [])]) {
      const values = hashes.get(hash) || [];
      values.push(photo); hashes.set(hash, values);
    }
  }
  const rows = [], unresolved = [];
  for (const attachment of inventory.attachments) {
    let photo;
    for (const candidate of [attachment.edited_name, attachment.source_url, attachment.sample_url, attachment.file]) {
      photo = names.get(stem(candidate));
      if (photo) break;
    }
    if (!photo) {
      const candidates = hashes.get(attachment.sha256) || [];
      const contents = new Set(candidates.map(row => row.sha256));
      if (contents.size > 1) throw new Error(`Midia ${attachment.id}: hash antigo corresponde a fotos novas diferentes. Revisao necessaria.`);
      photo = candidates[0];
    }
    if (!photo) { unresolved.push(attachment.id); continue; }
    if (!attachment.sha256) throw new Error(`Arquivo atual ausente na midia ${attachment.id}.`);
    rows.push({ id: attachment.id, name: photo.name, file: photo.file, sha256: photo.sha256, old_sha256: attachment.sha256 });
  }
  const referenced = new Set(inventory.references.flatMap(row => [row.cover, ...row.gallery]).filter(Boolean));
  const mapped = new Set(rows.map(row => row.id));
  const missing = [...referenced].filter(id => !mapped.has(id));
  if (missing.length) throw new Error(`Fotos de produtos sem correspondencia: IDs locais ${missing.join(', ')}. Nenhuma troca foi aplicada.`);
  if (!referenced.size || !rows.length) throw new Error('Nenhuma foto de catalogo identificada nesta instalacao.');
  const byId = new Map(inventory.attachments.map(row => [row.id, row]));
  const current = rows.filter(row => byId.get(row.id).sha256 === row.sha256 && byId.get(row.id).mime === 'image/webp').length;
  return { attachments: rows, summary: { mapped: rows.length, referenced: referenced.size, already_current: current,
    to_update: rows.length - current, other_media_preserved: unresolved.length,
    products: inventory.references.filter(row => row.type === 'product').length,
    variations: inventory.references.filter(row => row.type === 'product_variation').length } };
}
