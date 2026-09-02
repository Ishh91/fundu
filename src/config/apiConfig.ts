/**
 * API Configuration helper for Fundu App
 * Automatically picks relative /api proxy in development to eliminate CORS preflight latency
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  return 'https://fundu.onrender.com/api';
};

export const API_BASE = getApiBaseUrl();
