import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dropExpired, setBounded } from '../server/utils/boundedCache.js';

describe('setBounded', () => {
  it('keeps at most maxEntries and drops the oldest first', () => {
    const cache = new Map();
    for (let i = 0; i < 10; i += 1) setBounded(cache, `k${i}`, i, 3);
    assert.deepEqual([...cache.keys()], ['k7', 'k8', 'k9']);
  });

  it('does not grow past the limit however many different keys arrive', () => {
    const cache = new Map();
    for (let i = 0; i < 5000; i += 1) setBounded(cache, `query-${i}`, { big: i }, 100);
    assert.equal(cache.size, 100);
  });

  it('moves a key that is set again to the newest place, so it outlives older ones', () => {
    const cache = new Map();
    setBounded(cache, 'a', 1, 2);
    setBounded(cache, 'b', 2, 2);
    setBounded(cache, 'a', 3, 2);
    setBounded(cache, 'c', 4, 2);
    assert.deepEqual([...cache.keys()], ['a', 'c']);
    assert.equal(cache.get('a'), 3);
  });

  it('returns the value it stored', () => {
    assert.equal(setBounded(new Map(), 'x', 'value', 5), 'value');
  });
});

describe('dropExpired', () => {
  it('removes entries older than the age, by timestamp or createdAt, and keeps fresh ones', () => {
    const cache = new Map([
      ['old-timestamp', { timestamp: 1000 }],
      ['old-created', { createdAt: 1000 }],
      ['fresh', { timestamp: 9500 }],
    ]);
    dropExpired(cache, 1000, 10000);
    assert.deepEqual([...cache.keys()], ['fresh']);
  });
});
