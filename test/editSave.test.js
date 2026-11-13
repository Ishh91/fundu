import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { pickSelectedFields } from '../server/services/dbService.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadObjectDiff() {
  const source = await readFile(path.join(ROOT, 'src', 'lib', 'objectDiff.ts'), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const inlineVideo = `data:video/mp4;base64,${'A'.repeat(3 * 1024 * 1024)}`;
const inlinePhoto = `data:image/webp;base64,${'B'.repeat(300 * 1024)}`;

const storedProduct = {
  id: 'p1',
  title: 'iPhone 13',
  brand: 'Apple',
  model: 'iPhone 13',
  price: 42000,
  stock: 2,
  offer_tag: null,
  images: [inlinePhoto, inlinePhoto],
  video_url: inlineVideo,
  available_storages: ['128 GB', '256 GB'],
};

describe('changedFields', () => {
  let changedFields;

  before(async () => {
    ({ changedFields } = await loadObjectDiff());
  });

  it('sends only the price when only the price was edited', () => {
    const form = { ...storedProduct, price: 39999 };

    const changes = changedFields(storedProduct, form);

    assert.deepEqual(changes, { price: 39999 });
  });

  it('keeps a multi-MB product edit down to a few bytes', () => {
    const form = { ...storedProduct, stock: 5 };

    const changes = changedFields(storedProduct, form);

    assert.ok(JSON.stringify(storedProduct).length > 3 * 1024 * 1024, 'the stored product is several MB');
    assert.ok(JSON.stringify(changes).length < 100, 'the edit request is tiny');
  });

  it('includes photos only when the photo list changed', () => {
    const form = { ...storedProduct, images: [inlinePhoto] };

    const changes = changedFields(storedProduct, form);

    assert.deepEqual(Object.keys(changes), ['images']);
  });

  it('sends a cleared video as null so it is removed', () => {
    const form = { ...storedProduct, video_url: null };

    assert.deepEqual(changedFields(storedProduct, form), { video_url: null });
  });

  it('treats missing, undefined and null as the same empty value', () => {
    const form = { ...storedProduct, offer_tag: undefined, description: null };

    assert.deepEqual(changedFields(storedProduct, form), {});
  });

  it('returns nothing when the form was saved without edits', () => {
    assert.deepEqual(changedFields(storedProduct, { ...storedProduct }), {});
  });

  it('treats every field as changed when there is no original', () => {
    assert.deepEqual(changedFields(null, { title: 'New', price: 1 }), { title: 'New', price: 1 });
  });
});

describe('pickSelectedFields', () => {
  it('returns only the requested columns of an updated document', () => {
    const reply = pickSelectedFields(storedProduct, 'id');

    assert.deepEqual(reply, { id: 'p1' });
  });

  it('returns the full document for "*" or when nothing was selected', () => {
    assert.equal(pickSelectedFields(storedProduct, '*'), storedProduct);
    assert.equal(pickSelectedFields(storedProduct, undefined), storedProduct);
    assert.equal(pickSelectedFields(storedProduct, ''), storedProduct);
  });

  it('trims each document of a multi-row update', () => {
    const reply = pickSelectedFields([storedProduct, { ...storedProduct, id: 'p2' }], 'id, price');

    assert.deepEqual(reply, [{ id: 'p1', price: 42000 }, { id: 'p2', price: 42000 }]);
  });

  it('ignores unknown columns and non-string selections', () => {
    assert.deepEqual(pickSelectedFields(storedProduct, 'id,does_not_exist'), { id: 'p1' });
    assert.equal(pickSelectedFields(storedProduct, { $ne: null }), storedProduct);
    assert.equal(pickSelectedFields(null, 'id'), null);
  });
});
