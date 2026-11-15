import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/sellPaths.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { sellModelListPath } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

describe('sellModelListPath', () => {
  it('goes to the brand model list on the /sell paths', () => {
    assert.equal(sellModelListPath('/sell/apple/iphone-13', 'apple', 'Apple'), '/sell/apple');
  });

  it('keeps the sell-old-mobile-phone family and its brand slug', () => {
    assert.equal(
      sellModelListPath('/sell-old-mobile-phone/sell-apple/sell-iphone-13', 'sell-apple', 'Apple'),
      '/sell-old-mobile-phone/sell-apple',
    );
  });

  it('falls back to the chosen brand name, spaces turned into dashes', () => {
    assert.equal(sellModelListPath('/sell', undefined, 'Google Pixel'), '/sell/google-pixel');
  });

  it('goes to the all-brands page only when no brand is known', () => {
    assert.equal(sellModelListPath('/sell', undefined, ''), '/sell');
    assert.equal(sellModelListPath('/sell-old-mobile-phone', null, null), '/sell-old-mobile-phone');
  });
});
