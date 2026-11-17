import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPricingRulesService } from '../server/services/pricingRulesService.js';
import { DEFAULT_PRICING_RULES, cloneRules } from '../fundu_pricing_rules.mjs';

/** A stand-in for the PricingRules model that keeps its documents in an array. It does only what the service asks of it. */
function fakeModel() {
  const docs = [];
  const state = { reads: 0, failing: false };
  const matches = (doc, filter = {}) => Object.entries(filter).every(([key, cond]) => {
    if (cond && typeof cond === 'object') {
      if ('$in' in cond) return cond.$in.includes(doc[key]);
      if ('$lt' in cond) return doc[key] < cond.$lt;
    }
    return doc[key] === cond;
  });
  const query = (rows) => {
    let result = rows;
    const chain = {
      sort(spec) { const [[field, dir]] = Object.entries(spec); result = [...result].sort((a, b) => (a[field] - b[field]) * dir); return chain; },
      limit(n) { result = result.slice(0, n); return chain; },
      lean() { return chain; },
      then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
    };
    return chain;
  };
  const guard = () => { state.reads += 1; if (state.failing) throw new Error('database is down'); };
  return {
    docs,
    state,
    findOne(filter) { guard(); const rows = docs.filter((d) => matches(d, filter)); const q = query(rows); const original = q.then; q.then = (res, rej) => original(([first]) => res(first ?? null), rej); return q; },
    find(filter) { guard(); return query(docs.filter((d) => matches(d, filter))); },
    async create(doc) { guard(); const stored = { ...doc, updated_at: new Date(), created_at: new Date() }; docs.push(stored); return stored; },
    async updateOne(filter, update) { guard(); const doc = docs.find((d) => matches(d, filter)); if (doc) Object.assign(doc, update.$set, { updated_at: new Date() }); },
    async updateMany(filter, update) { guard(); docs.filter((d) => matches(d, filter)).forEach((d) => Object.assign(d, update.$set)); },
    async deleteMany(filter) { guard(); for (let i = docs.length - 1; i >= 0; i--) if (matches(docs[i], filter)) docs.splice(i, 1); },
  };
}

const rulesWith = (change) => {
  const rules = cloneRules(DEFAULT_PRICING_RULES);
  change(rules);
  return rules;
};
const make = (options = {}) => {
  const model = fakeModel();
  const clock = { t: 1_000_000 };
  const service = createPricingRulesService({ model, now: () => clock.t, ...options });
  return { model, clock, service };
};

describe('the published rules', () => {
  it('are the defaults, as version 0, when nothing was ever published', async () => {
    const { service } = make();
    const published = await service.getPublished();
    assert.equal(published.version, 0);
    assert.equal(published.source, 'defaults');
    assert.deepEqual(published.rules, DEFAULT_PRICING_RULES);
  });

  it('are the saved set once published', async () => {
    const { service } = make();
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.78; }), { user: 'admin@fundu.in' });
    assert.equal(await service.publish({ user: 'admin@fundu.in' }), 1);
    const published = await service.getPublished();
    assert.equal(published.version, 1);
    assert.equal(published.source, 'database');
    assert.equal(published.rules.age.over11, 0.78);
  });

  it('never throw and never wait when the database is down or not connected', async () => {
    const down = make();
    down.model.state.failing = true;
    assert.equal((await down.service.getPublished()).version, 0);

    const offline = make({ isReady: () => false });
    assert.equal((await offline.service.getPublished()).source, 'defaults');
    assert.equal(offline.model.state.reads, 0, 'it must not touch the database when it is not connected');
  });

  it('keep using the last rules that were read when the database goes down', async () => {
    const { service, model, clock } = make({ cacheMs: 1000 });
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.75; }));
    await service.publish();
    assert.equal((await service.getPublished()).rules.age.over11, 0.75);
    model.state.failing = true;
    clock.t += 5000;
    const stale = await service.getPublished();
    assert.equal(stale.version, 1);
    assert.equal(stale.rules.age.over11, 0.75);
  });

  it('read the database only once within the cache window, and again after it', async () => {
    const { service, model, clock } = make({ cacheMs: 30_000 });
    await service.getPublished();
    const readsAfterFirst = model.state.reads;
    await service.getPublished();
    await service.getPublished();
    assert.equal(model.state.reads, readsAfterFirst);
    clock.t += 31_000;
    await service.getPublished();
    assert.equal(model.state.reads, readsAfterFirst + 1);
  });

  it('are not served from a stale cache after a publish', async () => {
    const { service } = make();
    assert.equal((await service.getPublished()).version, 0);
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.7; }));
    await service.publish();
    assert.equal((await service.getPublished()).version, 1);
  });

  it('come back safe when the stored rules are damaged', async () => {
    const { service, model } = make();
    model.docs.push({ status: 'published', version: 3, rules: { age: { over11: 0.01 }, samsungMidFactor: 'lots' } });
    const published = await service.getPublished();
    assert.equal(published.version, 3);
    assert.equal(published.rules.age.over11, 0.8);
    assert.equal(published.rules.samsungMidFactor, 0.8);
  });

  it('can be peeked at without waiting: the last read, or the defaults', async () => {
    const { service } = make();
    assert.equal(service.peek().version, 0);
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.7; }));
    await service.publish();
    await service.getPublished();
    assert.equal(service.peek().version, 1);
  });
});

describe('the draft', () => {
  it('is refused when a rule is out of bounds, with every problem listed, and nothing is saved', async () => {
    const { service, model } = make();
    await assert.rejects(
      service.saveDraft(rulesWith((r) => { r.age.over11 = 0.1; r.samsungMidFactor = 5; })),
      (error) => error.status === 400 && error.errors.length >= 2,
    );
    assert.equal(model.docs.length, 0);
    assert.equal(await service.getDraft(), null);
  });

  it('is saved, and saving again changes the one draft, not adds another', async () => {
    const { service, model } = make();
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.78; }), { user: 'a@fundu.in', note: 'first' });
    const second = await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.77; }), { user: 'b@fundu.in', note: 'second' });
    assert.equal(model.docs.filter((d) => d.status === 'draft').length, 1);
    assert.equal(second.rules.age.over11, 0.77);
    assert.equal(second.note, 'second');
    assert.equal(second.updated_by, 'b@fundu.in');
  });

  it('does not change what any quote is priced on until it is published', async () => {
    const { service } = make();
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.6; }));
    assert.equal((await service.getPublished()).rules.age.over11, 0.8);
  });

  it('remembers which version it was started from', async () => {
    const { service } = make();
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.78; }));
    await service.publish();
    const draft = await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.77; }));
    assert.equal(draft.based_on_version, 1);
  });

  it('can be thrown away', async () => {
    const { service } = make();
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.78; }));
    await service.discardDraft();
    assert.equal(await service.getDraft(), null);
  });
});

describe('publishing', () => {
  it('needs a draft', async () => {
    const { service } = make();
    await assert.rejects(service.publish(), (error) => error.status === 409);
  });

  it('makes each publish the next version, archives the one before and keeps exactly one published', async () => {
    const { service, model } = make();
    for (const value of [0.78, 0.77, 0.76]) {
      await service.saveDraft(rulesWith((r) => { r.age.over11 = value; }));
      await service.publish({ user: 'admin@fundu.in', note: `over11 ${value}` });
    }
    assert.equal((await service.getPublished()).version, 3);
    assert.equal(model.docs.filter((d) => d.status === 'published').length, 1);
    assert.deepEqual(model.docs.filter((d) => d.status === 'archived').map((d) => d.version).sort(), [1, 2]);
    assert.equal(model.docs.filter((d) => d.status === 'draft').length, 0, 'the draft is used up by a publish');
  });

  it('records who published it and when', async () => {
    const { service, clock } = make();
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.78; }));
    await service.publish({ user: 'admin@fundu.in', note: 'matched iPhone 14' });
    const [version] = await service.listVersions();
    assert.equal(version.published_by, 'admin@fundu.in');
    assert.equal(version.note, 'matched iPhone 14');
    assert.equal(new Date(version.published_at).getTime(), clock.t);
  });

  it('refuses a draft that has gone bad in the database', async () => {
    const { service, model } = make();
    model.docs.push({ status: 'draft', version: null, rules: { age: { over11: 0.01 } } });
    await assert.rejects(service.publish(), (error) => error.status === 400);
    assert.equal((await service.getPublished()).version, 0);
  });
});

describe('the history and rolling back', () => {
  const publishThree = async (service) => {
    for (const value of [0.78, 0.77, 0.76]) {
      await service.saveDraft(rulesWith((r) => { r.age.over11 = value; }));
      await service.publish();
    }
  };

  it('lists the newest version first, each with its rules', async () => {
    const { service } = make();
    await publishThree(service);
    const versions = await service.listVersions();
    assert.deepEqual(versions.map((v) => v.version), [3, 2, 1]);
    assert.deepEqual(versions.map((v) => v.rules.age.over11), [0.76, 0.77, 0.78]);
    assert.deepEqual(versions.map((v) => v.status), ['published', 'archived', 'archived']);
  });

  it('publishes an earlier version again as a new version, so the history is never rewritten', async () => {
    const { service } = make();
    await publishThree(service);
    assert.equal(await service.rollback(1, { user: 'admin@fundu.in' }), 4);
    const published = await service.getPublished();
    assert.equal(published.version, 4);
    assert.equal(published.rules.age.over11, 0.78);
    const versions = await service.listVersions();
    assert.equal(versions.length, 4);
    assert.equal(versions[0].note, 'Rolled back to version 1');
    assert.equal(versions[0].based_on_version, 1);
    assert.equal(versions.filter((v) => v.status === 'published').length, 1);
  });

  it('refuses to roll back to the live version, to one that does not exist, or to nonsense', async () => {
    const { service } = make();
    await publishThree(service);
    await assert.rejects(service.rollback(3), (error) => error.status === 409);
    await assert.rejects(service.rollback(99), (error) => error.status === 404);
    for (const bad of [undefined, 'x', 0, -1, 1.5]) await assert.rejects(service.rollback(bad), (error) => error.status === 400, String(bad));
  });

  it('gives the admin page everything in one read', async () => {
    const { service } = make();
    await publishThree(service);
    await service.saveDraft(rulesWith((r) => { r.age.over11 = 0.75; }));
    const state = await service.getState();
    assert.equal(state.published.version, 3);
    assert.equal(state.draft.rules.age.over11, 0.75);
    assert.equal(state.versions.length, 3);
  });
});
