import { db } from './db';

// Hardcoded Baseline Admin WhatsApp Numbers (Always Included)
export const BASELINE_ADMIN_NUMBERS = [
  '9105783553', // Primary Admin WhatsApp
  '9839122345', // Fundu Official Helpline WhatsApp
];

/**
 * Normalizes phone numbers to standard 12-digit Indian format (91XXXXXXXXXX)
 */
export function normalizePhone(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10) return `91${digits.slice(-10)}`;
  return null;
}

/**
 * Dynamically resolves all admin phone numbers:
 * 1. Default baseline numbers ('9105783553' and '9839122345')
 * 2. Any user assigned 'admin' role in the database (automatically loaded and cached)
 */
export async function getAdminNotificationNumbers(): Promise<string[]> {
  const numberSet = new Set<string>();

  // Add default baseline numbers
  BASELINE_ADMIN_NUMBERS.forEach((num) => {
    const norm = normalizePhone(num);
    if (norm) numberSet.add(norm);
  });

  // Check cached admin numbers from localStorage for instantaneous response
  try {
    const cached = localStorage.getItem('fundu_cached_admin_phones');
    if (cached) {
      const parsed: string[] = JSON.parse(cached);
      parsed.forEach((n) => {
        const norm = normalizePhone(n);
        if (norm) numberSet.add(norm);
      });
    }
  } catch {}

  // Fetch live active admins from database profiles
  try {
    const { data: adminProfiles } = await db
      .from('profiles')
      .select('phone, role')
      .eq('role', 'admin');

    if (adminProfiles && Array.isArray(adminProfiles)) {
      const dbPhones: string[] = [];
      adminProfiles.forEach((p: any) => {
        if (p?.phone) {
          const norm = normalizePhone(p.phone);
          if (norm) {
            numberSet.add(norm);
            dbPhones.push(norm);
          }
        }
      });
      // Cache for offline/instant next lookup
      localStorage.setItem('fundu_cached_admin_phones', JSON.stringify(dbPhones));
    }
  } catch (err) {
    console.warn('⚠️ [WhatsApp] Could not refresh live admin profiles, using baseline numbers:', err);
  }

  return Array.from(numberSet);
}

/**
 * Builds direct WhatsApp URL for sending message with guaranteed 91 international prefix
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const norm = normalizePhone(phone) || (phone.startsWith('91') ? phone : `91${phone}`);
  return `https://api.whatsapp.com/send?phone=${norm}&text=${encodeURIComponent(text)}`;
}

import { API_BASE } from '../config/apiConfig';

/**
 * Dispatches automated WhatsApp notification:
 * Calls server-side WhatsApp API (/api/whatsapp/send) for direct automated delivery
 * without opening WhatsApp manually.
 */
export async function dispatchWhatsAppAlert(text: string, autoOpenInBrowser: boolean = false) {
  const adminPhones = await getAdminNotificationNumbers();
  const urls: string[] = [];

  adminPhones.forEach((phone) => {
    const url = buildWhatsAppUrl(phone, text);
    urls.push(url);
  });

  // 1. DIRECT AUTOMATED SERVER-SIDE WHATSAPP API DISPATCH
  try {
    const apiBase = API_BASE.replace(/\/$/, '');
    await fetch(`${apiBase}/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numbers: adminPhones,
        message: text,
      }),
    });
    console.log(`🤖 [Automated WhatsApp API Dispatched] to admins:`, adminPhones);
  } catch (apiErr) {
    console.warn('⚠️ [WhatsApp Backend API Error]:', apiErr);
  }

  // 2. Optional Manual Browser Open (Only if explicitly requested)
  if (autoOpenInBrowser) {
    adminPhones.forEach((phone, idx) => {
      const url = buildWhatsAppUrl(phone, text);
      if (idx === 0) {
        try {
          const win = window.open(url, '_blank');
          if (win) win.focus();
        } catch {}
      }
    });
  }

  return { success: true, adminPhones, urls };
}

// =========================================================================
// 1. BUY PHONE ORDER NOTIFICATION
// =========================================================================
export interface BuyOrderNotificationData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
}

export async function notifyNewBuyOrder(data: BuyOrderNotificationData, autoOpen: boolean = false) {
  const msg =
    `🛒 *NEW BUY PHONE ORDER RECEIVED!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Order ID:* #${data.orderId.slice(0, 8).toUpperCase()}\n` +
    `👤 *Customer:* ${data.customerName}\n` +
    `📞 *Phone:* ${data.customerPhone}\n` +
    (data.customerEmail ? `✉️ *Email:* ${data.customerEmail}\n` : '') +
    `📱 *Item(s):* ${data.itemsSummary}\n` +
    `💰 *Total Amount:* ₹${data.totalAmount.toLocaleString('en-IN')}\n` +
    `💳 *Payment:* ${data.paymentMethod.toUpperCase()} (${data.paymentStatus.toUpperCase()})\n` +
    `📍 *Delivery Address:* ${data.deliveryAddress}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ Please assign a field rider in Admin Portal: ${window.location.origin}/admin`;

  return await dispatchWhatsAppAlert(msg, autoOpen);
}

// =========================================================================
// 2. SELL PHONE PICKUP NOTIFICATION
// =========================================================================
export interface SellRequestNotificationData {
  requestId: string;
  customerName: string;
  customerPhone: string;
  brand: string;
  model: string;
  storage?: string;
  condition?: string;
  offeredPrice: number;
  pickupAddress: string;
  pickupDate: string;
  pickupSlot: string;
}

export async function notifyNewSellRequest(data: SellRequestNotificationData, autoOpen: boolean = false) {
  const msg =
    `📱 *NEW SELL PHONE PICKUP BOOKED!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Booking ID:* #${data.requestId.slice(0, 8).toUpperCase()}\n` +
    `👤 *Customer:* ${data.customerName}\n` +
    `📞 *Phone:* ${data.customerPhone}\n` +
    `📱 *Device:* ${data.brand} ${data.model} (${data.storage || 'Standard'})\n` +
    (data.condition ? `⚙️ *Condition:* ${data.condition}\n` : '') +
    `💵 *Quoted Value:* ₹${data.offeredPrice.toLocaleString('en-IN')}\n` +
    `📅 *Pickup Schedule:* ${data.pickupDate} (${data.pickupSlot})\n` +
    `📍 *Pickup Address:* ${data.pickupAddress}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ Check & dispatch rider in Admin Portal: ${window.location.origin}/admin`;

  return await dispatchWhatsAppAlert(msg, autoOpen);
}

// =========================================================================
// 3. REPAIR BOOKING NOTIFICATION
// =========================================================================
export interface RepairBookingNotificationData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  brand: string;
  model: string;
  problem: string;
  estimatedCost: number;
  pickupAddress: string;
  pickupDate?: string | null;
  pickupSlot?: string | null;
}

export async function notifyNewRepairBooking(data: RepairBookingNotificationData, autoOpen: boolean = false) {
  const msg =
    `🔧 *NEW 30-MIN DOORSTEP REPAIR BOOKING!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Repair ID:* #${data.bookingId.slice(0, 8).toUpperCase()}\n` +
    `👤 *Customer:* ${data.customerName}\n` +
    `📞 *Phone:* ${data.customerPhone}\n` +
    `📱 *Model:* ${data.brand} ${data.model}\n` +
    `⚠️ *Issue / Fault:* ${data.problem}\n` +
    `💰 *Estimated Cost:* ₹${data.estimatedCost.toLocaleString('en-IN')}\n` +
    (data.pickupDate ? `📅 *Date & Slot:* ${data.pickupDate} (${data.pickupSlot || 'Standard'})\n` : '') +
    `📍 *Doorstep Address:* ${data.pickupAddress}\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ Assign technician in Admin Portal: ${window.location.origin}/admin`;

  return await dispatchWhatsAppAlert(msg, autoOpen);
}

// =========================================================================
// 4. CONTACT FORM MESSAGE NOTIFICATION
// =========================================================================
export interface ContactMessageNotificationData {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export async function notifyNewContactMessage(data: ContactMessageNotificationData, autoOpen: boolean = false) {
  const msg =
    `📩 *NEW CONTACT FORM ENQUIRY!*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *From:* ${data.name}\n` +
    `✉️ *Email:* ${data.email}\n` +
    `📞 *Phone:* ${data.phone || 'Not Provided'}\n` +
    `📌 *Subject:* ${data.subject}\n` +
    `💬 *Message:*\n"${data.message}"\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡ Reply to customer or view in Admin Console: ${window.location.origin}/admin`;

  return await dispatchWhatsAppAlert(msg, autoOpen);
}
