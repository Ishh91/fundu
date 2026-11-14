import { API_BASE } from '../config/apiConfig';
import { authHeaders } from './db';

export type RazorpayServerOrder = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type RazorpayProof = {
  order_id: string;
  payment_id: string;
  signature: string;
};

type CartLine = { product_id: string | null; spare_part_id: string | null; quantity: number };

/** Asks the server to open a Razorpay order; the server works out the amount from its own prices. */
export async function createServerRazorpayOrder(items: CartLine[]): Promise<RazorpayServerOrder> {
  const response = await fetch(`${API_BASE}/payments/razorpay/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ items }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : 'Could not start the payment.');
  }
  return payload.data as RazorpayServerOrder;
}
