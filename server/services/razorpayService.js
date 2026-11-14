import crypto from 'node:crypto';
import { createHttpError } from '../utils/error.js';

const RAZORPAY_API = 'https://api.razorpay.com/v1';
const PAISE_PER_RUPEE = 100;

/** Keys come only from the environment. Returns null when either one is missing. */
export const getRazorpayCredentials = (env = process.env) => {
  const keyId = String(env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(env.RAZORPAY_KEY_SECRET || '').trim();
  return keyId && keySecret ? { keyId, keySecret } : null;
};

const NOT_CONFIGURED = 'Online payment is not configured on the server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing). Please use Cash on Delivery.';

const requireCredentials = (creds) => {
  if (!creds) throw createHttpError(503, NOT_CONFIGURED);
  return creds;
};

const basicAuth = ({ keyId, keySecret }) =>
  `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

/** Razorpay signs `order_id|payment_id` with the key secret (HMAC SHA256, hex). */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }, secret) => {
  if (!orderId || !paymentId || typeof signature !== 'string' || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const callRazorpay = async (path, init, { creds, fetchImpl = fetch }) => {
  const response = await fetchImpl(`${RAZORPAY_API}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: basicAuth(creds), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw createHttpError(502, 'Could not reach the payment provider. Please try again.');
  }
  return response.json();
};

export const createRazorpayOrder = async ({ amountRupees, receipt, notes }, { creds, fetchImpl } = {}) => {
  requireCredentials(creds);
  return callRazorpay(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        amount: Math.round(amountRupees * PAISE_PER_RUPEE),
        currency: 'INR',
        receipt: String(receipt).slice(0, 40),
        notes,
      }),
    },
    { creds, fetchImpl },
  );
};

export const fetchRazorpayOrder = (orderId, { creds, fetchImpl } = {}) =>
  callRazorpay(`/orders/${encodeURIComponent(orderId)}`, { method: 'GET' }, { creds: requireCredentials(creds), fetchImpl });

/**
 * Proves the browser really paid `expectedTotal` rupees: the signature must match,
 * and Razorpay itself must report that order as paid for exactly that amount.
 */
export const confirmRazorpayPayment = async (proof, expectedTotal, { creds, fetchOrder, fetchImpl } = {}) => {
  requireCredentials(creds);
  const orderId = proof?.order_id;
  const paymentId = proof?.payment_id;
  if (!verifyPaymentSignature({ orderId, paymentId, signature: proof?.signature }, creds.keySecret)) {
    throw createHttpError(400, 'Payment could not be verified.');
  }
  const remote = await (fetchOrder ?? ((id) => fetchRazorpayOrder(id, { creds, fetchImpl })))(orderId);
  const paidInFull =
    remote?.status === 'paid' &&
    remote?.currency === 'INR' &&
    remote?.amount === Math.round(expectedTotal * PAISE_PER_RUPEE);
  if (!paidInFull) {
    throw createHttpError(400, 'Payment amount does not match the order total.');
  }
};
