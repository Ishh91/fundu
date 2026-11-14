/**
 * Finds vendor ledger rows that were posted more than once for the same job.
 *
 * Before the one-post-per-job fix, every later edit of a finished sell request
 * or repair booking added the same ledger rows again, and each repeated
 * buyback payout also raised the vendor's outstanding balance.
 */

/** Ledger types that must appear at most once per sell request / repair booking. */
export const ONCE_PER_JOB_TYPES = Object.freeze([
  'sell_buyback_payout',
  'sell_commission_fee',
  'repair_earning',
  'repair_commission_fee',
]);

/** Only this type moved the vendor's outstanding balance when it was posted. */
const BALANCE_CHANGING_TYPE = 'sell_buyback_payout';

const createdTime = (row) => new Date(row.created_at || 0).getTime();

/**
 * @param {Array<object>} rows vendor ledger rows (plain objects)
 * @returns {{ duplicates: object[], overchargeByVendor: Record<string, number> }}
 *   `duplicates` are the extra rows to remove (the earliest row of each job is
 *   kept); `overchargeByVendor` is how much each vendor's balance was raised
 *   by those extra payouts.
 */
export const findDuplicateLedgerEntries = (rows) => {
  const groups = new Map();
  for (const row of rows) {
    if (!row.reference_order_id || !ONCE_PER_JOB_TYPES.includes(row.type)) continue;
    const key = `${row.reference_order_id}::${row.type}`;
    groups.set(key, [...(groups.get(key) || []), row]);
  }

  const duplicates = [];
  const overchargeByVendor = {};
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [, ...extras] = [...group].sort((a, b) => createdTime(a) - createdTime(b));
    for (const extra of extras) {
      duplicates.push(extra);
      if (extra.type === BALANCE_CHANGING_TYPE) {
        const vendorId = String(extra.vendor_id);
        overchargeByVendor[vendorId] = (overchargeByVendor[vendorId] || 0) + (Number(extra.amount) || 0);
      }
    }
  }

  return { duplicates, overchargeByVendor };
};

/** The balance after removing an overcharge; never below zero. */
export const correctedBalance = (currentBalance, overcharge) =>
  Math.max(0, (Number(currentBalance) || 0) - (Number(overcharge) || 0));
