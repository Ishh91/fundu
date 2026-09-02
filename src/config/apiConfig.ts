/**
 * API Configuration helper for Fundu App
 * Automatically picks localhost server in local development or custom VITE_API_URL env variable
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:4000/api';
  }
  return 'https://fundu.onrender.com/api';
};

export const API_BASE = getApiBaseUrl();
