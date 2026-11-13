import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  postBuybackToLedger,
  postRepairToLedger,
  shouldRestoreStock,
} from '../server/services/vendorLedgerService.js';

/** In-memory stand-ins for the ledger and user collections. */
const createFakes = (outstandingBalance = 1000) => {
  const rows = [];
  const vendor = { _id: 'v1', business_name: 'Gomti Mobiles', outstanding_balance: outstandingBalance };
  return {
    rows,
    vendor,
    Ledger: {
      exists: async (query) =>
        rows.some((row) => row.reference_order_id === query.reference_order_id && row.type === query.type),
      create: async (row) => {
        rows.push(row);
        return row;
      },
    },
    Users: {
      findById: async (id) => (id === vendor._id ? { ...vendor } : null),
      findByIdAndUpdate: async (_id, update) => {
        vendor.outstanding_balance += update.$inc.outstanding_balance;
      },
    },
  };
};

const completedSale = {
  id: 'sr1',
  status: 'completed',
  assigned_vendor_id: 'v1',
  vendor_quote_price: 20000,
  brand: 'Apple',
  model: 'iPhone 13',
};

const paidRepair = {
  id: 'rb1',
  status: 'paid',
  assigned_vendor_id: 'v1',
  vendor_quotation_amount: 3000,
  brand: 'Apple',
  model: 'iPhone 13',
  problem: 'Screen',
};

describe('postBuybackToLedger', () => {
  it('charges the vendor and records payout plus commission', async () => {
    const fakes = createFakes(1000);

    const posted = await postBuybackToLedger(completedSale, fakes);

    assert.equal(posted, true);
    assert.equal(fakes.vendor.outstanding_balance, 21000);
    assert.deepEqual(fakes.rows.map((row) => [row.type, row.amount]), [
      ['sell_buyback_payout', 20000],
      ['sell_commission_fee', 2000],
    ]);
  });

  it('does not charge the vendor again when the finished request is edited later', async () => {
    const fakes = createFakes(1000);
    await postBuybackToLedger(completedSale, fakes);

    const postedAgain = await postBuybackToLedger({ ...completedSale, notes: 'called customer' }, fakes);

    assert.equal(postedAgain, false);
    assert.equal(fakes.vendor.outstanding_balance, 21000);
    assert.equal(fakes.rows.length, 2);
  });

  it('ignores a request that is not settled or has no vendor', async () => {
    const fakes = createFakes();

    assert.equal(await postBuybackToLedger({ ...completedSale, status: 'pending' }, fakes), false);
    assert.equal(await postBuybackToLedger({ ...completedSale, assigned_vendor_id: null }, fakes), false);
    assert.equal(await postBuybackToLedger({ ...completedSale, assigned_vendor_id: 'missing' }, fakes), false);
    assert.equal(fakes.rows.length, 0);
  });
});

describe('postRepairToLedger', () => {
  it('records the 90% earning and 10% commission once', async () => {
    const fakes = createFakes();

    await postRepairToLedger(paidRepair, fakes);
    await postRepairToLedger({ ...paidRepair, notes: 'device returned' }, fakes);

    assert.deepEqual(fakes.rows.map((row) => [row.type, row.amount]), [
      ['repair_earning', 2700],
      ['repair_commission_fee', 300],
    ]);
  });

  it('keeps separate bookings separate', async () => {
    const fakes = createFakes();

    await postRepairToLedger(paidRepair, fakes);
    await postRepairToLedger({ ...paidRepair, id: 'rb2' }, fakes);

    assert.equal(fakes.rows.length, 4);
  });
});

describe('shouldRestoreStock', () => {
  it('restores stock on the update that cancels an order', () => {
    assert.equal(shouldRestoreStock('pending', 'cancelled'), true);
    assert.equal(shouldRestoreStock(undefined, 'cancelled'), true);
  });

  it('does not restore stock again when a cancelled order is edited', () => {
    assert.equal(shouldRestoreStock('cancelled', 'cancelled'), false);
  });

  it('does nothing for orders that are not cancelled', () => {
    assert.equal(shouldRestoreStock('pending', 'dispatched'), false);
  });
});
