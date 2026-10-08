/**
 * Fundu Used-Smartphone Buyback Quote Engine
 * 
 * Formula:
 * exact-variant current expected resale proceeds
 *   adjusted for condition (cosmetic multipliers + accessories)
 *   minus configured repairs
 *   minus pickup/inspection/refurbishment costs
 *   minus warranty and risk reserves
 *   minus target contribution margin
 *
 * Internal economics (margins, reserves, repair costs) are kept on the server.
 * Sellers are shown the resulting conditional estimate and understandable condition-related reasons.
 */

// Fundu-controlled Policy Configuration
export const FUNDU_POLICY = {
  version: 'fundu-policy-2025.1',
  effectiveDate: '2025-01-01',
  maxStalenessDays: 90, // Benchmarks older than 90 days trigger manual review
  
  // Internal Operational Costs (Kept confidential on server)
  pickupInspectionRefurbCost: 450, // INR: Doorstep pickup logistics, physical bench diagnostics, sanitization
  
  // Reserves (Kept confidential on server)
  warrantyAndRiskReservesRate: 0.05, // 5% risk reserve for component variance, price fluctuation, and holding risk
  warrantyBonusCredit: 500, // INR credit reducing risk reserve if device is covered under active manufacturer warranty
  
  // Target Economics (Kept confidential on server)
  targetContributionMarginRate: 0.10, // 10% target gross contribution margin for Fundu buyback operations
  
  // Price Floor (Minimum cash offer for viable functioning device)
  minOfferFloor: 500, // INR
  
  // Cosmetic condition adjustment multipliers
  cosmeticMultipliers: {
    flawless: 1.00, // Like new, zero scratches/scuffs
    good: 0.92,     // Normal wear, light micro-scratches (-8% markdown)
    fair: 0.82,     // Heavy scratches, scuffs (-18% markdown)
  },
  
  // Accessories bonus credits added to proceeds
  accessoriesBonus: {
    'Original Box': 300,
    'Original Charger': 300,
    'Valid Bill': 200,
  },
};

// Master Doorstep Service Localities
export const FUNDU_SERVICE_LOCALITIES = [
  'Gomti Nagar',
  'Hazratganj',
  'Indira Nagar',
  'Aliganj',
  'Mahanagar',
  'Ashiyana',
  'Chowk',
  'Rajajipuram',
  'Jankipuram',
  'Kanpur Road',
];

// Real Project Resale Proceeds Benchmarks (Exact Brand + Model + Storage)
// Derived from MASTER_MODEL_CATALOG, phonesData, and ALL_INDIAN_PHONES_CATALOG
export const RESALE_BENCHMARKS = [
  { brand: 'Apple', model: "Apple iPhone 11", storage: '64 GB', proceeds: 13490, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11", storage: '128 GB', proceeds: 15150, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11", storage: '256 GB', proceeds: 15720, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11 Pro", storage: '64 GB', proceeds: 16150, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11 Pro", storage: '512 GB', proceeds: 18420, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11 Pro", storage: '256 GB', proceeds: 18180, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11 Pro Max", storage: '64 GB', proceeds: 17950, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11 Pro Max", storage: '512 GB', proceeds: 20220, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 11 Pro Max", storage: '256 GB', proceeds: 19740, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12", storage: '64 GB', proceeds: 17490, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12", storage: '128 GB', proceeds: 18420, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12", storage: '256 GB', proceeds: 19630, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Mini", storage: '64 GB', proceeds: 15430, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Mini", storage: '128 GB', proceeds: 17010, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Mini", storage: '256 GB', proceeds: 17490, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Pro", storage: '128 GB', proceeds: 24000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Pro", storage: '256 GB', proceeds: 25460, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Pro", storage: '512 GB', proceeds: 26760, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Pro Max", storage: '128 GB', proceeds: 25460, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Pro Max", storage: '512 GB', proceeds: 27910, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 12 Pro Max", storage: '256 GB', proceeds: 26680, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13", storage: '128 GB', proceeds: 25760, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13", storage: '256 GB', proceeds: 26410, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13", storage: '512 GB', proceeds: 26980, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Mini", storage: '128 GB', proceeds: 22390, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Mini", storage: '512 GB', proceeds: 23440, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Mini", storage: '256 GB', proceeds: 23040, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro", storage: '128 GB', proceeds: 33940, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro", storage: '256 GB', proceeds: 35800, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro", storage: '512 GB', proceeds: 37020, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro", storage: '1 TB', proceeds: 37870, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro Max", storage: '128 GB', proceeds: 35840, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro Max", storage: '256 GB', proceeds: 36890, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro Max", storage: '512 GB', proceeds: 39320, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 13 Pro Max", storage: '1 TB', proceeds: 40860, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14", storage: '128 GB', proceeds: 28780, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14", storage: '256 GB', proceeds: 29430, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14", storage: '512 GB', proceeds: 29840, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Plus", storage: '128 GB', proceeds: 30240, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Plus", storage: '256 GB', proceeds: 30890, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Plus", storage: '512 GB', proceeds: 31860, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro", storage: '128 GB', proceeds: 43690, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro", storage: '256 GB', proceeds: 45070, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro", storage: '1 TB', proceeds: 47910, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro", storage: '512 GB', proceeds: 47100, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro Max", storage: '128 GB', proceeds: 44860, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro Max", storage: '256 GB', proceeds: 46480, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro Max", storage: '1 TB', proceeds: 50130, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 14 Pro Max", storage: '512 GB', proceeds: 48510, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15", storage: '128 GB', proceeds: 43220, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15", storage: '256 GB', proceeds: 45220, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15", storage: '512 GB', proceeds: 47550, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Plus", storage: '128 GB', proceeds: 45700, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Plus", storage: '512 GB', proceeds: 49600, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Plus", storage: '256 GB', proceeds: 47120, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro", storage: '128 GB', proceeds: 63400, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro", storage: '256 GB', proceeds: 66280, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro", storage: '512 GB', proceeds: 69160, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro", storage: '1 TB', proceeds: 71080, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro Max", storage: '256 GB', proceeds: 72040, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro Max", storage: '512 GB', proceeds: 73480, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 15 Pro Max", storage: '1 TB', proceeds: 79240, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16", storage: '128 GB', proceeds: 53900, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16", storage: '256 GB', proceeds: 55720, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16", storage: '512 GB', proceeds: 56680, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Plus", storage: '128 GB', proceeds: 55720, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Plus", storage: '512 GB', proceeds: 57160, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Plus", storage: '256 GB', proceeds: 56200, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro", storage: '128 GB', proceeds: 75210, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro", storage: '256 GB', proceeds: 78410, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro", storage: '512 GB', proceeds: 80350, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro", storage: '1 TB', proceeds: 81120, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro Max", storage: '256 GB', proceeds: 87040, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro Max", storage: '512 GB', proceeds: 89270, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16 Pro Max", storage: '1 TB', proceeds: 91400, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16e", storage: '256 GB', proceeds: 40290, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16e", storage: '128 GB', proceeds: 38830, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 16e", storage: '512 GB', proceeds: 42230, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17", storage: '256 GB', proceeds: 66000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17", storage: '512 GB', proceeds: 68700, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro", storage: '256 GB', proceeds: 104000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro", storage: '512 GB', proceeds: 109000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro", storage: '1 TB', proceeds: 110000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro Max", storage: '256 GB', proceeds: 111000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro Max", storage: '512 GB', proceeds: 118000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro Max", storage: '1 TB', proceeds: 119700, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17 Pro Max", storage: '2 TB', proceeds: 124000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17e", storage: '256 GB', proceeds: 47000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 17e", storage: '512 GB', proceeds: 54400, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro", storage: '512 GB', proceeds: 128000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro", storage: '256 GB', proceeds: 121000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro", storage: '2 TB', proceeds: 161000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro", storage: '1 TB', proceeds: 141000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro Max", storage: '256 GB', proceeds: 131000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro Max", storage: '1 TB', proceeds: 146000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro Max", storage: '512 GB', proceeds: 138000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 18 Pro Max", storage: '2 TB', proceeds: 166000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6", storage: '32 GB', proceeds: 2770, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6", storage: '128 GB', proceeds: 3200, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6", storage: '16 GB', proceeds: 2550, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6", storage: '64 GB', proceeds: 3000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6 Plus", storage: '16 GB', proceeds: 3080, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6 Plus", storage: '128 GB', proceeds: 3640, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6 Plus", storage: '64 GB', proceeds: 3380, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S", storage: '64 GB', proceeds: 3650, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S", storage: '32 GB', proceeds: 3350, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S", storage: '16 GB', proceeds: 3080, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S", storage: '128 GB', proceeds: 3720, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S Plus", storage: '128 GB', proceeds: 4650, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S Plus", storage: '16 GB', proceeds: 3270, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S Plus", storage: '32 GB', proceeds: 3830, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 6S Plus", storage: '64 GB', proceeds: 4240, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 7", storage: '32 GB', proceeds: 5200, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 7", storage: '256 GB', proceeds: 5730, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 7", storage: '128 GB', proceeds: 5430, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 7 Plus", storage: '256 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 7 Plus", storage: '128 GB', proceeds: 6450, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 7 Plus", storage: '32 GB', proceeds: 5840, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 8", storage: '64 GB', proceeds: 6450, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 8", storage: '256 GB', proceeds: 7150, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 8", storage: '128 GB', proceeds: 6850, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 8 Plus", storage: '64 GB', proceeds: 7740, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 8 Plus", storage: '128 GB', proceeds: 7920, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone 8 Plus", storage: '256 GB', proceeds: 8440, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone Air", storage: '1 TB', proceeds: 88000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone Air", storage: '256 GB', proceeds: 70000, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone Air", storage: '512 GB', proceeds: 76200, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 1st Generation", storage: '64 GB', proceeds: 3040, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 1st Generation", storage: '128 GB', proceeds: 3160, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 1st Generation", storage: '16 GB', proceeds: 2670, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 1st Generation", storage: '32 GB', proceeds: 2930, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 2020", storage: '64 GB', proceeds: 8610, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 2020", storage: '128 GB', proceeds: 8930, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 2020", storage: '256 GB', proceeds: 9100, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 2022", storage: '64 GB', proceeds: 13430, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 2022", storage: '128 GB', proceeds: 13810, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone SE 2022", storage: '256 GB', proceeds: 14340, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone X", storage: '64 GB', proceeds: 10540, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone X", storage: '256 GB', proceeds: 11020, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XR", storage: '256 GB', proceeds: 12030, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XR", storage: '64 GB', proceeds: 10800, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XR", storage: '128 GB', proceeds: 11600, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XS", storage: '64 GB', proceeds: 11400, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XS", storage: '256 GB', proceeds: 12610, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XS", storage: '512 GB', proceeds: 12860, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XS Max", storage: '256 GB', proceeds: 13640, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XS Max", storage: '64 GB', proceeds: 12710, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "Apple iPhone XS Max", storage: '512 GB', proceeds: 14290, lastUpdated: '2026-10-08' },
  { brand: 'Apple', model: "iPhone 17", storage: '128 GB', proceeds: 72000, lastUpdated: '2025-02-15' },
  { brand: 'Apple', model: "iPhone 17 Air", storage: '128 GB', proceeds: 82000, lastUpdated: '2025-02-15' },
  { brand: 'Apple', model: "iPhone SE (2020)", storage: '64 GB', proceeds: 11000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: "iPhone SE (2022)", storage: '64 GB', proceeds: 18000, lastUpdated: '2025-01-05' },
  { brand: 'Google', model: "Google Pixel 10", storage: '256 GB', proceeds: 46850, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 10 Pro", storage: '256 GB', proceeds: 65750, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 10 Pro Fold", storage: '256 GB', proceeds: 93750, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 10 Pro XL", storage: '256 GB', proceeds: 70650, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 10a", storage: '256 GB', proceeds: 35050, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11", storage: '256 GB', proceeds: 61250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11", storage: '512 GB', proceeds: 67250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11 Pro", storage: '256 GB', proceeds: 73250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11 Pro", storage: '512 GB', proceeds: 81250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11 Pro Fold", storage: '512 GB', proceeds: 102250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11 Pro XL", storage: '256 GB', proceeds: 81250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 11 Pro XL", storage: '512 GB', proceeds: 86250, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 4A", storage: '128 GB', proceeds: 5240, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 6a", storage: '128 GB', proceeds: 11750, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 7", storage: '256 GB', proceeds: 16290, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 7", storage: '128 GB', proceeds: 16050, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 7 Pro", storage: '128 GB', proceeds: 19670, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 7 Pro", storage: '256 GB', proceeds: 20160, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 7a", storage: '128 GB', proceeds: 19210, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8", storage: '128 GB', proceeds: 26040, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8", storage: '256 GB', proceeds: 26320, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8 Pro", storage: '128 GB', proceeds: 32920, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8 Pro", storage: '256 GB', proceeds: 33880, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8 Pro", storage: '512 GB', proceeds: 34360, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8a", storage: '128 GB', proceeds: 25350, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 8a", storage: '256 GB', proceeds: 25550, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 9", storage: '256 GB', proceeds: 38630, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 9 Pro", storage: '256 GB', proceeds: 50490, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 9 Pro Fold", storage: '256 GB', proceeds: 67000, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 9 Pro XL", storage: '256 GB', proceeds: 53660, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 9 Pro XL", storage: '512 GB', proceeds: 54810, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Google Pixel 9a", storage: '256 GB', proceeds: 28700, lastUpdated: '2026-10-08' },
  { brand: 'Google', model: "Pixel 9", storage: '128 GB', proceeds: 54000, lastUpdated: '2025-01-20' },
  { brand: 'Google', model: "Pixel 9 Pro", storage: '128 GB', proceeds: 72000, lastUpdated: '2025-01-20' },
  { brand: 'iQOO', model: "iQOO 11 5G", storage: '256 GB', proceeds: 19020, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 12 5G", storage: '256 GB', proceeds: 27760, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 12 5G", storage: '512 GB', proceeds: 28640, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 13 5G", storage: '512 GB', proceeds: 31750, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 13 5G", storage: '256 GB', proceeds: 30180, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 15 5G", storage: '512 GB', proceeds: 42650, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 15 5G", storage: '256 GB', proceeds: 40950, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 15R", storage: '256 GB', proceeds: 32250, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 15R", storage: '512 GB', proceeds: 33250, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 3", storage: '256 GB', proceeds: 7200, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 3", storage: '128 GB', proceeds: 7020, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 7 5G", storage: '256 GB', proceeds: 10790, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 7 5G", storage: '128 GB', proceeds: 10480, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 7 Legend 5G", storage: '128 GB', proceeds: 12060, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 7 Legend 5G", storage: '256 GB', proceeds: 12290, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9 5G", storage: '128 GB', proceeds: 11910, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9 5G", storage: '256 GB', proceeds: 12290, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9 Pro 5G", storage: '256 GB', proceeds: 17490, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9 SE 5G", storage: '256 GB', proceeds: 12810, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9 SE 5G", storage: '128 GB', proceeds: 12210, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9T 5G", storage: '256 GB', proceeds: 16030, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO 9T 5G", storage: '128 GB', proceeds: 15150, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 10", storage: '128 GB', proceeds: 21620, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 10", storage: '256 GB', proceeds: 26340, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 10", storage: '512 GB', proceeds: 27330, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 10R 5G", storage: '128 GB', proceeds: 18240, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 10R 5G", storage: '256 GB', proceeds: 20850, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 6 5G", storage: '128 GB', proceeds: 11840, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 6 5G", storage: '256 GB', proceeds: 12400, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 7 5G", storage: '128 GB', proceeds: 12030, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 7 5G", storage: '256 GB', proceeds: 12470, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 7 Pro 5G", storage: '256 GB', proceeds: 17990, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 7 Pro 5G", storage: '128 GB', proceeds: 17750, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 9 Pro 5G", storage: '128 GB', proceeds: 17850, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Neo 9 Pro 5G", storage: '256 GB', proceeds: 20990, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10 5G", storage: '128 GB', proceeds: 16940, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10 5G", storage: '256 GB', proceeds: 17900, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10 Lite 5G", storage: '64 GB', proceeds: 8320, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10 Lite 5G", storage: '128 GB', proceeds: 9480, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10 Lite 5G", storage: '256 GB', proceeds: 9950, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10R 5G", storage: '128 GB', proceeds: 15250, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10R 5G", storage: '256 GB', proceeds: 16400, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10x 5G", storage: '128 GB', proceeds: 11400, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z10x 5G", storage: '256 GB', proceeds: 12720, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11 5G", storage: '128 GB', proceeds: 23500, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11 5G", storage: '256 GB', proceeds: 32000, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11 Lite 5G", storage: '64 GB', proceeds: 12500, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11 Lite 5G", storage: '128 GB', proceeds: 15140, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11 Lite 5G", storage: '256 GB', proceeds: 17160, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11x 5G", storage: '128 GB', proceeds: 16660, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11x 5G", storage: '256 GB', proceeds: 17460, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z11xa 5G", storage: '128 GB', proceeds: 19500, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z3 5G", storage: '128 GB', proceeds: 8940, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z3 5G", storage: '256 GB', proceeds: 9070, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z5 5G", storage: '128 GB', proceeds: 9270, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z5 5G", storage: '256 GB', proceeds: 9490, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z6", storage: '128 GB', proceeds: 7200, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z6 Lite 5G", storage: '64 GB', proceeds: 6970, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z6 Lite 5G", storage: '128 GB', proceeds: 8570, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z6 Pro 5G", storage: '256 GB', proceeds: 9510, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z6 Pro 5G", storage: '128 GB', proceeds: 9150, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z7 5G", storage: '128 GB', proceeds: 9790, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z7 Pro 5G", storage: '128 GB', proceeds: 13800, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z7 Pro 5G", storage: '256 GB', proceeds: 16660, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z7s 5G", storage: '128 GB', proceeds: 9730, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9 5G", storage: '128 GB', proceeds: 8910, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9 5G", storage: '256 GB', proceeds: 9280, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9 Lite 5G", storage: '128 GB', proceeds: 9000, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9s 5G", storage: '128 GB', proceeds: 14010, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9s 5G", storage: '256 GB', proceeds: 14830, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9s Pro 5G", storage: '128 GB', proceeds: 14050, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9s Pro 5G", storage: '256 GB', proceeds: 14630, lastUpdated: '2026-10-08' },
  { brand: 'iQOO', model: "iQOO Z9x 5G", storage: '128 GB', proceeds: 9380, lastUpdated: '2026-10-08' },
  { brand: 'Lenovo', model: "Lenovo K10 Note", storage: '64 GB', proceeds: 1490, lastUpdated: '2025-02-15' },
  { brand: 'Lenovo', model: "Lenovo K10 Note", storage: '128 GB', proceeds: 1565, lastUpdated: '2025-02-15' },
  { brand: 'Lenovo', model: "Lenovo K10 Plus", storage: '64 GB', proceeds: 3100, lastUpdated: '2025-02-15' },
  { brand: 'Lenovo', model: "Lenovo K8 Note", storage: '64 GB', proceeds: 2400, lastUpdated: '2025-02-15' },
  { brand: 'Lenovo', model: "Lenovo K9 Note", storage: '64 GB', proceeds: 2700, lastUpdated: '2025-02-15' },
  { brand: 'Lenovo', model: "Lenovo Legion Duel 2", storage: '256 GB', proceeds: 18500, lastUpdated: '2025-02-15' },
  { brand: 'Lenovo', model: "Lenovo Z6 Pro", storage: '128 GB', proceeds: 8500, lastUpdated: '2025-02-15' },
  { brand: 'Motorola', model: "Motorola Moto E13", storage: '64 GB', proceeds: 5190, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto E13", storage: '128 GB', proceeds: 5430, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto e22s", storage: '64 GB', proceeds: 4080, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto e32", storage: '64 GB', proceeds: 4120, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto e32s", storage: '64 GB', proceeds: 3860, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto e32s", storage: '32 GB', proceeds: 3600, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto E40", storage: '64 GB', proceeds: 4540, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto E6s", storage: '64 GB', proceeds: 2990, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto E7 Plus", storage: '64 GB', proceeds: 3560, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto E7 Power", storage: '32 GB', proceeds: 3180, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto E7 Power", storage: '64 GB', proceeds: 3600, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 20", storage: '128 GB', proceeds: 7960, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 20 Fusion", storage: '128 GB', proceeds: 7810, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 20 Pro", storage: '128 GB', proceeds: 8760, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 30", storage: '128 GB', proceeds: 9430, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 30 Fusion", storage: '128 GB', proceeds: 10970, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 30 Pro", storage: '128 GB', proceeds: 9800, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 30 Ultra", storage: '128 GB', proceeds: 13420, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 30 Ultra", storage: '256 GB', proceeds: 13780, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 40", storage: '256 GB', proceeds: 16120, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 40 Neo", storage: '256 GB', proceeds: 15920, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 40 Neo", storage: '128 GB', proceeds: 14980, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 50", storage: '256 GB', proceeds: 16360, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 50 Fusion", storage: '128 GB', proceeds: 14930, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 50 Fusion", storage: '256 GB', proceeds: 16270, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 50 Neo", storage: '256 GB', proceeds: 16590, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 50 Pro", storage: '256 GB', proceeds: 18300, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 50 Ultra", storage: '512 GB', proceeds: 26510, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 60", storage: '256 GB', proceeds: 18750, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 60 Fusion", storage: '128 GB', proceeds: 16230, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 60 Fusion", storage: '256 GB', proceeds: 17950, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 60 Pro", storage: '512 GB', proceeds: 24850, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 60 Pro", storage: '256 GB', proceeds: 23250, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 60 Stylus", storage: '256 GB', proceeds: 16430, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 70", storage: '256 GB', proceeds: 19550, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 70 Fusion", storage: '128 GB', proceeds: 19050, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 70 Fusion", storage: '256 GB', proceeds: 22450, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 70 Fusion", storage: '512 GB', proceeds: 25000, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 70 Pro 5G", storage: '256 GB', proceeds: 28950, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge 70 Pro Plus 5G", storage: '256 GB', proceeds: 32750, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Edge Plus", storage: '256 GB', proceeds: 8910, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G 5G", storage: '128 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G04", storage: '128 GB', proceeds: 4620, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G04", storage: '64 GB', proceeds: 4510, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G04s", storage: '64 GB', proceeds: 4810, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G05", storage: '64 GB', proceeds: 6120, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G06 Power", storage: '64 GB', proceeds: 6280, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G10 Power", storage: '64 GB', proceeds: 4100, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G13", storage: '64 GB', proceeds: 3290, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G13", storage: '128 GB', proceeds: 4200, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G14", storage: '128 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G22", storage: '64 GB', proceeds: 4730, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G24 Power", storage: '128 GB', proceeds: 4560, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G30", storage: '64 GB', proceeds: 4160, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G31", storage: '64 GB', proceeds: 4810, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G31", storage: '128 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G32", storage: '128 GB', proceeds: 5810, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G32", storage: '64 GB', proceeds: 5070, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G34 5G", storage: '128 GB', proceeds: 9410, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G35 5G", storage: '128 GB', proceeds: 9850, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G37 5G", storage: '64 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G37 Power 5G", storage: '128 GB', proceeds: 12410, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G40 Fusion", storage: '128 GB', proceeds: 6270, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G40 Fusion", storage: '64 GB', proceeds: 5070, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G42", storage: '64 GB', proceeds: 4420, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G45 5G", storage: '128 GB', proceeds: 9910, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G51 5G", storage: '64 GB', proceeds: 6310, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G52", storage: '64 GB', proceeds: 4880, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G52", storage: '128 GB', proceeds: 6210, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G54 5G", storage: '256 GB', proceeds: 12270, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G54 5G", storage: '128 GB', proceeds: 11390, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G57 Power 5G", storage: '128 GB', proceeds: 10240, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G6", storage: '32 GB', proceeds: 2200, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G6", storage: '64 GB', proceeds: 2680, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G6 Plus", storage: '64 GB', proceeds: 2880, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G60", storage: '128 GB', proceeds: 6470, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G62 5G", storage: '128 GB', proceeds: 7800, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G64 5G", storage: '256 GB', proceeds: 11540, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G64 5G", storage: '128 GB', proceeds: 10340, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G67 Power 5G", storage: '128 GB', proceeds: 11550, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G67 Power 5G", storage: '256 GB', proceeds: 13030, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G7", storage: '64 GB', proceeds: 2730, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G7 Power", storage: '64 GB', proceeds: 2950, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G71 5G", storage: '128 GB', proceeds: 8010, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G72", storage: '128 GB', proceeds: 5890, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G73 5G", storage: '128 GB', proceeds: 8930, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G8 Plus", storage: '64 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G8 Power Lite", storage: '64 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G82 5G", storage: '128 GB', proceeds: 8110, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G84 5G", storage: '256 GB', proceeds: 12950, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G85 5G", storage: '256 GB', proceeds: 15050, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G85 5G", storage: '128 GB', proceeds: 13770, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G86 Power 5G", storage: '128 GB', proceeds: 13320, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G9", storage: '64 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G9 Power", storage: '64 GB', proceeds: 3870, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G96 5G", storage: '256 GB', proceeds: 14520, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto G96 5G", storage: '128 GB', proceeds: 13470, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto One", storage: '64 GB', proceeds: 2950, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr", storage: '128 GB', proceeds: 10500, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 40", storage: '256 GB', proceeds: 19660, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 40 Ultra", storage: '256 GB', proceeds: 23680, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 50", storage: '256 GB', proceeds: 24480, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 50 Ultra", storage: '512 GB', proceeds: 32400, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 5G", storage: '256 GB', proceeds: 13860, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 60", storage: '256 GB', proceeds: 27680, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Razr 60 Ultra", storage: '512 GB', proceeds: 46710, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Signature", storage: '1 TB', proceeds: 42450, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Signature", storage: '512 GB', proceeds: 39630, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Signature", storage: '256 GB', proceeds: 36670, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola Moto Z2 Force", storage: '64 GB', proceeds: 2660, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola One Action", storage: '128 GB', proceeds: 3520, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola One Fusion Plus", storage: '128 GB', proceeds: 5660, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola One Macro", storage: '64 GB', proceeds: 2950, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola One Power", storage: '64 GB', proceeds: 3110, lastUpdated: '2026-10-08' },
  { brand: 'Motorola', model: "Motorola One Vision", storage: '128 GB', proceeds: 3180, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "CMF by Nothing Phone 1", storage: '128 GB', proceeds: 12720, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "CMF by Nothing Phone 2 Pro 5G", storage: '128 GB', proceeds: 15140, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "CMF by Nothing Phone 2 Pro 5G", storage: '256 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone (2)", storage: '128 GB', proceeds: 27000, lastUpdated: '2025-01-10' },
  { brand: 'Nothing', model: "Nothing Phone (2a)", storage: '128 GB', proceeds: 17500, lastUpdated: '2025-01-10' },
  { brand: 'Nothing', model: "Nothing Phone 1", storage: '256 GB', proceeds: 15070, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 1", storage: '128 GB', proceeds: 14000, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 2", storage: '128 GB', proceeds: 20700, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 2", storage: '256 GB', proceeds: 21420, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 2", storage: '512 GB', proceeds: 22130, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 2a 5G", storage: '128 GB', proceeds: 17810, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 2a 5G", storage: '256 GB', proceeds: 18290, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 2a Plus", storage: '256 GB', proceeds: 19730, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3", storage: '512 GB', proceeds: 33750, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3", storage: '256 GB', proceeds: 32750, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3a", storage: '128 GB', proceeds: 20900, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3a", storage: '256 GB', proceeds: 22010, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3a Lite", storage: '256 GB', proceeds: 16660, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3a Lite", storage: '128 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3a Pro", storage: '128 GB', proceeds: 21710, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 3a Pro", storage: '256 GB', proceeds: 24230, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 4a", storage: '128 GB', proceeds: 26750, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 4a", storage: '256 GB', proceeds: 27750, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 4a Pro", storage: '128 GB', proceeds: 30650, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 4a Pro", storage: '256 GB', proceeds: 33850, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 4b", storage: '128 GB', proceeds: 24530, lastUpdated: '2026-10-08' },
  { brand: 'Nothing', model: "Nothing Phone 4b", storage: '256 GB', proceeds: 27050, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 10 Pro 5G", storage: '128 GB', proceeds: 13860, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 10 Pro 5G", storage: '256 GB', proceeds: 15560, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 10R 5G", storage: '256 GB', proceeds: 11810, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 10R 5G", storage: '128 GB', proceeds: 11250, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 10T 5G", storage: '128 GB', proceeds: 14350, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 10T 5G", storage: '256 GB', proceeds: 16280, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 11 5G", storage: '128 GB', proceeds: 23960, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 11 5G", storage: '256 GB', proceeds: 25850, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus 11 5G Marble Edition", storage: '256 GB', proceeds: 27440, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus 11R 5G", storage: '512 GB', proceeds: 23380, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 11R 5G", storage: '128 GB', proceeds: 21990, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 11R 5G", storage: '256 GB', proceeds: 22620, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 12", storage: '256 GB', proceeds: 34150, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 12", storage: '512 GB', proceeds: 39050, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 12R", storage: '128 GB', proceeds: 26340, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 12R", storage: '256 GB', proceeds: 28340, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13", storage: '1 TB', proceeds: 50500, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13", storage: '256 GB', proceeds: 42550, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13", storage: '512 GB', proceeds: 44950, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13R", storage: '512 GB', proceeds: 33050, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13R", storage: '256 GB', proceeds: 32050, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13s", storage: '256 GB', proceeds: 37950, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 13s", storage: '512 GB', proceeds: 41000, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 15", storage: '256 GB', proceeds: 58250, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 15", storage: '512 GB', proceeds: 60250, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus 15R", storage: '512 GB', proceeds: 38250, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus 15R", storage: '256 GB', proceeds: 37250, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 3", storage: '64 GB', proceeds: 2620, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus 3T", storage: '128 GB', proceeds: 3030, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 3T", storage: '64 GB', proceeds: 2770, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 5", storage: '64 GB', proceeds: 3330, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 5", storage: '128 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 5T", storage: '64 GB', proceeds: 3560, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 5T", storage: '128 GB', proceeds: 3820, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 6", storage: '128 GB', proceeds: 5200, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 6", storage: '64 GB', proceeds: 5010, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 6", storage: '256 GB', proceeds: 5290, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 6T", storage: '128 GB', proceeds: 6570, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 6T", storage: '256 GB', proceeds: 6680, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 6T McLaren", storage: '256 GB', proceeds: 6680, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7", storage: '128 GB', proceeds: 6760, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7", storage: '256 GB', proceeds: 7300, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7 Pro", storage: '128 GB', proceeds: 8380, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7 Pro", storage: '256 GB', proceeds: 9130, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7T", storage: '128 GB', proceeds: 7550, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7T", storage: '256 GB', proceeds: 8000, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7T Pro", storage: '256 GB', proceeds: 9540, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 7T Pro McLaren Edition", storage: '256 GB', proceeds: 10040, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 8", storage: '128 GB', proceeds: 10600, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 8", storage: '256 GB', proceeds: 11600, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 8 Pro", storage: '256 GB', proceeds: 13040, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 8 Pro", storage: '128 GB', proceeds: 12520, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 8T", storage: '256 GB', proceeds: 11460, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 8T", storage: '128 GB', proceeds: 10780, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9 5G", storage: '128 GB', proceeds: 10710, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9 5G", storage: '256 GB', proceeds: 11460, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9 Pro 5G", storage: '256 GB', proceeds: 13800, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9 Pro 5G", storage: '128 GB', proceeds: 12890, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9R 5G", storage: '256 GB', proceeds: 11240, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9R 5G", storage: '128 GB', proceeds: 10600, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9RT 5G", storage: '128 GB', proceeds: 11090, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus 9RT 5G", storage: '256 GB', proceeds: 12600, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus N6", storage: '128 GB', proceeds: 16860, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus N6 Lite", storage: '64 GB', proceeds: 12000, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus N6x", storage: '128 GB', proceeds: 14940, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus N6x", storage: '64 GB', proceeds: 13830, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord", storage: '64 GB', proceeds: 7870, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord", storage: '128 GB', proceeds: 9340, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord", storage: '256 GB', proceeds: 9990, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 2 5G", storage: '128 GB', proceeds: 10410, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 2 5G", storage: '256 GB', proceeds: 11210, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 2T 5G", storage: '256 GB', proceeds: 11210, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 2T 5G", storage: '128 GB', proceeds: 10370, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 3 5G", storage: '128 GB', proceeds: 15730, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 3 5G", storage: '256 GB', proceeds: 16270, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 4", storage: '128 GB', proceeds: 18810, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 4", storage: '256 GB', proceeds: 21940, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 5", storage: '256 GB', proceeds: 25540, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 5", storage: '512 GB', proceeds: 26750, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord 6 5G", storage: '256 GB', proceeds: 29550, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 2 5G", storage: '128 GB', proceeds: 10330, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 2 Lite 5G", storage: '128 GB', proceeds: 9340, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 3 5G", storage: '256 GB', proceeds: 16030, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 3 5G", storage: '128 GB', proceeds: 15350, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 3 Lite 5G", storage: '256 GB', proceeds: 14070, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 3 Lite 5G", storage: '128 GB', proceeds: 12940, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 4", storage: '128 GB', proceeds: 19000, lastUpdated: '2025-01-15' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 5", storage: '128 GB', proceeds: 18980, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 5", storage: '256 GB', proceeds: 20950, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 5G", storage: '128 GB', proceeds: 8900, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE 5G", storage: '256 GB', proceeds: 9570, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus Nord CE4 5G", storage: '128 GB', proceeds: 15830, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus Nord CE4 5G", storage: '256 GB', proceeds: 17340, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE4 Lite 5G", storage: '128 GB', proceeds: 14450, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "OnePlus Nord CE4 Lite 5G", storage: '256 GB', proceeds: 15120, lastUpdated: '2026-10-08' },
  { brand: 'OnePlus', model: "Oneplus Open", storage: '512 GB', proceeds: 52650, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A11K", storage: '32 GB', proceeds: 3450, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A12", storage: '32 GB', proceeds: 4060, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A12", storage: '64 GB', proceeds: 4520, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A15", storage: '32 GB', proceeds: 4320, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A15s", storage: '128 GB', proceeds: 5320, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A15s", storage: '64 GB', proceeds: 4620, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A16", storage: '64 GB', proceeds: 5550, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A16e", storage: '64 GB', proceeds: 5050, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A16e", storage: '32 GB', proceeds: 4040, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A16K", storage: '32 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A16K", storage: '64 GB', proceeds: 4500, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A17", storage: '64 GB', proceeds: 4880, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A17K", storage: '64 GB', proceeds: 4600, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "Oppo A18", storage: '64 GB', proceeds: 5480, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "Oppo A18", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A1K", storage: '32 GB', proceeds: 3260, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3 5G", storage: '128 GB', proceeds: 11290, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3 Pro 5G", storage: '128 GB', proceeds: 12780, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3 Pro 5G", storage: '256 GB', proceeds: 13570, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A31", storage: '64 GB', proceeds: 4890, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A31", storage: '128 GB', proceeds: 5510, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A33 2020", storage: '32 GB', proceeds: 4120, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A38", storage: '128 GB', proceeds: 7210, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3s", storage: '32 GB', proceeds: 2920, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3s", storage: '16 GB', proceeds: 2770, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3s", storage: '64 GB', proceeds: 3110, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3x", storage: '128 GB', proceeds: 6260, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A3x 5G", storage: '64 GB', proceeds: 9610, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5", storage: '32 GB', proceeds: 3510, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5", storage: '64 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5 2020", storage: '64 GB', proceeds: 4290, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5 2020", storage: '128 GB', proceeds: 4450, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5 5G", storage: '128 GB', proceeds: 11390, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5 Pro 5G", storage: '256 GB', proceeds: 14780, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5 Pro 5G", storage: '128 GB', proceeds: 13830, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A52", storage: '128 GB', proceeds: 5740, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A53", storage: '128 GB', proceeds: 6040, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A53", storage: '64 GB', proceeds: 5510, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A53s 5G", storage: '128 GB', proceeds: 8290, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A54", storage: '128 GB', proceeds: 5700, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A54", storage: '64 GB', proceeds: 5320, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A55", storage: '128 GB', proceeds: 6470, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A55", storage: '64 GB', proceeds: 5790, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A57", storage: '32 GB', proceeds: 2510, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A57 2022", storage: '64 GB', proceeds: 5360, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A58", storage: '128 GB', proceeds: 7770, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A59 5G", storage: '128 GB', proceeds: 11020, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5s", storage: '32 GB', proceeds: 3480, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5s", storage: '64 GB', proceeds: 3950, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5X", storage: '64 GB', proceeds: 6960, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A5x 5G", storage: '128 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6 5G", storage: '128 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6 5G", storage: '256 GB', proceeds: 16660, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6 Pro 5G", storage: '256 GB', proceeds: 17160, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6 Pro 5G", storage: '128 GB', proceeds: 16150, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6c", storage: '128 GB', proceeds: 12400, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6c", storage: '64 GB', proceeds: 10490, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6s 5G", storage: '128 GB', proceeds: 13420, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6x 5G", storage: '64 GB', proceeds: 10190, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A6x 5G", storage: '128 GB', proceeds: 11910, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A7", storage: '64 GB', proceeds: 3030, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A71 2018", storage: '16 GB', proceeds: 2050, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A74 5G", storage: '128 GB', proceeds: 9240, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "Oppo A76", storage: '128 GB', proceeds: 6540, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A77", storage: '64 GB', proceeds: 2430, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A77 2022", storage: '128 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A77 2022", storage: '64 GB', proceeds: 4120, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A77s", storage: '128 GB', proceeds: 6480, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A78 5G", storage: '128 GB', proceeds: 11690, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A79 5G", storage: '128 GB', proceeds: 11850, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A83", storage: '32 GB', proceeds: 2360, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A83", storage: '16 GB', proceeds: 2240, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A83", storage: '64 GB', proceeds: 2660, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A9", storage: '128 GB', proceeds: 5070, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A9 2020", storage: '128 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO A96", storage: '128 GB', proceeds: 6600, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F1 plus", storage: '64 GB', proceeds: 2260, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F11", storage: '128 GB', proceeds: 4230, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F11 Pro", storage: '128 GB', proceeds: 5420, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F11 Pro", storage: '64 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F11 Pro Avenger Edition", storage: '128 GB', proceeds: 5360, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F15", storage: '128 GB', proceeds: 5610, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F17", storage: '128 GB', proceeds: 6510, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F17 Pro", storage: '128 GB', proceeds: 6660, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F19", storage: '128 GB', proceeds: 6780, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "Oppo F19 Pro", storage: '128 GB', proceeds: 6890, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F19 Pro", storage: '256 GB', proceeds: 7040, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F19 Pro Plus 5G", storage: '128 GB', proceeds: 8640, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F19s", storage: '128 GB', proceeds: 6240, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F1s", storage: '64 GB', proceeds: 2280, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F1s", storage: '32 GB', proceeds: 2130, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F21 Pro", storage: '128 GB', proceeds: 7940, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F21s Pro 5G", storage: '128 GB', proceeds: 9130, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F23 5G", storage: '256 GB', proceeds: 13400, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F25 Pro 5G", storage: '256 GB', proceeds: 14930, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F25 Pro 5G", storage: '128 GB', proceeds: 14450, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F27 5G", storage: '128 GB', proceeds: 14470, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F27 5G", storage: '256 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F27 Pro Plus 5G", storage: '256 GB', proceeds: 17130, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F27 Pro Plus 5G", storage: '128 GB', proceeds: 16040, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F29 5G", storage: '128 GB', proceeds: 16450, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F29 5G", storage: '256 GB', proceeds: 17770, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F29 Pro 5G", storage: '256 GB', proceeds: 17970, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F29 Pro 5G", storage: '128 GB', proceeds: 16910, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F3", storage: '64 GB', proceeds: 2430, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F3 Plus", storage: '64 GB', proceeds: 3140, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F31 5G", storage: '256 GB', proceeds: 19280, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F31 5G", storage: '128 GB', proceeds: 18170, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F31 Pro 5G", storage: '128 GB', proceeds: 19690, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F31 Pro 5G", storage: '256 GB', proceeds: 21100, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F31 Pro Plus 5G", storage: '256 GB', proceeds: 22920, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F33 5G", storage: '128 GB', proceeds: 21000, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F33 5G", storage: '256 GB', proceeds: 25850, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F33 Pro 5G", storage: '128 GB', proceeds: 23220, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F33 Pro 5G", storage: '256 GB', proceeds: 25240, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F5", storage: '32 GB', proceeds: 2700, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F5", storage: '64 GB', proceeds: 2790, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F5 Youth", storage: '32 GB', proceeds: 2620, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F7", storage: '128 GB', proceeds: 3520, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F7", storage: '64 GB', proceeds: 3290, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F9", storage: '64 GB', proceeds: 3620, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F9 Pro", storage: '128 GB', proceeds: 3950, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO F9 Pro", storage: '64 GB', proceeds: 3600, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find N2 Flip 5G", storage: '256 GB', proceeds: 19060, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find N3 Flip 5G", storage: '256 GB', proceeds: 24770, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X", storage: '256 GB', proceeds: 7810, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X2", storage: '256 GB', proceeds: 11860, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X9 5G", storage: '512 GB', proceeds: 47990, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X9 5G", storage: '256 GB', proceeds: 43560, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X9 Pro", storage: '512 GB', proceeds: 61750, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X9 Ultra", storage: '512 GB', proceeds: 78250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X9s", storage: '256 GB', proceeds: 41650, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Find X9s", storage: '512 GB', proceeds: 44250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K1", storage: '64 GB', proceeds: 4160, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K10 5G", storage: '128 GB', proceeds: 8350, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K12x 5G", storage: '256 GB', proceeds: 10060, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K12x 5G", storage: '128 GB', proceeds: 9760, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K13 5G", storage: '256 GB', proceeds: 14620, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K13 5G", storage: '128 GB', proceeds: 14030, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K13 Turbo 5G", storage: '128 GB', proceeds: 17650, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K13 Turbo 5G", storage: '256 GB', proceeds: 18170, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K13 Turbo Pro 5G", storage: '256 GB', proceeds: 22010, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K13x 5G", storage: '128 GB', proceeds: 10290, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K14 5G", storage: '256 GB', proceeds: 13830, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K14 5G", storage: '128 GB', proceeds: 13020, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K14x 5G", storage: '64 GB', proceeds: 10600, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K14x 5G", storage: '128 GB', proceeds: 12620, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K3", storage: '64 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO K3", storage: '128 GB', proceeds: 5260, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO R11", storage: '64 GB', proceeds: 3180, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO R17", storage: '128 GB', proceeds: 5130, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno", storage: '128 GB', proceeds: 5890, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno 10x Zoom", storage: '256 GB', proceeds: 6510, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno 10x Zoom", storage: '128 GB', proceeds: 6380, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno 15c 5G", storage: '256 GB', proceeds: 23830, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno 2", storage: '256 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno 2Z", storage: '256 GB', proceeds: 7130, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno10 5G", storage: '256 GB', proceeds: 17440, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno10 Pro 5G", storage: '256 GB', proceeds: 20320, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno10 Pro Plus 5G", storage: '256 GB', proceeds: 20800, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno11 5G", storage: '256 GB', proceeds: 17830, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno11 5G", storage: '128 GB', proceeds: 16620, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno11 Pro 5G", storage: '256 GB', proceeds: 20420, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno12 5G", storage: '256 GB', proceeds: 18580, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno12 Pro 5G", storage: '256 GB', proceeds: 20800, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno12 Pro 5G", storage: '512 GB', proceeds: 21490, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno13 5G", storage: '128 GB', proceeds: 20900, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno13 5G", storage: '256 GB', proceeds: 21500, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno13 5G", storage: '512 GB', proceeds: 21810, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno13 Pro 5G", storage: '512 GB', proceeds: 26250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno13 Pro 5G", storage: '256 GB', proceeds: 24080, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno14 5G", storage: '256 GB', proceeds: 24530, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno14 5G", storage: '512 GB', proceeds: 29050, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno14 Pro 5G", storage: '256 GB', proceeds: 30550, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno14 Pro 5G", storage: '512 GB', proceeds: 33890, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno15 5G", storage: '256 GB', proceeds: 31050, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno15 5G", storage: '512 GB', proceeds: 32950, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno15 Pro 5G", storage: '256 GB', proceeds: 42250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno15 Pro 5G", storage: '512 GB', proceeds: 43650, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno15 Pro Mini 5G", storage: '512 GB', proceeds: 38640, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno15 Pro Mini 5G", storage: '256 GB', proceeds: 35550, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno16 5G", storage: '256 GB', proceeds: 38250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno16c 5G", storage: '256 GB', proceeds: 34250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno16c 5G", storage: '128 GB', proceeds: 30250, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno2 F", storage: '256 GB', proceeds: 6040, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno2 F", storage: '128 GB', proceeds: 7090, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno3 Pro", storage: '256 GB', proceeds: 6950, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno3 Pro", storage: '128 GB', proceeds: 6790, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno4 Pro", storage: '128 GB', proceeds: 7740, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno5 Pro 5G", storage: '128 GB', proceeds: 9880, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno6 5G", storage: '128 GB', proceeds: 9350, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno6 Pro 5G", storage: '256 GB', proceeds: 10750, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno7 5G", storage: '256 GB', proceeds: 9910, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno7 Pro 5G", storage: '256 GB', proceeds: 11880, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno8 5G", storage: '128 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno8 Pro 5G", storage: '256 GB', proceeds: 11710, lastUpdated: '2026-10-08' },
  { brand: 'Oppo', model: "OPPO Reno8T 5G", storage: '128 GB', proceeds: 12560, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C3", storage: '32 GB', proceeds: 4210, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C3", storage: '64 GB', proceeds: 4380, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C31", storage: '32 GB', proceeds: 4370, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C31", storage: '64 GB', proceeds: 4810, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C50", storage: '32 GB', proceeds: 5720, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C51", storage: '64 GB', proceeds: 5580, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C51", storage: '128 GB', proceeds: 5900, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C55", storage: '64 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C55", storage: '128 GB', proceeds: 6360, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C61", storage: '128 GB', proceeds: 6240, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C61", storage: '64 GB', proceeds: 5950, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C65", storage: '128 GB', proceeds: 6450, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C65", storage: '256 GB', proceeds: 6940, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C71", storage: '64 GB', proceeds: 5190, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C71", storage: '128 GB', proceeds: 5600, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C75 5G", storage: '128 GB', proceeds: 7210, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C75 5G", storage: '64 GB', proceeds: 6860, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C81", storage: '64 GB', proceeds: 8580, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C81X", storage: '64 GB', proceeds: 7770, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C85 5G", storage: '128 GB', proceeds: 9890, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C85x", storage: '64 GB', proceeds: 9080, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO C85x", storage: '128 GB', proceeds: 9590, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F3 GT", storage: '128 GB', proceeds: 9340, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F3 GT", storage: '256 GB', proceeds: 9570, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F4 5G", storage: '128 GB', proceeds: 8350, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F4 5G", storage: '256 GB', proceeds: 8950, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F5 5G", storage: '256 GB', proceeds: 14470, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F6 5G", storage: '256 GB', proceeds: 15320, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F6 5G", storage: '512 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F7 5G", storage: '256 GB', proceeds: 21570, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO F7 5G", storage: '512 GB', proceeds: 21870, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M2", storage: '128 GB', proceeds: 5400, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M2", storage: '64 GB', proceeds: 4820, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M2 Pro", storage: '64 GB', proceeds: 5400, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M2 Pro", storage: '128 GB', proceeds: 6040, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M2 Reloaded", storage: '64 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M3", storage: '64 GB', proceeds: 5300, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M3", storage: '128 GB', proceeds: 5690, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M3 Pro 5G", storage: '64 GB', proceeds: 6930, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M3 Pro 5G", storage: '128 GB', proceeds: 7540, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M4 5G", storage: '64 GB', proceeds: 7010, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M4 5G", storage: '128 GB', proceeds: 7160, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M4 Pro", storage: '64 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M4 Pro", storage: '128 GB', proceeds: 6470, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M5", storage: '128 GB', proceeds: 5090, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M5", storage: '64 GB', proceeds: 4900, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 5G", storage: '64 GB', proceeds: 6790, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 5G", storage: '128 GB', proceeds: 7330, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 5G", storage: '256 GB', proceeds: 7540, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 Plus 5G", storage: '128 GB', proceeds: 7510, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 Pro 5G", storage: '128 GB', proceeds: 9110, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 Pro 5G", storage: '256 GB', proceeds: 10010, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M6 Pro 5G", storage: '64 GB', proceeds: 7630, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M7 5G", storage: '128 GB', proceeds: 7620, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M7 Plus 5G", storage: '128 GB', proceeds: 10290, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M7 Pro 5G", storage: '128 GB', proceeds: 10090, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M7 Pro 5G", storage: '256 GB', proceeds: 10390, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M8 5G", storage: '128 GB', proceeds: 14940, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO M8 5G", storage: '256 GB', proceeds: 16860, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X3", storage: '128 GB', proceeds: 5780, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X3", storage: '64 GB', proceeds: 5550, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X3 Pro", storage: '128 GB', proceeds: 6530, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X4 Pro 5G", storage: '64 GB', proceeds: 7540, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X4 Pro 5G", storage: '128 GB', proceeds: 8760, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X5 5G", storage: '128 GB', proceeds: 11050, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X5 5G", storage: '256 GB', proceeds: 11400, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X5 Pro 5G", storage: '128 GB', proceeds: 11890, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X5 Pro 5G", storage: '256 GB', proceeds: 12180, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X6 5G", storage: '256 GB', proceeds: 12780, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X6 5G", storage: '512 GB', proceeds: 13320, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X6 Neo 5G", storage: '128 GB', proceeds: 9810, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X6 Neo 5G", storage: '256 GB', proceeds: 10200, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X6 Pro 5G", storage: '512 GB', proceeds: 16540, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X6 Pro 5G", storage: '256 GB', proceeds: 16190, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X7 5G", storage: '128 GB', proceeds: 12280, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X7 5G", storage: '256 GB', proceeds: 12930, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X7 Pro 5G", storage: '256 GB', proceeds: 15200, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X8 Pro", storage: '256 GB', proceeds: 22720, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X8 Pro Max 5G", storage: '256 GB', proceeds: 29250, lastUpdated: '2026-10-08' },
  { brand: 'Poco', model: "POCO X8 Pro Max 5G", storage: '512 GB', proceeds: 31250, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 1", storage: '32 GB', proceeds: 3070, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 1", storage: '64 GB', proceeds: 3220, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 1", storage: '128 GB', proceeds: 3940, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 10", storage: '64 GB', proceeds: 6170, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 10", storage: '128 GB', proceeds: 6530, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 10 Pro 5G", storage: '128 GB', proceeds: 9570, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 10 Pro Plus 5G", storage: '256 GB', proceeds: 11780, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 10 Pro Plus 5G", storage: '128 GB', proceeds: 11020, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 11 5G", storage: '128 GB', proceeds: 10590, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 11 5G", storage: '256 GB', proceeds: 11960, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 11 Pro 5G", storage: '256 GB', proceeds: 15950, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 11 Pro 5G", storage: '128 GB', proceeds: 15340, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 11 Pro Plus 5G", storage: '256 GB', proceeds: 16910, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 11x 5G", storage: '128 GB', proceeds: 10670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 5G", storage: '128 GB', proceeds: 12130, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Plus 5G", storage: '128 GB', proceeds: 11830, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Plus 5G", storage: '256 GB', proceeds: 13490, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Pro 5G", storage: '256 GB', proceeds: 16650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Pro 5G", storage: '128 GB', proceeds: 14940, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Pro Plus 5G", storage: '256 GB', proceeds: 16900, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Pro Plus 5G", storage: '128 GB', proceeds: 15650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 12 Pro+", storage: '128 GB', proceeds: 21000, lastUpdated: '2025-01-15' },
  { brand: 'Realme', model: "Realme 12x 5G", storage: '128 GB', proceeds: 11580, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 5G", storage: '256 GB', proceeds: 12580, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 5G", storage: '128 GB', proceeds: 12040, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Plus 5G", storage: '128 GB', proceeds: 12390, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Plus 5G", storage: '256 GB', proceeds: 13710, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Pro 5G", storage: '128 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Pro 5G", storage: '256 GB', proceeds: 17510, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Pro 5G", storage: '512 GB', proceeds: 18330, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Pro Plus 5G", storage: '512 GB', proceeds: 18290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 13 Pro Plus 5G", storage: '256 GB', proceeds: 17670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro 5G", storage: '256 GB', proceeds: 17970, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro 5G", storage: '128 GB', proceeds: 17670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro Lite 5G", storage: '256 GB', proceeds: 15590, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro Lite 5G", storage: '128 GB', proceeds: 14280, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro Plus 5G", storage: '512 GB', proceeds: 22210, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro Plus 5G", storage: '256 GB', proceeds: 21500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14 Pro Plus 5G", storage: '128 GB', proceeds: 18980, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14T 5G", storage: '128 GB', proceeds: 12620, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 14T 5G", storage: '256 GB', proceeds: 13930, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15 5G", storage: '256 GB', proceeds: 19480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15 5G", storage: '128 GB', proceeds: 18780, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15 Pro 5G", storage: '128 GB', proceeds: 19480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15 Pro 5G", storage: '256 GB', proceeds: 20190, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15 Pro 5G", storage: '512 GB', proceeds: 23320, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15X 5G", storage: '128 GB', proceeds: 13890, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 15X 5G", storage: '256 GB', proceeds: 14730, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16 5G", storage: '128 GB', proceeds: 22310, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16 5G", storage: '256 GB', proceeds: 26750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16 Pro 5G", storage: '256 GB', proceeds: 25750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16 Pro 5G", storage: '128 GB', proceeds: 23930, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16 Pro Plus 5G", storage: '256 GB', proceeds: 31250, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16 Pro Plus 5G", storage: '128 GB', proceeds: 28250, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16T 5G", storage: '128 GB', proceeds: 20800, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16T 5G", storage: '256 GB', proceeds: 22820, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16x 5G", storage: '256 GB', proceeds: 21000, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 16x 5G", storage: '128 GB', proceeds: 17500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 2", storage: '64 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 2", storage: '32 GB', proceeds: 3140, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 2 Pro", storage: '64 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 2 Pro", storage: '128 GB', proceeds: 3940, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 3", storage: '64 GB', proceeds: 3680, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 3", storage: '32 GB', proceeds: 3410, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 3 Pro", storage: '128 GB', proceeds: 4800, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 3 Pro", storage: '64 GB', proceeds: 4520, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 3i", storage: '32 GB', proceeds: 3330, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 3i", storage: '64 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5", storage: '64 GB', proceeds: 4320, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5", storage: '32 GB', proceeds: 3950, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5", storage: '128 GB', proceeds: 4640, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5 Pro", storage: '64 GB', proceeds: 4860, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5 Pro", storage: '128 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5i", storage: '128 GB', proceeds: 5140, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5i", storage: '64 GB', proceeds: 4920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5s", storage: '128 GB', proceeds: 4650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 5s", storage: '64 GB', proceeds: 4250, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 6", storage: '64 GB', proceeds: 5920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 6", storage: '128 GB', proceeds: 6090, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 6 Pro", storage: '64 GB', proceeds: 5550, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 6 Pro", storage: '128 GB', proceeds: 6240, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 6i", storage: '64 GB', proceeds: 5510, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 7", storage: '64 GB', proceeds: 5900, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 7", storage: '128 GB', proceeds: 6350, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 7 Pro", storage: '128 GB', proceeds: 7120, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 7i", storage: '128 GB', proceeds: 5550, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 7i", storage: '64 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 8 5G", storage: '128 GB', proceeds: 7770, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 8 5G", storage: '64 GB', proceeds: 6970, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 8 Pro", storage: '128 GB', proceeds: 7290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 8i", storage: '64 GB', proceeds: 5440, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 8i", storage: '128 GB', proceeds: 5880, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 8s 5G", storage: '128 GB', proceeds: 8630, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9 5G", storage: '128 GB', proceeds: 8790, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9 5G", storage: '64 GB', proceeds: 7730, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9 5G Speed Edition", storage: '128 GB', proceeds: 8530, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9 Pro 5G", storage: '128 GB', proceeds: 9200, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9 Pro Plus 5G", storage: '256 GB', proceeds: 10190, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9 Pro Plus 5G", storage: '128 GB', proceeds: 9460, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9i 5G", storage: '64 GB', proceeds: 6290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme 9i 5G", storage: '128 GB', proceeds: 7130, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C1", storage: '16 GB', proceeds: 2730, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C1 2019", storage: '32 GB', proceeds: 2990, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C100i", storage: '64 GB', proceeds: 10500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C100x", storage: '64 GB', proceeds: 10740, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C11", storage: '32 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C11 2021", storage: '32 GB', proceeds: 3790, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C11 2021", storage: '64 GB', proceeds: 4500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C12", storage: '32 GB', proceeds: 4080, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C12", storage: '64 GB', proceeds: 4730, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C15", storage: '64 GB', proceeds: 4560, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C15", storage: '32 GB', proceeds: 4170, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C15 Qualcomm Edition", storage: '32 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C15 Qualcomm Edition", storage: '64 GB', proceeds: 4310, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C2", storage: '32 GB', proceeds: 3370, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C2", storage: '16 GB', proceeds: 2920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C20", storage: '32 GB', proceeds: 3640, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C21", storage: '64 GB', proceeds: 4480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C21", storage: '32 GB', proceeds: 4170, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C21Y", storage: '64 GB', proceeds: 4480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C21Y", storage: '32 GB', proceeds: 4170, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C25", storage: '128 GB', proceeds: 4650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C25", storage: '64 GB', proceeds: 4290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C25s", storage: '128 GB', proceeds: 4920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C25s", storage: '64 GB', proceeds: 4560, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C25Y", storage: '64 GB', proceeds: 4880, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C25Y", storage: '128 GB', proceeds: 5620, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C3", storage: '32 GB', proceeds: 3980, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C3", storage: '64 GB', proceeds: 4730, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C30", storage: '32 GB', proceeds: 3730, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C30s", storage: '32 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C30s", storage: '64 GB', proceeds: 4230, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C31", storage: '32 GB', proceeds: 3640, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C31", storage: '64 GB', proceeds: 4320, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C33", storage: '32 GB', proceeds: 4140, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C33", storage: '64 GB', proceeds: 5300, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C33 2023", storage: '64 GB', proceeds: 5250, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C33 2023", storage: '128 GB', proceeds: 6100, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C35", storage: '128 GB', proceeds: 5780, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C35", storage: '64 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C51", storage: '128 GB', proceeds: 6390, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C51", storage: '64 GB', proceeds: 6040, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C53", storage: '64 GB', proceeds: 6240, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C53", storage: '128 GB', proceeds: 6510, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C55", storage: '128 GB', proceeds: 8320, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C55", storage: '64 GB', proceeds: 7980, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C61", storage: '64 GB', proceeds: 4990, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C61", storage: '128 GB', proceeds: 5720, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C63", storage: '64 GB', proceeds: 5750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C63 5G", storage: '128 GB', proceeds: 7090, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C65 5G", storage: '64 GB', proceeds: 5370, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C65 5G", storage: '128 GB', proceeds: 8920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C67 5G", storage: '128 GB', proceeds: 7940, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C71", storage: '128 GB', proceeds: 6270, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C73 5G", storage: '128 GB', proceeds: 9480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C73 5G", storage: '64 GB', proceeds: 8680, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C75 5G", storage: '128 GB', proceeds: 9740, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C83 5G", storage: '128 GB', proceeds: 12820, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C83 5G", storage: '64 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme C85 5G", storage: '128 GB', proceeds: 11100, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 2", storage: '256 GB', proceeds: 10670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 2", storage: '128 GB', proceeds: 10410, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 2 Pro", storage: '256 GB', proceeds: 11060, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 2 Pro", storage: '128 GB', proceeds: 10520, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 5G", storage: '128 GB', proceeds: 9210, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 5G", storage: '256 GB', proceeds: 9570, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 6", storage: '256 GB', proceeds: 17920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 6", storage: '512 GB', proceeds: 21260, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 6T 5G", storage: '512 GB', proceeds: 19080, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 6T 5G", storage: '128 GB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 6T 5G", storage: '256 GB', proceeds: 16780, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 7", storage: '512 GB', proceeds: 30670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 7", storage: '256 GB', proceeds: 25550, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 7 Pro 5G", storage: '512 GB', proceeds: 35590, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 7 Pro 5G", storage: '256 GB', proceeds: 30870, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 7T", storage: '512 GB', proceeds: 24130, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 7T", storage: '256 GB', proceeds: 22210, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 8 Pro", storage: '512 GB', proceeds: 42970, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT 8 Pro", storage: '256 GB', proceeds: 40390, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT Master Edition", storage: '256 GB', proceeds: 9600, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT Master Edition", storage: '128 GB', proceeds: 9350, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT NEO 2", storage: '256 GB', proceeds: 9990, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT NEO 2", storage: '128 GB', proceeds: 9690, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT Neo 3", storage: '128 GB', proceeds: 10410, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT Neo 3", storage: '256 GB', proceeds: 10520, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT NEO 3 150W", storage: '256 GB', proceeds: 11670, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT NEO 3T", storage: '128 GB', proceeds: 9880, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme GT NEO 3T", storage: '256 GB', proceeds: 10210, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 10", storage: '128 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 100 Lite 5G", storage: '128 GB', proceeds: 12410, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 100 Lite 5G", storage: '64 GB', proceeds: 10190, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 10A", storage: '32 GB', proceeds: 4290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 10A", storage: '64 GB', proceeds: 4500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 20", storage: '64 GB', proceeds: 5450, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 20", storage: '128 GB', proceeds: 5700, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 20 Pro", storage: '128 GB', proceeds: 5720, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 20 Pro", storage: '64 GB', proceeds: 5260, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 20A", storage: '32 GB', proceeds: 4380, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 20A", storage: '64 GB', proceeds: 4880, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 30", storage: '64 GB', proceeds: 5290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 30 5G", storage: '128 GB', proceeds: 8360, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 30 Pro 5G", storage: '128 GB', proceeds: 8500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 30 Pro 5G", storage: '64 GB', proceeds: 8330, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 30A", storage: '32 GB', proceeds: 4760, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 30A", storage: '64 GB', proceeds: 5130, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50", storage: '128 GB', proceeds: 6130, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50 5G", storage: '64 GB', proceeds: 6080, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50 Pro 5G", storage: '128 GB', proceeds: 8650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50A", storage: '64 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50A", storage: '128 GB', proceeds: 5420, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50A Prime", storage: '128 GB', proceeds: 5410, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50A Prime", storage: '64 GB', proceeds: 4950, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50i", storage: '32 GB', proceeds: 4250, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50i", storage: '64 GB', proceeds: 4820, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50i Prime", storage: '64 GB', proceeds: 4560, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 50i Prime", storage: '32 GB', proceeds: 4290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 60 5G", storage: '256 GB', proceeds: 11580, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 60 5G", storage: '128 GB', proceeds: 11290, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 60 Pro 5G", storage: '1 TB', proceeds: 15850, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 60 Pro 5G", storage: '128 GB', proceeds: 14370, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 60 Pro 5G", storage: '256 GB', proceeds: 14860, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 60X 5G", storage: '128 GB', proceeds: 9640, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 70 5G", storage: '128 GB', proceeds: 8920, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 70 Pro 5G", storage: '256 GB', proceeds: 12530, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 70 Pro 5G", storage: '128 GB', proceeds: 11590, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 70 Turbo 5G", storage: '256 GB', proceeds: 11890, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 70 Turbo 5G", storage: '128 GB', proceeds: 10900, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 70x 5G", storage: '128 GB', proceeds: 8270, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 80 Lite 4G", storage: '128 GB', proceeds: 6760, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 80 Lite 4G", storage: '64 GB', proceeds: 6400, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 80 Lite 5G", storage: '128 GB', proceeds: 8400, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 80 Pro 5G", storage: '128 GB', proceeds: 12710, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 80 Pro 5G", storage: '256 GB', proceeds: 14020, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 80x 5G", storage: '128 GB', proceeds: 9280, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 90 5G", storage: '128 GB', proceeds: 13830, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo 90x 5G", storage: '128 GB', proceeds: 11810, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N53", storage: '64 GB', proceeds: 6600, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N53", storage: '128 GB', proceeds: 7310, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N55", storage: '128 GB', proceeds: 7480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N55", storage: '64 GB', proceeds: 6940, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N61", storage: '128 GB', proceeds: 5610, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N61", storage: '64 GB', proceeds: 4860, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N63", storage: '64 GB', proceeds: 5240, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N63", storage: '128 GB', proceeds: 5750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo N65 5G", storage: '128 GB', proceeds: 6940, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo Power 5G", storage: '128 GB', proceeds: 18680, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme Narzo Power 5G", storage: '256 GB', proceeds: 20490, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P1 5G", storage: '128 GB', proceeds: 10750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P1 5G", storage: '256 GB', proceeds: 11420, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P1 Pro 5G", storage: '256 GB', proceeds: 11090, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P1 Pro 5G", storage: '128 GB', proceeds: 10100, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P2 Pro 5G", storage: '256 GB', proceeds: 11590, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P2 Pro 5G", storage: '128 GB', proceeds: 10800, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P2 Pro 5G", storage: '512 GB', proceeds: 13430, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 5G", storage: '128 GB', proceeds: 12470, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 5G", storage: '256 GB', proceeds: 13320, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 Lite 5G", storage: '128 GB', proceeds: 8400, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 Pro 5G", storage: '256 GB', proceeds: 15440, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 Pro 5G", storage: '128 GB', proceeds: 13930, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 Ultra 5G", storage: '128 GB', proceeds: 15240, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3 Ultra 5G", storage: '256 GB', proceeds: 16700, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P3X 5G", storage: '128 GB', proceeds: 10240, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 5G", storage: '128 GB', proceeds: 14840, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 5G", storage: '256 GB', proceeds: 15650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 Lite", storage: '128 GB', proceeds: 9480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 Lite", storage: '64 GB', proceeds: 8680, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 Power 5G", storage: '256 GB', proceeds: 20800, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 Power 5G", storage: '128 GB', proceeds: 18880, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 Pro 5G", storage: '128 GB', proceeds: 17160, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4 Pro 5G", storage: '256 GB', proceeds: 17560, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4R 5G", storage: '256 GB', proceeds: 17770, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4R 5G", storage: '64 GB', proceeds: 13500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4R 5G", storage: '128 GB', proceeds: 15750, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4s 5G", storage: '256 GB', proceeds: 28000, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4s 5G", storage: '128 GB', proceeds: 23500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4x 5G", storage: '128 GB', proceeds: 11500, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme P4x 5G", storage: '256 GB', proceeds: 12410, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme U1", storage: '32 GB', proceeds: 3300, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme U1", storage: '64 GB', proceeds: 3420, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X2", storage: '64 GB', proceeds: 5070, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X2", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X2", storage: '256 GB', proceeds: 6300, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X2 Pro", storage: '64 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X2 Pro", storage: '128 GB', proceeds: 6170, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X2 Pro", storage: '256 GB', proceeds: 6530, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X3", storage: '128 GB', proceeds: 6450, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X3 SuperZoom", storage: '256 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X3 SuperZoom", storage: '128 GB', proceeds: 6040, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X50 Pro", storage: '128 GB', proceeds: 7480, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X50 Pro", storage: '256 GB', proceeds: 8370, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X7", storage: '128 GB', proceeds: 8650, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X7 Max 5G", storage: '128 GB', proceeds: 9440, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X7 Max 5G", storage: '256 GB', proceeds: 9880, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme X7 Pro", storage: '128 GB', proceeds: 9040, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme XT", storage: '64 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Realme', model: "Realme XT", storage: '128 GB', proceeds: 6010, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Galaxy S22 Ultra 5G", storage: '128 GB', proceeds: 44000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: "Galaxy S22+ 5G", storage: '128 GB', proceeds: 34000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: "Galaxy S23+", storage: '256 GB', proceeds: 46000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: "Galaxy S24+", storage: '256 GB', proceeds: 59000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: "Galaxy S25 Ultra", storage: '256 GB', proceeds: 84000, lastUpdated: '2025-02-15' },
  { brand: 'Samsung', model: "Galaxy S25+", storage: '256 GB', proceeds: 68000, lastUpdated: '2025-02-15' },
  { brand: 'Samsung', model: "Galaxy Z Flip 5", storage: '256 GB', proceeds: 44000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: "Galaxy Z Flip 6", storage: '256 GB', proceeds: 58000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: "Galaxy Z Fold 5", storage: '256 GB', proceeds: 72000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: "Galaxy Z Fold 6", storage: '256 GB', proceeds: 88000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: "Samsung Galaxy A03", storage: '32 GB', proceeds: 3350, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A03", storage: '64 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A03 Core", storage: '32 GB', proceeds: 3210, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A03s", storage: '32 GB', proceeds: 3210, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A03s", storage: '64 GB', proceeds: 4100, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A04", storage: '32 GB', proceeds: 3560, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A04", storage: '128 GB', proceeds: 4790, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A04", storage: '64 GB', proceeds: 4100, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A04s", storage: '128 GB', proceeds: 4600, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A04s", storage: '64 GB', proceeds: 4450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A05", storage: '128 GB', proceeds: 6530, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A05", storage: '64 GB', proceeds: 6190, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A05s", storage: '128 GB', proceeds: 6340, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A06", storage: '64 GB', proceeds: 5940, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A06", storage: '128 GB', proceeds: 6160, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A07", storage: '64 GB', proceeds: 6510, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A07 5G", storage: '128 GB', proceeds: 11190, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A10", storage: '32 GB', proceeds: 2950, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A10s", storage: '32 GB', proceeds: 3180, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A12", storage: '128 GB', proceeds: 5260, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A12", storage: '64 GB', proceeds: 4640, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A13", storage: '64 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A13", storage: '128 GB', proceeds: 5980, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A14", storage: '64 GB', proceeds: 6880, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A14", storage: '128 GB', proceeds: 7450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A15 5G", storage: '128 GB', proceeds: 10890, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A15 5G", storage: '256 GB', proceeds: 11660, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A16 5G", storage: '128 GB', proceeds: 11610, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A16 5G", storage: '256 GB', proceeds: 12620, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A17 5G", storage: '128 GB', proceeds: 14130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A17 5G", storage: '256 GB', proceeds: 14640, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A20", storage: '32 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A20s", storage: '64 GB', proceeds: 3790, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A20s", storage: '32 GB', proceeds: 3410, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A21s", storage: '64 GB', proceeds: 4350, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A21s", storage: '128 GB', proceeds: 4800, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A22", storage: '128 GB', proceeds: 5440, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A23 5G", storage: '128 GB', proceeds: 10600, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A25 5G", storage: '256 GB', proceeds: 13050, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A25 5G", storage: '128 GB', proceeds: 12660, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A26 5G", storage: '256 GB', proceeds: 14740, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A26 5G", storage: '128 GB', proceeds: 13730, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A27 5G", storage: '256 GB', proceeds: 28250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A27 5G", storage: '128 GB', proceeds: 25040, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A30", storage: '64 GB', proceeds: 3820, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A30s", storage: '128 GB', proceeds: 3840, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A30s", storage: '64 GB', proceeds: 3520, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A31", storage: '128 GB', proceeds: 4760, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A32", storage: '128 GB', proceeds: 6030, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A33 5G", storage: '128 GB', proceeds: 7790, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A34 5G", storage: '128 GB', proceeds: 11680, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A34 5G", storage: '256 GB', proceeds: 12760, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A35 5G", storage: '128 GB', proceeds: 14370, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A35 5G", storage: '256 GB', proceeds: 15050, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A36 5G", storage: '256 GB', proceeds: 19180, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A36 5G", storage: '128 GB', proceeds: 18780, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A37 5G", storage: '256 GB', proceeds: 28250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A37 5G", storage: '128 GB', proceeds: 24230, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A5 2017", storage: '32 GB', proceeds: 2070, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A50", storage: '128 GB', proceeds: 4460, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A50", storage: '64 GB', proceeds: 4400, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A50s", storage: '128 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A51", storage: '128 GB', proceeds: 5030, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A52", storage: '128 GB', proceeds: 6430, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A52s 5G", storage: '128 GB', proceeds: 8880, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A53 5G", storage: '128 GB', proceeds: 8550, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A53 5G", storage: '256 GB', proceeds: 9330, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A54 5G", storage: '128 GB', proceeds: 14030, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A54 5G", storage: '256 GB', proceeds: 15310, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A55 5G", storage: '128 GB', proceeds: 17830, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A55 5G", storage: '256 GB', proceeds: 19810, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A56 5G", storage: '256 GB', proceeds: 25440, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A56 5G", storage: '128 GB', proceeds: 23730, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A57 5G", storage: '256 GB', proceeds: 33250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A6", storage: '32 GB', proceeds: 2450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A6", storage: '64 GB', proceeds: 6550, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A6 Plus", storage: '32 GB', proceeds: 2630, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A6 Plus", storage: '64 GB', proceeds: 2810, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A7 2017", storage: '32 GB', proceeds: 2360, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A7 2018", storage: '64 GB', proceeds: 2810, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A7 2018", storage: '128 GB', proceeds: 2990, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A70", storage: '128 GB', proceeds: 5190, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A70s", storage: '128 GB', proceeds: 4740, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A71", storage: '128 GB', proceeds: 5130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A72", storage: '128 GB', proceeds: 7400, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A72", storage: '256 GB', proceeds: 7950, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A73 5G", storage: '128 GB', proceeds: 9830, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A73 5G", storage: '256 GB', proceeds: 10810, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A8 Plus", storage: '64 GB', proceeds: 3290, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A8 Star", storage: '64 GB', proceeds: 2770, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A80", storage: '128 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A9 2018", storage: '128 GB', proceeds: 3180, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy A9 Pro", storage: '32 GB', proceeds: 2430, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy C5 Pro", storage: '64 GB', proceeds: 3030, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy C7 Pro", storage: '64 GB', proceeds: 3100, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy C9 Pro", storage: '64 GB', proceeds: 3140, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F02s", storage: '32 GB', proceeds: 3710, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F02s", storage: '64 GB', proceeds: 3860, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F04", storage: '64 GB', proceeds: 4040, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F05", storage: '64 GB', proceeds: 5370, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F06 5G", storage: '64 GB', proceeds: 6150, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F06 5G", storage: '128 GB', proceeds: 6760, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F07", storage: '64 GB', proceeds: 6450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F12", storage: '128 GB', proceeds: 4790, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F12", storage: '64 GB', proceeds: 4360, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F13", storage: '64 GB', proceeds: 4880, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F13", storage: '128 GB', proceeds: 5100, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F14", storage: '64 GB', proceeds: 6070, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F14 5G", storage: '128 GB', proceeds: 8290, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F15 5G", storage: '128 GB', proceeds: 9670, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F16 5G", storage: '128 GB', proceeds: 9990, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F17 5G", storage: '128 GB', proceeds: 11140, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F22", storage: '128 GB', proceeds: 4860, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F22", storage: '64 GB', proceeds: 4690, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F23 5G", storage: '128 GB', proceeds: 7360, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F34 5G", storage: '128 GB', proceeds: 10300, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F36 5G", storage: '128 GB', proceeds: 13420, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F36 5G", storage: '256 GB', proceeds: 14710, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F41", storage: '128 GB', proceeds: 4940, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F41", storage: '64 GB', proceeds: 4270, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F42 5G", storage: '128 GB', proceeds: 7970, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F55 5G", storage: '256 GB', proceeds: 14560, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F55 5G", storage: '128 GB', proceeds: 12680, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F56 5G", storage: '128 GB', proceeds: 16960, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F56 5G", storage: '256 GB', proceeds: 19460, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F62", storage: '128 GB', proceeds: 6160, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F70 Pro 5G", storage: '256 GB', proceeds: 25750, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F70 Pro 5G", storage: '128 GB', proceeds: 19000, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy F70e 5G", storage: '128 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Fold", storage: '512 GB', proceeds: 13710, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J6", storage: '64 GB', proceeds: 2620, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J6", storage: '32 GB', proceeds: 2520, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J6 Plus", storage: '64 GB', proceeds: 2880, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J7 Duo", storage: '32 GB', proceeds: 2360, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J7 Max", storage: '32 GB', proceeds: 2430, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J7 Nxt", storage: '16 GB', proceeds: 2130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J7 Nxt", storage: '32 GB', proceeds: 2360, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J7 Pro", storage: '64 GB', proceeds: 2110, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J7 Pro", storage: '32 GB', proceeds: 1940, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy J8", storage: '64 GB', proceeds: 3260, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M01", storage: '32 GB', proceeds: 3220, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M01 Core", storage: '32 GB', proceeds: 2640, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M01 Core", storage: '16 GB', proceeds: 2380, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M01s", storage: '32 GB', proceeds: 3070, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M02", storage: '32 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M02s", storage: '32 GB', proceeds: 3330, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M02s", storage: '64 GB', proceeds: 3820, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M04", storage: '64 GB', proceeds: 4590, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M04", storage: '128 GB', proceeds: 4730, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M05", storage: '64 GB', proceeds: 5720, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M06 5G", storage: '128 GB', proceeds: 7450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M06 5G", storage: '64 GB', proceeds: 6500, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M07", storage: '64 GB', proceeds: 5820, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M10s", storage: '32 GB', proceeds: 3270, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M11", storage: '64 GB', proceeds: 3940, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M11", storage: '32 GB', proceeds: 3480, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M12", storage: '128 GB', proceeds: 5200, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M12", storage: '64 GB', proceeds: 4800, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M13", storage: '64 GB', proceeds: 5220, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M13", storage: '128 GB', proceeds: 5400, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M14 4G", storage: '64 GB', proceeds: 6340, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M14 4G", storage: '128 GB', proceeds: 7130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M14 5G", storage: '128 GB', proceeds: 8640, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M15 5G", storage: '128 GB', proceeds: 9570, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M15 5G Prime Edition", storage: '128 GB', proceeds: 9680, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M16 5G", storage: '128 GB', proceeds: 9330, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M17e 5G", storage: '128 GB', proceeds: 11610, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M20", storage: '32 GB', proceeds: 3130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M20", storage: '64 GB', proceeds: 3290, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M21", storage: '64 GB', proceeds: 4200, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M21", storage: '128 GB', proceeds: 4450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M21 2021 Edition", storage: '128 GB', proceeds: 4420, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M21 2021 Edition", storage: '64 GB', proceeds: 4310, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M30", storage: '64 GB', proceeds: 3700, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M30", storage: '128 GB', proceeds: 3900, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M30", storage: '32 GB', proceeds: 3510, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M30s", storage: '128 GB', proceeds: 3900, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M30s", storage: '64 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M31", storage: '64 GB', proceeds: 4230, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M31", storage: '128 GB', proceeds: 4820, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M31s", storage: '128 GB', proceeds: 4690, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M32", storage: '64 GB', proceeds: 4570, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M32 5G", storage: '128 GB', proceeds: 7910, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M32 Prime Edition", storage: '128 GB', proceeds: 6200, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M32 Prime Edition", storage: '64 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M33 5G", storage: '128 GB', proceeds: 8020, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M34 5G", storage: '128 GB', proceeds: 9820, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M34 5G", storage: '256 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M35 5G", storage: '128 GB', proceeds: 11000, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M35 5G", storage: '256 GB', proceeds: 11690, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M36 5G", storage: '128 GB', proceeds: 11450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M36 5G", storage: '256 GB', proceeds: 13800, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M40", storage: '128 GB', proceeds: 4280, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M42 5G", storage: '128 GB', proceeds: 7860, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M47 5G", storage: '128 GB', proceeds: 23220, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M47 5G", storage: '256 GB', proceeds: 26250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M51", storage: '128 GB', proceeds: 5480, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M52 5G", storage: '128 GB', proceeds: 8440, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M53 5G", storage: '128 GB', proceeds: 9380, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M55 5G", storage: '128 GB', proceeds: 14260, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M55 5G", storage: '256 GB', proceeds: 15150, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M55s 5G", storage: '256 GB', proceeds: 13460, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M55s 5G", storage: '128 GB', proceeds: 12580, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M56 5G", storage: '128 GB', proceeds: 16150, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy M56 5G", storage: '256 GB', proceeds: 18270, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 10", storage: '256 GB', proceeds: 9970, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 10 Lite", storage: '128 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 10 Plus", storage: '256 GB', proceeds: 10520, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 10 Plus", storage: '512 GB', proceeds: 10670, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 20", storage: '256 GB', proceeds: 10020, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 20 Ultra 5G", storage: '256 GB', proceeds: 14850, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 8", storage: '256 GB', proceeds: 7050, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 8", storage: '64 GB', proceeds: 5780, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 8", storage: '128 GB', proceeds: 6530, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 9", storage: '512 GB', proceeds: 7250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Note 9", storage: '128 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy On Max", storage: '32 GB', proceeds: 2470, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy On6", storage: '64 GB', proceeds: 2050, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy On7 Prime", storage: '32 GB', proceeds: 2580, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy On7 Prime", storage: '64 GB', proceeds: 2870, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy On8 2018", storage: '64 GB', proceeds: 2700, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10", storage: '128 GB', proceeds: 7850, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10", storage: '512 GB', proceeds: 8680, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10 Lite", storage: '512 GB', proceeds: 7420, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10 Lite", storage: '128 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10 Plus", storage: '1 TB', proceeds: 10190, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10 Plus", storage: '512 GB', proceeds: 8870, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10 Plus", storage: '128 GB', proceeds: 8720, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S10e", storage: '128 GB', proceeds: 6660, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S20", storage: '128 GB', proceeds: 9660, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S20 FE", storage: '128 GB', proceeds: 8820, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S20 FE", storage: '256 GB', proceeds: 9130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S20 Plus", storage: '128 GB', proceeds: 10980, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S20 Ultra 5G", storage: '128 GB', proceeds: 14920, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 5G", storage: '256 GB', proceeds: 14280, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 5G", storage: '128 GB', proceeds: 13620, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 FE 5G", storage: '128 GB', proceeds: 12550, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 FE 5G", storage: '256 GB', proceeds: 13360, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 Plus 5G", storage: '128 GB', proceeds: 13710, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 Plus 5G", storage: '256 GB', proceeds: 15200, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 Ultra 5G", storage: '512 GB', proceeds: 20260, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S21 Ultra 5G", storage: '256 GB', proceeds: 18130, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 5G", storage: '128 GB', proceeds: 16970, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 5G", storage: '256 GB', proceeds: 18030, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 Plus 5G", storage: '256 GB', proceeds: 19110, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 Plus 5G", storage: '128 GB', proceeds: 17740, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 Ultra 5G", storage: '1 TB', proceeds: 28610, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 Ultra 5G", storage: '512 GB', proceeds: 27800, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S22 Ultra 5G", storage: '256 GB', proceeds: 25780, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 5G", storage: '128 GB', proceeds: 23700, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 5G", storage: '256 GB', proceeds: 25060, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 FE 5G", storage: '128 GB', proceeds: 19060, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 FE 5G", storage: '256 GB', proceeds: 19890, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 Plus 5G", storage: '256 GB', proceeds: 26430, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 Plus 5G", storage: '512 GB', proceeds: 27800, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 Ultra 5G", storage: '256 GB', proceeds: 35960, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 Ultra 5G", storage: '512 GB', proceeds: 36770, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S23 Ultra 5G", storage: '1 TB', proceeds: 39440, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 5G", storage: '128 GB', proceeds: 34390, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 5G", storage: '256 GB', proceeds: 36420, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 5G", storage: '512 GB', proceeds: 37380, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 FE 5G", storage: '128 GB', proceeds: 25010, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 FE 5G", storage: '256 GB', proceeds: 26440, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 Plus 5G", storage: '512 GB', proceeds: 40230, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 Plus 5G", storage: '256 GB', proceeds: 40640, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 Ultra 5G", storage: '256 GB', proceeds: 62390, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 Ultra 5G", storage: '512 GB', proceeds: 63050, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S24 Ultra 5G", storage: '1 TB', proceeds: 64000, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S25 5G", storage: '128 GB', proceeds: 42900, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S25 Edge", storage: '512 GB', proceeds: 50090, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S25 Edge", storage: '256 GB', proceeds: 43720, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S25 FE", storage: '512 GB', proceeds: 40250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S25 FE", storage: '256 GB', proceeds: 36750, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S25 FE", storage: '128 GB', proceeds: 32750, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26", storage: '512 GB', proceeds: 61520, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26", storage: '256 GB', proceeds: 52250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26 FE 5G", storage: '256 GB', proceeds: 52500, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26 Plus", storage: '512 GB', proceeds: 71610, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26 Plus", storage: '256 GB', proceeds: 62750, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26 Ultra", storage: '256 GB', proceeds: 82920, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26 Ultra", storage: '512 GB', proceeds: 87250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S26 Ultra", storage: '1 TB', proceeds: 102250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S8", storage: '64 GB', proceeds: 4390, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S8 Plus", storage: '128 GB', proceeds: 5020, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S8 Plus", storage: '64 GB', proceeds: 4730, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S9", storage: '128 GB', proceeds: 5440, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S9", storage: '256 GB', proceeds: 5740, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S9", storage: '64 GB', proceeds: 5220, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S9 Plus", storage: '256 GB', proceeds: 5970, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S9 Plus", storage: '64 GB', proceeds: 5400, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy S9 Plus", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip", storage: '256 GB', proceeds: 9500, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip 7", storage: '512 GB', proceeds: 55370, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip 7", storage: '256 GB', proceeds: 54190, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip 8", storage: '512 GB', proceeds: 79970, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip 8", storage: '256 GB', proceeds: 72100, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip3 5G", storage: '256 GB', proceeds: 12890, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip3 5G", storage: '128 GB', proceeds: 12540, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip4", storage: '256 GB', proceeds: 15330, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip4", storage: '128 GB', proceeds: 14350, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip5", storage: '256 GB', proceeds: 27950, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip5", storage: '512 GB', proceeds: 29940, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip6 5G", storage: '512 GB', proceeds: 41560, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip6 5G", storage: '256 GB', proceeds: 39700, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Flip7 FE 5G", storage: '256 GB', proceeds: 52250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 7", storage: '512 GB', proceeds: 93450, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 7", storage: '256 GB', proceeds: 92280, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 7", storage: '1 TB', proceeds: 95250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 8", storage: '256 GB', proceeds: 95750, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 8", storage: '1 TB', proceeds: 113250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 8", storage: '512 GB', proceeds: 102250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 8 Ultra", storage: '256 GB', proceeds: 118250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 8 Ultra", storage: '512 GB', proceeds: 124250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold 8 Ultra", storage: '1 TB', proceeds: 136250, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold2 5G", storage: '256 GB', proceeds: 18080, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold3 5G", storage: '512 GB', proceeds: 22290, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold3 5G", storage: '256 GB', proceeds: 22050, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold4", storage: '512 GB', proceeds: 27920, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold4", storage: '256 GB', proceeds: 27380, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold4", storage: '1 TB', proceeds: 31640, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold5", storage: '1 TB', proceeds: 51930, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold5", storage: '512 GB', proceeds: 49890, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold5", storage: '256 GB', proceeds: 50740, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold6 5G", storage: '256 GB', proceeds: 66800, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold6 5G", storage: '512 GB', proceeds: 67480, lastUpdated: '2026-10-08' },
  { brand: 'Samsung', model: "Samsung Galaxy Z Fold6 5G", storage: '1 TB', proceeds: 70070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo NEX", storage: '128 GB', proceeds: 5440, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo S1", storage: '128 GB', proceeds: 5290, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo S1", storage: '64 GB', proceeds: 5060, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo S1 Pro", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo S2", storage: '256 GB', proceeds: 29000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo S2", storage: '128 GB', proceeds: 26000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T1 5G", storage: '128 GB', proceeds: 8880, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T1 Pro 5G", storage: '128 GB', proceeds: 9560, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T1x", storage: '64 GB', proceeds: 5520, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T1x", storage: '128 GB', proceeds: 6430, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T2 5G", storage: '128 GB', proceeds: 11740, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T2 Pro 5G", storage: '128 GB', proceeds: 16690, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T2 Pro 5G", storage: '256 GB', proceeds: 17270, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T2x 5G", storage: '128 GB', proceeds: 10510, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 5G", storage: '256 GB', proceeds: 13170, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 5G", storage: '128 GB', proceeds: 12790, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 Lite 5G", storage: '128 GB', proceeds: 7420, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 Pro 5G", storage: '128 GB', proceeds: 15950, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 Pro 5G", storage: '256 GB', proceeds: 17940, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 Ultra", storage: '128 GB', proceeds: 18330, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3 Ultra", storage: '256 GB', proceeds: 20550, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T3x 5G", storage: '128 GB', proceeds: 11440, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 5G", storage: '256 GB', proceeds: 18490, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 5G", storage: '128 GB', proceeds: 16900, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Lite 5G", storage: '128 GB', proceeds: 8450, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Lite 5G", storage: '256 GB', proceeds: 9990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Lite 5G", storage: '64 GB', proceeds: 7670, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Pro 5G", storage: '256 GB', proceeds: 20280, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Pro 5G", storage: '128 GB', proceeds: 19040, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Ultra 5G", storage: '256 GB', proceeds: 24450, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4 Ultra 5G", storage: '512 GB', proceeds: 26830, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4R 5G", storage: '256 GB', proceeds: 17290, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4R 5G", storage: '128 GB', proceeds: 14740, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4x 5G", storage: '128 GB', proceeds: 11610, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T4x 5G", storage: '256 GB', proceeds: 13120, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 5G", storage: '128 GB', proceeds: 24000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 5G", storage: '256 GB', proceeds: 30500, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 Lite 5G", storage: '256 GB', proceeds: 17400, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 Lite 5G", storage: '128 GB', proceeds: 13920, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 Lite 5G", storage: '64 GB', proceeds: 13000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 Pro 5G", storage: '128 GB', proceeds: 19500, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5 Pro 5G", storage: '256 GB', proceeds: 23360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5x 5G", storage: '128 GB', proceeds: 17900, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo T5x 5G", storage: '256 GB', proceeds: 18690, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo U10", storage: '32 GB', proceeds: 3880, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo U10", storage: '64 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo U20", storage: '128 GB', proceeds: 4760, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo U20", storage: '64 GB', proceeds: 4610, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V11", storage: '64 GB', proceeds: 4360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V11 Pro", storage: '64 GB', proceeds: 4840, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V15", storage: '64 GB', proceeds: 5290, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V15", storage: '128 GB', proceeds: 5440, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V15 Pro", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V17", storage: '128 GB', proceeds: 6790, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V17 Pro", storage: '128 GB', proceeds: 6910, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V19", storage: '128 GB', proceeds: 6930, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V19", storage: '256 GB', proceeds: 7020, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V20", storage: '256 GB', proceeds: 7260, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V20", storage: '128 GB', proceeds: 6950, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V20 2021", storage: '256 GB', proceeds: 6640, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V20 2021", storage: '128 GB', proceeds: 6490, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V20 Pro", storage: '128 GB', proceeds: 9010, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V20 SE", storage: '128 GB', proceeds: 6720, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V21 5G", storage: '256 GB', proceeds: 9620, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V21 5G", storage: '128 GB', proceeds: 9130, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V21e 5G", storage: '128 GB', proceeds: 8570, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V21e 5G", storage: '256 GB', proceeds: 8880, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V23 5G", storage: '256 GB', proceeds: 11490, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V23 5G", storage: '128 GB', proceeds: 10490, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V23 Pro", storage: '128 GB', proceeds: 11220, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V23 Pro", storage: '256 GB', proceeds: 12500, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V23e 5G", storage: '128 GB', proceeds: 9730, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V25 5G", storage: '128 GB', proceeds: 10500, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V25 5G", storage: '256 GB', proceeds: 11430, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V25 Pro 5G", storage: '128 GB', proceeds: 12990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V25 Pro 5G", storage: '256 GB', proceeds: 13570, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V27", storage: '256 GB', proceeds: 18840, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V27", storage: '128 GB', proceeds: 16600, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V27 Pro", storage: '128 GB', proceeds: 18790, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V27 Pro", storage: '256 GB', proceeds: 19220, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V29", storage: '128 GB', proceeds: 17910, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V29", storage: '256 GB', proceeds: 18560, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V29 Pro", storage: '256 GB', proceeds: 20190, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V29e", storage: '128 GB', proceeds: 16520, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V29e", storage: '256 GB', proceeds: 17480, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V30", storage: '256 GB', proceeds: 20640, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V30", storage: '128 GB', proceeds: 19810, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V30 Pro", storage: '256 GB', proceeds: 22510, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V30 Pro", storage: '512 GB', proceeds: 23770, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V30e", storage: '128 GB', proceeds: 18370, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V30e", storage: '256 GB', proceeds: 18960, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40", storage: '128 GB', proceeds: 21090, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40", storage: '512 GB', proceeds: 22970, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40", storage: '256 GB', proceeds: 22580, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40 Pro", storage: '512 GB', proceeds: 27860, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40 Pro", storage: '256 GB', proceeds: 26130, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40e", storage: '256 GB', proceeds: 19810, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V40e", storage: '128 GB', proceeds: 19320, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V5", storage: '32 GB', proceeds: 2550, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V5 Plus", storage: '32 GB', proceeds: 2990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V5 Plus", storage: '64 GB', proceeds: 3180, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V50", storage: '256 GB', proceeds: 23360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V50", storage: '128 GB', proceeds: 21200, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V50", storage: '512 GB', proceeds: 24230, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V50e", storage: '128 GB', proceeds: 20190, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V50e", storage: '256 GB', proceeds: 20700, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V60", storage: '256 GB', proceeds: 27210, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V60", storage: '128 GB', proceeds: 23460, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V60", storage: '512 GB', proceeds: 29070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V60e", storage: '256 GB', proceeds: 24240, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V60e", storage: '128 GB', proceeds: 20880, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V7", storage: '32 GB', proceeds: 3070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V7 Plus", storage: '64 GB', proceeds: 3140, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V70", storage: '256 GB', proceeds: 32750, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V70 Elite", storage: '256 GB', proceeds: 36050, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V70 Elite", storage: '512 GB', proceeds: 41250, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V70 FE", storage: '256 GB', proceeds: 29840, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V70 FE", storage: '128 GB', proceeds: 24430, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V9", storage: '64 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V9 Pro", storage: '64 GB', proceeds: 4110, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo V9 Youth", storage: '32 GB', proceeds: 3210, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X Fold 3 Pro", storage: '512 GB', proceeds: 59880, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X Fold 5", storage: '512 GB', proceeds: 79770, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X100", storage: '256 GB', proceeds: 27960, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X100", storage: '512 GB', proceeds: 28720, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X100 Pro", storage: '512 GB', proceeds: 33070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X200 FE", storage: '256 GB', proceeds: 35290, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X200 FE", storage: '512 GB', proceeds: 36670, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X200T", storage: '512 GB', proceeds: 41590, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X200T", storage: '256 GB', proceeds: 38450, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X21", storage: '128 GB', proceeds: 4620, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X300", storage: '512 GB', proceeds: 47010, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X300", storage: '256 GB', proceeds: 46220, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X300 FE", storage: '256 GB', proceeds: 49750, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X300 FE", storage: '512 GB', proceeds: 55250, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X300 Pro", storage: '512 GB', proceeds: 62750, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X300 Ultra", storage: '512 GB', proceeds: 78990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X50", storage: '256 GB', proceeds: 6910, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X50", storage: '128 GB', proceeds: 6680, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X50 Pro", storage: '256 GB', proceeds: 10070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X60", storage: '256 GB', proceeds: 11130, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X60", storage: '128 GB', proceeds: 10440, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X60 Pro", storage: '256 GB', proceeds: 12660, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X60 Pro Plus", storage: '256 GB', proceeds: 14220, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X70 Pro", storage: '128 GB', proceeds: 15190, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X70 Pro", storage: '256 GB', proceeds: 16730, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X70 Pro Plus", storage: '256 GB', proceeds: 18390, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X80", storage: '128 GB', proceeds: 16240, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X80", storage: '256 GB', proceeds: 17750, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X80 Pro", storage: '256 GB', proceeds: 21190, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X9", storage: '64 GB', proceeds: 3230, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X9", storage: '128 GB', proceeds: 3390, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X90", storage: '256 GB', proceeds: 24330, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X90 Pro", storage: '256 GB', proceeds: 29110, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X9s", storage: '64 GB', proceeds: 3310, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo X9s Plus", storage: '64 GB', proceeds: 3540, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y01", storage: '32 GB', proceeds: 3720, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y01a", storage: '32 GB', proceeds: 3600, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y02", storage: '32 GB', proceeds: 3980, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y02T", storage: '64 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y05", storage: '64 GB', proceeds: 9540, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y100 5G", storage: '128 GB', proceeds: 11790, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y100A 5G", storage: '256 GB', proceeds: 11990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y100A 5G", storage: '128 GB', proceeds: 11600, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y11 2019", storage: '32 GB', proceeds: 3790, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y11 5G", storage: '128 GB', proceeds: 11710, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y11 5G", storage: '64 GB', proceeds: 10700, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y12", storage: '32 GB', proceeds: 4850, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y12", storage: '64 GB', proceeds: 4540, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y12G", storage: '32 GB', proceeds: 4400, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y12G", storage: '64 GB', proceeds: 4890, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y12s", storage: '32 GB', proceeds: 4860, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y15 2019", storage: '64 GB', proceeds: 4750, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y15c", storage: '64 GB', proceeds: 4360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y15c", storage: '32 GB', proceeds: 4170, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y15s 2021", storage: '32 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y16", storage: '32 GB', proceeds: 4590, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y16", storage: '128 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y16", storage: '64 GB', proceeds: 5090, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y17", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y17s", storage: '128 GB', proceeds: 7120, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y17s", storage: '64 GB', proceeds: 6660, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y18", storage: '128 GB', proceeds: 6410, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y18", storage: '64 GB', proceeds: 6090, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y18e", storage: '64 GB', proceeds: 5940, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y18i", storage: '64 GB', proceeds: 6090, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y19 5G", storage: '128 GB', proceeds: 9180, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y19 5G", storage: '64 GB', proceeds: 8350, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y19e", storage: '64 GB', proceeds: 6320, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y19s 5G", storage: '64 GB', proceeds: 8980, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y19s 5G", storage: '128 GB', proceeds: 11000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y1s", storage: '32 GB', proceeds: 3450, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y20", storage: '64 GB', proceeds: 5320, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y200 5G", storage: '256 GB', proceeds: 13970, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y200 5G", storage: '128 GB', proceeds: 13350, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y200 Pro 5G", storage: '128 GB', proceeds: 14970, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y200e 5G", storage: '128 GB', proceeds: 12990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y20A", storage: '64 GB', proceeds: 4840, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y20G", storage: '64 GB', proceeds: 5340, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y20G", storage: '128 GB', proceeds: 6130, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y20i", storage: '64 GB', proceeds: 4650, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y20T", storage: '64 GB', proceeds: 6000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21 2021", storage: '64 GB', proceeds: 5360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21 2021", storage: '128 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21 5G", storage: '128 GB', proceeds: 13340, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21a", storage: '64 GB', proceeds: 5140, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21e", storage: '64 GB', proceeds: 5050, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21G", storage: '64 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y21T", storage: '128 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y22 2022", storage: '64 GB', proceeds: 5590, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y22 2022", storage: '128 GB', proceeds: 6080, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y27", storage: '128 GB', proceeds: 8080, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y28 5G", storage: '128 GB', proceeds: 10280, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y28e 5G", storage: '128 GB', proceeds: 9810, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y28e 5G", storage: '64 GB', proceeds: 8620, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y28s 5G", storage: '128 GB', proceeds: 10740, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y29 5G", storage: '128 GB', proceeds: 13000, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y29 5G", storage: '256 GB', proceeds: 13730, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y30", storage: '128 GB', proceeds: 5870, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y300 Plus 5G", storage: '128 GB', proceeds: 16800, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y31 2021", storage: '128 GB', proceeds: 5820, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y31 5G", storage: '128 GB', proceeds: 11480, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y31 Pro 5G", storage: '256 GB', proceeds: 15610, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y31 Pro 5G", storage: '128 GB', proceeds: 14170, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y31T 5G", storage: '128 GB', proceeds: 17500, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y33s", storage: '128 GB', proceeds: 6480, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y33T", storage: '128 GB', proceeds: 6490, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y35", storage: '128 GB', proceeds: 6370, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y36", storage: '128 GB', proceeds: 9150, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y39 5G", storage: '256 GB', proceeds: 13720, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y39 5G", storage: '128 GB', proceeds: 13650, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y3s 2021", storage: '32 GB', proceeds: 3910, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y400 5G", storage: '256 GB', proceeds: 17990, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y400 5G", storage: '128 GB', proceeds: 17110, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y400 Pro 5G", storage: '256 GB', proceeds: 18160, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y400 Pro 5G", storage: '128 GB', proceeds: 17800, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y50", storage: '128 GB', proceeds: 6120, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y51 2020", storage: '128 GB', proceeds: 6320, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y51 Pro 5G", storage: '256 GB', proceeds: 20580, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y51 Pro 5G", storage: '128 GB', proceeds: 17550, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y51A", storage: '128 GB', proceeds: 6050, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y53i", storage: '16 GB', proceeds: 1960, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y53s", storage: '128 GB', proceeds: 6530, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y55s", storage: '16 GB', proceeds: 2040, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y56 5G", storage: '128 GB', proceeds: 10410, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y58 5G", storage: '128 GB', proceeds: 12360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y66", storage: '32 GB', proceeds: 2480, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y69", storage: '32 GB', proceeds: 2520, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y71", storage: '16 GB', proceeds: 2320, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y71", storage: '32 GB', proceeds: 2660, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y71i", storage: '16 GB', proceeds: 2280, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y72 5G", storage: '128 GB', proceeds: 8710, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y73", storage: '128 GB', proceeds: 7020, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y75 5G", storage: '128 GB', proceeds: 8790, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y81", storage: '32 GB', proceeds: 3070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y81i", storage: '16 GB', proceeds: 2280, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y83", storage: '32 GB', proceeds: 3240, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y83 Pro", storage: '64 GB', proceeds: 3640, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y90", storage: '16 GB', proceeds: 3070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y91", storage: '32 GB', proceeds: 3280, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y91i", storage: '16 GB', proceeds: 2640, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y91i", storage: '32 GB', proceeds: 2870, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y93", storage: '64 GB', proceeds: 3510, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y93", storage: '32 GB', proceeds: 3480, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Y95", storage: '64 GB', proceeds: 4080, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Z1 Pro", storage: '64 GB', proceeds: 4360, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Z1 Pro", storage: '128 GB', proceeds: 4570, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Z10", storage: '32 GB', proceeds: 3480, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Z1x", storage: '128 GB', proceeds: 5070, lastUpdated: '2026-10-08' },
  { brand: 'Vivo', model: "Vivo Z1x", storage: '64 GB', proceeds: 4920, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "POCO F1", storage: '128 GB', proceeds: 4270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "POCO F1", storage: '64 GB', proceeds: 4120, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "POCO F1", storage: '256 GB', proceeds: 4570, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Poco F6", storage: '256 GB', proceeds: 23000, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: "POCO X2", storage: '128 GB', proceeds: 5670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "POCO X2", storage: '256 GB', proceeds: 5820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "POCO X2", storage: '64 GB', proceeds: 5490, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Poco X6 Pro", storage: '256 GB', proceeds: 18500, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: "Redmi Note 13 Pro+", storage: '256 GB', proceeds: 22000, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: "Xiaomi 11 Lite NE 5G", storage: '128 GB', proceeds: 9540, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 11i 5G", storage: '128 GB', proceeds: 9110, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 11i Hypercharge 5G", storage: '128 GB', proceeds: 9490, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 11T Pro 5G", storage: '128 GB', proceeds: 9800, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 11T Pro 5G", storage: '256 GB', proceeds: 10330, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 12 Pro 5G", storage: '256 GB', proceeds: 14880, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 13 Pro 5G", storage: '256 GB', proceeds: 26460, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 14", storage: '256 GB', proceeds: 42000, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: "Xiaomi 14", storage: '512 GB', proceeds: 28400, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 14 CIVI", storage: '256 GB', proceeds: 19900, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 14 CIVI", storage: '512 GB', proceeds: 20600, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 14 Ultra", storage: '512 GB', proceeds: 38980, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 15", storage: '512 GB', proceeds: 38350, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 15 Ultra", storage: '512 GB', proceeds: 60830, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 17", storage: '256 GB', proceeds: 54980, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 17", storage: '512 GB', proceeds: 58750, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 17 Ultra", storage: '512 GB', proceeds: 76620, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 17T", storage: '256 GB', proceeds: 38250, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi 17T", storage: '512 GB', proceeds: 41750, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Black Shark 2", storage: '128 GB', proceeds: 5970, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Black Shark 2", storage: '256 GB', proceeds: 6830, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 10", storage: '256 GB', proceeds: 11350, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 10i", storage: '64 GB', proceeds: 7760, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 10i", storage: '128 GB', proceeds: 8800, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 10T", storage: '128 GB', proceeds: 8610, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 10T Pro", storage: '128 GB', proceeds: 8800, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 11 Lite", storage: '128 GB', proceeds: 6890, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 11 Ultra", storage: '256 GB', proceeds: 18270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 11X", storage: '128 GB', proceeds: 9300, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 11X Pro", storage: '256 GB', proceeds: 9350, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi 11X Pro", storage: '128 GB', proceeds: 9040, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi A2", storage: '64 GB', proceeds: 3520, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi A2", storage: '128 GB', proceeds: 3820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi A3", storage: '64 GB', proceeds: 5010, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi A3", storage: '128 GB', proceeds: 5320, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi Max 2", storage: '128 GB', proceeds: 3280, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi Max 2", storage: '32 GB', proceeds: 2700, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi Max 2", storage: '64 GB', proceeds: 2870, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Mi Mix 2", storage: '128 GB', proceeds: 3820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10", storage: '128 GB', proceeds: 5720, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10", storage: '64 GB', proceeds: 5270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10 Power", storage: '128 GB', proceeds: 6400, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10 Prime", storage: '128 GB', proceeds: 5920, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10 Prime", storage: '64 GB', proceeds: 5320, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10 Prime 2022", storage: '64 GB', proceeds: 5410, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10 Prime 2022", storage: '128 GB', proceeds: 5670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10A", storage: '32 GB', proceeds: 4010, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 10A", storage: '64 GB', proceeds: 4710, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 11 Prime", storage: '128 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 11 Prime 5G", storage: '64 GB', proceeds: 6720, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 12 5G", storage: '128 GB', proceeds: 10600, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 12 5G", storage: '256 GB', proceeds: 11290, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 12C", storage: '128 GB', proceeds: 7140, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 12C", storage: '64 GB', proceeds: 6510, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 13 5G", storage: '128 GB', proceeds: 9980, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 13C", storage: '128 GB', proceeds: 7270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 13C", storage: '256 GB', proceeds: 7570, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 14C 5G", storage: '64 GB', proceeds: 8370, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 14C 5G", storage: '128 GB', proceeds: 8980, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 15 5G", storage: '256 GB', proceeds: 15140, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 15 5G", storage: '128 GB', proceeds: 13520, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 15A 5G", storage: '128 GB', proceeds: 11710, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 15A 5G", storage: '64 GB', proceeds: 10240, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 15C 5G", storage: '128 GB', proceeds: 11610, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 17 5G", storage: '128 GB', proceeds: 16500, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 5", storage: '16 GB', proceeds: 2700, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 5", storage: '32 GB', proceeds: 2760, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 5", storage: '64 GB', proceeds: 3110, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 5A", storage: '32 GB', proceeds: 2360, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 5A", storage: '16 GB', proceeds: 2200, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 6", storage: '64 GB', proceeds: 2890, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 6", storage: '32 GB', proceeds: 2810, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 6 pro", storage: '64 GB', proceeds: 3290, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 6 pro", storage: '32 GB', proceeds: 3160, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 6A", storage: '16 GB', proceeds: 2430, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 6A", storage: '32 GB', proceeds: 2580, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 7", storage: '16 GB', proceeds: 3410, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 7", storage: '32 GB', proceeds: 3560, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 7", storage: '64 GB', proceeds: 3750, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 7A", storage: '16 GB', proceeds: 2450, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 7A", storage: '32 GB', proceeds: 2610, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 8", storage: '64 GB', proceeds: 4480, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 8A", storage: '32 GB', proceeds: 3640, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 8A Dual", storage: '32 GB', proceeds: 3860, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 8A Dual", storage: '64 GB', proceeds: 4080, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9", storage: '64 GB', proceeds: 4160, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9", storage: '128 GB', proceeds: 4540, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9 Activ", storage: '128 GB', proceeds: 4390, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9 Activ", storage: '64 GB', proceeds: 4180, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9 Power", storage: '64 GB', proceeds: 4610, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9 Power", storage: '128 GB', proceeds: 5200, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9 Prime", storage: '128 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9 Prime", storage: '64 GB', proceeds: 4820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9A", storage: '32 GB', proceeds: 4050, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9i", storage: '128 GB', proceeds: 4600, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi 9i", storage: '64 GB', proceeds: 4120, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A1", storage: '32 GB', proceeds: 3560, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A1 Plus", storage: '32 GB', proceeds: 3670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A2", storage: '32 GB', proceeds: 4420, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A2", storage: '64 GB', proceeds: 4670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A2 Plus", storage: '128 GB', proceeds: 5290, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A2 Plus", storage: '64 GB', proceeds: 5150, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A2 Plus", storage: '32 GB', proceeds: 4980, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A3", storage: '128 GB', proceeds: 5800, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A3", storage: '64 GB', proceeds: 5300, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A3x", storage: '64 GB', proceeds: 5170, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A3x", storage: '128 GB', proceeds: 5560, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A4 5G", storage: '64 GB', proceeds: 7270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A4 5G", storage: '128 GB', proceeds: 7650, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A5", storage: '64 GB', proceeds: 5850, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A5", storage: '128 GB', proceeds: 6450, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A7", storage: '64 GB', proceeds: 7970, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A7 Pro", storage: '64 GB', proceeds: 8680, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi A7 Pro 5G", storage: '128 GB', proceeds: 9890, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Go", storage: '16 GB', proceeds: 2050, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Go", storage: '8 GB', proceeds: 1900, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi K20", storage: '64 GB', proceeds: 5670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi K20", storage: '128 GB', proceeds: 6010, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi K20 Pro", storage: '256 GB', proceeds: 7230, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi K20 Pro", storage: '128 GB', proceeds: 6870, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi K50i 5G", storage: '128 GB', proceeds: 9730, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi K50i 5G", storage: '256 GB', proceeds: 9960, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10", storage: '64 GB', proceeds: 5450, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10", storage: '128 GB', proceeds: 5990, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10 Lite", storage: '128 GB', proceeds: 5820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10 Lite", storage: '64 GB', proceeds: 5300, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10 Pro", storage: '64 GB', proceeds: 5510, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10 Pro", storage: '128 GB', proceeds: 7040, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10 Pro Max", storage: '64 GB', proceeds: 6050, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10 Pro Max", storage: '128 GB', proceeds: 7420, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10s", storage: '128 GB', proceeds: 6010, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10s", storage: '64 GB', proceeds: 5670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10T 5G", storage: '128 GB', proceeds: 7810, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 10T 5G", storage: '64 GB', proceeds: 7270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11", storage: '64 GB', proceeds: 6150, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11", storage: '128 GB', proceeds: 6600, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11 Pro", storage: '128 GB', proceeds: 7190, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11 Pro Plus 5G", storage: '128 GB', proceeds: 9200, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11 Pro Plus 5G", storage: '256 GB', proceeds: 9790, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11 SE", storage: '64 GB', proceeds: 6010, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11S", storage: '128 GB', proceeds: 6700, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11S", storage: '64 GB', proceeds: 6160, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11T 5G", storage: '64 GB', proceeds: 7380, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 11T 5G", storage: '128 GB', proceeds: 8650, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 12", storage: '64 GB', proceeds: 7820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 12 5G", storage: '256 GB', proceeds: 11090, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 12 5G", storage: '128 GB', proceeds: 10020, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 12 Pro 5G", storage: '128 GB', proceeds: 12340, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 12 Pro 5G", storage: '256 GB', proceeds: 13300, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 12 Pro Plus 5G", storage: '256 GB', proceeds: 13970, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 13 5G", storage: '128 GB', proceeds: 11380, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 13 5G", storage: '256 GB', proceeds: 11850, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 13 Pro 5G", storage: '128 GB', proceeds: 14450, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 13 Pro 5G", storage: '256 GB', proceeds: 15030, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 13 Pro Plus 5G", storage: '256 GB', proceeds: 17610, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 13 Pro Plus 5G", storage: '512 GB', proceeds: 18480, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 14 SE 5G", storage: '128 GB', proceeds: 10440, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 5G", storage: '128 GB', proceeds: 17670, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 5G", storage: '256 GB', proceeds: 20190, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 Pro 5G", storage: '128 GB', proceeds: 22820, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 Pro 5G", storage: '256 GB', proceeds: 24630, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 Pro Plus 5G", storage: '256 GB', proceeds: 26750, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 Pro Plus 5G", storage: '512 GB', proceeds: 30250, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 SE 5G", storage: '128 GB', proceeds: 16660, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 15 SE 5G", storage: '256 GB', proceeds: 19180, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 17 5G", storage: '128 GB', proceeds: 21500, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 17 Pro 5G", storage: '128 GB', proceeds: 25500, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 17 Pro 5G", storage: '256 GB', proceeds: 27500, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 17 Pro Max 5G", storage: '256 GB', proceeds: 36000, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 5", storage: '64 GB', proceeds: 3120, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 5", storage: '32 GB', proceeds: 2770, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 5 Pro", storage: '64 GB', proceeds: 3790, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 6 Pro", storage: '64 GB', proceeds: 4260, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 7", storage: '32 GB', proceeds: 3640, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 7", storage: '64 GB', proceeds: 4270, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 7 Pro", storage: '128 GB', proceeds: 5350, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 7 Pro", storage: '64 GB', proceeds: 5090, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 7S", storage: '32 GB', proceeds: 4500, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 7S", storage: '64 GB', proceeds: 4620, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 8", storage: '64 GB', proceeds: 5090, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 8", storage: '32 GB', proceeds: 4650, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 8", storage: '128 GB', proceeds: 5260, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 8 Pro", storage: '64 GB', proceeds: 5540, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 8 Pro", storage: '128 GB', proceeds: 6080, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 9", storage: '128 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 9", storage: '64 GB', proceeds: 5250, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 9 Pro", storage: '128 GB', proceeds: 5990, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 9 Pro", storage: '64 GB', proceeds: 5630, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 9 Pro Max", storage: '128 GB', proceeds: 6760, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Note 9 Pro Max", storage: '64 GB', proceeds: 5930, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Turbo 5", storage: '256 GB', proceeds: 25750, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y1", storage: '64 GB', proceeds: 2400, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y1", storage: '32 GB', proceeds: 2300, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y1 Lite", storage: '16 GB', proceeds: 2050, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y2", storage: '32 GB', proceeds: 3120, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y2", storage: '64 GB', proceeds: 3300, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y3", storage: '64 GB', proceeds: 3480, lastUpdated: '2026-10-08' },
  { brand: 'Xiaomi', model: "Xiaomi Redmi Y3", storage: '32 GB', proceeds: 3410, lastUpdated: '2026-10-08' },
];

// Configured Repair Costs Catalog (From scripts/seed_repair_catalog.cjs & RepairPriceCatalog)
export const CONFIGURED_REPAIRS = {
  // Apple
  'apple:iphone 17 pro max': { screen: 24999, battery: 4499, charging: 1799, camera: 6999, backglass: 6499, speaker: 1499 },
  'apple:iphone 17 pro': { screen: 22999, battery: 4299, charging: 1799, camera: 6499, backglass: 5999, speaker: 1499 },
  'apple:iphone 17 air': { screen: 16999, battery: 3899, charging: 1599, camera: 5499, backglass: 4999, speaker: 1299 },
  'apple:iphone 17': { screen: 13999, battery: 3499, charging: 1399, camera: 4499, backglass: 3999, speaker: 1199 },
  'apple:iphone 16 pro max': { screen: 21999, battery: 4199, charging: 1699, camera: 6499, backglass: 5999, speaker: 1399 },
  'apple:iphone 16 pro': { screen: 19999, battery: 3999, charging: 1699, camera: 5999, backglass: 5499, speaker: 1399 },
  'apple:iphone 16 plus': { screen: 12999, battery: 3499, charging: 1399, camera: 4499, backglass: 3999, speaker: 1199 },
  'apple:iphone 16': { screen: 10999, battery: 3299, charging: 1299, camera: 3999, backglass: 3499, speaker: 1099 },
  'apple:iphone 15 pro max': { screen: 19999, battery: 3899, charging: 1499, camera: 5999, backglass: 5499, speaker: 1299 },
  'apple:iphone 15 pro': { screen: 17999, battery: 3699, charging: 1499, camera: 5499, backglass: 4999, speaker: 1299 },
  'apple:iphone 15 plus': { screen: 10999, battery: 3299, charging: 1299, camera: 3999, backglass: 3499, speaker: 1099 },
  'apple:iphone 15': { screen: 8999, battery: 2999, charging: 1199, camera: 3499, backglass: 2999, speaker: 999 },
  'apple:iphone 14 pro max': { screen: 16999, battery: 3499, charging: 1299, camera: 4999, backglass: 4499, speaker: 1199 },
  'apple:iphone 14 pro': { screen: 14999, battery: 3299, charging: 1299, camera: 4499, backglass: 3999, speaker: 1199 },
  'apple:iphone 14 plus': { screen: 8499, battery: 2899, charging: 1099, camera: 3299, backglass: 2899, speaker: 999 },
  'apple:iphone 14': { screen: 6999, battery: 2699, charging: 999, camera: 2999, backglass: 2499, speaker: 899 },
  'apple:iphone 13 pro max': { screen: 12999, battery: 2999, charging: 1099, camera: 3999, backglass: 3499, speaker: 999 },
  'apple:iphone 13 pro': { screen: 10999, battery: 2799, charging: 999, camera: 3499, backglass: 2999, speaker: 899 },
  'apple:iphone 13': { screen: 5499, battery: 2299, charging: 899, camera: 2499, backglass: 1999, speaker: 799 },
  'apple:iphone 13 mini': { screen: 4999, battery: 2199, charging: 899, camera: 2299, backglass: 1899, speaker: 799 },
  'apple:iphone 12 pro max': { screen: 9999, battery: 2499, charging: 899, camera: 2999, backglass: 2499, speaker: 799 },
  'apple:iphone 12 pro': { screen: 8499, battery: 2299, charging: 899, camera: 2699, backglass: 2199, speaker: 799 },
  'apple:iphone 12': { screen: 4499, battery: 1999, charging: 799, camera: 1999, backglass: 1699, speaker: 699 },
  'apple:iphone 12 mini': { screen: 3999, battery: 1899, charging: 799, camera: 1899, backglass: 1599, speaker: 699 },
  'apple:iphone 11 pro max': { screen: 6999, battery: 2199, charging: 799, camera: 2499, backglass: 1999, speaker: 699 },
  'apple:iphone 11 pro': { screen: 5999, battery: 1999, charging: 799, camera: 2199, backglass: 1799, speaker: 699 },
  'apple:iphone 11': { screen: 3299, battery: 1699, charging: 699, camera: 1699, backglass: 1399, speaker: 599 },
  'apple:iphone se (2022)': { screen: 2999, battery: 1499, charging: 699, camera: 1499, backglass: 1199, speaker: 549 },
  'apple:iphone se (2020)': { screen: 2499, battery: 1399, charging: 599, camera: 1299, backglass: 999, speaker: 499 },

  // Samsung
  'samsung:galaxy s25 ultra': { screen: 20999, battery: 3499, charging: 1399, camera: 5499, backglass: 4499, speaker: 1199 },
  'samsung:galaxy s25+': { screen: 14999, battery: 3199, charging: 1199, camera: 4199, backglass: 3299, speaker: 999 },
  'samsung:galaxy s25 5g': { screen: 12999, battery: 2999, charging: 1099, camera: 3699, backglass: 2999, speaker: 899 },
  'samsung:galaxy s24 ultra': { screen: 18999, battery: 3299, charging: 1299, camera: 4999, backglass: 3999, speaker: 1099 },
  'samsung:galaxy s24+': { screen: 13999, battery: 2999, charging: 1099, camera: 3899, backglass: 2999, speaker: 899 },
  'samsung:galaxy s24 5g': { screen: 11999, battery: 2799, charging: 999, camera: 3499, backglass: 2699, speaker: 799 },
  'samsung:galaxy s24 fe': { screen: 8999, battery: 2499, charging: 899, camera: 2999, backglass: 2299, speaker: 699 },
  'samsung:galaxy s23 ultra': { screen: 15999, battery: 2999, charging: 1099, camera: 4299, backglass: 3299, speaker: 999 },
  'samsung:galaxy s23+': { screen: 11999, battery: 2699, charging: 999, camera: 3499, backglass: 2699, speaker: 799 },
  'samsung:galaxy s23 5g': { screen: 9499, battery: 2499, charging: 899, camera: 2999, backglass: 2199, speaker: 699 },
  'samsung:galaxy s23 fe 5g': { screen: 7499, battery: 2199, charging: 799, camera: 2499, backglass: 1899, speaker: 649 },
  'samsung:galaxy s22 ultra 5g': { screen: 13999, battery: 2799, charging: 999, camera: 3899, backglass: 2899, speaker: 899 },
  'samsung:galaxy s22+ 5g': { screen: 9999, battery: 2499, charging: 899, camera: 2999, backglass: 2299, speaker: 749 },
  'samsung:galaxy s22 5g': { screen: 7999, battery: 2299, charging: 799, camera: 2499, backglass: 1899, speaker: 649 },
  'samsung:galaxy z fold 6': { screen: 26999, battery: 4299, charging: 1599, camera: 5999, backglass: 5499, speaker: 1299 },
  'samsung:galaxy z flip 6': { screen: 17999, battery: 3499, charging: 1299, camera: 4299, backglass: 3699, speaker: 999 },
  'samsung:galaxy z fold 5': { screen: 24999, battery: 3999, charging: 1499, camera: 5499, backglass: 4999, speaker: 1199 },
  'samsung:galaxy z flip 5': { screen: 16999, battery: 3299, charging: 1199, camera: 3999, backglass: 3499, speaker: 899 },
  'samsung:galaxy a55 5g': { screen: 4499, battery: 1599, charging: 699, camera: 1799, backglass: 1299, speaker: 599 },
  'samsung:galaxy a35 5g': { screen: 3499, battery: 1499, charging: 699, camera: 1499, backglass: 1199, speaker: 549 },
  'samsung:galaxy a54 5g': { screen: 3999, battery: 1499, charging: 699, camera: 1599, backglass: 1199, speaker: 549 },
  'samsung:galaxy m35 5g': { screen: 2799, battery: 1399, charging: 649, camera: 1299, backglass: 999, speaker: 499 },
  'samsung:galaxy m34 5g': { screen: 2499, battery: 1299, charging: 599, camera: 1199, backglass: 899, speaker: 449 },

  // OnePlus
  'oneplus:oneplus 12': { screen: 12999, battery: 2699, charging: 999, camera: 3499, backglass: 2799, speaker: 799 },
  'oneplus:oneplus 12r': { screen: 7999, battery: 2299, charging: 899, camera: 2699, backglass: 1999, speaker: 699 },
  'oneplus:oneplus 11': { screen: 9999, battery: 2499, charging: 899, camera: 2999, backglass: 2299, speaker: 699 },
  'oneplus:oneplus 11r': { screen: 6499, battery: 1999, charging: 799, camera: 2199, backglass: 1699, speaker: 599 },
  'oneplus:oneplus nord 4': { screen: 4999, battery: 1799, charging: 749, camera: 1899, backglass: 1399, speaker: 549 },
  'oneplus:oneplus nord ce 4': { screen: 3499, battery: 1499, charging: 649, camera: 1499, backglass: 1099, speaker: 499 },
  'oneplus:oneplus nord 3': { screen: 4199, battery: 1699, charging: 699, camera: 1699, backglass: 1299, speaker: 549 },

  // Xiaomi / Redmi / Poco
  'xiaomi:xiaomi 14': { screen: 11999, battery: 2499, charging: 999, camera: 3499, backglass: 2499, speaker: 799 },
  'xiaomi:redmi note 13 pro+': { screen: 4999, battery: 1599, charging: 699, camera: 1899, backglass: 1299, speaker: 549 },
  'xiaomi:redmi note 13 pro': { screen: 3899, battery: 1499, charging: 649, camera: 1699, backglass: 1199, speaker: 499 },
  'xiaomi:redmi note 13': { screen: 2799, battery: 1299, charging: 599, camera: 1299, backglass: 899, speaker: 449 },
  'xiaomi:poco x6 pro': { screen: 3699, battery: 1499, charging: 649, camera: 1599, backglass: 1099, speaker: 499 },
  'xiaomi:poco f6': { screen: 4499, battery: 1699, charging: 699, camera: 1799, backglass: 1299, speaker: 549 },

  // Google Pixel
  'google:pixel 9 pro': { screen: 17999, battery: 3299, charging: 1299, camera: 4999, backglass: 3999, speaker: 999 },
  'google:pixel 9': { screen: 12999, battery: 2799, charging: 1099, camera: 3899, backglass: 2999, speaker: 849 },
  'google:pixel 8 pro': { screen: 15999, battery: 2999, charging: 1199, camera: 4499, backglass: 3499, speaker: 899 },
  'google:pixel 8': { screen: 9999, battery: 2499, charging: 999, camera: 3299, backglass: 2499, speaker: 749 },
  'google:pixel 7a': { screen: 5499, battery: 1999, charging: 799, camera: 2199, backglass: 1499, speaker: 599 },

  // Vivo / Realme / Nothing
  'vivo:vivo x100': { screen: 12999, battery: 2699, charging: 999, camera: 3899, backglass: 2699, speaker: 799 },
  'vivo:vivo v30 pro': { screen: 5499, battery: 1899, charging: 799, camera: 2499, backglass: 1599, speaker: 599 },
  'realme:realme 12 pro+': { screen: 4499, battery: 1699, charging: 699, camera: 1999, backglass: 1399, speaker: 549 },
  'realme:realme gt 6': { screen: 6999, battery: 2199, charging: 899, camera: 2799, backglass: 1899, speaker: 649 },
  'nothing:nothing phone (2)': { screen: 7999, battery: 2499, charging: 899, camera: 2999, backglass: 2999, speaker: 749 },
  'nothing:nothing phone (2a)': { screen: 4499, battery: 1699, charging: 699, camera: 1899, backglass: 1699, speaker: 599 },

  // Lenovo
  'lenovo:lenovo k10 note': { screen: 1199, battery: 699, charging: 349, camera: 599, backglass: 399, speaker: 249 },
  'lenovo:k10 note': { screen: 1199, battery: 699, charging: 349, camera: 599, backglass: 399, speaker: 249 },
  'lenovo:k10 plus': { screen: 1099, battery: 649, charging: 349, camera: 549, backglass: 349, speaker: 249 },
  'lenovo:k8 note': { screen: 999, battery: 599, charging: 299, camera: 499, backglass: 299, speaker: 249 },
};

/**
 * Normalizes device string identifiers for robust catalog matching
 */
function normalizeKey(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/^apple\s+/i, '')
    .replace(/^samsung\s+/i, '')
    .replace(/^google\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes storage string (e.g., '128GB' -> '128 GB')
 */
function normalizeStorage(stg = '') {
  const match = String(stg).match(/(\d+)\s*(gb|tb)/i);
  if (!match) return String(stg).trim();
  return `${match[1]} ${match[2].toUpperCase()}`;
}

/**
 * Dynamic fallback proceeds estimator for any smartphone model in India
 */
export function computeDynamicBenchmarkProceeds(brand = '', model = '', storage = '', ram = '') {
  const normBrand = String(brand || '').toLowerCase().trim();
  const normModel = normalizeKey(model);
  const normStorage = normalizeStorage(storage);

  let base = 16000;

  // Apple iPhones
  if (normBrand.includes('apple') || normModel.includes('iphone')) {
    if (normModel.includes('17 pro max')) base = 118000;
    else if (normModel.includes('17 pro')) base = 104000;
    else if (normModel.includes('17 air') || normModel.includes('17 slim')) base = 82000;
    else if (normModel.includes('17')) base = 72000;
    else if (normModel.includes('16 pro max')) base = 98000;
    else if (normModel.includes('16 pro')) base = 88000;
    else if (normModel.includes('16 plus')) base = 68000;
    else if (normModel.includes('16')) base = 58000;
    else if (normModel.includes('15 pro max')) base = 85000;
    else if (normModel.includes('15 pro')) base = 74000;
    else if (normModel.includes('15 plus')) base = 59000;
    else if (normModel.includes('15')) base = 54000;
    else if (normModel.includes('14 pro max')) base = 65000;
    else if (normModel.includes('14 pro')) base = 58000;
    else if (normModel.includes('14 plus')) base = 49000;
    else if (normModel.includes('14')) base = 46000;
    else if (normModel.includes('13 pro max')) base = 54000;
    else if (normModel.includes('13 pro')) base = 47000;
    else if (normModel.includes('13 mini')) base = 32000;
    else if (normModel.includes('13')) base = 38500;
    else if (normModel.includes('12 pro max')) base = 42000;
    else if (normModel.includes('12 pro')) base = 36000;
    else if (normModel.includes('12 mini')) base = 22000;
    else if (normModel.includes('12')) base = 28000;
    else if (normModel.includes('11 pro max')) base = 31000;
    else if (normModel.includes('11 pro')) base = 26000;
    else if (normModel.includes('11')) base = 21000;
    else if (normModel.includes('xs max')) base = 19000;
    else if (normModel.includes('xs')) base = 16000;
    else if (normModel.includes('xr')) base = 14000;
    else if (normModel.includes('x')) base = 13000;
    else if (normModel.includes('8 plus')) base = 11000;
    else if (normModel.includes('8')) base = 8500;
    else if (normModel.includes('7 plus')) base = 7500;
    else if (normModel.includes('7')) base = 5500;
    else if (normModel.includes('se (2022)') || normModel.includes('se 2022') || normModel.includes('se 3rd')) base = 18000;
    else if (normModel.includes('se (2020)') || normModel.includes('se 2020') || normModel.includes('se 2nd')) base = 11000;
    else if (normModel.includes('se')) base = 4000;
    else base = 25000;
  }
  // Samsung
  else if (normBrand.includes('samsung') || normModel.includes('galaxy')) {
    if (normModel.includes('s25 ultra')) base = 84000;
    else if (normModel.includes('s25+')) base = 68000;
    else if (normModel.includes('s25')) base = 56000;
    else if (normModel.includes('s24 ultra')) base = 78000;
    else if (normModel.includes('s24+')) base = 59000;
    else if (normModel.includes('s24 fe')) base = 38000;
    else if (normModel.includes('s24')) base = 48000;
    else if (normModel.includes('s23 ultra')) base = 62000;
    else if (normModel.includes('s23+')) base = 46000;
    else if (normModel.includes('s23 fe')) base = 31000;
    else if (normModel.includes('s23')) base = 39000;
    else if (normModel.includes('s22 ultra')) base = 44000;
    else if (normModel.includes('s22+')) base = 34000;
    else if (normModel.includes('s22')) base = 27000;
    else if (normModel.includes('s21 ultra')) base = 32000;
    else if (normModel.includes('s21+')) base = 24000;
    else if (normModel.includes('s21 fe')) base = 18000;
    else if (normModel.includes('s21')) base = 20000;
    else if (normModel.includes('s20 ultra')) base = 22000;
    else if (normModel.includes('s20')) base = 14000;
    else if (normModel.includes('fold 6') || normModel.includes('fold6')) base = 88000;
    else if (normModel.includes('flip 6') || normModel.includes('flip6')) base = 58000;
    else if (normModel.includes('fold 5') || normModel.includes('fold5')) base = 72000;
    else if (normModel.includes('flip 5') || normModel.includes('flip5')) base = 44000;
    else if (normModel.includes('fold 4') || normModel.includes('fold4')) base = 55000;
    else if (normModel.includes('flip 4') || normModel.includes('flip4')) base = 32000;
    else if (normModel.includes('note 20 ultra')) base = 28000;
    else if (normModel.includes('note 20')) base = 22000;
    else if (normModel.includes('a55')) base = 25000;
    else if (normModel.includes('a35')) base = 18500;
    else if (normModel.includes('a54')) base = 19500;
    else if (normModel.includes('a34')) base = 15000;
    else if (normModel.includes('m35')) base = 14000;
    else if (normModel.includes('m34')) base = 11000;
    else if (normModel.includes('f54')) base = 13000;
    else base = 16000;
  }
  // OnePlus
  else if (normBrand.includes('oneplus')) {
    if (normModel.includes('open')) base = 75000;
    else if (normModel.includes('13')) base = 58000;
    else if (normModel.includes('12r')) base = 31000;
    else if (normModel.includes('12')) base = 48000;
    else if (normModel.includes('11r')) base = 26000;
    else if (normModel.includes('11')) base = 34000;
    else if (normModel.includes('10 pro')) base = 25000;
    else if (normModel.includes('10t')) base = 21000;
    else if (normModel.includes('10r')) base = 16000;
    else if (normModel.includes('9 pro')) base = 18000;
    else if (normModel.includes('9')) base = 14000;
    else if (normModel.includes('nord 4')) base = 24000;
    else if (normModel.includes('nord ce 4')) base = 19000;
    else if (normModel.includes('nord 3')) base = 17000;
    else if (normModel.includes('nord ce 3 lite')) base = 11000;
    else if (normModel.includes('nord ce 3')) base = 14000;
    else if (normModel.includes('nord 2t')) base = 12000;
    else if (normModel.includes('nord')) base = 10000;
    else base = 15000;
  }
  // Xiaomi / Redmi / Poco
  else if (normBrand.includes('xiaomi') || normBrand.includes('redmi') || normBrand.includes('poco') || normModel.includes('redmi') || normModel.includes('poco')) {
    if (normModel.includes('14 ultra')) base = 62000;
    else if (normModel.includes('14')) base = 42000;
    else if (normModel.includes('13 pro')) base = 35000;
    else if (normModel.includes('note 13 pro+')) base = 22000;
    else if (normModel.includes('note 13 pro')) base = 18000;
    else if (normModel.includes('note 13')) base = 13500;
    else if (normModel.includes('note 12 pro+')) base = 14000;
    else if (normModel.includes('note 12 pro')) base = 12000;
    else if (normModel.includes('note 12')) base = 9500;
    else if (normModel.includes('note 11 pro+')) base = 10500;
    else if (normModel.includes('note 11 pro')) base = 9000;
    else if (normModel.includes('note 11s')) base = 8000;
    else if (normModel.includes('note 11')) base = 7000;
    else if (normModel.includes('note 10 pro max')) base = 8000;
    else if (normModel.includes('note 10 pro')) base = 7000;
    else if (normModel.includes('note 10')) base = 5500;
    else if (normModel.includes('poco f6')) base = 23000;
    else if (normModel.includes('poco f5')) base = 18000;
    else if (normModel.includes('poco x6 pro')) base = 18500;
    else if (normModel.includes('poco x6')) base = 15000;
    else if (normModel.includes('poco x5 pro')) base = 12000;
    else if (normModel.includes('poco m6 pro')) base = 9500;
    else if (normModel.includes('poco m6')) base = 7500;
    else if (normModel.includes('13c') || normModel.includes('12c')) base = 5500;
    else base = 9000;
  }
  // Google Pixel
  else if (normBrand.includes('google') || normModel.includes('pixel')) {
    if (normModel.includes('9 pro xl')) base = 78000;
    else if (normModel.includes('9 pro fold')) base = 92000;
    else if (normModel.includes('9 pro')) base = 72000;
    else if (normModel.includes('9')) base = 54000;
    else if (normModel.includes('8 pro')) base = 52000;
    else if (normModel.includes('8a')) base = 32000;
    else if (normModel.includes('8')) base = 39000;
    else if (normModel.includes('7 pro')) base = 32000;
    else if (normModel.includes('7a')) base = 22000;
    else if (normModel.includes('7')) base = 26000;
    else if (normModel.includes('6 pro')) base = 22000;
    else if (normModel.includes('6a')) base = 15000;
    else if (normModel.includes('6')) base = 18000;
    else base = 20000;
  }
  // Vivo / iQOO
  else if (normBrand.includes('vivo') || normBrand.includes('iqoo') || normModel.includes('iqoo')) {
    if (normModel.includes('x100 pro')) base = 55000;
    else if (normModel.includes('x100')) base = 46000;
    else if (normModel.includes('x90 pro')) base = 38000;
    else if (normModel.includes('v40 pro')) base = 36000;
    else if (normModel.includes('v40')) base = 28000;
    else if (normModel.includes('v30 pro')) base = 28000;
    else if (normModel.includes('v30')) base = 22000;
    else if (normModel.includes('v29 pro')) base = 22000;
    else if (normModel.includes('v29')) base = 18000;
    else if (normModel.includes('t3 pro')) base = 18000;
    else if (normModel.includes('t3')) base = 13500;
    else if (normModel.includes('t2 pro')) base = 14000;
    else if (normModel.includes('t2x')) base = 8500;
    else if (normModel.includes('iqoo 12')) base = 42000;
    else if (normModel.includes('iqoo neo 9 pro')) base = 28000;
    else if (normModel.includes('iqoo neo 7 pro')) base = 21000;
    else if (normModel.includes('iqoo z9')) base = 13500;
    else base = 12000;
  }
  // Realme
  else if (normBrand.includes('realme')) {
    if (normModel.includes('gt 6')) base = 29000;
    else if (normModel.includes('gt 6t')) base = 23000;
    else if (normModel.includes('13 pro+')) base = 24000;
    else if (normModel.includes('12 pro+')) base = 21000;
    else if (normModel.includes('12 pro')) base = 17500;
    else if (normModel.includes('12+')) base = 14000;
    else if (normModel.includes('11 pro+')) base = 15000;
    else if (normModel.includes('narzo 70 pro')) base = 13500;
    else if (normModel.includes('narzo 70')) base = 10500;
    else base = 11000;
  }
  // Oppo
  else if (normBrand.includes('oppo')) {
    if (normModel.includes('find x7')) base = 65000;
    else if (normModel.includes('reno 12 pro')) base = 31000;
    else if (normModel.includes('reno 12')) base = 24000;
    else if (normModel.includes('reno 11 pro')) base = 24000;
    else if (normModel.includes('reno 11')) base = 19000;
    else if (normModel.includes('f27 pro+')) base = 21000;
    else if (normModel.includes('f25 pro')) base = 17500;
    else base = 12000;
  }
  // Motorola
  else if (normBrand.includes('motorola') || normBrand.includes('moto')) {
    if (normModel.includes('edge 50 ultra')) base = 46000;
    else if (normModel.includes('edge 50 pro')) base = 26000;
    else if (normModel.includes('edge 50 fusion')) base = 18500;
    else if (normModel.includes('edge 40')) base = 17000;
    else if (normModel.includes('razr 50')) base = 65000;
    else if (normModel.includes('g85')) base = 13500;
    else if (normModel.includes('g84')) base = 12500;
    else base = 10000;
  }
  // Nothing
  else if (normBrand.includes('nothing') || normModel.includes('nothing')) {
    if (normModel.includes('phone (2)') || normModel.includes('phone 2')) base = 27000;
    else if (normModel.includes('phone (2a)') || normModel.includes('phone 2a')) base = 17500;
    else if (normModel.includes('cmf phone 1')) base = 11500;
    else base = 18000;
  }
  // Lenovo
  else if (normBrand.includes('lenovo') || normModel.includes('lenovo')) {
    if (normModel.includes('legion duel 2')) base = 18500;
    else if (normModel.includes('legion y90')) base = 22000;
    else if (normModel.includes('legion pro')) base = 14000;
    else if (normModel.includes('z6 pro')) base = 8500;
    else if (normModel.includes('z6 lite')) base = 4200;
    else if (normModel.includes('z5 pro gt')) base = 6800;
    else if (normModel.includes('k10 note')) base = 1500;
    else if (normModel.includes('k10 plus')) base = 3100;
    else if (normModel.includes('k9 note')) base = 2700;
    else if (normModel.includes('k8 note')) base = 2400;
    else if (normModel.includes('k8 plus')) base = 2100;
    else if (normModel.includes('a6 note')) base = 2200;
    else base = 3000;
  }

  // Apply unified Hardware Multiplier for Storage and RAM
  const mult = calculateHardwareVariantMultiplier(normStorage, ram, brand);
  base = Math.round(base * mult);

  return Math.max(1000, Math.round(base / 50) * 50);
}

/**
 * Calculates deterministic dynamic price multiplier based on RAM + Storage combination.
 * Standard baseline: 6GB RAM + 128GB Storage = 1.000x multiplier.
 */
export function calculateHardwareVariantMultiplier(storage = '128 GB', ram = '', brand = '') {
  const normStorage = normalizeStorage(storage).toLowerCase();
  const isApple = String(brand || '').toLowerCase().includes('apple');

  // 1. Storage Multiplier (against 128GB standard)
  let storageMult = 1.0;
  if (normStorage.includes('1 tb') || normStorage.includes('1024')) storageMult = 1.42;
  else if (normStorage.includes('512')) storageMult = 1.26;
  else if (normStorage.includes('256')) storageMult = 1.12;
  else if (normStorage.includes('128')) storageMult = 1.00;
  else if (normStorage.includes('64')) storageMult = 0.88;
  else if (normStorage.includes('32')) storageMult = 0.76;
  else if (normStorage.includes('16')) storageMult = 0.65;

  // 2. RAM Multiplier (against 6GB standard, Apple is fixed 1.0)
  let ramMult = 1.0;
  if (!isApple && ram) {
    const ramMatch = String(ram).match(/(\d+)/);
    if (ramMatch) {
      const r = parseInt(ramMatch[1], 10);
      if (r >= 24) ramMult = 1.38;
      else if (r >= 16) ramMult = 1.28;
      else if (r >= 12) ramMult = 1.18;
      else if (r >= 8) ramMult = 1.08;
      else if (r >= 6) ramMult = 1.00;
      else if (r >= 4) ramMult = 0.95;
      else if (r >= 3) ramMult = 0.92;
      else if (r >= 2) ramMult = 0.88;
    }
  }

  return Number((storageMult * ramMult).toFixed(4));
}

/**
 * Find exact variant benchmark from real project data with guaranteed intelligent fallback
 */
export function lookupResaleBenchmark(brand, model, storage, options = {}) {
  const normBrand = String(brand || '').trim().toLowerCase();
  const normModel = normalizeKey(model);
  const normStorage = normalizeStorage(storage);
  const ram = options.ram || '';

  // 1. Direct exact match in RESALE_BENCHMARKS
  let benchmark = RESALE_BENCHMARKS.find((b) => {
    const bBrand = b.brand.toLowerCase();
    const bModel = normalizeKey(b.model);
    const bStorage = normalizeStorage(b.storage);

    return bBrand === normBrand && bModel === normModel && bStorage === normStorage;
  });

  // 2. Same model with different storage variant in RESALE_BENCHMARKS
  if (!benchmark) {
    const sibling = RESALE_BENCHMARKS.find((b) => {
      const bBrand = b.brand.toLowerCase();
      const bModel = normalizeKey(b.model);
      return bBrand === normBrand && (bModel === normModel || bModel.includes(normModel) || normModel.includes(bModel));
    });

    if (sibling) {
      const siblingMult = calculateHardwareVariantMultiplier(sibling.storage, '', sibling.brand);
      const targetMult = calculateHardwareVariantMultiplier(normStorage, ram, brand);
      const ratio = targetMult / (siblingMult || 1.0);

      benchmark = {
        brand: sibling.brand,
        model: sibling.model,
        storage: normStorage,
        proceeds: Math.round((sibling.proceeds * ratio) / 50) * 50,
        lastUpdated: sibling.lastUpdated,
      };
    }
  }

  // 3. Guaranteed comprehensive catalog valuation fallback
  if (!benchmark) {
    const fallbackProceeds = computeDynamicBenchmarkProceeds(brand, model, storage, ram);
    benchmark = {
      brand: brand || 'Smartphone',
      model: model || 'Smartphone',
      storage: normStorage,
      proceeds: fallbackProceeds,
      lastUpdated: '2025-02-01',
    };
  }

  // 4. Variant adjustments for RAM on direct matches (where benchmark storage matched, but RAM differs)
  if (ram && benchmark && benchmark.proceeds) {
    const ramRatio = calculateHardwareVariantMultiplier(normStorage, ram, brand) / calculateHardwareVariantMultiplier(normStorage, '', brand);
    if (Math.abs(ramRatio - 1.0) > 0.001) {
      benchmark.proceeds = Math.round((benchmark.proceeds * ramRatio) / 50) * 50;
    }
  }

  return {
    found: true,
    benchmark,
  };
}

/**
 * Lookup configured repairs for device model with proportional fallback
 */
export function lookupModelRepairs(brand, model, benchmarkProceeds = 20000) {
  const key = `${String(brand).trim().toLowerCase()}:${normalizeKey(model)}`;
  if (CONFIGURED_REPAIRS[key]) return CONFIGURED_REPAIRS[key];

  // Proportional repair rates for models not explicitly in CONFIGURED_REPAIRS
  const p = benchmarkProceeds > 0 ? benchmarkProceeds : 20000;
  return {
    screen: Math.max(1999, Math.round(p * 0.22 / 100) * 100 - 1),
    battery: Math.max(999, Math.round(p * 0.06 / 100) * 100 - 1),
    charging: 899,
    camera: Math.max(1499, Math.round(p * 0.08 / 100) * 100 - 1),
    backglass: Math.max(1199, Math.round(p * 0.06 / 100) * 100 - 1),
    speaker: 699,
  };
}

/**
 * Generates an end-to-end, deterministic Fundu buyback quote
 * 
 * Formula:
 * rawOffer = (resaleProceeds * cosmeticMultiplier + accessoriesBonus)
 *            - configuredRepairs
 *            - pickupInspectionRefurbCost
 *            - warrantyAndRiskReserves
 *            - targetContributionMargin
 *
 * Internal unit economics remain on the server; sellers receive the net conditional offer
 * and understandable condition-related reasons.
 *
 * @param {Object} input
 * @param {Object} [options]
 * @returns {Object} Quote result
 */
export function quotePhone(input = {}, options = {}) {
  const {
    brand,
    model,
    storage,
    ram,
    powers_on,
    activation_lock_cleared = true,
    ownership_verified = true,
    liquid_damage = false,
    cosmetic_condition = 'good',
    screen_condition = 'flawless',
    body_condition = 'flawless',
    battery_health = 'healthy',
    defects = [],
    accessories = [],
    under_warranty = false,
  } = input;

  // 1. Validate mandatory basic input structure
  if (!brand || !String(brand).trim()) {
    return {
      status: 'invalid_input',
      error: 'Phone brand is required.',
      code: 'MISSING_BRAND',
    };
  }

  if (!model || !String(model).trim()) {
    return {
      status: 'invalid_input',
      error: 'Phone model is required.',
      code: 'MISSING_MODEL',
    };
  }

  if (!storage || !String(storage).trim()) {
    return {
      status: 'invalid_input',
      error: 'Storage variant is required.',
      code: 'MISSING_STORAGE',
    };
  }

  // 2. Mandatory Manual-Review Routing Triggers (Still compute estimated recovery/salvage value so valuation is never zero)
  const estBaseProceeds = computeDynamicBenchmarkProceeds(brand, model, storage, ram);

  // Trigger A: Non-powering devices
  if (powers_on === false) {
    const salvageAmount = Math.max(FUNDU_POLICY.minOfferFloor, Math.round((estBaseProceeds * 0.25) / 50) * 50);
    return {
      status: 'requires_manual_review',
      quoteId: `FND-Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      offerAmount: salvageAmount,
      isConditionalEstimate: true,
      reason: 'NON_POWERING_DEVICE',
      message: 'Non-powering devices cannot receive an automated instant estimate. Our technician will perform a physical diagnostic at our inspection hub to assess motherboard recovery and component value.',
      reviewAction: 'book_inspection',
      contactPath: {
        phone: '+91-9839122345',
        email: 'support@fundu.in',
        doorstepHub: 'Lucknow Central Diagnostics',
      },
    };
  }

  // Trigger B: Uncleared activation locks (iCloud, Google FRP, Mi Account)
  if (activation_lock_cleared === false) {
    const estVal = Math.max(FUNDU_POLICY.minOfferFloor, Math.round((estBaseProceeds * 0.35) / 50) * 50);
    return {
      status: 'requires_manual_review',
      quoteId: `FND-Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      offerAmount: estVal,
      isConditionalEstimate: true,
      reason: 'UNCLEARED_ACTIVATION_LOCK',
      message: 'Devices with uncleared activation locks (iCloud, Google FRP, or vendor accounts) cannot be purchased automatically. Locks must be removed or verified in-person before an offer can be finalized.',
      reviewAction: 'contact_support',
      contactPath: {
        phone: '+91-9839122345',
        email: 'support@fundu.in',
      },
    };
  }

  // Trigger C: Unverified ownership (Missing bill/ID/declaration)
  if (ownership_verified === false) {
    const estVal = Math.max(FUNDU_POLICY.minOfferFloor, Math.round((estBaseProceeds * 0.50) / 50) * 50);
    return {
      status: 'requires_manual_review',
      quoteId: `FND-Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      offerAmount: estVal,
      isConditionalEstimate: true,
      reason: 'UNVERIFIED_OWNERSHIP',
      message: 'Legal buyback regulations require seller identity verification and proof of ownership. A manual review or in-person KYC is required.',
      reviewAction: 'manual_verification',
      contactPath: {
        phone: '+91-9839122345',
        email: 'support@fundu.in',
      },
    };
  }

  // Trigger D: Liquid or moisture damage
  if (liquid_damage === true) {
    const estVal = Math.max(FUNDU_POLICY.minOfferFloor, Math.round((estBaseProceeds * 0.28) / 50) * 50);
    return {
      status: 'requires_manual_review',
      quoteId: `FND-Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      offerAmount: estVal,
      isConditionalEstimate: true,
      reason: 'LIQUID_DAMAGE',
      message: 'Devices with liquid contact or moisture exposure require internal bench inspection to check for sub-board corrosion and display adhesive integrity.',
      reviewAction: 'book_inspection',
      contactPath: {
        phone: '+91-9839122345',
        email: 'support@fundu.in',
      },
    };
  }

  // 3. Exact Variant Benchmark Lookup from Real Catalog
  const benchmarkResult = lookupResaleBenchmark(brand, model, storage, { ...options, ram });

  const { proceeds: expectedResaleProceeds } = benchmarkResult.benchmark;

  // 4. Retrieve Configured Repairs for this exact phone (with proportional fallback)
  const repairCosts = lookupModelRepairs(brand, model, expectedResaleProceeds);

  const requiresScreenRepair = screen_condition === 'cracked' || screen_condition === 'touch_fault' || screen_condition === 'display_lines';
  const requiresBackglassRepair = body_condition === 'dents_bent';
  const requiresBatteryRepair = battery_health === 'degraded_service';
  const hasCameraDefect = Array.isArray(defects) && defects.includes('camera');
  const hasChargingDefect = Array.isArray(defects) && defects.includes('charging_port');
  const hasSpeakerDefect = Array.isArray(defects) && defects.includes('speaker_mic');

  // 5. Compute Deductions & Adjustments according to Business Formula
  const cosmeticKey = String(cosmetic_condition).toLowerCase();
  const cosmeticMultiplier = FUNDU_POLICY.cosmeticMultipliers[cosmeticKey] ?? FUNDU_POLICY.cosmeticMultipliers.good;

  // Customer-facing condition explanations
  const conditionReasons = [];

  if (powers_on) {
    conditionReasons.push('Device powers on and boots normally');
  }

  if (cosmeticKey === 'flawless') {
    conditionReasons.push('Flawless cosmetic condition (zero body scratches/scuffs)');
  } else if (cosmeticKey === 'good') {
    conditionReasons.push('Good cosmetic condition (minor signs of normal use)');
  } else if (cosmeticKey === 'fair') {
    conditionReasons.push('Fair cosmetic condition (visible surface wear and scuffs)');
  }

  // Accessories Bonus
  let accessoriesBonusTotal = 0;
  if (Array.isArray(accessories)) {
    accessories.forEach((acc) => {
      const bonus = FUNDU_POLICY.accessoriesBonus[acc];
      if (bonus) {
        accessoriesBonusTotal += bonus;
        conditionReasons.push(`Included ${acc} bonus (+₹${bonus})`);
      }
    });
  }

  // Configured repairs itemization (kept confidential in breakdown; summarized to seller)
  let configuredRepairsTotal = 0;
  const internalRepairBreakdown = [];

  if (requiresScreenRepair && repairCosts?.screen) {
    configuredRepairsTotal += repairCosts.screen;
    internalRepairBreakdown.push({ item: 'screen', cost: repairCosts.screen });
    conditionReasons.push(`Screen/display replacement required (${screen_condition.replace('_', ' ')})`);
  }

  if (requiresBackglassRepair && repairCosts?.backglass) {
    configuredRepairsTotal += repairCosts.backglass;
    internalRepairBreakdown.push({ item: 'backglass', cost: repairCosts.backglass });
    conditionReasons.push('Chassis / back housing panel replacement required');
  }

  if (requiresBatteryRepair && repairCosts?.battery) {
    configuredRepairsTotal += repairCosts.battery;
    internalRepairBreakdown.push({ item: 'battery', cost: repairCosts.battery });
    conditionReasons.push('Battery service required (health below 80% or degraded)');
  }

  if (hasCameraDefect && repairCosts?.camera) {
    configuredRepairsTotal += repairCosts.camera;
    internalRepairBreakdown.push({ item: 'camera', cost: repairCosts.camera });
    conditionReasons.push('Camera sensor repair required');
  }

  if (hasChargingDefect && repairCosts?.charging) {
    configuredRepairsTotal += repairCosts.charging;
    internalRepairBreakdown.push({ item: 'charging', cost: repairCosts.charging });
    conditionReasons.push('Charging port / sub-board IC repair required');
  }

  if (hasSpeakerDefect && repairCosts?.speaker) {
    configuredRepairsTotal += repairCosts.speaker;
    internalRepairBreakdown.push({ item: 'speaker', cost: repairCosts.speaker });
    conditionReasons.push('Speaker / audio microphone repair required');
  }

  // Logistics, Refurbishment, and Inspection Costs (Internal)
  const pickupInspectionCost = FUNDU_POLICY.pickupInspectionRefurbCost;
  conditionReasons.push('Includes free doorstep pickup & certified data wipe');

  // Warranty and Risk Reserves (Internal)
  let warrantyAndRiskReserves = Math.round(expectedResaleProceeds * FUNDU_POLICY.warrantyAndRiskReservesRate);
  if (under_warranty) {
    warrantyAndRiskReserves = Math.max(0, warrantyAndRiskReserves - FUNDU_POLICY.warrantyBonusCredit);
    conditionReasons.push('Active manufacturer brand warranty verified');
  }

  // Target Contribution Margin (Internal)
  const targetContributionMargin = Math.round(expectedResaleProceeds * FUNDU_POLICY.targetContributionMarginRate);

  // Exact Business Formula:
  // proceeds adjusted for condition - repairs - pickup - reserves - margin
  const proceedsAdjustedForCondition = Math.round(expectedResaleProceeds * cosmeticMultiplier) + accessoriesBonusTotal;
  const rawOffer = proceedsAdjustedForCondition - configuredRepairsTotal - pickupInspectionCost - warrantyAndRiskReserves - targetContributionMargin;

  // If raw offer drops below minimum floor or repairs exceed proceeds, provide salvage/floor offer so estimate is never 0:
  if (rawOffer <= 0 || configuredRepairsTotal > expectedResaleProceeds * 0.70) {
    const salvageFloor = Math.max(FUNDU_POLICY.minOfferFloor, Math.round((expectedResaleProceeds * 0.20) / 50) * 50);
    return {
      status: 'requires_manual_review',
      quoteId: `FND-Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      offerAmount: salvageFloor,
      isConditionalEstimate: true,
      reason: 'DEDUCTIONS_EXCEED_VALUE',
      message: 'Repair and refurbishing deductions exceed standard online thresholds. Our team has provided an estimated salvage value subject to on-site evaluation.',
      conditionSummary: conditionReasons,
      reviewAction: 'book_inspection',
      contactPath: {
        phone: '+91-9839122345',
        email: 'support@fundu.in',
      },
    };
  }

  // Clean rounding to nearest ₹50 for professional consumer pricing
  const finalOfferAmount = Math.max(FUNDU_POLICY.minOfferFloor, Math.round(rawOffer / 50) * 50);

  const quoteId = `FND-Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Public seller-facing quote (Safe, no leaked confidential economics)
  const sellerFacingQuote = {
    status: 'quoted',
    quoteId,
    offerAmount: finalOfferAmount,
    currency: 'INR',
    isConditionalEstimate: true,
    disclaimer: 'This is a conditional estimate subject to physical doorstep inspection and verification of phone specifications and hardware integrity.',
    conditionSummary: conditionReasons,
    deviceSummary: {
      brand: benchmarkResult.benchmark.brand,
      model: benchmarkResult.benchmark.model,
      storage: normalizeStorage(storage),
      ...(ram ? { ram: String(ram).trim() } : {}),
    },
    policyVersion: FUNDU_POLICY.version,
    validForDays: 7,
    createdAt: new Date().toISOString(),
    nextSteps: [
      'Accept estimate and choose preferred doorstep pickup date & slot',
      'Doorstep agent performs 15-point functional verification test',
      'Receive instant spot cash or UPI payment before handing over device',
    ],
  };

  // Internal Audit Record (Retained strictly on the server for business records)
  const internalAudit = {
    quoteId,
    variant: {
      brand: benchmarkResult.benchmark.brand,
      model: benchmarkResult.benchmark.model,
      storage: normalizeStorage(storage),
      resaleProceedsBenchmark: expectedResaleProceeds,
      benchmarkDate: benchmarkResult.benchmark.lastUpdated,
    },
    conditionAnswers: {
      powers_on,
      activation_lock_cleared,
      ownership_verified,
      liquid_damage,
      cosmetic_condition,
      screen_condition,
      body_condition,
      battery_health,
      defects,
      accessories,
      under_warranty,
    },
    economics: {
      expectedResaleProceeds,
      cosmeticMultiplier,
      accessoriesBonusTotal,
      proceedsAdjustedForCondition,
      configuredRepairsTotal,
      configuredRepairs: internalRepairBreakdown,
      pickupInspectionRefurbCost: pickupInspectionCost,
      warrantyAndRiskReserves,
      targetContributionMargin,
      rawOffer,
      finalOfferAmount,
      targetMarginPercent: `${(FUNDU_POLICY.targetContributionMarginRate * 100).toFixed(1)}%`,
    },
    policyVersion: FUNDU_POLICY.version,
    createdAt: sellerFacingQuote.createdAt,
  };

  return {
    ...sellerFacingQuote,
    _internalAudit: internalAudit,
  };
}

/**
 * Inspection Mismatch & Revised Offer Calculator
 * 
 * When a physical inspection occurs at doorstep, if the inspected condition differs
 * materially from the seller's initial answers, explains the mismatch and calculates
 * the revised offer, requiring seller acceptance before proceeding.
 *
 * @param {Object} initialAudit
 * @param {Object} inspectedAnswers
 * @returns {Object} Mismatch analysis & revised offer
 */
export function recalculateInspectedQuote(initialAudit, inspectedAnswers = {}) {
  if (!initialAudit || !initialAudit.variant) {
    throw new Error('Initial quote audit record is required for inspection recalculation.');
  }

  const { variant } = initialAudit;
  const initialAnswers = initialAudit.conditionAnswers || {};

  // Build the inspected quote inputs (using inspected answers where provided, fallback to initial)
  const evaluatedInputs = {
    brand: variant.brand,
    model: variant.model,
    storage: inspectedAnswers.storage || variant.storage,
    powers_on: inspectedAnswers.powers_on !== undefined ? inspectedAnswers.powers_on : initialAnswers.powers_on,
    activation_lock_cleared: inspectedAnswers.activation_lock_cleared !== undefined ? inspectedAnswers.activation_lock_cleared : initialAnswers.activation_lock_cleared,
    ownership_verified: inspectedAnswers.ownership_verified !== undefined ? inspectedAnswers.ownership_verified : initialAnswers.ownership_verified,
    liquid_damage: inspectedAnswers.liquid_damage !== undefined ? inspectedAnswers.liquid_damage : initialAnswers.liquid_damage,
    cosmetic_condition: inspectedAnswers.cosmetic_condition || initialAnswers.cosmetic_condition,
    screen_condition: inspectedAnswers.screen_condition || initialAnswers.screen_condition,
    body_condition: inspectedAnswers.body_condition || initialAnswers.body_condition,
    battery_health: inspectedAnswers.battery_health || initialAnswers.battery_health,
    defects: Array.isArray(inspectedAnswers.defects) ? inspectedAnswers.defects : initialAnswers.defects,
    accessories: Array.isArray(inspectedAnswers.accessories) ? inspectedAnswers.accessories : initialAnswers.accessories,
    under_warranty: inspectedAnswers.under_warranty !== undefined ? inspectedAnswers.under_warranty : initialAnswers.under_warranty,
  };

  // Run official quote engine on inspected condition
  const revisedResult = quotePhone(evaluatedInputs);

  // Detect material mismatches
  const mismatches = [];

  if (inspectedAnswers.storage && normalizeStorage(inspectedAnswers.storage) !== normalizeStorage(variant.storage)) {
    mismatches.push(`Storage variant was reported as "${variant.storage}", but physical device is "${inspectedAnswers.storage}".`);
  }

  if (inspectedAnswers.cosmetic_condition && inspectedAnswers.cosmetic_condition !== initialAnswers.cosmetic_condition) {
    mismatches.push(`Cosmetic condition reported as "${initialAnswers.cosmetic_condition}", but physical inspection found "${inspectedAnswers.cosmetic_condition}".`);
  }

  if (inspectedAnswers.screen_condition && inspectedAnswers.screen_condition !== initialAnswers.screen_condition) {
    mismatches.push(`Screen reported as "${initialAnswers.screen_condition}", but physical inspection identified "${inspectedAnswers.screen_condition}".`);
  }

  if (inspectedAnswers.body_condition && inspectedAnswers.body_condition !== initialAnswers.body_condition) {
    mismatches.push(`Body reported as "${initialAnswers.body_condition}", but physical inspection identified "${inspectedAnswers.body_condition}".`);
  }

  if (inspectedAnswers.battery_health && inspectedAnswers.battery_health !== initialAnswers.battery_health) {
    mismatches.push(`Battery health reported as "${initialAnswers.battery_health}", but diagnostic report showed "${inspectedAnswers.battery_health}".`);
  }

  if (Array.isArray(inspectedAnswers.defects)) {
    const initialDefects = new Set(initialAnswers.defects || []);
    const newlyDiscovered = inspectedAnswers.defects.filter((d) => !initialDefects.has(d));
    if (newlyDiscovered.length > 0) {
      mismatches.push(`Additional hardware faults detected during bench diagnostics: ${newlyDiscovered.join(', ')}.`);
    }
  }

  const previousOffer = initialAudit.economics?.finalOfferAmount || initialAudit.offerAmount || 0;
  const revisedOffer = revisedResult.offerAmount || 0;
  const hasMaterialDifference = mismatches.length > 0 || Math.abs(revisedOffer - previousOffer) > 0;

  return {
    hasMismatch: hasMaterialDifference,
    previousOffer,
    revisedOffer,
    difference: revisedOffer - previousOffer,
    mismatchExplanations: mismatches,
    requiresSellerAcceptance: hasMaterialDifference,
    inspectedQuote: revisedResult,
    sellerActionPrompt: hasMaterialDifference
      ? 'The inspected device differs from your online submission. Please review the updated offer and choose whether to accept the revised amount or have your phone returned.'
      : 'Doorstep inspection confirmed all answers. Original offer is fully guaranteed!',
  };
}
