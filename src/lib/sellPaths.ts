/**
 * Where "Back" from the condition step should land: the brand's model list, so the customer can
 * pick another model, not the all-brands page. Keeps whichever URL family the customer is on.
 */
export const sellModelListPath = (pathname: string, brandSlug?: string | null, brandName?: string | null): string => {
  const base = pathname.startsWith('/sell-old-mobile-phone') ? '/sell-old-mobile-phone' : '/sell';
  const slug = String(brandSlug || brandName || '').trim().toLowerCase().replace(/\s+/g, '-');
  return slug ? `${base}/${slug}` : base;
};
