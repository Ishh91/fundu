import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escapeRegex } from '../server/utils/regex.js';

const exact = (brand) => new RegExp(`^${escapeRegex(brand)}$`, 'i');

describe('escapeRegex', () => {
  it('lets a brand with a plus sign match itself and nothing else', () => {
    assert.equal(exact('Ai+').test('Ai+'), true);
    assert.equal(exact('Ai+').test('ai+'), true);
    assert.equal(exact('Ai+').test('Aii'), false);
    assert.equal(exact('Ai+').test('Ai'), false);
  });

  it('leaves an ordinary brand name working', () => {
    assert.equal(exact('OnePlus').test('oneplus'), true);
    assert.equal(exact('OnePlus').test('Samsung'), false);
  });

  it('escapes every regex symbol', () => {
    assert.equal(escapeRegex('a.b*c?d(e)[f]{g}|h^i$j\\k'), 'a\\.b\\*c\\?d\\(e\\)\\[f\\]\\{g\\}\\|h\\^i\\$j\\\\k');
  });

  it('treats a missing value as empty text', () => {
    assert.equal(escapeRegex(undefined), '');
    assert.equal(escapeRegex(null), '');
  });
});
