import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/storeLocations.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { DEFAULT_STORES, addStore, normalizeStores, removeStore, validateStoreInput } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);

const input = { name: ' Kanpur Hub ', locality: 'Kanpur', address: ' 5 Mall Road ', timing: '10 AM – 8 PM', phone: '+91 90000 00000', type: 'Pickup' };

describe('addStore', () => {
  it('appends a trimmed store with the given id and leaves the old list alone', () => {
    const before = [...DEFAULT_STORES];
    const after = addStore(before, input, () => 'kanpur');
    assert.equal(after.length, before.length + 1);
    assert.deepEqual(after.at(-1), { ...input, name: 'Kanpur Hub', address: '5 Mall Road', id: 'kanpur' });
    assert.equal(before.length, DEFAULT_STORES.length);
  });

  it('ignores a store without a name', () => {
    assert.equal(addStore(DEFAULT_STORES, { ...input, name: '  ' }, () => 'x').length, DEFAULT_STORES.length);
  });
});

describe('removeStore', () => {
  it('drops only the store with that id', () => {
    const after = removeStore(DEFAULT_STORES, 'chowk');
    assert.equal(after.length, DEFAULT_STORES.length - 1);
    assert.ok(!after.some((s) => s.id === 'chowk'));
  });

  it('can empty the list', () => {
    assert.deepEqual(removeStore([DEFAULT_STORES[0]], DEFAULT_STORES[0].id), []);
  });
});

describe('normalizeStores', () => {
  it('drops junk, fills missing ids and keeps ids unique', () => {
    const out = normalizeStores([{ name: 'A' }, { name: 'B', id: 'dup' }, { name: 'C', id: 'dup' }, null, 'x', { name: '' }]);
    assert.deepEqual(out.map((s) => s.name), ['A', 'B', 'C']);
    assert.equal(new Set(out.map((s) => s.id)).size, 3);
  });

  it('returns an empty list for non-arrays', () => {
    assert.deepEqual(normalizeStores(undefined), []);
  });
});

describe('validateStoreInput', () => {
  it('needs a name and an address', () => {
    assert.match(validateStoreInput({ ...input, name: '' }), /name/i);
    assert.match(validateStoreInput({ ...input, address: ' ' }), /address/i);
    assert.equal(validateStoreInput(input), null);
  });
});
