/**
 * Brand matching for the Buy pages' brand chips.
 *
 * Product brands are typed by hand in the admin panel, so the saved values have
 * stray spaces and different capitalisation ("Samsung ", "Oneplus"). Compare them
 * the way a person would: ignoring case and surrounding/extra spaces.
 */

/** Brands that are sold under a family brand's chip. */
const BRAND_ALIASES: Record<string, string[]> = {
  xiaomi: ['redmi'],
  google: ['pixel'],
};

const normalizeBrand = (value: string | null | undefined): string =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export const isAllBrands = (selected: string | null | undefined): boolean => {
  const clean = normalizeBrand(selected);
  return clean === '' || clean === 'all';
};

export const matchesBrand = (productBrand: string | null | undefined, selected: string | null | undefined): boolean => {
  if (isAllBrands(selected)) return true;
  const wanted = normalizeBrand(selected);
  const actual = normalizeBrand(productBrand);
  if (actual === wanted) return true;
  return (BRAND_ALIASES[wanted] ?? []).includes(actual);
};
