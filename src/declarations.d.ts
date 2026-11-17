declare module '*/fundu_phone_quote.mjs' {
  export const quotePhone: any;
  export const calculatePhoneAgingFactor: any;
  export const recalculateInspectedQuote: any;
  export const calculateHardwareVariantMultiplier: any;
  export const FUNDU_POLICY: any;
  export const FUNDU_SERVICE_LOCALITIES: any;
  export const lookupResaleBenchmark: any;
  export const screenRepairRate: any;
}

declare module '*/fundu_pricing_rules.mjs' {
  export const DEFAULT_PRICING_RULES: any;
  export const RULE_LIMITS: any;
  export const SCREEN_STATE_KEYS: readonly string[];
  export const normalizeModelKey: (model: unknown) => string;
  export const androidModelKey: (brand: unknown, model: unknown) => string;
  export const resolvePricingRules: (saved: unknown) => any;
  export const validatePricingRules: (rules: unknown) => { valid: boolean; errors: string[] };
  export const diffPricingRules: (before: unknown, after: unknown) => { path: string; from: number | undefined; to: number | undefined }[];
  export const cloneRules: <T>(rules: T) => T;
}
