/**
 * API Configuration helper for Fundu App
 * Exclusively connected to the production Render cloud backend
 */
export const RENDER_BACKEND_URL = 'https://fundu.onrender.com/api';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && envUrl !== '/api') {
    return envUrl.replace(/\/$/, '');
  }
  return RENDER_BACKEND_URL;
};

export const API_BASE = getApiBaseUrl();
