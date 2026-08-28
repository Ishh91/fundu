import emailjs from '@emailjs/browser';

// EmailJS config from env variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID_OTP = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_OTP || '';
const TEMPLATE_ID_WELCOME = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_WELCOME || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Send OTP Verification Email via EmailJS (@emailjs/browser)
 */
export async function sendEmailJSOTP(email: string, otp: string, userName: string = 'User') {
  if (!SERVICE_ID || !TEMPLATE_ID_OTP || !PUBLIC_KEY) {
    console.warn('⚠️ [EmailJS] Missing environment variables. Falling back to local log simulation.');
    console.log(`🔑 [EmailJS OTP Simulated] To: ${email} | Name: ${userName} | OTP: ${otp}`);
    return { success: true, simulated: true, otp };
  }

  try {
    const templateParams = {
      to_email: email,
      to_name: userName,
      otp_code: otp,
      app_name: 'Fundu',
      reply_to: 'support@fundu.com',
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_OTP, templateParams, PUBLIC_KEY);
    console.log('🎉 [EmailJS OTP Sent Successfully]:', response.status, response.text);
    return { success: true, response };
  } catch (error: any) {
    console.error('❌ [EmailJS OTP Error]:', error);
    return { success: false, error: error?.text || error?.message || 'Failed to send OTP via EmailJS' };
  }
}

/**
 * Send Welcome Email via EmailJS (@emailjs/browser)
 */
export async function sendEmailJSWelcome(email: string, userName: string = 'User') {
  if (!SERVICE_ID || !TEMPLATE_ID_WELCOME || !PUBLIC_KEY) {
    console.warn('⚠️ [EmailJS] Missing environment variables. Falling back to local log simulation.');
    console.log(`🎉 [EmailJS Welcome Simulated] To: ${email} | Name: ${userName}`);
    return { success: true, simulated: true };
  }

  try {
    const templateParams = {
      to_email: email,
      to_name: userName,
      app_name: 'Fundu',
      login_url: `${window.location.origin}/login`,
      dashboard_url: `${window.location.origin}/dashboard`,
      reply_to: 'support@fundu.com',
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_WELCOME, templateParams, PUBLIC_KEY);
    console.log('🎉 [EmailJS Welcome Sent Successfully]:', response.status, response.text);
    return { success: true, response };
  } catch (error: any) {
    console.error('❌ [EmailJS Welcome Error]:', error);
    return { success: false, error: error?.text || error?.message || 'Failed to send Welcome Email via EmailJS' };
  }
}
