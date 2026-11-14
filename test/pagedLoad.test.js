import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadModule() {
  const source = await readFile(path.join(ROOT, 'src', 'lib', 'pagedLoad.ts'), 'utf8');
  const { code } = await transform(source, { loader: 'ts', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const rowsOf = (from, count) => Array.from({ length: count }, (_, i) => ({ id: `r${from + i}` }));

/** A fake table of `total` rows served in pages, recording each request. */
const createTable = (total) => {
  const requests = [];
  const fetchPage = async (offset, limit) => {
    requests.push({ offset, limit });
    return rowsOf(offset, Math.max(0, Math.min(limit, total - offset)));
  };
  return { requests, fetchPage };
};

describe('loadRemainingPages', () => {
  let loadRemainingPages;

  before(async () => {
    ({ loadRemainingPages } = await loadModule());
  });

  it('loads every row after the first page, page by page', async () => {
    const table = createTable(150);
    const received = [];

    const loaded = await loadRemainingPages(table.fetchPage, {
      pageSize: 60,
      startOffset: 60,
      maxRows: 5000,
      onPage: (rows) => received.push(...rows),
    });

    assert.equal(loaded, 90);
    assert.equal(received[0].id, 'r60');
    assert.equal(received.at(-1).id, 'r149');
    assert.deepEqual(table.requests, [{ offset: 60, limit: 60 }, { offset: 120, limit: 60 }]);
  });

  it('asks once more when the last page was exactly full, then stops', async () => {
    const table = createTable(120);

    const loaded = await loadRemainingPages(table.fetchPage, { pageSize: 60, startOffset: 60, maxRows: 5000, onPage: () => {} });

    assert.equal(loaded, 60);
    assert.equal(table.requests.length, 2);
  });

  it('stops at the safety cap', async () => {
    const table = createTable(100000);

    const loaded = await loadRemainingPages(table.fetchPage, { pageSize: 60, startOffset: 60, maxRows: 180, onPage: () => {} });

    assert.equal(loaded, 120);
  });

  it('stops quietly when a page fails to load', async () => {
    const loaded = await loadRemainingPages(async () => null, { pageSize: 60, startOffset: 60, maxRows: 5000, onPage: () => {} });

    assert.equal(loaded, 0);
  });

  it('drops a page that arrives after a newer reload cancelled it', async () => {
    const table = createTable(300);
    let cancelled = false;
    const received = [];

    await loadRemainingPages(table.fetchPage, {
      pageSize: 60,
      startOffset: 60,
      maxRows: 5000,
      onPage: (rows) => {
        received.push(...rows);
        cancelled = true;
      },
      isCancelled: () => cancelled,
    });

    assert.equal(received.length, 60);
  });
});

describe('list merging', () => {
  let appendUniqueById;
  let mergeLatestById;

  before(async () => {
    ({ appendUniqueById, mergeLatestById } = await loadModule());
  });

  it('appends only rows that are not already in the list', () => {
    const merged = appendUniqueById(rowsOf(0, 3), [{ id: 'r2' }, { id: 'r3' }, { id: 'r3' }]);

    assert.deepEqual(merged.map((row) => row.id), ['r0', 'r1', 'r2', 'r3']);
  });

  it('keeps older rows when only the newest few are refreshed', () => {
    const existing = rowsOf(0, 100);
    const latest = [{ id: 'new' }, { id: 'r0', status: 'completed' }];

    const merged = mergeLatestById(existing, latest);

    assert.equal(merged.length, 101);
    assert.equal(merged[0].id, 'new');
    assert.equal(merged[1].status, 'completed');
    assert.equal(merged.at(-1).id, 'r99');
  });
});
