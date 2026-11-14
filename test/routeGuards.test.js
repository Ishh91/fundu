import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { permissionGuard } from '../server/middleware/auth.js';
import { createRateLimiter, rateLimit } from '../server/middleware/rateLimit.js';
import { limitNotification } from '../server/utils/notificationLimits.js';

const createResponse = () => {
  const res = { statusCode: 200, body: null, headers: {} };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  res.setHeader = (name, value) => {
    res.headers[name] = value;
  };
  return res;
};

const run = (middleware, req) => {
  const res = createResponse();
  let passed = false;
  middleware(req, res, () => {
    passed = true;
  });
  return { res, passed };
};

describe('permissionGuard', () => {
  const guard = permissionGuard('fleet');

  it('rejects a request with no login', () => {
    const { res, passed } = run(guard, { auth: null });

    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
  });

  it('rejects a customer and staff without the permission', () => {
    assert.equal(run(guard, { auth: { sub: 'u1', role: 'customer' } }).res.statusCode, 403);
    assert.equal(run(guard, { auth: { sub: 'u2', role: 'staff', permissions: ['inventory'] } }).res.statusCode, 403);
  });

  it('lets the super admin and staff with the permission through', () => {
    assert.equal(run(guard, { auth: { sub: 'a1', role: 'admin' } }).passed, true);
    assert.equal(run(guard, { auth: { sub: 's1', role: 'staff', permissions: ['fleet'] } }).passed, true);
  });
});

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks until the window resets', () => {
    let time = 1000;
    const limiter = createRateLimiter({ windowMs: 60000, max: 2, now: () => time });

    assert.equal(limiter.take('ip').allowed, true);
    assert.equal(limiter.take('ip').allowed, true);
    const blocked = limiter.take('ip');
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterMs, 60000);

    time += 60001;
    assert.equal(limiter.take('ip').allowed, true);
  });

  it('counts each client separately', () => {
    const limiter = createRateLimiter({ windowMs: 60000, max: 1, now: () => 0 });

    assert.equal(limiter.take('a').allowed, true);
    assert.equal(limiter.take('b').allowed, true);
    assert.equal(limiter.take('a').allowed, false);
  });
});

describe('rateLimit middleware', () => {
  it('answers 429 once an anonymous client passes the limit', () => {
    const middleware = rateLimit({ windowMs: 60000, max: 1, name: 'test' });
    const req = { ip: '1.2.3.4', auth: null };

    assert.equal(run(middleware, req).passed, true);
    const { res, passed } = run(middleware, req);

    assert.equal(passed, false);
    assert.equal(res.statusCode, 429);
    assert.ok(Number(res.headers['Retry-After']) > 0);
  });

  it('does not limit signed-in admin panel users', () => {
    const middleware = rateLimit({ windowMs: 60000, max: 1, name: 'test' });
    const req = { ip: '5.6.7.8', auth: { sub: 'a1', role: 'admin' } };

    assert.equal(run(middleware, req).passed, true);
    assert.equal(run(middleware, req).passed, true);
  });
});

describe('limitNotification', () => {
  it('accepts a normal message to a few recipients', () => {
    assert.equal(limitNotification({ recipients: ['9000000001', '9000000002'], body: 'New order' }), null);
  });

  it('rejects a blast to many recipients', () => {
    const recipients = Array.from({ length: 6 }, (_, i) => `900000000${i}`);

    assert.match(limitNotification({ recipients, body: 'hi' }), /recipients/);
  });

  it('rejects an oversized or empty body', () => {
    assert.match(limitNotification({ recipients: ['9'], body: 'x'.repeat(200001) }), /too long/);
    assert.match(limitNotification({ recipients: ['9'], body: '' }), /required/);
  });
});
