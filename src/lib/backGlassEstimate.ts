import { quotePhone } from '../../fundu_phone_quote.mjs';
import type { PricingRules } from './quoteRules';

const ROUND_TO = 10;

/**
 * What a cracked, missing or bent back panel takes off a phone today, from the body damage share: the offer for a flawless phone older
 * than 11 months less the offer for the same phone with a broken panel, on the phone's admin price. Rounded to ₹10. Null when there is
 * no price or the phone cannot be priced. The rules are used as they are, so a phone that has its own amount in them is priced on that.
 */
export function estimateBackGlassRupees(brand: string, model: string, storage: string, price: number, rules: PricingRules): number | null {
  if (!(price > 0)) return null;
  const offer = (bodyCondition: string): number | null => {
    const quote = quotePhone(
      {
        brand, model, storage, powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
        cosmetic_condition: 'flawless', screen_condition: 'flawless', body_condition: bodyCondition, battery_health: 'healthy',
        defects: [], accessories: [], age_period: 'above_11_months',
      },
      { catalogPrice: price, catalogStorage: storage, pricingRules: rules },
    );
    return typeof quote?.offerAmount === 'number' ? quote.offerAmount : null;
  };
  const flawless = offer('flawless');
  const broken = offer('panel_broken');
  if (flawless === null || broken === null) return null;
  return Math.max(0, Math.round((flawless - broken) / ROUND_TO) * ROUND_TO);
}
