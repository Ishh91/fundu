import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isRejectedSessionRead } from '../server/routes/dbRoutes.js';
import { createHttpError } from '../server/utils/error.js';

const unauthorized = createHttpError(401, 'Authentication required.');
const withToken = { headers: { authorization: 'Bearer stale-token' }, auth: null };

describe('isRejectedSessionRead', () => {
  it('flags a private read whose login token the server did not accept', () => {
    assert.equal(isRejectedSessionRead(withToken, unauthorized), true);
  });

  it('leaves anonymous visitors on the quiet empty-list reply', () => {
    const anonymous = { headers: {}, auth: null };

    assert.equal(isRejectedSessionRead(anonymous, unauthorized), false);
  });

  it('ignores a signed-in user who simply lacks access', () => {
    const signedIn = { headers: { authorization: 'Bearer good' }, auth: { sub: 'u1', role: 'customer' } };

    assert.equal(isRejectedSessionRead(signedIn, createHttpError(403, 'Admin access required.')), false);
    assert.equal(isRejectedSessionRead(signedIn, unauthorized), false);
  });

  it('ignores failures that are not about the login', () => {
    assert.equal(isRejectedSessionRead(withToken, new Error('Unknown table')), false);
    assert.equal(isRejectedSessionRead(withToken, createHttpError(503, 'Database unavailable.')), false);
    assert.equal(isRejectedSessionRead(withToken, null), false);
  });

  it('does not treat a non-bearer header as a login token', () => {
    const basic = { headers: { authorization: 'Basic abc' }, auth: null };

    assert.equal(isRejectedSessionRead(basic, unauthorized), false);
  });
});
