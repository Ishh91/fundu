import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { getJwtSecret, parseAuth } from '../server/middleware/auth.js';
import { User } from '../server/models/index.js';

const CONNECTED = 1;

const tokenFor = (claims) => jwt.sign(claims, getJwtSecret());

/** Runs the auth middleware for a bearer token and returns the resulting req.auth. */
const authenticate = async (token) => {
  const req = { headers: { authorization: `Bearer ${token}` } };
  await parseAuth(req, {}, () => {});
  return req.auth;
};

const pretendDatabaseIsConnected = () => {
  Object.defineProperty(mongoose.connection, 'readyState', { get: () => CONNECTED, configurable: true });
};

const pretendUserInDatabase = (userDoc) => {
  mock.method(User, 'findById', () => ({
    select: () => ({ lean: async () => userDoc }),
  }));
};

describe('parseAuth re-checks admin and staff against the database', () => {
  afterEach(() => {
    mock.restoreAll();
    delete mongoose.connection.readyState;
  });

  it('loads the current staff permissions from the database, not from the token', async () => {
    pretendDatabaseIsConnected();
    pretendUserInDatabase({ role: 'staff', permissions: ['inventory', 'not-a-real-permission'] });

    const auth = await authenticate(tokenFor({ sub: 'u1', role: 'staff', permissions: ['orders', 'sell_pricing'] }));

    assert.equal(auth.role, 'staff');
    assert.deepEqual(auth.permissions, ['inventory']);
  });

  it('applies a demotion immediately even though the token still says admin', async () => {
    pretendDatabaseIsConnected();
    pretendUserInDatabase({ role: 'customer', permissions: [] });

    const auth = await authenticate(tokenFor({ sub: 'u1', role: 'admin' }));

    assert.equal(auth.role, 'customer');
    assert.deepEqual(auth.permissions, []);
  });

  it('rejects an admin or staff token whose account was deleted', async () => {
    pretendDatabaseIsConnected();
    pretendUserInDatabase(null);

    assert.equal(await authenticate(tokenFor({ sub: 'gone', role: 'staff' })), null);
    assert.equal(await authenticate(tokenFor({ sub: 'gone', role: 'admin' })), null);
  });

  it('grants staff no permissions when the database is unreachable', async () => {
    const auth = await authenticate(tokenFor({ sub: 'u1', role: 'staff', permissions: ['orders'] }));

    assert.equal(auth.role, 'staff');
    assert.deepEqual(auth.permissions, []);
  });

  it('does not look up ordinary customers in the database', async () => {
    pretendDatabaseIsConnected();
    const findById = mock.method(User, 'findById', () => {
      throw new Error('customers must not trigger a lookup');
    });

    const auth = await authenticate(tokenFor({ sub: 'c1', role: 'customer' }));

    assert.equal(auth.role, 'customer');
    assert.equal(findById.mock.callCount(), 0);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ sub: 'evil', role: 'admin' }, 'change-this-jwt-secret');

    assert.equal(await authenticate(forged), null);
  });
});
