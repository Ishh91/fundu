import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { assertDatabaseReady } from '../server/services/dbService.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MB = 1024 * 1024;

/** Compiles the pure TypeScript upload rules so plain Node can import them. */
async function loadUploadLimits() {
  const source = await readFile(path.join(ROOT, 'src', 'lib', 'uploadLimits.ts'), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

/** A base64 data URL as produced by uploading a file of the given size. */
const inlineFile = (mimeType, fileBytes) => `data:${mimeType};base64,${'A'.repeat(Math.ceil((fileBytes * 4) / 3))}`;

describe('product save size check', () => {
  let limits;

  before(async () => {
    limits = await loadUploadLimits();
  });

  it('allows a normal product with image links and a YouTube video', () => {
    const payload = {
      title: 'iPhone 13',
      images: ['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg'],
      video_url: 'https://youtu.be/dQw4w9WgXcQ',
    };

    assert.equal(limits.describeOversizedSave(payload), null);
  });

  it('allows several compressed photos', () => {
    const payload = { title: 'iPhone 13', images: Array.from({ length: 8 }, () => inlineFile('image/webp', 0.3 * MB)) };

    assert.equal(limits.describeOversizedSave(payload), null);
  });

  it('blocks an uploaded video the server would reject and suggests a link', () => {
    const payload = { title: 'iPhone 13', images: [], video_url: inlineFile('video/mp4', 8 * MB) };

    const message = limits.describeOversizedSave(payload);

    assert.match(message, /too large to save/);
    assert.match(message, /uploaded video is 10\.7 MB/);
    assert.match(message, /YouTube link/);
  });

  it('blocks too many uncompressed photos and says to remove some', () => {
    const payload = { title: 'iPhone 13', images: [inlineFile('image/jpeg', 4 * MB), inlineFile('image/jpeg', 4 * MB)] };

    const message = limits.describeOversizedSave(payload);

    assert.match(message, /2 uploaded photos total 10\.7 MB/);
    assert.match(message, /Remove a few photos/);
  });

  it('keeps the client limit under the server limit of 10 MB', () => {
    assert.ok(limits.MAX_SAVE_PAYLOAD_BYTES < 10 * MB);
  });

  it('only accepts uploaded videos small enough to fit in one save', () => {
    const largestAllowedVideo = { video_url: inlineFile('video/mp4', limits.MAX_INLINE_VIDEO_FILE_BYTES) };

    assert.equal(limits.describeOversizedSave(largestAllowedVideo), null);
  });
});

describe('writes while the database is unavailable', () => {
  const statusOf = (action) => {
    try {
      action();
      return 'allowed';
    } catch (error) {
      return error.status;
    }
  };

  it('allows writes when connected', () => {
    assert.equal(statusOf(() => assertDatabaseReady(1)), 'allowed');
  });

  it('rejects writes with 503 instead of crashing when disconnected or still connecting', () => {
    for (const readyState of [0, 2, 3]) {
      assert.equal(statusOf(() => assertDatabaseReady(readyState)), 503, `readyState ${readyState}`);
    }
  });
});
