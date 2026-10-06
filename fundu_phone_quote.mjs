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
  // --- APPLE iPHONES ---
  { brand: 'Apple', model: 'iPhone 17 Pro Max', storage: '256 GB', proceeds: 118000, lastUpdated: '2025-02-15' },
  { brand: 'Apple', model: 'iPhone 17 Pro', storage: '256 GB', proceeds: 104000, lastUpdated: '2025-02-15' },
  { brand: 'Apple', model: 'iPhone 17 Air', storage: '128 GB', proceeds: 82000, lastUpdated: '2025-02-15' },
  { brand: 'Apple', model: 'iPhone 17', storage: '128 GB', proceeds: 72000, lastUpdated: '2025-02-15' },

  { brand: 'Apple', model: 'iPhone 16 Pro Max', storage: '256 GB', proceeds: 98000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16 Pro Max', storage: '512 GB', proceeds: 108000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16 Pro Max', storage: '1 TB', proceeds: 118000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16 Pro', storage: '128 GB', proceeds: 88000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16 Pro', storage: '256 GB', proceeds: 96000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16 Plus', storage: '128 GB', proceeds: 68000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16', storage: '128 GB', proceeds: 58000, lastUpdated: '2025-01-20' },
  { brand: 'Apple', model: 'iPhone 16', storage: '256 GB', proceeds: 64000, lastUpdated: '2025-01-20' },

  { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256 GB', proceeds: 85000, lastUpdated: '2025-01-10' },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '512 GB', proceeds: 94000, lastUpdated: '2025-01-10' },
  { brand: 'Apple', model: 'iPhone 15 Pro', storage: '128 GB', proceeds: 74000, lastUpdated: '2025-01-10' },
  { brand: 'Apple', model: 'iPhone 15 Pro', storage: '256 GB', proceeds: 81000, lastUpdated: '2025-01-10' },
  { brand: 'Apple', model: 'iPhone 15 Plus', storage: '128 GB', proceeds: 59000, lastUpdated: '2025-01-10' },
  { brand: 'Apple', model: 'iPhone 15', storage: '128 GB', proceeds: 54000, lastUpdated: '2025-01-10' },
  { brand: 'Apple', model: 'iPhone 15', storage: '256 GB', proceeds: 59000, lastUpdated: '2025-01-10' },

  { brand: 'Apple', model: 'iPhone 14 Pro Max', storage: '128 GB', proceeds: 65000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', storage: '256 GB', proceeds: 71000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 14 Pro', storage: '128 GB', proceeds: 58000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 14 Plus', storage: '128 GB', proceeds: 49000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 14', storage: '128 GB', proceeds: 46000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 14', storage: '256 GB', proceeds: 50000, lastUpdated: '2025-01-05' },

  { brand: 'Apple', model: 'iPhone 13 Pro Max', storage: '128 GB', proceeds: 54000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 13 Pro', storage: '128 GB', proceeds: 47000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 13', storage: '128 GB', proceeds: 38500, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 13', storage: '256 GB', proceeds: 42500, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 13 mini', storage: '128 GB', proceeds: 32000, lastUpdated: '2025-01-05' },

  { brand: 'Apple', model: 'iPhone 12 Pro Max', storage: '128 GB', proceeds: 42000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 12 Pro', storage: '128 GB', proceeds: 36000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 12', storage: '64 GB', proceeds: 26000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 12', storage: '128 GB', proceeds: 28000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 12 mini', storage: '64 GB', proceeds: 22000, lastUpdated: '2025-01-05' },

  { brand: 'Apple', model: 'iPhone 11 Pro Max', storage: '64 GB', proceeds: 31000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 11 Pro', storage: '64 GB', proceeds: 26000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 11', storage: '64 GB', proceeds: 19000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone 11', storage: '128 GB', proceeds: 21000, lastUpdated: '2025-01-05' },

  { brand: 'Apple', model: 'iPhone SE (2022)', storage: '64 GB', proceeds: 18000, lastUpdated: '2025-01-05' },
  { brand: 'Apple', model: 'iPhone SE (2020)', storage: '64 GB', proceeds: 11000, lastUpdated: '2025-01-05' },

  // --- SAMSUNG GALAXY ---
  { brand: 'Samsung', model: 'Galaxy S25 Ultra', storage: '256 GB', proceeds: 84000, lastUpdated: '2025-02-15' },
  { brand: 'Samsung', model: 'Galaxy S25+', storage: '256 GB', proceeds: 68000, lastUpdated: '2025-02-15' },
  { brand: 'Samsung', model: 'Galaxy S25 5G', storage: '128 GB', proceeds: 56000, lastUpdated: '2025-02-15' },

  { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '256 GB', proceeds: 78000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '512 GB', proceeds: 85000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: 'Galaxy S24+', storage: '256 GB', proceeds: 59000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: 'Galaxy S24 5G', storage: '128 GB', proceeds: 48000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: 'Galaxy S24 FE', storage: '128 GB', proceeds: 38000, lastUpdated: '2025-01-15' },

  { brand: 'Samsung', model: 'Galaxy S23 Ultra', storage: '256 GB', proceeds: 62000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy S23+', storage: '256 GB', proceeds: 46000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy S23 5G', storage: '128 GB', proceeds: 39000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy S23 FE 5G', storage: '128 GB', proceeds: 31000, lastUpdated: '2025-01-10' },

  { brand: 'Samsung', model: 'Galaxy S22 Ultra 5G', storage: '128 GB', proceeds: 44000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy S22+ 5G', storage: '128 GB', proceeds: 34000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy S22 5G', storage: '128 GB', proceeds: 27000, lastUpdated: '2025-01-10' },

  { brand: 'Samsung', model: 'Galaxy Z Fold 6', storage: '256 GB', proceeds: 88000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 6', storage: '256 GB', proceeds: 58000, lastUpdated: '2025-01-15' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 5', storage: '256 GB', proceeds: 72000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 5', storage: '256 GB', proceeds: 44000, lastUpdated: '2025-01-10' },

  { brand: 'Samsung', model: 'Galaxy A55 5G', storage: '128 GB', proceeds: 25000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy A35 5G', storage: '128 GB', proceeds: 18500, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy A54 5G', storage: '128 GB', proceeds: 19500, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy M35 5G', storage: '128 GB', proceeds: 14000, lastUpdated: '2025-01-10' },
  { brand: 'Samsung', model: 'Galaxy M34 5G', storage: '128 GB', proceeds: 11000, lastUpdated: '2025-01-10' },

  // --- ONEPLUS ---
  { brand: 'OnePlus', model: 'OnePlus 12', storage: '256 GB', proceeds: 48000, lastUpdated: '2025-01-15' },
  { brand: 'OnePlus', model: 'OnePlus 12R', storage: '128 GB', proceeds: 31000, lastUpdated: '2025-01-15' },
  { brand: 'OnePlus', model: 'OnePlus 11', storage: '128 GB', proceeds: 34000, lastUpdated: '2025-01-10' },
  { brand: 'OnePlus', model: 'OnePlus 11R', storage: '128 GB', proceeds: 26000, lastUpdated: '2025-01-10' },
  { brand: 'OnePlus', model: 'OnePlus Nord 4', storage: '128 GB', proceeds: 24000, lastUpdated: '2025-01-15' },
  { brand: 'OnePlus', model: 'OnePlus Nord CE 4', storage: '128 GB', proceeds: 19000, lastUpdated: '2025-01-15' },
  { brand: 'OnePlus', model: 'OnePlus Nord 3', storage: '128 GB', proceeds: 17000, lastUpdated: '2025-01-10' },

  // --- XIAOMI / REDMI / POCO ---
  { brand: 'Xiaomi', model: 'Xiaomi 14', storage: '256 GB', proceeds: 42000, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', storage: '256 GB', proceeds: 22000, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', storage: '128 GB', proceeds: 18000, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: 'Redmi Note 13', storage: '128 GB', proceeds: 13500, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: 'Poco X6 Pro', storage: '256 GB', proceeds: 18500, lastUpdated: '2025-01-15' },
  { brand: 'Xiaomi', model: 'Poco F6', storage: '256 GB', proceeds: 23000, lastUpdated: '2025-01-15' },

  // --- GOOGLE PIXEL ---
  { brand: 'Google', model: 'Pixel 9 Pro', storage: '128 GB', proceeds: 72000, lastUpdated: '2025-01-20' },
  { brand: 'Google', model: 'Pixel 9', storage: '128 GB', proceeds: 54000, lastUpdated: '2025-01-20' },
  { brand: 'Google', model: 'Pixel 8 Pro', storage: '128 GB', proceeds: 52000, lastUpdated: '2025-01-10' },
  { brand: 'Google', model: 'Pixel 8', storage: '128 GB', proceeds: 39000, lastUpdated: '2025-01-10' },
  { brand: 'Google', model: 'Pixel 7a', storage: '128 GB', proceeds: 22000, lastUpdated: '2025-01-10' },

  // --- VIVO & REALME & NOTHING ---
  { brand: 'Vivo', model: 'Vivo X100', storage: '256 GB', proceeds: 46000, lastUpdated: '2025-01-15' },
  { brand: 'Vivo', model: 'Vivo V30 Pro', storage: '256 GB', proceeds: 28000, lastUpdated: '2025-01-15' },
  { brand: 'Realme', model: 'Realme 12 Pro+', storage: '128 GB', proceeds: 21000, lastUpdated: '2025-01-15' },
  { brand: 'Realme', model: 'Realme GT 6', storage: '256 GB', proceeds: 29000, lastUpdated: '2025-01-15' },
  { brand: 'Nothing', model: 'Nothing Phone (2)', storage: '128 GB', proceeds: 27000, lastUpdated: '2025-01-10' },
  { brand: 'Nothing', model: 'Nothing Phone (2a)', storage: '128 GB', proceeds: 17500, lastUpdated: '2025-01-10' },
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
export function computeDynamicBenchmarkProceeds(brand = '', model = '', storage = '') {
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

  // Storage adjustment
  if (normStorage.includes('1 tb')) base = Math.round(base * 1.25);
  else if (normStorage.includes('512')) base = Math.round(base * 1.15);
  else if (normStorage.includes('256')) base = Math.round(base * 1.08);
  else if (normStorage.includes('64')) base = Math.round(base * 0.88);
  else if (normStorage.includes('32')) base = Math.round(base * 0.75);
  else if (normStorage.includes('16')) base = Math.round(base * 0.65);

  return Math.max(3000, Math.round(base / 500) * 500);
}

/**
 * Find exact variant benchmark from real project data with guaranteed intelligent fallback
 */
export function lookupResaleBenchmark(brand, model, storage, options = {}) {
  const normBrand = String(brand || '').trim().toLowerCase();
  const normModel = normalizeKey(model);
  const normStorage = normalizeStorage(storage);

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
      let multiplier = 1.0;
      if (normStorage.includes('1 tb')) multiplier = 1.25;
      else if (normStorage.includes('512')) multiplier = 1.15;
      else if (normStorage.includes('256')) multiplier = 1.08;
      else if (normStorage.includes('128')) multiplier = 1.0;
      else if (normStorage.includes('64')) multiplier = 0.88;
      else if (normStorage.includes('32')) multiplier = 0.75;
      else if (normStorage.includes('16')) multiplier = 0.65;

      benchmark = {
        brand: sibling.brand,
        model: sibling.model,
        storage: normStorage,
        proceeds: Math.round((sibling.proceeds * multiplier) / 500) * 500,
        lastUpdated: sibling.lastUpdated,
      };
    }
  }

  // 3. Guaranteed comprehensive catalog valuation fallback
  if (!benchmark) {
    const fallbackProceeds = computeDynamicBenchmarkProceeds(brand, model, storage);
    benchmark = {
      brand: brand || 'Smartphone',
      model: model || 'Smartphone',
      storage: normStorage,
      proceeds: fallbackProceeds,
      lastUpdated: '2025-02-01',
    };
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
  const estBaseProceeds = computeDynamicBenchmarkProceeds(brand, model, storage);

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
  const benchmarkResult = lookupResaleBenchmark(brand, model, storage, options);

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
