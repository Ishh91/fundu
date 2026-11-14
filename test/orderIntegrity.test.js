import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  generateDeliveryOtp,
  priceOrderItems,
  secureCustomerOrder,
} from '../server/services/orderSecurity.js';
import {
  getRazorpayCredentials,
  verifyPaymentSignature,
  confirmRazorpayPayment,
  createRazorpayOrder,
} from '../server/services/razorpayService.js';
import { preparePayload } from '../server/services/dbService.js';

const SECRET = 'test_secret_value';
const sign = (orderId, paymentId, secret = SECRET) =>
  crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

const catalog = {
  'products:p1': { id: 'p1', price: 10000, stock: 5, is_approved: true, title: 'Phone' },
  'products:p2': { id: 'p2', price: 500, stock: 1, is_approved: true },
  'products:hidden': { id: 'hidden', price: 1, stock: 5, is_approved: false },
  'products:empty': { id: 'empty', price: 1, stock: 0, is_approved: true },
  'spare_parts:s1': { id: 's1', price: 250, stock: 9, is_approved: true },
};
const lookup = async (kind, id) => catalog[`${kind}:${id}`] ?? null;

describe('generateDeliveryOtp', () => {
  it('makes a 4 digit code from the injected random source', () => {
    assert.equal(generateDeliveryOtp(() => 1234), '1234');
    assert.match(generateDeliveryOtp(), /^\d{4}$/);
  });
});

describe('priceOrderItems', () => {
  it('ignores client prices and totals from the catalog', async () => {
    const result = await priceOrderItems(
      [
        { product_id: 'p1', price: 1, quantity: 2 },
        { spare_part_id: 's1', price: 1, quantity: 1 },
      ],
      lookup,
    );
    assert.equal(result.total, 20250);
    assert.equal(result.quantity, 3);
    assert.deepEqual(result.items.map((i) => i.price), [10000, 250]);
  });

  it('rejects empty carts, unknown, unapproved and out of stock items', async () => {
    await assert.rejects(priceOrderItems([], lookup), { status: 400 });
    await assert.rejects(priceOrderItems([{ product_id: 'nope' }], lookup), { status: 400 });
    await assert.rejects(priceOrderItems([{ product_id: 'hidden' }], lookup), { status: 400 });
    await assert.rejects(priceOrderItems([{ product_id: 'empty' }], lookup), { status: 409 });
    await assert.rejects(priceOrderItems([{ product_id: 'p2', quantity: 2 }], lookup), { status: 409 });
  });

  it('rejects bad quantities', async () => {
    for (const quantity of [0, -1, 1.5, 'x', 1000]) {
      await assert.rejects(priceOrderItems([{ product_id: 'p1', quantity }], lookup), { status: 400 });
    }
  });
});

describe('razorpay signature', () => {
  it('reads credentials only from env and reports a missing secret', () => {
    assert.equal(getRazorpayCredentials({}), null);
    assert.equal(getRazorpayCredentials({ RAZORPAY_KEY_ID: 'k' }), null);
    assert.deepEqual(getRazorpayCredentials({ RAZORPAY_KEY_ID: 'k', RAZORPAY_KEY_SECRET: 's' }), { keyId: 'k', keySecret: 's' });
  });

  it('accepts a correct HMAC and rejects tampering', () => {
    const good = { orderId: 'order_1', paymentId: 'pay_1', signature: sign('order_1', 'pay_1') };
    assert.equal(verifyPaymentSignature(good, SECRET), true);
    assert.equal(verifyPaymentSignature({ ...good, paymentId: 'pay_2' }, SECRET), false);
    assert.equal(verifyPaymentSignature({ ...good, signature: 'abc' }, SECRET), false);
    assert.equal(verifyPaymentSignature({ ...good, signature: undefined }, SECRET), false);
    assert.equal(verifyPaymentSignature(good, 'other'), false);
  });
});

describe('confirmRazorpayPayment', () => {
  const proof = { order_id: 'order_1', payment_id: 'pay_1', signature: sign('order_1', 'pay_1') };
  const creds = { keyId: 'k', keySecret: SECRET };
  const fetchOrder = (over = {}) => async () => ({ id: 'order_1', amount: 2000000, currency: 'INR', status: 'paid', ...over });

  it('passes when signature, amount and status all match', async () => {
    await confirmRazorpayPayment(proof, 20000, { creds, fetchOrder: fetchOrder() });
  });

  it('fails on bad signature, wrong amount, or unpaid order', async () => {
    await assert.rejects(confirmRazorpayPayment({ ...proof, signature: 'x' }, 20000, { creds, fetchOrder: fetchOrder() }), { status: 400 });
    await assert.rejects(confirmRazorpayPayment(proof, 20000, { creds, fetchOrder: fetchOrder({ amount: 100 }) }), { status: 400 });
    await assert.rejects(confirmRazorpayPayment(proof, 20000, { creds, fetchOrder: fetchOrder({ status: 'created' }) }), { status: 400 });
  });

  it('says so clearly when the secret is not configured', async () => {
    await assert.rejects(confirmRazorpayPayment(proof, 20000, { creds: null }), { status: 503, message: /not configured/i });
  });
});

describe('createRazorpayOrder', () => {
  it('posts the amount in paise with basic auth and returns the order', async () => {
    let seen;
    const fetchImpl = async (url, init) => {
      seen = { url, init };
      return { ok: true, json: async () => ({ id: 'order_9', amount: 12300, currency: 'INR' }) };
    };
    const order = await createRazorpayOrder({ amountRupees: 123, receipt: 'r1' }, { creds: { keyId: 'k', keySecret: 's' }, fetchImpl });
    assert.equal(order.id, 'order_9');
    assert.equal(JSON.parse(seen.init.body).amount, 12300);
    assert.match(seen.init.headers.Authorization, /^Basic /);
  });

  it('refuses without credentials', async () => {
    await assert.rejects(createRazorpayOrder({ amountRupees: 1, receipt: 'r' }, { creds: null }), { status: 503 });
  });
});

describe('secureCustomerOrder', () => {
  const customer = { sub: 'u1', role: 'customer' };
  const base = (over = {}) => ({
    delivery_name: 'A',
    delivery_phone: '1',
    total_amount: 1,
    payment_status: 'paid',
    payment_method: 'cod',
    delivery_otp: '0000',
    items: [{ product_id: 'p1', price: 1, quantity: 2 }],
    ...over,
  });
  const deps = (over = {}) => ({
    lookup,
    paymentUsed: async () => false,
    creds: { keyId: 'k', keySecret: SECRET },
    fetchOrder: async () => ({ amount: 2000000, currency: 'INR', status: 'paid' }),
    ...over,
  });
  const proof = { order_id: 'order_1', payment_id: 'pay_1', signature: sign('order_1', 'pay_1') };

  it('recomputes total, forces pending and replaces the OTP for COD', async () => {
    const out = await secureCustomerOrder(base(), customer, deps());
    assert.equal(out.total_amount, 20000);
    assert.equal(out.quantity, 2);
    assert.equal(out.payment_status, 'pending');
    assert.match(out.delivery_otp, /^\d{4}$/);
    assert.equal(out.items[0].price, 10000);
  });

  it('marks razorpay orders paid only with a verified payment for the same amount', async () => {
    const ok = await secureCustomerOrder(base({ payment_method: 'razorpay', razorpay: proof }), customer, deps());
    assert.equal(ok.payment_status, 'paid');
    assert.equal(ok.razorpay_payment_id, 'pay_1');
    assert.equal('razorpay' in ok, false);

    await assert.rejects(secureCustomerOrder(base({ payment_method: 'razorpay' }), customer, deps()), { status: 400 });
    await assert.rejects(
      secureCustomerOrder(base({ payment_method: 'razorpay', razorpay: { ...proof, signature: 'bad' } }), customer, deps()),
      { status: 400 },
    );
    await assert.rejects(
      secureCustomerOrder(
        base({ payment_method: 'razorpay', razorpay: proof }),
        customer,
        deps({ fetchOrder: async () => ({ amount: 100, currency: 'INR', status: 'paid' }) }),
      ),
      { status: 400 },
    );
  });

  it('refuses to reuse one payment for a second order', async () => {
    await assert.rejects(
      secureCustomerOrder(base({ payment_method: 'razorpay', razorpay: proof }), customer, deps({ paymentUsed: async () => true })),
      { status: 409 },
    );
  });

  it('keeps COD working when the Razorpay secret is missing', async () => {
    const out = await secureCustomerOrder(base(), customer, deps({ creds: null }));
    assert.equal(out.payment_status, 'pending');
  });

  it('leaves admin and vendor orders untouched', async () => {
    const order = base();
    assert.equal(await secureCustomerOrder(order, { sub: 'a', role: 'admin' }, deps()), order);
    assert.equal(await secureCustomerOrder(order, { sub: 'v', role: 'vendor' }, deps()), order);
  });
});

describe('preparePayload for customer order edits', () => {
  it('strips money, payment and OTP fields from a customer update', () => {
    const out = preparePayload(
      'orders',
      'update',
      {
        status: 'cancelled',
        total_amount: 1,
        payment_status: 'paid',
        items: [],
        delivery_otp: '1',
        delivery_otp_created_at: 'x',
        payment_method: 'cod',
      },
      { sub: 'u1', role: 'customer' },
    );
    assert.deepEqual(out, { status: 'cancelled' });
  });

  it('lets admins edit those fields', () => {
    const out = preparePayload('orders', 'update', { payment_status: 'paid' }, { sub: 'a', role: 'admin' });
    assert.equal(out.payment_status, 'paid');
  });
});

describe('priceOrderItems with storage and condition choices', () => {
  const phone = { id: 'v1', price: 20000, storage: '128 GB', condition: 'Superb', stock: 3, is_approved: true, title: 'Phone', available_storages: ['128 GB', '256 GB'] };
  const variantLookup = async (kind, id) => (kind === 'products' && id === 'v1' ? phone : null);

  it('charges the same price the product page shows for the chosen storage and grade', async () => {
    const result = await priceOrderItems(
      [{ product_id: 'v1', quantity: 1, price: 1, storage: '256 GB', condition: 'Good' }],
      variantLookup,
    );
    assert.equal(result.items[0].price, 21850);
    assert.equal(result.total, 21850);
  });

  it('refuses a storage the listing does not offer', async () => {
    await assert.rejects(
      priceOrderItems([{ product_id: 'v1', quantity: 1, storage: '64 GB' }], variantLookup),
      /storage option is not available/,
    );
  });

  it('counts one listing once even when the cart splits it over several lines', async () => {
    await assert.rejects(
      priceOrderItems(
        [
          { product_id: 'v1', quantity: 2, storage: '128 GB' },
          { product_id: 'v1', quantity: 2, storage: '256 GB' },
        ],
        variantLookup,
      ),
      /Not enough stock/,
    );
  });
});
