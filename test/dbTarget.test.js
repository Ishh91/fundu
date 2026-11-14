import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { describeDbTarget, resolveDbName } from '../server/utils/dbTarget.js';

describe('resolveDbName', () => {
  it('uses MONGODB_DB_NAME, like the server does, and falls back to fundu', () => {
    assert.equal(resolveDbName({ MONGODB_DB_NAME: 'shop' }), 'shop');
    assert.equal(resolveDbName({ MONGODB_DB_NAME: '  ' }), 'fundu');
    assert.equal(resolveDbName({}), 'fundu');
  });
});

describe('describeDbTarget', () => {
  it('shows the host and database but never the credentials', () => {
    const label = describeDbTarget('mongodb+srv://admin:Sup3r%40Secret@cluster0.abc12.mongodb.net/?retryWrites=true', 'fundu');

    assert.equal(label, 'cluster0.abc12.mongodb.net / fundu');
    assert.equal(label.includes('Sup3r'), false);
    assert.equal(label.includes('admin'), false);
  });

  it('handles a plain mongodb:// address with a port', () => {
    assert.equal(describeDbTarget('mongodb://user:pw@127.0.0.1:27017/x', 'fundu'), '127.0.0.1:27017 / fundu');
  });

  it('never throws on a bad address', () => {
    assert.equal(describeDbTarget('not a uri', 'fundu'), 'unknown host / fundu');
    assert.equal(describeDbTarget(undefined, 'fundu'), 'unknown host / fundu');
  });
});
