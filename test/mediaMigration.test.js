import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createBackupWriter, migrateDocument, restoreFromBackup } from '../server/services/mediaMigration.js';

const photo = (seed) => `data:image/jpeg;base64,${seed.repeat(1200)}`;
const video = (seed) => `data:video/mp4;base64,${seed.repeat(1500)}`;
const urlFor = (dataUrl) => `https://res.cloudinary.com/demo/image/upload/${dataUrl.length}-${dataUrl.charCodeAt(30)}.jpg`;

/** A tiny stand-in for a MongoDB collection that supports the updates the migration uses. */
const fakeCollection = (rows) => ({
  rows,
  async updateOne(filter, update) {
    const row = rows.find((candidate) => candidate._id === filter._id);
    const [field] = Object.keys(filter).filter((key) => key !== '_id');
    const read = (target, dotted) => dotted.split('.').reduce((value, key) => value?.[key], target);
    if (!row || read(row, field) !== filter[field]) return { matchedCount: 0 };
    const [setField, setValue] = Object.entries(update.$set)[0];
    const keys = setField.split('.');
    const last = keys.pop();
    keys.reduce((value, key) => value[key], row)[last] = setValue;
    return { matchedCount: 1 };
  },
});

const okUploader = (failOn) => ({
  async upload(dataUrl) {
    if (failOn && dataUrl === failOn) throw new Error('upload rejected');
    return { url: urlFor(dataUrl), publicId: 'p', kind: dataUrl.startsWith('data:video') ? 'video' : 'image' };
  },
});

describe('migrateDocument', () => {
  it('moves every photo and video in a row and records an undo entry for each', async () => {
    const row = { _id: 'a1', title: 'Phone', images: [photo('A'), 'https://example.com/x.jpg', photo('B')], video_url: video('C') };
    const original = structuredClone(row);
    const collection = fakeCollection([row]);
    const backups = [];

    const result = await migrateDocument({ doc: structuredClone(row), table: 'products', collection, uploader: okUploader(), writeBackup: async (e) => backups.push(e) });

    assert.equal(result.migrated.length, 3);
    assert.equal(result.failed.length + result.changedMeanwhile.length, 0);
    assert.equal(row.images[0], urlFor(original.images[0]));
    assert.equal(row.images[1], 'https://example.com/x.jpg');
    assert.equal(row.video_url, urlFor(original.video_url));
    assert.deepEqual(backups.map((entry) => entry.field).sort(), ['images.0', 'images.2', 'video_url']);
    assert.equal(backups.find((entry) => entry.field === 'images.0').dataUrl, original.images[0]);
  });

  it('leaves a field alone when its upload fails and still moves the others', async () => {
    const row = { _id: 'a2', images: [photo('A'), photo('B')] };
    const collection = fakeCollection([row]);
    const backups = [];

    const result = await migrateDocument({ doc: structuredClone(row), table: 'products', collection, uploader: okUploader(row.images[0]), writeBackup: async (e) => backups.push(e) });

    assert.equal(result.failed.length, 1);
    assert.equal(result.migrated.length, 1);
    assert.equal(row.images[0].startsWith('data:image'), true, 'the failed photo stays as it was');
    assert.equal(row.images[1].startsWith('https://'), true);
    assert.equal(backups.length, 1, 'no undo entry for a file that was never changed');
  });

  it('does not overwrite a field that was edited while the migration ran', async () => {
    const stale = { _id: 'a3', images: [photo('A')] };
    const live = { _id: 'a3', images: ['https://example.com/new-edit.jpg'] };
    const collection = fakeCollection([live]);

    const result = await migrateDocument({ doc: stale, table: 'products', collection, uploader: okUploader(), writeBackup: async () => {} });

    assert.equal(result.migrated.length, 0);
    assert.equal(result.changedMeanwhile.length, 1);
    assert.equal(live.images[0], 'https://example.com/new-edit.jpg');
  });

  it('handles nested fields such as device_photos.front', async () => {
    const row = { _id: 'a4', device_photos: { front: photo('F'), back: '' } };
    const collection = fakeCollection([row]);

    await migrateDocument({ doc: structuredClone(row), table: 'sell_requests', collection, uploader: okUploader(), writeBackup: async () => {} });

    assert.equal(row.device_photos.front.startsWith('https://'), true);
    assert.equal(row.device_photos.back, '');
  });

  it('does nothing for a row without inline files', async () => {
    const row = { _id: 'a5', images: ['https://example.com/x.jpg'] };
    const result = await migrateDocument({ doc: row, table: 'products', collection: fakeCollection([row]), uploader: okUploader(), writeBackup: async () => {} });

    assert.deepEqual(result, { migrated: [], failed: [], changedMeanwhile: [] });
  });
});

describe('undo file', () => {
  let dir;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'media-undo-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes one line per entry and restores the original base64', async () => {
    const original = { _id: 'b1', images: [photo('A'), photo('B')] };
    const row = structuredClone(original);
    const collections = { products: fakeCollection([row]) };
    const file = path.join(dir, 'undo.ndjson');

    await migrateDocument({ doc: structuredClone(row), table: 'products', collection: collections.products, uploader: okUploader(), writeBackup: createBackupWriter(file) });
    assert.equal(row.images.every((value) => value.startsWith('https://')), true);
    assert.equal((await readFile(file, 'utf8')).trim().split('\n').length, 2);

    const outcome = await restoreFromBackup({ file, getCollection: (table) => collections[table] });

    assert.deepEqual(outcome, { restored: 2, skipped: 0 });
    assert.deepEqual(row, original);
  });

  it('skips fields that were changed again after the migration', async () => {
    const original = { _id: 'b2', images: [photo('A')] };
    const row = structuredClone(original);
    const collections = { products: fakeCollection([row]) };
    const file = path.join(dir, 'undo.ndjson');

    await migrateDocument({ doc: structuredClone(row), table: 'products', collection: collections.products, uploader: okUploader(), writeBackup: createBackupWriter(file) });
    row.images[0] = 'https://example.com/replaced-later.jpg';

    const outcome = await restoreFromBackup({ file, getCollection: (table) => collections[table] });

    assert.deepEqual(outcome, { restored: 0, skipped: 1 });
    assert.equal(row.images[0], 'https://example.com/replaced-later.jpg');
  });

  it('skips entries for a collection it does not know', async () => {
    const file = path.join(dir, 'undo.ndjson');
    await writeFile(file, `${JSON.stringify({ table: 'gone', id: 'x', field: 'images.0', url: 'u', dataUrl: 'd' })}\n\n`);

    assert.deepEqual(await restoreFromBackup({ file, getCollection: () => undefined }), { restored: 0, skipped: 1 });
  });
});
