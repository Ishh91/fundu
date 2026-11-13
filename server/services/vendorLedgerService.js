import { User, VendorLedger } from '../models/index.js';

const COMMISSION_RATE = 0.10;

const referenceIdOf = (doc) => String(doc.id || doc._id || '');
const vendorNameOf = (vendor) => vendor.business_name || vendor.full_name;

/**
 * True when this job was already posted to the vendor ledger. Updates to a
 * finished sell request or repair (a note, a status tweak) run the same hook
 * again; without this check each one charged the vendor a second time.
 */
export const isAlreadyPosted = async (referenceId, type, Ledger = VendorLedger) => {
  if (!referenceId) return true;
  return Boolean(await Ledger.exists({ reference_order_id: referenceId, type }));
};

export const isBuybackSettled = (doc) =>
  Boolean(
    (doc.vendor_quote_status === 'user_accepted' || doc.status === 'completed') &&
      doc.assigned_vendor_id &&
      doc.vendor_quote_price,
  );

export const isRepairSettled = (doc) =>
  Boolean(
    (doc.quotation_status === 'user_accepted' || doc.quotation_status === 'paid' || doc.status === 'paid') &&
      doc.assigned_vendor_id &&
      doc.vendor_quotation_amount,
  );

/** Stock goes back to the shelf only on the update that cancels the order, not on later edits. */
export const shouldRestoreStock = (previousStatus, newStatus) =>
  newStatus === 'cancelled' && previousStatus !== 'cancelled';

/** Charges the vendor's credit for a phone bought from a seller, once per sell request. */
export const postBuybackToLedger = async (doc, { Ledger = VendorLedger, Users = User } = {}) => {
  if (!isBuybackSettled(doc)) return false;
  const referenceId = referenceIdOf(doc);
  if (await isAlreadyPosted(referenceId, 'sell_buyback_payout', Ledger)) return false;

  const vendor = await Users.findById(doc.assigned_vendor_id);
  if (!vendor) return false;

  const buybackPrice = Number(doc.vendor_quote_price) || 0;
  const commissionAmount = Math.round(buybackPrice * COMMISSION_RATE);
  const balanceBefore = vendor.outstanding_balance || 0;
  const balanceAfter = balanceBefore + buybackPrice;
  const common = {
    vendor_id: vendor._id.toString(),
    vendor_name: vendorNameOf(vendor),
    reference_order_id: referenceId,
  };

  await Ledger.create({
    ...common,
    type: 'sell_buyback_payout',
    amount: buybackPrice,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    payment_mode: 'Website Limit Credit',
    notes: `Purchased user phone (${doc.brand} ${doc.model}) via website credit limit.`,
  });
  await Users.findByIdAndUpdate(vendor._id, { $inc: { outstanding_balance: buybackPrice } });
  await Ledger.create({
    ...common,
    type: 'sell_commission_fee',
    amount: commissionAmount,
    balance_before: balanceAfter,
    balance_after: balanceAfter,
    payment_mode: '10% Platform Commission',
    notes: `10% Platform commission fee on mobile buyback ₹${buybackPrice}.`,
  });
  return true;
};

/** Records the vendor's earning and the platform commission for a repair, once per booking. */
export const postRepairToLedger = async (doc, { Ledger = VendorLedger, Users = User } = {}) => {
  if (!isRepairSettled(doc)) return false;
  const referenceId = referenceIdOf(doc);
  if (await isAlreadyPosted(referenceId, 'repair_earning', Ledger)) return false;

  const vendor = await Users.findById(doc.assigned_vendor_id);
  if (!vendor) return false;

  const totalRepairCost = Number(doc.vendor_quotation_amount) || 0;
  const commissionAmount = Math.round(totalRepairCost * COMMISSION_RATE);
  const vendorEarning = totalRepairCost - commissionAmount;
  const balance = vendor.outstanding_balance || 0;
  const common = {
    vendor_id: vendor._id.toString(),
    vendor_name: vendorNameOf(vendor),
    reference_order_id: referenceId,
    balance_before: balance,
    balance_after: balance,
  };

  await Ledger.create({
    ...common,
    type: 'repair_earning',
    amount: vendorEarning,
    payment_mode: 'User Website Payment',
    notes: `Earned 90% (₹${vendorEarning}) for repairing ${doc.brand} ${doc.model} (${doc.problem}).`,
  });
  await Ledger.create({
    ...common,
    type: 'repair_commission_fee',
    amount: commissionAmount,
    payment_mode: '10% Platform Commission',
    notes: `10% Platform commission fee on repair job ₹${totalRepairCost}.`,
  });
  return true;
};
