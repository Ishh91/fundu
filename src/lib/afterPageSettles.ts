/**
 * Runs background work only after the page has had time to load its own data.
 *
 * Catalog and image refreshes are large. Started right at page load they share the server
 * with the data the visitor is waiting for, and everything slows down together.
 */

/** How long after the page has loaded the browser must still be idle before background work starts. */
export const SETTLE_DELAY_MS = 3000;
const IDLE_TIMEOUT_MS = 4000;

export const afterPageSettles = (task: () => void): void => {
  if (typeof window === 'undefined') return;

  const start = () => {
    window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
      else task();
    }, SETTLE_DELAY_MS);
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
};
