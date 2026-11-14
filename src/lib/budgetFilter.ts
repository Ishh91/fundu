/**
 * Budget filter shared by the Buy Phones and Buy Laptops pages.
 *
 * The page has two price controls: preset chips ("Under ₹10,000") and a
 * "Max Budget" slider. Only one applies at a time: picking a chip puts the
 * slider back to "no limit", and moving the slider selects the first chip.
 */

export interface PricePreset {
  label: string;
  min: number;
  max: number;
}

/** Index of the "All Prices" chip, which applies no price range. */
export const ALL_PRICES_PRESET = 0;

/** Top of the slider. At this value the slider means "no upper limit". */
export const BUDGET_SLIDER_MAX = 150000;
export const BUDGET_SLIDER_STEP = 5000;

export const hasBudgetLimit = (maxPrice: number): boolean => maxPrice < BUDGET_SLIDER_MAX;

/** True when either price control is narrowing the list. */
export const isBudgetFilterActive = (presetIndex: number, maxPrice: number): boolean =>
  presetIndex !== ALL_PRICES_PRESET || hasBudgetLimit(maxPrice);

export const matchesBudget = (
  price: number,
  presets: readonly PricePreset[],
  presetIndex: number,
  maxPrice: number,
): boolean => {
  const preset = presets[presetIndex];
  if (presetIndex !== ALL_PRICES_PRESET && preset) {
    return price >= preset.min && price <= preset.max;
  }
  return !hasBudgetLimit(maxPrice) || price <= maxPrice;
};

/** Text shown next to the slider. */
export const budgetLabel = (maxPrice: number, formatPrice: (amount: number) => string): string =>
  hasBudgetLimit(maxPrice) ? formatPrice(maxPrice) : 'No limit';
