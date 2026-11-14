import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/brandFilter.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { matchesBrand, isAllBrands } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

describe('matchesBrand', () => {
  it('ignores trailing spaces and capitalisation in saved brand names', () => {
    assert.equal(matchesBrand('Samsung ', 'Samsung'), true);
    assert.equal(matchesBrand('Oneplus ', 'OnePlus'), true);
    assert.equal(matchesBrand('  realme', 'Realme'), true);
    assert.equal(matchesBrand('Vivo  ', 'vivo'), true);
  });

  it('does not match a different brand', () => {
    assert.equal(matchesBrand('Oppo ', 'Vivo'), false);
    assert.equal(matchesBrand('Apple', 'Samsung'), false);
  });

  it('shows everything for All or an empty chip', () => {
    assert.equal(matchesBrand('Anything', 'All'), true);
    assert.equal(matchesBrand('Anything', ''), true);
    assert.equal(isAllBrands(undefined), true);
  });

  it('puts Redmi phones under Xiaomi and Pixel under Google', () => {
    assert.equal(matchesBrand('Redmi', 'Xiaomi'), true);
    assert.equal(matchesBrand('Pixel', 'Google'), true);
    assert.equal(matchesBrand('Xiaomi', 'Redmi'), false);
  });

  it('copes with a missing product brand', () => {
    assert.equal(matchesBrand(undefined, 'Apple'), false);
    assert.equal(matchesBrand(null, 'All'), true);
  });
});
