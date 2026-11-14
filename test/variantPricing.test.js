import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gradeKey, storageGb, storageMultiplier, isPlausibleStorage, variantPrice } from '../shared/variantPricing.js';

describe('gradeKey', () => {
  it('maps condition text to a grade', () => {
    assert.equal(gradeKey('Fair'), 'fair');
    assert.equal(gradeKey('Good'), 'good');
    assert.equal(gradeKey('Superb'), 'superb');
    assert.equal(gradeKey('Excellent'), 'superb');
    assert.equal(gradeKey('Grade A (Excellent)'), 'superb');
    assert.equal(gradeKey(undefined), 'superb');
  });
});

describe('storageGb', () => {
  it('reads GB and TB', () => {
    assert.equal(storageGb('256 GB'), 256);
    assert.equal(storageGb('512gb'), 512);
    assert.equal(storageGb('1 TB'), 1024);
    assert.equal(storageGb('none'), 0);
  });
});

describe('storageMultiplier', () => {
  it('is 1 for the same size and grows or shrinks by doubling steps', () => {
    assert.equal(storageMultiplier('128 GB', '128 GB'), 1);
    assert.equal(storageMultiplier('256 GB', '128 GB'), 1.15);
    assert.equal(storageMultiplier('512 GB', '128 GB'), 1.3);
    assert.equal(storageMultiplier('64 GB', '128 GB'), 0.88);
  });
});

describe('variantPrice', () => {
  it('matches the price the product page shows', () => {
    assert.equal(variantPrice({ price: 20000, storage: '128 GB' }, { storage: '128 GB', condition: 'Superb' }), 20000);
    assert.equal(variantPrice({ price: 20000, storage: '128 GB' }, { storage: '256 GB', condition: 'Superb' }), 23000);
    assert.equal(variantPrice({ price: 20000, storage: '128 GB' }, { storage: '128 GB', condition: 'Fair' }), 17600);
    assert.equal(variantPrice({ price: 20000, storage: '128 GB' }, { storage: '256 GB', condition: 'Good' }), 21850);
  });

  it('uses the listing storage and the top grade when nothing is chosen', () => {
    assert.equal(variantPrice({ price: 15000, storage: '256 GB' }), 15000);
  });
});

describe('isPlausibleStorage', () => {
  it('rejects absurd sizes', () => {
    assert.equal(isPlausibleStorage('128 GB'), true);
    assert.equal(isPlausibleStorage('1 TB'), true);
    assert.equal(isPlausibleStorage('1 GB'), false);
    assert.equal(isPlausibleStorage('99 TB'), false);
    assert.equal(isPlausibleStorage(''), false);
  });
});
