import { API_BASE } from '../config/apiConfig';

export interface ErrorReportPayload {
  type?: 'client_error' | 'unhandled_rejection' | 'react_crash';
  message: string;
  stack?: string;
  component_stack?: string;
  url?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

// In-memory deduplication cache: message -> timestamp
const reportedErrors = new Map<string, number>();
const DEDUP_WINDOW_MS = 60 * 1000; // 1 minute deduplication

// Local session log of the last 20 errors for debugging
export const sessionCrashLogs: Array<{ time: string; message: string; stack?: string }> = [];

/**
 * Filter out benign browser extension and resize noise
 */
function isIgnoredNoise(message: string): boolean {
  if (!message) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('resizeobserver loop') ||
    lower.includes('chrome-extension://') ||
    lower.includes('moz-extension://') ||
    lower.includes('safari-extension://') ||
    lower.includes('script error') ||
    lower.includes('canceled') ||
    lower.includes('aborterror')
  );
}

/**
 * Sends error report to backend
 */
export function reportErrorToTracker(
  error: unknown,
  context?: {
    type?: 'client_error' | 'unhandled_rejection' | 'react_crash';
    componentStack?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  try {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : typeof error === 'object' && error && 'message' in error
        ? String(error.message)
        : 'Unknown client error';

    if (isIgnoredNoise(message)) return;

    const now = Date.now();
    const lastReported = reportedErrors.get(message);
    if (lastReported && now - lastReported < DEDUP_WINDOW_MS) {
      return; // Deduplicated
    }
    reportedErrors.set(message, now);

    const stack = error instanceof Error ? error.stack || '' : '';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    sessionCrashLogs.unshift({
      time: new Date().toLocaleTimeString(),
      message,
      stack,
    });
    if (sessionCrashLogs.length > 20) sessionCrashLogs.pop();

    const payload: ErrorReportPayload = {
      type: context?.type || 'client_error',
      message: message.slice(0, 1000),
      stack: stack.slice(0, 5000),
      component_stack: context?.componentStack ? context.componentStack.slice(0, 5000) : '',
      url: currentUrl.slice(0, 500),
      path: currentPath.slice(0, 500),
      metadata: context?.metadata || {},
    };

    const endpoint = `${API_BASE}/errors/report`;
    const jsonBody = JSON.stringify(payload);

    // Prefer sendBeacon for non-blocking fire-and-forget delivery
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([jsonBody], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }

    // Fallback to fetch with keepalive
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonBody,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Error tracker must never throw
  }
}

let isInitialized = false;

/**
 * Initializes global client-side error listeners
 */
export function initErrorTracker(): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Uncaught global runtime errors
  window.addEventListener('error', (event) => {
    // Ignore vite bundle mismatch reloads (already handled)
    if (
      event.message &&
      (event.message.includes('MIME type') ||
        event.message.includes('Loading chunk') ||
        event.message.includes('Failed to fetch dynamically imported module'))
    ) {
      return;
    }

    reportErrorToTracker(event.error || event.message, {
      type: 'client_error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // 2. Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    reportErrorToTracker(reason, {
      type: 'unhandled_rejection',
      metadata: {
        reason: typeof reason === 'object' ? JSON.stringify(reason) : String(reason),
      },
    });
  });
}

