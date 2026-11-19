import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { MaintenancePage } from './components/MaintenancePage';
import './index.css';
import { initErrorTracker } from './lib/errorTracker';

// Production-only maintenance switch. Set VITE_MAINTENANCE=true in the hosting
// environment (e.g. Vercel) to show the holding page. Localhost always sees the
// real app, so development keeps working regardless of the flag.
const isLocalHost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE === 'true' && !isLocalHost;

// Initialize global crash & unhandled promise error tracking
initErrorTracker();

// Handle automatic page reload when an old cached script bundle is updated after a new deployment
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

window.addEventListener('error', (e) => {
  if (
    e.message &&
    (e.message.includes('MIME type') ||
      e.message.includes('Loading chunk') ||
      e.message.includes('Failed to fetch dynamically imported module'))
  ) {
    console.warn('[Fundu] Outdated script bundle detected after deployment. Refreshing page...');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMaintenanceMode ? <MaintenancePage /> : <App />}
  </StrictMode>
);
