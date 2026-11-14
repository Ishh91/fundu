import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { correctedBalance, findDuplicateLedgerEntries } from '../server/services/ledgerCleanup.js';

const row = (id, type, reference, amount, minute, vendor = 'v1') => ({
  id,
  type,
  reference_order_id: reference,
  amount,
  vendor_id: vendor,
  created_at: `2026-11-01T10:${String(minute).padStart(2, '0')}:00Z`,
});

describe('findDuplicateLedgerEntries', () => {
  it('keeps the first posting of a job and flags the repeats', () => {
    const rows = [
      row('a', 'sell_buyback_payout', 'sr1', 20000, 0),
      row('b', 'sell_commission_fee', 'sr1', 2000, 0),
      row('c', 'sell_buyback_payout', 'sr1', 20000, 5),
      row('d', 'sell_commission_fee', 'sr1', 2000, 5),
      row('e', 'sell_buyback_payout', 'sr1', 20000, 9),
    ];

    const { duplicates, overchargeByVendor } = findDuplicateLedgerEntries(rows);

    assert.deepEqual(duplicates.map((entry) => entry.id).sort(), ['c', 'd', 'e']);
    assert.deepEqual(overchargeByVendor, { v1: 40000 });
  });

  it('keeps the earliest row even when rows arrive out of order', () => {
    const rows = [row('late', 'repair_earning', 'rb1', 2700, 30), row('early', 'repair_earning', 'rb1', 2700, 1)];

    assert.deepEqual(findDuplicateLedgerEntries(rows).duplicates.map((entry) => entry.id), ['late']);
  });

  it('does not count repeated repair rows as a balance overcharge', () => {
    const rows = [row('a', 'repair_earning', 'rb1', 2700, 0), row('b', 'repair_earning', 'rb1', 2700, 4)];

    assert.deepEqual(findDuplicateLedgerEntries(rows).overchargeByVendor, {});
  });

  it('leaves different jobs, other entry types and rows without a reference alone', () => {
    const rows = [
      row('a', 'sell_buyback_payout', 'sr1', 20000, 0),
      row('b', 'sell_buyback_payout', 'sr2', 20000, 1),
      row('c', 'cash_repayment', 'sr1', 500, 2),
      row('d', 'cash_repayment', 'sr1', 500, 3),
      row('e', 'sell_buyback_payout', null, 100, 4),
      row('f', 'sell_buyback_payout', null, 100, 5),
    ];

    assert.deepEqual(findDuplicateLedgerEntries(rows), { duplicates: [], overchargeByVendor: {} });
  });

  it('totals the overcharge per vendor', () => {
    const rows = [
      row('a', 'sell_buyback_payout', 'sr1', 1000, 0, 'v1'),
      row('b', 'sell_buyback_payout', 'sr1', 1000, 1, 'v1'),
      row('c', 'sell_buyback_payout', 'sr9', 700, 0, 'v2'),
      row('d', 'sell_buyback_payout', 'sr9', 700, 1, 'v2'),
      row('e', 'sell_buyback_payout', 'sr9', 700, 2, 'v2'),
    ];

    assert.deepEqual(findDuplicateLedgerEntries(rows).overchargeByVendor, { v1: 1000, v2: 1400 });
  });
});

describe('correctedBalance', () => {
  it('subtracts the overcharge', () => {
    assert.equal(correctedBalance(61000, 40000), 21000);
  });

  it('never goes below zero', () => {
    assert.equal(correctedBalance(500, 40000), 0);
    assert.equal(correctedBalance(undefined, 100), 0);
  });
});
