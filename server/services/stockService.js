import { Types } from 'mongoose';
import { createHttpError } from '../utils/error.js';
import { findVariantEntry } from '../../shared/variantStock.js';

const idFilterFor = (productId) => ({
  $or: [{ _id: Types.ObjectId.isValid(productId) ? new Types.ObjectId(productId) : null }, { id: productId }],
});

const entryMatch = (entry, extra = {}) => {
  const match = { ...extra };
  if (entry.storage) match.storage = entry.storage;
  if (entry.color) match.color = entry.color;
  return { variant_stock: { $elemMatch: match } };
};

/**
 * Takes ('take') or returns ('give') `qty` units for one order line. A listing that counts stock per
 * variant changes that variant's count and the total together, and 'take' only succeeds while the
 * variant still has the units, so two buyers can never get the last piece. Other listings change their
 * single count as before. Returns false only when a counted variant has too few units left.
 */
export const adjustProductStock = async (Product, productId, item, qty, direction) => {
  const idFilter = idFilterFor(productId);
  const doc = await Product.findOne(idFilter).lean();
  if (!doc) return true;

  const entry = findVariantEntry(doc, { storage: item?.storage, color: item?.color });
  const sign = direction === 'take' ? -1 : 1;
  if (!entry) {
    await Product.findOneAndUpdate(idFilter, { $inc: { stock: sign * qty } });
    return true;
  }

  const filter = {
    $and: [idFilter, entryMatch(entry, direction === 'take' ? { stock: { $gte: qty } } : {})],
  };
  const updated = await Product.findOneAndUpdate(filter, {
    $inc: { 'variant_stock.$.stock': sign * qty, stock: sign * qty },
  });
  return Boolean(updated);
};

const lineQuantity = (item) => Math.max(Number(item?.quantity) || 1, 1);
const lineProductId = (item) => item?.product_id || item?.id || item?._id;

/** Gives back what `reserveOrderStock` took. Failures are logged, never thrown. */
export const releaseOrderStock = async (Product, taken) => {
  for (const { productId, item, qty } of taken) {
    try {
      await adjustProductStock(Product, productId, item, qty, 'give');
    } catch (err) {
      console.warn('Notice restoring stock:', err);
    }
  }
};

/**
 * Takes the stock for every product line of the orders. If a counted variant has sold out in the
 * meantime, everything already taken is given back and a 409 is thrown. Returns what was taken.
 */
export const reserveOrderStock = async (Product, orders) => {
  const taken = [];
  for (const order of orders) {
    for (const item of Array.isArray(order.items) ? order.items : []) {
      const productId = lineProductId(item);
      if (!productId) continue;
      const qty = lineQuantity(item);
      let ok = true;
      try {
        ok = await adjustProductStock(Product, productId, item, qty, 'take');
      } catch (err) {
        console.warn('Notice updating product stock for order:', err);
        continue;
      }
      if (!ok) {
        await releaseOrderStock(Product, taken);
        throw createHttpError(409, `Not enough stock for ${item.title || 'an item'}.`);
      }
      taken.push({ productId, item, qty });
    }
  }
  return taken;
};
