/**
 * API Configuration helper for Fundu App
 * Supports both unified same-origin /api (Vercel serverless) and external backend URLs
 */
export const PROD_BACKEND_URL = 'https://funduserver.vercel.app/api';
export const RENDER_BACKEND_URL = PROD_BACKEND_URL;

export const getApiBaseUrl = (): string => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof process !== 'undefined' ? process.env?.VITE_API_URL : undefined);

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // When running on the production domain thefundu.com, use relative /api for zero-CORS same-domain deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('thefundu.com')) {
    return '/api';
  }

  // Default to relative /api (works with local Vite proxy and Vercel)
  return '/api';
};

export const API_BASE = getApiBaseUrl();
