import dotenv from 'dotenv';
dotenv.config();

const primaryPhone = '919105783553';
const helplinePhone = '919839122345';

const sampleOrderMsg = `🛒 *TEST ORDER NOTIFICATION - FUNDU*
━━━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* #ORD-TEST99
👤 *Customer:* Rahul Sharma
📞 *Customer Phone:* +91 9876543210
📱 *Item(s):* iPhone 15 Pro 128GB (Natural Titanium)
💰 *Total Amount:* ₹64,999 (COD)
📍 *Delivery Address:* Hazratganj, Lucknow, UP
━━━━━━━━━━━━━━━━━━━━━
⚡ Multi-Admin Auto Trigger Active`;

const waUrl1 = `https://api.whatsapp.com/send?phone=${primaryPhone}&text=${encodeURIComponent(sampleOrderMsg)}`;
const waUrl2 = `https://api.whatsapp.com/send?phone=${helplinePhone}&text=${encodeURIComponent(sampleOrderMsg)}`;

console.log('----------------------------------------------------');
console.log('✅ TEST WHATSAPP NOTIFICATION LINKS:');
console.log('1. Primary Admin (9105783553):');
console.log(waUrl1);
console.log('\n2. Helpline Admin (9839122345):');
console.log(waUrl2);
console.log('----------------------------------------------------');

import('../server/routes/emailRoutes.js').then(async ({ sendViaNodemailer }) => {
  try {
    const res = await sendViaNodemailer({
      to: 'trustiqueassist0003@gmail.com',
      subject: '✅ [TEST CONFIRMED] Fundu Auto WhatsApp & Order Notification System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0d9488; margin-top: 0;">Fundu Automated Multi-Admin Notification Test</h2>
          <p>This is a live test verifying that all automated notifications are active for:</p>
          <ul>
            <li><b>Primary Admin:</b> +91-9105783553</li>
            <li><b>Helpline Admin:</b> +91-9839122345</li>
          </ul>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <pre style="white-space: pre-wrap; font-size: 13px;">${sampleOrderMsg}</pre>
          </div>
          <p>Click below to test WhatsApp message dispatch directly:</p>
          <div style="margin-top: 15px;">
            <a href="${waUrl1}" style="background: #25d366; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px; display: inline-block;">📲 Open WhatsApp (9105783553)</a>
            <a href="${waUrl2}" style="background: #075e54; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">📲 Open WhatsApp (9839122345)</a>
          </div>
        </div>
      `,
    });
    console.log('Email Alert Status:', res.success ? 'Delivered to trustiqueassist0003@gmail.com' : res.error);
  } catch (e) {
    console.error('Email error:', e);
  }
  process.exit(0);
});
