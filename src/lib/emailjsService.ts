import emailjs from '@emailjs/browser';

const getEmailJSConfig = () => ({
  serviceId: (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined) || '',
  templateIdOtp: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID_OTP as string | undefined) || '',
  templateIdWelcome: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID_WELCOME as string | undefined) || '',
  publicKey: (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined) || '',
});

/**
 * Send OTP Verification Email via EmailJS (@emailjs/browser)
 */
export async function sendEmailJSOTP(email: string, otp: string, userName: string = 'User') {
  const { serviceId, templateIdOtp, publicKey } = getEmailJSConfig();

  if (!serviceId || !templateIdOtp || !publicKey) {
    console.log(`🔑 [EmailJS OTP Simulated] To: ${email} | Name: ${userName} | OTP: ${otp}`);
    return { success: true, simulated: true, otp };
  }

  try {
    const templateParams = {
      to_email: email,
      email: email,
      to: email,
      user_email: email,
      recipient: email,
      recipient_email: email,
      to_name: userName,
      user_name: userName,
      name: userName,
      otp_code: otp,
      otp: otp,
      app_name: 'Fundu',
      reply_to: 'support@fundu.com',
    };

    const response = await emailjs.send(serviceId, templateIdOtp, templateParams, publicKey);
    console.log('🎉 [EmailJS OTP Sent Successfully]:', response.status, response.text);
    return { success: true, response };
  } catch (error: any) {
    console.warn('⚠️ [EmailJS OTP Fallback to Simulation]:', error?.text || error?.message);
    return { success: true, simulated: true, otp };
  }
}

/**
 * Send Welcome Email via EmailJS (@emailjs/browser)
 */
export async function sendEmailJSWelcome(email: string, userName: string = 'User') {
  const { serviceId, templateIdWelcome, publicKey } = getEmailJSConfig();

  if (!serviceId || !templateIdWelcome || !publicKey) {
    console.log(`🎉 [EmailJS Welcome Simulated] To: ${email} | Name: ${userName}`);
    return { success: true, simulated: true };
  }

  try {
    const templateParams = {
      to_email: email,
      email: email,
      to: email,
      user_email: email,
      recipient: email,
      recipient_email: email,
      to_name: userName,
      user_name: userName,
      name: userName,
      app_name: 'Fundu',
    };

    const response = await emailjs.send(serviceId, templateIdWelcome, templateParams, publicKey);
    console.log('🎉 [EmailJS Welcome Sent Successfully]:', response.status, response.text);
    return { success: true, response };
  } catch (error: any) {
    console.warn('⚠️ [EmailJS Welcome Fallback]:', error?.text || error?.message);
    return { success: true, simulated: true };
  }
}
