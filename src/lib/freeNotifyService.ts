/**
 * Free Notification Helper Service for Fundu App
 * 100% FREE Tier Options for Email, WhatsApp, and SMS Notifications
 */

export interface NotificationPayload {
  orderId: string;
  agentName: string;
  agentPhone: string;
  agentEmail?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
}

/**
 * METHOD 1: WhatsApp Deep Link (100% FREE FOREVER, No API Keys or Credit Card Required)
 * Directly opens WhatsApp Web or WhatsApp Mobile App with pre-formatted message payload.
 */
export function sendFreeWhatsAppNotification(payload: NotificationPayload) {
  const cleanPhone = payload.agentPhone.replace(/\D/g, '') || '9839122345';
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const text =
    `🚨 *FUNDU NEW DISPATCH TASK ASSIGNED*\n\n` +
    `Hi *${payload.agentName}*,\n` +
    `You have been assigned a new doorstep delivery task in Lucknow!\n\n` +
    `📋 *Order ID:* #${payload.orderId.slice(0, 8).toUpperCase()}\n` +
    `👤 *Customer Name:* ${payload.customerName}\n` +
    `📞 *Customer Phone:* ${payload.customerPhone}\n` +
    `📍 *Delivery Address:* ${payload.deliveryAddress}\n` +
    `💰 *Payable Amount:* ₹${payload.totalAmount.toLocaleString('en-IN')}\n\n` +
    `🧭 *GPS Navigation:* https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(payload.deliveryAddress + ', Lucknow')}\n\n` +
    `Please log in to your private fleet desk: ${window.location.origin}/fleet-desk`;

  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
  return { success: true, url: whatsappUrl };
}

/**
 * METHOD 2: Resend Email API (3,000 FREE Emails / Month)
 * Free API setup: Sign up at resend.com -> get free API key -> 3,000 free emails/month.
 */
export async function sendFreeEmailResend(
  payload: NotificationPayload,
  apiKey: string = (import.meta.env.VITE_RESEND_API_KEY as string | undefined) || ''
) {
  const recipientEmail = payload.agentEmail || 'trustiqueassist0003@gmail.com';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="background-color: #0f172a; padding: 16px; border-radius: 12px; text-align: center; color: white;">
        <h2 style="margin: 0; color: #14b8a6;">FUNDU DISPATCH ALERT</h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Lucknow Doorstep Logistics Network</p>
      </div>

      <div style="padding: 20px 0;">
        <p>Hi <strong>${payload.agentName}</strong>,</p>
        <p>A new order task has been assigned to you. Here are the details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Order ID</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">#${payload.orderId.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Customer</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${payload.customerName} (${payload.customerPhone})</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Address</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${payload.deliveryAddress}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Amount to Collect</td>
            <td style="padding: 10px; font-weight: bold; color: #0d9488; border-bottom: 1px solid #e2e8f0;">₹${payload.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(payload.deliveryAddress + ', Lucknow')}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block;">
            📍 Open Turn-by-Turn GPS Navigation
          </a>
        </div>
      </div>
    </div>
  `;

  // Try local server endpoint first if on localhost, then remote endpoint
  const getEndpointsToTry = (): string[] => {
    const endpoints: string[] = [];
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        endpoints.push('http://localhost:4000/api/email/send');
      }
    }
    const envUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'https://fundu.onrender.com/api';
    const clean = envUrl.trim().replace(/\/$/, '');
    const remoteEndpoint = clean.endsWith('/email/send') ? clean : `${clean}/email/send`;
    if (!endpoints.includes(remoteEndpoint)) {
      endpoints.push(remoteEndpoint);
    }
    return endpoints;
  };

  const endpoints = getEndpointsToTry();
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Fundu Dispatch <onboarding@resend.dev>',
          to: recipientEmail,
          subject: `🚨 NEW TASK ASSIGNED: Order #${payload.orderId.slice(0, 8).toUpperCase()}`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`[Resend Dispatch] Attempt to ${endpoint} failed:`, err);
    }
  }

  console.log(`🎉 [Resend Email Simulated] Dispatch to ${recipientEmail} logged. (Deploy backend to Render for live delivery).`);
  return { success: true, simulated: true, recipient: recipientEmail };
}

/**
 * METHOD 3: Meta WhatsApp Cloud API (1,000 FREE Conversations / Month)
 * Free API setup: Sign up at developers.facebook.com -> WhatsApp Cloud API -> 1,000 free conversations every month.
 */
export async function sendFreeMetaWhatsApp(
  payload: NotificationPayload,
  accessToken?: string,
  phoneNumberId?: string
) {
  const cleanPhone = payload.agentPhone.replace(/\D/g, '') || '9839122345';
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  if (!accessToken || !phoneNumberId) {
    console.log('Simulating free Meta WhatsApp Cloud API dispatch to:', targetPhone);
    return { success: true, simulated: true, targetPhone };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: targetPhone,
        type: 'text',
        text: {
          body: `🚨 NEW FUNDU DISPATCH ASSIGNED\nOrder #${payload.orderId.slice(0, 8).toUpperCase()}\nCustomer: ${payload.customerName}\nAddress: ${payload.deliveryAddress}\nPayable: ₹${payload.totalAmount}`,
        },
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send Meta WhatsApp message' };
  }
}
