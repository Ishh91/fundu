/**
 * Brand names are typed by hand in the admin panel, so they often carry stray spaces
 * ("Samsung ") that later break filters and grouping. These helpers clean them on save.
 */

/** Tables whose rows have a `brand` column that people type in. */
export const BRAND_TABLES = new Set([
  'products', 'spare_parts', 'master_phones', 'phones', 'sell_price_configs',
  'repair_price_configs', 'repair_catalogs', 'wholesale_inventory', 'wholesale_inventories',
]);

/** Trims the ends and collapses repeated spaces. Anything that is not a string is returned unchanged. */
export const cleanBrand = (brand) => (typeof brand === 'string' ? brand.replace(/\s+/g, ' ').trim() : brand);

const cleanRow = (row) => {
  if (!row || typeof row !== 'object' || Array.isArray(row) || typeof row.brand !== 'string') return row;
  const brand = cleanBrand(row.brand);
  return brand === row.brand ? row : { ...row, brand };
};

/** Returns a copy of one row, or a list of rows, with every `brand` cleaned. The input is not changed. */
export const withCleanBrand = (values) => (Array.isArray(values) ? values.map(cleanRow) : cleanRow(values));
