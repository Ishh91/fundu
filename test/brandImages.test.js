import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/phoneImages.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
// Replace relative imports for data URI evaluation
const sanitizedCode = code
  .replace(/import\s*\{[^}]*\}\s*from\s*["']\.\/afterPageSettles["'];?/g, 'const afterPageSettles = (fn) => setTimeout(fn, 10);')
  .replace(/import\s*\{[^}]*\}\s*from\s*["']\.\/errorMessage["'];?/g, 'const getErrorMessage = (e) => String(e);')
  .replace(/import\s*\{[^}]*\}\s*from\s*["']\.\/realtimeSync["'];?/g, 'const broadcastSync = () => {}; const subscribeToRealtimeSync = () => () => {};')
  .replace(/import\s*\{[^}]*\}\s*from\s*["']\.\/db["'];?/g, 'const db = {}; const readSession = () => null; const invalidateClientTableCache = () => {};')
  .replace(/import\s*\{[^}]*\}\s*from\s*["']\.\.\/config\/apiConfig["'];?/g, 'const API_BASE = "http://localhost:5000/api";')
  .replace(/import\s*\{[^}]*\}\s*from\s*["']\.\.\/data\/deviceImageDictionary\.ts["'];?/g, 'const MOBILE_API_THUMBS = {};');

const { getCleanPhoneImage, isBrandImageMismatch } = await import(`data:text/javascript;base64,${Buffer.from(sanitizedCode).toString('base64')}`);

describe('Sell Brand Page Image Resolution', () => {
  it('resolves authentic Apple flagship renders both with and without fallbackUrl', () => {
    const withoutFallback = getCleanPhoneImage('Apple', 'iPhone 15 Pro Max');
    const withFallback = getCleanPhoneImage('Apple', 'iPhone 15 Pro Max', 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg');
    assert.match(withoutFallback, /apple-iphone-15-pro-max\.jpg/);
    assert.match(withFallback, /apple-iphone-15-pro-max\.jpg/);
  });

  it('resolves iQOO models under Vivo brand correctly without being rejected by cross-brand check', () => {
    const iqooUnderVivo = getCleanPhoneImage('Vivo', 'iQOO 12 5G');
    assert.ok(iqooUnderVivo, 'Should not return empty string for iQOO 12 under Vivo');
    assert.match(iqooUnderVivo, /vivo-iqoo/i);
  });

  it('resolves Samsung Galaxy S24 Ultra render correctly', () => {
    const s24 = getCleanPhoneImage('Samsung', 'Galaxy S24 Ultra');
    assert.ok(s24);
    assert.match(s24, /samsung-galaxy-s24-ultra/i);
  });

  it('resolves OnePlus 12 render correctly', () => {
    const op12 = getCleanPhoneImage('OnePlus', 'OnePlus 12');
    assert.ok(op12);
    assert.match(op12, /oneplus-12/i);
  });

  it('rejects cross-brand mismatches correctly', () => {
    assert.equal(isBrandImageMismatch('Apple', 'iPhone 15', 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24.jpg'), true);
    assert.equal(isBrandImageMismatch('Samsung', 'Galaxy S24', 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg'), true);
  });
});
