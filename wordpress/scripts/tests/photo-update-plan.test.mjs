import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPhotoUpdatePlan } from '../photo-update-plan.mjs';

const photo = { name: '1234-5678_01.webp', file: 'images/1234-5678_01.webp', sha256: 'new', legacy_sha256: ['old'] };
const inventory = (rows, cover = rows[0].id) => ({ attachments: rows, references: [{type:'product',cover,gallery:[]}] });
test('uses receiver IDs and source filename even when IDs differ', () => {
  const result = buildPhotoUpdatePlan(inventory([{ id: 90001, source_url: 'https://katukina.com/assets/1234-5678_01.jpg', sha256:'old',mime:'image/jpeg' }]), [photo]);
  assert.equal(result.attachments[0].id, 90001);
  assert.equal(result.attachments[0].old_sha256, 'old');
  assert.equal(result.summary.to_update, 1);
});
test('rejects incomplete coverage without applying anything', () => {
  assert.throws(() => buildPhotoUpdatePlan(inventory([{id:3,file:'unknown.jpg',sha256:'unknown'}]), [photo]), /sem correspondencia/);
});
test('rejects ambiguous old content aliases', () => {
  assert.throws(() => buildPhotoUpdatePlan(inventory([{id:3,file:'unknown.jpg',sha256:'old'}]), [photo, {...photo,name:'other.webp',sha256:'different'}]), /hash antigo/);
});
test('recognizes already updated images without needing an installation', () => {
  const result = buildPhotoUpdatePlan(inventory([{id:3,file:'white-prefix.webp',sha256:'new',mime:'image/webp'}]), [photo]);
  assert.equal(result.summary.to_update, 0);
});
test('preserves unrelated library media while covering product references', () => {
  const result = buildPhotoUpdatePlan(inventory([{id:3,sha256:'old'}, {id:4,file:'logo.png',sha256:'logo'}]), [photo]);
  assert.equal(result.summary.other_media_preserved, 1);
});
