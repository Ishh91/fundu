/**
 * Google reCAPTCHA Enterprise Integration
 * Key: 6LcNjsctAAAAAFX11zXYA0zSoYzPtFcgFY0u9_Ui
 */

export const RECAPTCHA_SITE_KEY = '6LcNjsctAAAAAFX11zXYA0zSoYzPtFcgFY0u9_Ui';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
      ready?: (cb: () => void) => void;
      execute?: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

let recaptchaLoadingPromise: Promise<void> | null = null;

function ensureRecaptchaScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (recaptchaLoadingPromise) return recaptchaLoadingPromise;

  recaptchaLoadingPromise = new Promise<void>((resolve) => {
    const existing = document.getElementById('recaptcha-enterprise-script');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'recaptcha-enterprise-script';
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return recaptchaLoadingPromise;
}

/**
 * Executes reCAPTCHA Enterprise for a designated action (e.g. 'LOGIN', 'SEND_OTP')
 * and returns the generated token, or null if reCAPTCHA is unavailable/blocked.
 */
export async function executeRecaptchaEnterprise(action = 'LOGIN'): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    await ensureRecaptchaScript();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return null;

    if (grecaptcha.enterprise?.ready) {
      return await new Promise<string | null>((resolve) => {
        grecaptcha.enterprise!.ready(async () => {
          try {
            const token = await grecaptcha.enterprise!.execute(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (e) {
            console.warn('reCAPTCHA enterprise execution failed:', e);
            resolve(null);
          }
        });
      });
    }

    if (grecaptcha.ready) {
      return await new Promise<string | null>((resolve) => {
        grecaptcha.ready!(async () => {
          try {
            const token = await grecaptcha.execute!(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (e) {
            console.warn('reCAPTCHA execution failed:', e);
            resolve(null);
          }
        });
      });
    }

    return null;
  } catch (err) {
    console.warn('reCAPTCHA error:', err);
    return null;
  }
}
