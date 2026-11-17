import { API_BASE } from '../config/apiConfig';
import { resolveRules, type PricingRules } from './quoteRules';

// The published quote rules, as the sell page prices its instant estimate with them. The server prices the quote that counts; this
// only keeps the estimate on the screen from disagreeing with it. Until the rules arrive (or if they never do) the defaults are
// used, which is what the engine always used.
const REFRESH_AFTER_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 3000;

let current: PricingRules = resolveRules(undefined);
let loadedAt = 0;
let inFlight: Promise<void> | null = null;

/** Fetches the published rules if they are not already loaded or are older than five minutes. Never throws. */
export function prefetchPricingRules(): Promise<void> {
  if (typeof fetch === 'undefined') return Promise.resolve();
  if (Date.now() - loadedAt < REFRESH_AFTER_MS) return Promise.resolve();
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API_BASE}/pricing-rules`, { signal: controller.signal });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data?.rules) {
        current = resolveRules(json.data.rules);
        loadedAt = Date.now();
      }
    } catch {
      // offline, slow or an old server without the endpoint: keep what is there
    } finally {
      clearTimeout(timer);
      inFlight = null;
    }
  })();
  return inFlight;
}

/** The published rules last loaded (the defaults until then). Starts a refresh in the background when they are old. */
export function getPricingRulesForQuote(): PricingRules {
  void prefetchPricingRules();
  return current;
}
