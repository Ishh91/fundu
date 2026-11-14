import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildClientErrorRecord, groupErrors, limitMetadata } from '../server/services/errorReports.js';

describe('buildClientErrorRecord', () => {
  it('rejects a report without a message', () => {
    assert.deepEqual(buildClientErrorRecord({}), { ok: false, error: 'Error message is required.' });
    assert.equal(buildClientErrorRecord({ message: '   ' }).ok, false);
    assert.equal(buildClientErrorRecord({ message: { $ne: null } }).ok, false);
    assert.equal(buildClientErrorRecord(undefined).ok, false);
  });

  it('cuts long text fields to their limits', () => {
    const { record } = buildClientErrorRecord({
      message: 'm'.repeat(5000),
      stack: 's'.repeat(9000),
      url: 'u'.repeat(900),
      type: 't'.repeat(200),
    });

    assert.equal(record.message.length, 1000);
    assert.equal(record.stack.length, 5000);
    assert.equal(record.url.length, 500);
    assert.equal(record.type.length, 50);
  });

  it('takes the user from the verified login, never from the request body', () => {
    const body = { message: 'boom', user_id: 'someone-else', user_email: 'fake@example.com' };

    const anonymous = buildClientErrorRecord(body).record;
    const signedIn = buildClientErrorRecord(body, { auth: { sub: 'u1', email: 'real@example.com' } }).record;

    assert.equal(anonymous.user_id, null);
    assert.equal(anonymous.user_email, null);
    assert.equal(signedIn.user_id, 'u1');
    assert.equal(signedIn.user_email, 'real@example.com');
  });

  it('records the address and browser the server saw', () => {
    const { record } = buildClientErrorRecord({ message: 'boom' }, { ip: '10.0.0.1', userAgent: 'TestBrowser' });

    assert.equal(record.ip, '10.0.0.1');
    assert.equal(record.user_agent, 'TestBrowser');
    assert.equal(record.type, 'client_error');
  });
});

describe('limitMetadata', () => {
  it('keeps small plain objects', () => {
    assert.deepEqual(limitMetadata({ lineno: 4, filename: 'a.js' }), { lineno: 4, filename: 'a.js' });
  });

  it('drops values that are not plain objects', () => {
    assert.deepEqual(limitMetadata('text'), {});
    assert.deepEqual(limitMetadata(['a']), {});
    assert.deepEqual(limitMetadata(null), {});
  });

  it('replaces oversized metadata with a short preview', () => {
    const result = limitMetadata({ blob: 'x'.repeat(50000) });

    assert.equal(result.truncated, true);
    assert.equal(result.preview.length, 2000);
  });
});

describe('groupErrors', () => {
  const row = (message, minute, extra = {}) => ({
    type: 'client_error',
    message,
    path: '/buy',
    ip: '1.1.1.1',
    created_at: `2026-11-14T10:${String(minute).padStart(2, '0')}:00.000Z`,
    ...extra,
  });

  it('counts repeats of the same error on the same page as one group', () => {
    const groups = groupErrors([row('x is undefined', 1), row('x is undefined', 5), row('x is undefined', 3)]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].count, 3);
    assert.equal(groups[0].firstSeen, '2026-11-14T10:01:00.000Z');
    assert.equal(groups[0].lastSeen, '2026-11-14T10:05:00.000Z');
  });

  it('keeps different messages, pages and types apart', () => {
    const groups = groupErrors([
      row('a', 1),
      row('b', 2),
      row('a', 3, { path: '/sell' }),
      row('a', 4, { type: 'server_error' }),
    ]);

    assert.equal(groups.length, 4);
  });

  it('counts distinct visitors and lists the most recent problem first', () => {
    const groups = groupErrors([
      row('old', 1),
      row('new', 9, { ip: '2.2.2.2' }),
      row('new', 8, { user_id: 'u1' }),
      row('new', 7, { user_id: 'u1' }),
    ]);

    assert.deepEqual(groups.map((group) => group.message), ['new', 'old']);
    assert.equal(groups[0].users, 2);
    assert.equal(groups[0].sample.ip, '2.2.2.2');
  });

  it('returns nothing for no rows', () => {
    assert.deepEqual(groupErrors([]), []);
  });
});
