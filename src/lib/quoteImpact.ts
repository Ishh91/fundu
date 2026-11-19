import { quotePhone } from '../../fundu_phone_quote.mjs';
import type { PricingRules } from './quoteRules';

export interface ImpactPhone {
  brand: string;
  model: string;
  storage: string;
  price: number;
}

export interface ImpactScenario {
  key: string;
  label: string;
  screen_condition: string;
  body_condition: string;
  battery_health: string;
  defects: string[];
}

/** The scenarios the impact panel can simulate against the edited rules. */
export const IMPACT_SCENARIOS: readonly ImpactScenario[] = Object.freeze([
  { key: 'flawless', label: 'Flawless', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: [] },
  { key: 'scratched', label: 'Light scratches on screen', screen_condition: 'scratches_minor', body_condition: 'flawless', battery_health: 'healthy', defects: [] },
  { key: 'cracked', label: 'Screen cracked', screen_condition: 'cracked', body_condition: 'flawless', battery_health: 'healthy', defects: [] },
  { key: 'touch', label: 'Touch not working', screen_condition: 'touch_fault', body_condition: 'flawless', battery_health: 'healthy', defects: [] },
  { key: 'panel', label: 'Back panel broken', screen_condition: 'flawless', body_condition: 'panel_broken', battery_health: 'healthy', defects: [] },
  { key: 'dents', label: 'Major dents', screen_condition: 'flawless', body_condition: 'dents_bent', battery_health: 'healthy', defects: [] },
  { key: 'wifi', label: 'WiFi fault', screen_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: ['wifi'] },
]);

const ACCESSORIES_FULL = Object.freeze(['Original Box', 'Original Charger', 'Valid Bill']);

/**
 * The buyback offer this phone would get in this scenario, under these rules, as a phone older than 11 months with every accessory
 * present. Null when the phone cannot be priced (no admin price, or the engine refuses it).
 */
export function quoteImpactOffer(phone: ImpactPhone, scenario: ImpactScenario, rules: PricingRules): number | null {
  if (!(phone.price > 0)) return null;
  const quote = quotePhone(
    {
      brand: phone.brand,
      model: phone.model,
      storage: phone.storage,
      powers_on: true,
      activation_lock_cleared: true,
      ownership_verified: true,
      liquid_damage: false,
      cosmetic_condition: 'flawless',
      screen_condition: scenario.screen_condition,
      body_condition: scenario.body_condition,
      battery_health: scenario.battery_health,
      defects: scenario.defects,
      accessories: ACCESSORIES_FULL,
      age_period: 'above_11_months',
    },
    { catalogPrice: phone.price, catalogStorage: phone.storage, pricingRules: rules },
  );
  return typeof quote?.offerAmount === 'number' ? quote.offerAmount : null;
}

/**
 * A pinned phone's live offer and its draft offer side by side, with the rupee delta between them (positive = draft pays more).
 * Null offers come through as null so the UI can say "no admin price".
 */
export interface ImpactRow {
  phone: ImpactPhone;
  liveOffer: number | null;
  draftOffer: number | null;
  delta: number | null;
}

export function computeImpactRow(phone: ImpactPhone, scenario: ImpactScenario, live: PricingRules, edited: PricingRules): ImpactRow {
  const liveOffer = quoteImpactOffer(phone, scenario, live);
  const draftOffer = quoteImpactOffer(phone, scenario, edited);
  const delta = liveOffer !== null && draftOffer !== null ? draftOffer - liveOffer : null;
  return { phone, liveOffer, draftOffer, delta };
}

/** Make a phone key the pinned list can dedupe on: "<brand>|<model>|<storage>". */
export const impactPhoneKey = (phone: Pick<ImpactPhone, 'brand' | 'model' | 'storage'>) => `${phone.brand}|${phone.model}|${phone.storage}`;
