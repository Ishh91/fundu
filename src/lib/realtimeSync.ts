/**
 * Universal Real-Time Synchronization Engine for Fundu
 * Bridges Admin operations, Database mutations, and Frontend Views
 * using BroadcastChannel (cross-tab) and CustomEvent (same-tab) + Background Auto-Polling.
 */

export type RealtimeSyncAction =
  | 'PRICE_UPDATE'
  | 'PRODUCT_UPDATE'
  | 'MODEL_DELETE'
  | 'MODEL_RESTORE'
  | 'REPAIR_UPDATE'
  | 'HERO_UPDATE'
  | 'REVIEW_UPDATE'
  | 'DB_MUTATION';

export interface RealtimeSyncPayload {
  action: RealtimeSyncAction;
  table?: string;
  operation?: 'insert' | 'update' | 'delete' | 'upsert';
  data?: any;
  timestamp: number;
}

const SYNC_CHANNEL_NAME = 'fundu_realtime_channel_v1';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (err) {
    console.warn('Notice initializing BroadcastChannel:', err);
    broadcastChannel = null;
  }
}

/**
 * Broadcasts an event to all tabs, windows, and local components instantly
 */
export function broadcastSync(action: RealtimeSyncAction, table?: string, operation?: string, data?: any) {
  if (typeof window === 'undefined') return;

  const payload: RealtimeSyncPayload = {
    action,
    table,
    operation: operation as any,
    data,
    timestamp: Date.now(),
  };

  // 1. Post to BroadcastChannel for other tabs
  try {
    broadcastChannel?.postMessage(payload);
  } catch {}

  // 2. Dispatch CustomEvent for components in current tab
  window.dispatchEvent(
    new CustomEvent('fundu_realtime_sync', {
      detail: payload,
    })
  );

  // 3. Dispatch specific legacy events for backwards compatibility
  if (table === 'products' || action === 'PRODUCT_UPDATE') {
    window.dispatchEvent(new CustomEvent('fundu_product_updated', { detail: payload }));
  }
  if (table === 'sell_price_configs' || action === 'PRICE_UPDATE') {
    window.dispatchEvent(new CustomEvent('fundu_price_updated', { detail: payload }));
  }
  if (table === 'repair_price_configs' || action === 'REPAIR_UPDATE') {
    window.dispatchEvent(new CustomEvent('fundu_repair_price_updated', { detail: payload }));
  }
  if (table === 'site_content' || table === 'hero_posters' || action === 'HERO_UPDATE') {
    window.dispatchEvent(new CustomEvent('fundu_hero_posters_updated', { detail: payload }));
  }
  if (table === 'reviews' || action === 'REVIEW_UPDATE') {
    window.dispatchEvent(new CustomEvent('fundu_reviews_updated', { detail: payload }));
  }
}

/**
 * Listens for real-time broadcasts across tabs and current window
 */
export function subscribeToRealtimeSync(callback: (payload: RealtimeSyncPayload) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event: MessageEvent<RealtimeSyncPayload>) => {
    if (event?.data && event.data.action) {
      callback(event.data);
    }
  };

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<RealtimeSyncPayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  broadcastChannel?.addEventListener('message', handleBroadcast);
  window.addEventListener('fundu_realtime_sync', handleCustomEvent);

  return () => {
    broadcastChannel?.removeEventListener('message', handleBroadcast);
    window.removeEventListener('fundu_realtime_sync', handleCustomEvent);
  };
}
