/**
 * Makes pages open the moment a visitor clicks.
 *
 * Every page is a separate download. Normally it starts only when the link is clicked, so the
 * visitor waits for it. Here the download starts earlier: when a finger or mouse gets close to
 * a link, and for the small shop pages also while the browser is idle after the first paint.
 */
import { prefetchProduct } from './productsCache';

type Loader = () => Promise<unknown>;

/** Path prefix -> how to download that page. Only pages a visitor reaches by clicking a link. */
const ROUTES: ReadonlyArray<readonly [string, Loader]> = [
  ['/product/', () => import('../pages/ProductDetail')],
  ['/buy-laptop', () => import('../pages/BuyLaptops')],
  ['/buy', () => import('../pages/BuyPhones')],
  ['/search', () => import('../pages/SearchActionPage')],
  ['/sell', () => import('../pages/SellPhone')],
  ['/repair', () => import('../pages/Repair')],
  ['/mobile-repair', () => import('../pages/Repair')],
  ['/checkout', () => import('../pages/Checkout')],
  ['/login', () => import('../pages/Login')],
  ['/profile', () => import('../pages/Profile')],
  ['/contact', () => import('../pages/Contact')],
  ['/about', () => import('../pages/About')],
];

/** Small, most-visited pages that are downloaded while the browser has nothing else to do. */
const IDLE_PREFETCH = ['/buy', '/product/', '/checkout', '/login'];

const requested = new Set<string>();

const findLoader = (pathname: string): readonly [string, Loader] | undefined =>
  ROUTES.find(([prefix]) => (prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`)));

/** Starts downloading the page for `pathname`, once. A failed download is retried on the next call. */
export const prefetchRoute = (pathname: string): void => {
  const match = findLoader(pathname);
  if (!match) return;

  const productId = pathname.startsWith('/product/') ? pathname.slice('/product/'.length).split('/')[0] : '';
  if (productId) prefetchProduct(productId);

  const [prefix, load] = match;
  if (requested.has(prefix)) return;
  requested.add(prefix);
  load().catch(() => requested.delete(prefix));
};

const linkPath = (target: EventTarget | null): string | null => {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target === '_blank' || anchor.origin !== window.location.origin) return null;
  return anchor.pathname;
};

const onNearLink = (event: Event): void => {
  const path = linkPath(event.target);
  if (path) prefetchRoute(path);
};

const isSlowOrSavingData = (): boolean => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData) || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
};

/** Call once at start-up. Returns a function that removes the listeners. */
export const startRoutePrefetch = (): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const options = { passive: true, capture: true } as const;
  const events = ['pointerover', 'touchstart', 'focusin'] as const;
  events.forEach((name) => document.addEventListener(name, onNearLink, options));

  let idleHandle: number | undefined;
  if (!isSlowOrSavingData()) {
    const warmUp = () => IDLE_PREFETCH.forEach((path) => prefetchRoute(path));
    const afterLoad = () => {
      idleHandle = typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(warmUp, { timeout: 4000 })
        : window.setTimeout(warmUp, 2500);
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
  }

  return () => {
    events.forEach((name) => document.removeEventListener(name, onNearLink, options));
    if (idleHandle !== undefined) {
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle);
      window.clearTimeout(idleHandle);
    }
  };
};
