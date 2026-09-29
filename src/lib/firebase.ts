import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBBlO3OuntuKlCg7MK0460ax7kXXTUVVTI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'thefundu-3700a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'thefundu-3700a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'thefundu-3700a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '723412623861',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:723412623861:web:8e1bef52dd90ea462740bc',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7YMXPYPBTR',
};

// Initialize or reuse Firebase app
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize analytics safely if in browser
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Default language for SMS
auth.languageCode = 'en';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Safely initialize or reuse RecaptchaVerifier on designated container
 */
export function getOrCreateRecaptcha(containerId = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }

  // 1. If we already have a valid active verifier instance, reuse it
  if (window.recaptchaVerifier) {
    try {
      return window.recaptchaVerifier;
    } catch {}
  }

  // 2. Ensure container element exists
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'invisible';
    document.body.appendChild(container);
  }

  const verifier = new RecaptchaVerifier(auth, container, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        window.recaptchaVerifier = undefined;
      }
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

export function resetRecaptcha(containerId = 'recaptcha-container') {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {}
    window.recaptchaVerifier = undefined;
  }
  const c = document.getElementById(containerId);
  if (c) c.innerHTML = '';
}

export const initRecaptcha = getOrCreateRecaptcha;

/**
 * Dispatches a real Firebase SMS OTP to the 10-digit Indian phone number
 */
export async function sendFirebasePhoneOtp(
  rawPhone: string,
  containerId = 'recaptcha-container'
): Promise<{ success: boolean; error?: string }> {
  const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
  if (cleanDigits.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian phone number.' };
  }

  const formattedE164 = `+91${cleanDigits}`;

  try {
    const verifier = getOrCreateRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedE164, verifier);
    window.confirmationResult = confirmationResult;
    return { success: true };
  } catch (err: any) {
    console.error('Firebase sendPhoneOtp error, retrying with fresh reCAPTCHA:', err);
    resetRecaptcha(containerId);

    // Auto-retry once with a completely fresh verifier
    try {
      const freshVerifier = getOrCreateRecaptcha(containerId);
      const retryResult = await signInWithPhoneNumber(auth, formattedE164, freshVerifier);
      window.confirmationResult = retryResult;
      return { success: true };
    } catch (retryErr: any) {
      console.error('Firebase sendPhoneOtp retry error:', retryErr);
      resetRecaptcha(containerId);

      let message = retryErr?.message || 'Failed to send OTP via SMS.';
      if (retryErr?.code === 'auth/invalid-phone-number') {
        message = 'Invalid phone number format.';
      } else if (retryErr?.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please wait a few minutes before requesting another OTP.';
      } else if (retryErr?.code === 'auth/quota-exceeded') {
        message = 'SMS quota exceeded for today. Please try again later.';
      } else if (retryErr?.code === 'auth/captcha-check-failed' || message.includes('reCAPTCHA')) {
        message = 'SMS verification busy. Please wait a moment and click Resend OTP.';
      }
      return { success: false, error: message };
    }
  }
}

/**
 * Confirms the 6-digit OTP code with Firebase and returns verified phone and token
 */
export async function verifyFirebasePhoneOtp(
  otpCode: string
): Promise<{ success: boolean; idToken?: string; phone?: string; error?: string }> {
  try {
    if (!window.confirmationResult) {
      return { success: false, error: 'Session expired. Please request a new OTP.' };
    }

    const result = await window.confirmationResult.confirm(otpCode.trim());
    const idToken = await result.user.getIdToken();
    const phone = result.user.phoneNumber || '';

    return { success: true, idToken, phone };
  } catch (err: any) {
    console.error('Firebase confirm error:', err);
    let message = 'Invalid OTP code. Please check and try again.';
    if (err?.code === 'auth/invalid-verification-code') {
      message = 'Incorrect 6-digit OTP code entered.';
    } else if (err?.code === 'auth/code-expired') {
      message = 'The OTP code has expired. Please click Resend OTP.';
    }
    return { success: false, error: message };
  }
}
