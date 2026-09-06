import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB92qlzzsihGxswaOTLfVMijqh4nPrbKNw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fundu-4ea17.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fundu-4ea17',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fundu-4ea17.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '153465133346',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:153465133346:web:0d89a488ae42b48c972d7b',
};

// Initialize or reuse Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Default language for SMS
auth.languageCode = 'en';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Initialize an invisible RecaptchaVerifier on a designated container.
 */
export function initRecaptcha(containerId = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }

  // Clear previous verifier if any
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // reCAPTCHA expired, will re-trigger when user submits
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Dispatches a real Firebase SMS OTP to the 10-digit Indian phone number
 */
export async function sendFirebasePhoneOtp(
  rawPhone: string,
  containerId = 'recaptcha-container'
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit Indian phone number.' };
    }

    const formattedE164 = `+91${cleanDigits}`;
    const verifier = initRecaptcha(containerId);

    const confirmationResult = await signInWithPhoneNumber(auth, formattedE164, verifier);
    window.confirmationResult = confirmationResult;

    return { success: true };
  } catch (err: any) {
    console.error('Firebase sendPhoneOtp error:', err);
    let message = err?.message || 'Failed to send OTP via SMS.';
    if (err?.code === 'auth/invalid-phone-number') {
      message = 'Invalid phone number format.';
    } else if (err?.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please wait a few minutes before requesting another OTP.';
    } else if (err?.code === 'auth/quota-exceeded') {
      message = 'SMS quota exceeded for today. Please try again later.';
    } else if (err?.code === 'auth/captcha-check-failed') {
      message = 'ReCAPTCHA verification failed. Please refresh and try again.';
    }
    return { success: false, error: message };
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
