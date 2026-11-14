import { Router } from 'express';
import { Types } from 'mongoose';
import { Product, SparePart } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { createHttpError } from '../utils/error.js';
import { priceOrderItems } from '../services/orderSecurity.js';
import { createRazorpayOrder, getRazorpayCredentials } from '../services/razorpayService.js';

const router = Router();
const limiter = createRateLimiter({ windowMs: 60 * 1000, max: 20 });

const lookupCatalogItem = async (kind, id) => {
  const Model = kind === 'spare_parts' ? SparePart : Product;
  const filter = Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { id }] } : { id };
  return Model.findOne(filter).lean();
};

/** Tells the checkout page whether online payment can be offered at all. */
router.get('/razorpay/status', (_req, res) => {
  res.json({ data: { enabled: Boolean(getRazorpayCredentials()) } });
});

/** Creates a Razorpay order whose amount the server computes from the catalog. */
router.post('/razorpay/order', async (req, res) => {
  try {
    requireAuth(req.auth);
    const { allowed } = limiter.take(req.auth.sub);
    if (!allowed) throw createHttpError(429, 'Too many payment attempts. Please wait a minute.');

    const creds = getRazorpayCredentials();
    if (!creds) throw createHttpError(503, 'Online payment is not available right now. Please use Cash on Delivery.');

    const { total } = await priceOrderItems(req.body?.items, lookupCatalogItem);
    const order = await createRazorpayOrder(
      { amountRupees: total, receipt: `fundu_${Date.now()}`, notes: { user_id: String(req.auth.sub) } },
      { creds },
    );
    res.json({ data: { order_id: order.id, amount: order.amount, currency: order.currency, key_id: creds.keyId } });
  } catch (error) {
    res.status(error?.status || 500).json({ error: error?.status ? error.message : 'Could not start the payment.' });
  }
});

export default router;
