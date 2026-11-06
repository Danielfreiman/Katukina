import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { wordpressRoot } from './local-runtime.mjs';

const batch = process.argv[2] || 'catalog-webp-2026-11-06';
if (!/^catalog-webp-[a-z0-9-]+$/.test(batch)) throw new Error('Invalid batch.');
const root = resolve(wordpressRoot, 'tools/.imports', batch);
const verification = JSON.parse(readFileSync(resolve(root, 'verification.json'), 'utf8'));
if (verification.errors.length || !verification.non_image_data_unchanged) throw new Error('WordPress verification must pass first.');
const base = 'http://localhost:3001';
const expected = new Map(verification.urls.map(row => [row.id, row]));
const errors = [];
let products = 0, references = 0, checked = 0;
for (let page = 1; ; page++) {
  const response = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Store API HTTP ${response.status}`);
  const rows = await response.json();
  products += rows.length;
  for (const product of rows) {
    if (!product.images.length) errors.push(`No images: product ${product.id}`);
    for (const image of product.images) {
      references++;
      if (expected.get(image.id)?.url !== image.src || !new URL(image.src).pathname.endsWith('.webp')) errors.push(`Store image mismatch: ${product.id}/${image.id}`);
    }
  }
  if (page >= Number(response.headers.get('x-wp-totalpages') || 1)) break;
}
let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < verification.urls.length) {
    const row = verification.urls[index++];
    const url = new URL(row.url);
    if (url.origin !== base || !url.pathname.startsWith('/wp-content/uploads/')) throw new Error('Refusing nonlocal image URL.');
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (response.status !== 200 || !response.headers.get('content-type')?.startsWith('image/webp')) throw new Error(`HTTP ${response.status} or wrong MIME`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw new Error('Image hash mismatch');
    } catch (error) { errors.push(`${row.id}: ${error.message}`); }
    checked++;
    if (checked % 250 === 0) console.log(`HTTP checked ${checked}/${verification.urls.length}`);
  }
}));
const report = { public_products: products, public_image_references: references, image_files_checked: checked, errors };
writeFileSync(resolve(root, 'http-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (errors.length) process.exitCode = 1;
