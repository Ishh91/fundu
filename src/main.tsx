import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
    <App />
  </StrictMode>
);
