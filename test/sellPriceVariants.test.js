import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSiblingVariantUpsert, STANDARD_LOOK_MULTIPLIERS } from '../server/services/sellPriceVariants.js';

const require = createRequire(import.meta.url);
// The helper mongoose runs on every update of a schema with timestamps, to add `$set.updated_at` and `$setOnInsert.created_at`.
const applyTimestampsToUpdate = require('mongoose/lib/helpers/update/applyTimestampsToUpdate');

/** The update as mongoose sends it to MongoDB for the SellPriceConfig schema (createdAt: created_at, updatedAt: updated_at). */
const asSentToMongo = (update) => applyTimestampsToUpdate(new Date(), 'created_at', 'updated_at', structuredClone(update), {});

/** Paths named by two update operators at once: MongoDB rejects those with ConflictingUpdateOperators (code 40). */
const conflictingPaths = (update) => {
  const seen = new Map();
  const conflicts = [];
  for (const [operator, fields] of Object.entries(update)) {
    for (const path of Object.keys(fields)) {
      if (seen.has(path)) conflicts.push(`${path} (${seen.get(path)} and ${operator})`);
      else seen.set(path, operator);
    }
  }
  return conflicts;
};

const variant = { brand: 'Apple', model: 'iPhone 15', storage: '256 GB', basePrice: 61000 };

describe('adding a missing storage variant when an admin saves a price', () => {
  it('reproduces the production error with the old update, which named updated_at itself', () => {
    const oldUpdate = { $setOnInsert: { brand: 'Apple', created_at: new Date(), updated_at: new Date() } };
    assert.deepEqual(conflictingPaths(asSentToMongo(oldUpdate)), ['updated_at ($setOnInsert and $set)']);
  });

  it('sends MongoDB an update with no operator conflicts', () => {
    assert.deepEqual(conflictingPaths(asSentToMongo(buildSiblingVariantUpsert(variant))), []);
  });

  it('leaves both timestamps to mongoose', () => {
    const fields = buildSiblingVariantUpsert(variant).$setOnInsert;
    assert.ok(!('created_at' in fields));
    assert.ok(!('updated_at' in fields));
    const sent = asSentToMongo(buildSiblingVariantUpsert(variant));
    assert.ok('updated_at' in sent.$set, 'mongoose sets updated_at itself');
    assert.ok('created_at' in sent.$setOnInsert, 'mongoose sets created_at on insert itself');
  });

  it('only fills a row that is being inserted, so an existing variant is never overwritten', () => {
    assert.deepEqual(Object.keys(buildSiblingVariantUpsert(variant)), ['$setOnInsert']);
  });

  it('creates the row for the brand, model, storage and price asked for', () => {
    const fields = buildSiblingVariantUpsert(variant).$setOnInsert;
    assert.equal(fields.brand, 'Apple');
    assert.equal(fields.model, 'iPhone 15');
    assert.equal(fields.storage, '256 GB');
    assert.equal(fields.base_price, 61000);
    assert.equal(fields.is_active, true);
    assert.equal(fields.is_locked, false);
    assert.equal(fields.manual_override, false);
  });

  it('gives the new row the standard look multipliers: 1.00, 0.85, 0.70', () => {
    const fields = buildSiblingVariantUpsert(variant).$setOnInsert;
    assert.equal(fields.excellent_multiplier, 1);
    assert.equal(fields.good_multiplier, 0.85);
    assert.equal(fields.fair_multiplier, 0.7);
    assert.deepEqual(STANDARD_LOOK_MULTIPLIERS, { excellent_multiplier: 1, good_multiplier: 0.85, fair_multiplier: 0.7 });
  });
});
