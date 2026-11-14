import crypto from 'node:crypto';
import { createHttpError } from '../utils/error.js';
import { confirmRazorpayPayment } from './razorpayService.js';
import { isPlausibleStorage, storageGb, variantPrice } from '../../shared/variantPricing.js';

const MAX_QUANTITY_PER_ITEM = 20;
const OTP_MIN = 1000;
const OTP_MAX_EXCLUSIVE = 10000;

/** 4 digit handover code, made on the server with a cryptographic random source. */
export const generateDeliveryOtp = (randomInt = crypto.randomInt) =>
  String(randomInt(OTP_MIN, OTP_MAX_EXCLUSIVE));

const parseQuantity = (raw) => {
  const quantity = raw === undefined || raw === null ? 1 : Number(raw);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
    throw createHttpError(400, 'Invalid item quantity.');
  }
  return quantity;
};

/** Storage options a listing allows; empty when it does not list any. */
const allowedStorageSizes = (doc) =>
  (Array.isArray(doc.available_storages) ? doc.available_storages : []).map(storageGb).filter(Boolean);

/**
 * One unit's price from the saved listing and the customer's storage/condition choice,
 * by the same rules the product page uses to show it. Spare parts have no variants.
 */
const unitPrice = (kind, doc, item) => {
  if (kind === 'spare_parts') return Number(doc.price);
  const choice = { storage: item?.storage || doc.storage, condition: item?.condition || doc.condition };
  const sizes = allowedStorageSizes(doc);
  const chosenGb = storageGb(choice.storage);
  const ownGb = storageGb(doc.storage);
  const hasChoice = Boolean(choice.storage);
  const allowed = !hasChoice || (sizes.length > 0 ? sizes.includes(chosenGb) || chosenGb === ownGb : isPlausibleStorage(choice.storage));
  if (!allowed) throw createHttpError(400, `That storage option is not available for ${doc.title || 'this item'}.`);
  return variantPrice(doc, choice);
};

/**
 * Prices a cart from the catalog. `lookup(kind, id)` returns the product or spare
 * part document ('products' | 'spare_parts') or null. Client prices are ignored.
 */
export const priceOrderItems = async (items, lookup) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, 'Your cart is empty.');
  }

  const priced = [];
  const unitsByListing = new Map();
  for (const item of items) {
    const isSparePart = Boolean(item?.spare_part_id);
    const kind = isSparePart ? 'spare_parts' : 'products';
    const id = isSparePart ? item.spare_part_id : item?.product_id || item?.id;
    const quantity = parseQuantity(item?.quantity);
    const doc = id ? await lookup(kind, String(id)) : null;

    if (!doc || doc.is_approved === false) {
      throw createHttpError(400, 'An item in your cart is no longer available.');
    }

    // Stock is one count per listing, however many storage/colour lines the cart splits it into.
    const listingKey = `${kind}:${String(id)}`;
    const wanted = (unitsByListing.get(listingKey) || 0) + quantity;
    unitsByListing.set(listingKey, wanted);
    if ((Number(doc.stock) || 0) < wanted) {
      throw createHttpError(409, `Not enough stock for ${doc.title || 'an item'}.`);
    }

    const price = unitPrice(kind, doc, item);
    if (!Number.isFinite(price) || price < 0) {
      throw createHttpError(400, 'An item in your cart has no valid price.');
    }
    priced.push({ ...item, price, quantity });
  }

  return {
    items: priced,
    total: priced.reduce((sum, it) => sum + it.price * it.quantity, 0),
    quantity: priced.reduce((sum, it) => sum + it.quantity, 0),
  };
};

const TRUSTED_ROLES = new Set(['admin', 'vendor', 'wholesaler']);

/** Admin, staff and vendor order writes keep their existing behaviour. */
export const isTrustedOrderWriter = (auth) => TRUSTED_ROLES.has(auth?.role);

/**
 * Makes a customer's order trustworthy before it is saved: prices and total come
 * from the catalog, the payment is pending unless Razorpay proves otherwise, and
 * the OTP is made here. `deps` = { lookup, paymentUsed, creds, fetchOrder?, fetchImpl? }.
 */
export const secureCustomerOrder = async (order, auth, deps) => {
  if (isTrustedOrderWriter(auth)) return order;

  const { items, total, quantity } = await priceOrderItems(order.items, deps.lookup);
  const { razorpay, ...rest } = order;
  const secured = {
    ...rest,
    items,
    quantity,
    total_amount: total,
    payment_status: 'pending',
    delivery_otp: generateDeliveryOtp(),
    delivery_otp_created_at: new Date().toISOString(),
  };

  if (order.payment_method !== 'razorpay') return { ...secured, payment_method: 'cod' };

  if (!razorpay?.order_id || !razorpay?.payment_id || !razorpay?.signature) {
    throw createHttpError(400, 'Online payment was not completed.');
  }
  await confirmRazorpayPayment(razorpay, total, deps);
  if (await deps.paymentUsed(razorpay.payment_id)) {
    throw createHttpError(409, 'This payment was already used for another order.');
  }
  return {
    ...secured,
    payment_status: 'paid',
    razorpay_order_id: razorpay.order_id,
    razorpay_payment_id: razorpay.payment_id,
  };
};
