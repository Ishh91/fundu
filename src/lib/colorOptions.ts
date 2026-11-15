/** Colours an admin can switch on for a listing. Phones of one brand share a palette. */

const COMMON_COLORS = [
  'Black',
  'White',
  'Blue',
  'Green',
  'Red',
  'Pink',
  'Purple',
  'Gold',
  'Silver',
  'Teal',
  'Space Grey',
  'Phantom Black',
  'Titanium Gray',
  'Emerald Green',
];

const IPHONE_COLORS = [
  'Black',
  'White',
  'Blue',
  'Pink',
  'Yellow',
  'Green',
  'Teal',
  'Ultramarine',
  'Red',
  'Purple',
  'Starlight',
  'Midnight',
  'Space Black',
  'Silver',
  'Gold',
  'Graphite',
  'Sierra Blue',
  'Alpine Green',
  'Deep Purple',
  'Natural Titanium',
  'Blue Titanium',
  'White Titanium',
  'Black Titanium',
  'Desert Titanium',
];

const isApple = (brand: string, model: string): boolean => /\b(apple|iphone|ipad)\b/i.test(`${brand} ${model}`);

const sameColor = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * The colour buttons for the listing form: the brand's palette, then any colour already on the
 * listing that the palette does not have, so an uncommon or typed-in colour can still be switched off.
 */
export const colorOptionsFor = (brand: string, model: string, selected: string[] = []): string[] => {
  const palette = isApple(brand, model) ? IPHONE_COLORS : COMMON_COLORS;
  const extras = selected.filter((color) => color.trim() && !palette.some((known) => sameColor(known, color)));
  return [...palette, ...extras];
};

/** Adds a typed-in colour to a list unless it is blank or already there (ignoring case). */
export const withColor = (colors: string[], typed: string): string[] => {
  const color = typed.trim().replace(/\s+/g, ' ');
  if (!color || colors.some((existing) => sameColor(existing, color))) return colors;
  return [...colors, color];
};
