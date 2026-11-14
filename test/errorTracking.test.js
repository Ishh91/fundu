import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recordServerError } from '../server/routes/errorRoutes.js';

describe('Error Tracking System', () => {
  it('records server errors safely without throwing', () => {
    assert.doesNotThrow(() => {
      recordServerError(new Error('Test server failure'), {
        originalUrl: '/api/test',
        headers: { 'user-agent': 'NodeTestAgent' },
        ip: '127.0.0.1',
      });
    });
  });

  it('handles null request and string error gracefully', () => {
    assert.doesNotThrow(() => {
      recordServerError('String exception message', null);
    });
  });
});

