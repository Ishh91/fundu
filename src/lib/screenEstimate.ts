import { quotePhone } from '../../fundu_phone_quote.mjs';
import type { PricingRules } from './quoteRules';

const ROUND_TO = 10;

/**
 * What a cracked screen costs on a phone today, from the screen tables: the offer for a flawless phone older than 11 months less the
 * offer with a cracked screen, on the phone's admin price. Rounded to ₹10. Null when there is no price or the phone cannot be priced.
 * The rules are used as they are, so a phone that has its own amount in them is priced on that amount.
 */
export function estimateCrackRupees(brand: string, model: string, storage: string, price: number, rules: PricingRules): number | null {
  if (!(price > 0)) return null;
  const offer = (screen: string): number | null => {
    const quote = quotePhone(
      {
        brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
        cosmetic_condition: 'flawless', screen_condition: screen, body_condition: 'flawless', battery_health: 'healthy',
        defects: [], accessories: [], age_period: 'above_11_months',
      },
      { catalogPrice: price, catalogStorage: storage, pricingRules: rules },
    );
    return typeof quote?.offerAmount === 'number' ? quote.offerAmount : null;
  };
  const flawless = offer('flawless');
  const cracked = offer('cracked');
  if (flawless === null || cracked === null) return null;
  return Math.max(0, Math.round((flawless - cracked) / ROUND_TO) * ROUND_TO);
}
