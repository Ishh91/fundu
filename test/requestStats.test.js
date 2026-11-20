import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countRequest, takeTopRoutes } from '../server/utils/requestStats.js';

describe('request stats', () => {
  it('lists the busiest routes first and resets after a read', () => {
    takeTopRoutes(); // start clean
    for (let i = 0; i < 5; i += 1) countRequest('GET /api/db/:table [master_phones]');
    for (let i = 0; i < 2; i += 1) countRequest('GET /health');
    countRequest('POST /api/phones/quote');

    const first = takeTopRoutes(2);
    assert.equal(first.total, 8);
    assert.deepEqual(first.top, ['GET /api/db/:table [master_phones] x5', 'GET /health x2']);

    const second = takeTopRoutes(2);
    assert.equal(second.total, 0);
    assert.deepEqual(second.top, []);
  });

  it('never keeps more than a bounded number of different routes', () => {
    takeTopRoutes();
    for (let i = 0; i < 1000; i += 1) countRequest(`GET /odd-${i}`);
    const { top } = takeTopRoutes(1000);
    assert.ok(top.length <= 200, `kept ${top.length} routes`);
  });
});
