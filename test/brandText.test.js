import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BRAND_TABLES, cleanBrand, withCleanBrand } from '../server/utils/brandText.js';

describe('cleanBrand', () => {
  it('trims the ends and collapses repeated spaces', () => {
    assert.equal(cleanBrand('Samsung '), 'Samsung');
    assert.equal(cleanBrand('  Mi   Redmi '), 'Mi Redmi');
  });

  it('leaves non-text values alone', () => {
    assert.equal(cleanBrand(undefined), undefined);
    assert.equal(cleanBrand(null), null);
    assert.equal(cleanBrand(5), 5);
  });
});

describe('withCleanBrand', () => {
  it('cleans one row without changing the original', () => {
    const row = { brand: 'Vivo ', title: 'Vivo T5' };
    const result = withCleanBrand(row);

    assert.deepEqual(result, { brand: 'Vivo', title: 'Vivo T5' });
    assert.equal(row.brand, 'Vivo ');
  });

  it('cleans every row in a list', () => {
    assert.deepEqual(withCleanBrand([{ brand: 'Oppo ' }, { brand: 'Apple' }, { title: 'no brand' }]), [
      { brand: 'Oppo' },
      { brand: 'Apple' },
      { title: 'no brand' },
    ]);
  });

  it('returns rows that are already clean as they are', () => {
    const row = { brand: 'Apple' };
    assert.equal(withCleanBrand(row), row);
  });

  it('does not touch a row sent without a brand, such as a partial update', () => {
    const patch = { price: 100 };
    assert.equal(withCleanBrand(patch), patch);
  });

  it('covers the product table', () => {
    assert.equal(BRAND_TABLES.has('products'), true);
  });
});
