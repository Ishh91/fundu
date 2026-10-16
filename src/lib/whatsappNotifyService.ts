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

/**
 * Dispatches WhatsApp notification:
 * Opens WhatsApp link for primary admin and logs dispatch for all registered admins
 */
export async function dispatchWhatsAppAlert(text: string, autoOpenPrimary: boolean = true) {
  const adminPhones = await getAdminNotificationNumbers();
  const urls: string[] = [];

  adminPhones.forEach((phone, idx) => {
    const url = buildWhatsAppUrl(phone, text);
    urls.push(url);
    console.log(`📲 [WhatsApp Notification Prepared] To: +${phone} -> ${url}`);

    // Auto-open admin WhatsApp windows if requested
    if (autoOpenPrimary) {
      if (idx === 0) {
        try {
          const win = window.open(url, '_blank');
          if (win) win.focus();
        } catch (e) {
          console.warn('⚠️ Popup blocked for auto WhatsApp dispatch. Link:', url);
        }
      } else {
        // Stagger second admin window to minimize browser popup blocking
        setTimeout(() => {
          try {
            window.open(url, '_blank');
          } catch (e) {
            console.warn('⚠️ Popup blocked for secondary WhatsApp dispatch. Link:', url);
          }
        }, 400 * idx);
      }
    }
  });

  // Background server email alert for 100% guarantee (does not block user UI)
  try {
    const apiBase = (typeof window !== 'undefined' && (window as any).__API_BASE__) || 'https://fundu.onrender.com/api';
    fetch(`${apiBase}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'trustiqueassist0003@gmail.com',
        subject: `🚨 [FUNDU INSTANT ALERT] New Activity Triggered`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background-color: #0f172a; padding: 16px; border-radius: 12px; text-align: center; color: white;">
              <h2 style="margin: 0; color: #14b8a6;">FUNDU AUTOMATED ALERT</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Instant Multi-Admin Notification</p>
            </div>
            <div style="padding: 20px 0; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">
${text}
            </div>
            <div style="text-align: center; margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <a href="${urls[0] || '#'}" style="background-color: #25d366; color: white; padding: 10px 18px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin: 4px;">
                💬 Open WhatsApp (Admin 9105783553)
              </a>
              <a href="${urls[1] || '#'}" style="background-color: #075e54; color: white; padding: 10px 18px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin: 4px;">
                💬 Open WhatsApp (Helpline 9839122345)
              </a>
            </div>
          </div>
        `,
      }),
    }).catch(() => {});
  } catch {}

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

export async function notifyNewBuyOrder(data: BuyOrderNotificationData, autoOpen: boolean = true) {
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

export async function notifyNewSellRequest(data: SellRequestNotificationData, autoOpen: boolean = true) {
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

export async function notifyNewRepairBooking(data: RepairBookingNotificationData, autoOpen: boolean = true) {
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

export async function notifyNewContactMessage(data: ContactMessageNotificationData, autoOpen: boolean = true) {
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
