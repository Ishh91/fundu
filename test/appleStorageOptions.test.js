import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: [new URL('../src/lib/deviceSpecs.ts', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')],
  bundle: true,
  format: 'esm',
  write: false,
  logLevel: 'error',
});
const { getRadarHardwareSpecs, isStorageAllowedForModel } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

const storagesOf = (model) => getRadarHardwareSpecs('Apple', model).storages;

describe('storage options the sell page offers for an iPhone', () => {
  it('offers 2 TB where Apple and Cashify sell it', () => {
    for (const model of ['iPhone 17 Pro Max', 'iPhone 18 Pro Max', 'iPhone 18 Pro']) {
      assert.ok(storagesOf(model).includes('2 TB'), `${model}: ${storagesOf(model).join(', ')}`);
    }
  });

  it('lists the sizes in order, 2 TB last', () => {
    assert.deepEqual(storagesOf('iPhone 17 Pro Max'), ['256 GB', '512 GB', '1 TB', '2 TB']);
  });

  it('does not offer 2 TB where it is not sold', () => {
    for (const model of ['iPhone 17 Pro', 'iPhone 16 Pro Max', 'iPhone 15 Pro Max', 'iPhone 14 Pro', 'iPhone 13', 'iPhone 17']) {
      assert.ok(!storagesOf(model).includes('2 TB'), `${model}: ${storagesOf(model).join(', ')}`);
    }
  });

  it('offers a variant button for 2 TB', () => {
    const labels = getRadarHardwareSpecs('Apple', 'iPhone 17 Pro Max').combinedVariants.map((v) => v.label);
    assert.ok(labels.includes('2 TB'), labels.join(', '));
  });

  it('keeps the sizes the other iPhones already had', () => {
    assert.deepEqual(storagesOf('iPhone 16 Pro Max'), ['128 GB', '256 GB', '512 GB', '1 TB']);
    assert.ok(storagesOf('iPhone 13').includes('128 GB'));
  });

  it('allows 2 TB only on those models', () => {
    assert.equal(isStorageAllowedForModel('Apple', 'iPhone 17 Pro Max', '2 TB'), true);
    assert.equal(isStorageAllowedForModel('Apple', 'iPhone 18 Pro', '2 TB'), true);
    assert.equal(isStorageAllowedForModel('Apple', 'iPhone 17 Pro', '2 TB'), false);
    assert.equal(isStorageAllowedForModel('Apple', 'iPhone 16 Pro Max', '2 TB'), false);
  });
});
