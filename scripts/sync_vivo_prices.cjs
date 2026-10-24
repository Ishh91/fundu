const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Full OCR List from Cashify Buyback Master Catalogue - Vivo (160 entries)
const rawVivoList = [
  // Page 1: 1 - 25
  { name: 'Vivo X300 Ultra 5G', variant: '16 GB / 512 GB', price: 77990 },
  { name: 'Vivo X300 Pro 5G', variant: '16 GB / 512 GB', price: 61750 },
  { name: 'Vivo X300 FE 5G', variant: '12 GB / 256 GB', price: 51540 },
  { name: 'Vivo X300 5G', variant: '12 GB / 256 GB', price: 45220 },
  { name: 'Vivo X Fold 3 Pro 5G', variant: '16 GB / 512 GB', price: 68000 },
  { name: 'Vivo X Fold 2 5G', variant: '12 GB / 256 GB', price: 45000 },
  { name: 'Vivo X Flip 5G', variant: '12 GB / 256 GB', price: 29000 },
  { name: 'Vivo X200 Pro 5G', variant: '16 GB / 512 GB', price: 48750 },
  { name: 'Vivo X200 Pro mini 5G', variant: '12 GB / 256 GB', price: 41200 },
  { name: 'Vivo X200 FE 5G', variant: '12 GB / 256 GB', price: 36800 },
  { name: 'Vivo X200 5G', variant: '12 GB / 256 GB', price: 36500 },
  { name: 'Vivo X100 Ultra 5G', variant: '16 GB / 512 GB', price: 46000 },
  { name: 'Vivo X100s Pro 5G', variant: '16 GB / 512 GB', price: 37500 },
  { name: 'Vivo X100s 5G', variant: '12 GB / 256 GB', price: 30500 },
  { name: 'Vivo X100 Pro 5G', variant: '16 GB / 512 GB', price: 32070 },
  { name: 'Vivo X100 5G', variant: '12 GB / 256 GB', price: 26340 },
  { name: 'Vivo X90 Pro 5G', variant: '12 GB / 256 GB', price: 29780 },
  { name: 'Vivo X90 5G', variant: '8 GB / 256 GB', price: 22400 },
  { name: 'Vivo X80 Pro 5G', variant: '12 GB / 256 GB', price: 21800 },
  { name: 'Vivo X80 5G', variant: '8 GB / 128 GB', price: 16500 },
  { name: 'Vivo X70 Pro Plus 5G', variant: '12 GB / 256 GB', price: 15200 },
  { name: 'Vivo X70 Pro 5G', variant: '8 GB / 128 GB', price: 12400 },
  { name: 'Vivo X60 Pro Plus 5G', variant: '12 GB / 256 GB', price: 11800 },
  { name: 'Vivo X60 Pro', variant: '8 GB / 128 GB', price: 9200 },
  { name: 'Vivo X60', variant: '8 GB / 128 GB', price: 9200 },
  { name: 'Vivo X50 Pro', variant: '8 GB / 128 GB', price: 6800 },
  { name: 'Vivo X50', variant: '8 GB / 128 GB', price: 6800 },

  // Page 1: 26 - 29
  { name: 'Vivo NEX 3 5G', variant: '8 GB / 256 GB', price: 9500 },
  { name: 'Vivo NEX Dual Display Edition', variant: '10 GB / 128 GB', price: 7200 },
  { name: 'Vivo NEX S', variant: '8 GB / 128 GB', price: 5400 },
  { name: 'Vivo NEX A', variant: '6 GB / 128 GB', price: 4200 },

  // Page 2: 30 - 64
  { name: 'Vivo V70 Elite 5G', variant: '8 GB / 256 GB', price: 38240 },
  { name: 'Vivo V70 5G', variant: '8 GB / 256 GB', price: 31960 },
  { name: 'Vivo V70 FE 5G', variant: '8 GB / 128 GB', price: 23430 },
  { name: 'Vivo V60 Pro 5G', variant: '12 GB / 256 GB', price: 32500 },
  { name: 'Vivo V60 5G', variant: '8 GB / 128 GB', price: 26000 },
  { name: 'Vivo V60e 5G', variant: '8 GB / 128 GB', price: 20500 },
  { name: 'Vivo V50 Pro 5G', variant: '8 GB / 256 GB', price: 27000 },
  { name: 'Vivo V50 5G', variant: '8 GB / 128 GB', price: 22370 },
  { name: 'Vivo V50e 5G', variant: '8 GB / 128 GB', price: 17200 },
  { name: 'Vivo V40 Pro 5G', variant: '12 GB / 512 GB', price: 26860 },
  { name: 'Vivo V40 5G', variant: '8 GB / 128 GB', price: 20090 },
  { name: 'Vivo V40e 5G', variant: '8 GB / 128 GB', price: 15400 },
  { name: 'Vivo V30 Pro 5G', variant: '8 GB / 256 GB', price: 21510 },
  { name: 'Vivo V30 5G', variant: '8 GB / 128 GB', price: 19020 },
  { name: 'Vivo V30e 5G', variant: '8 GB / 128 GB', price: 14200 },
  { name: 'Vivo V29 Pro 5G', variant: '8 GB / 256 GB', price: 19190 },
  { name: 'Vivo V29 5G', variant: '8 GB / 128 GB', price: 16680 },
  { name: 'Vivo V29e 5G', variant: '8 GB / 128 GB', price: 12400 },
  { name: 'Vivo V27 Pro 5G', variant: '8 GB / 128 GB', price: 18250 },
  { name: 'Vivo V27 5G', variant: '8 GB / 128 GB', price: 15810 },
  { name: 'Vivo V25 Pro 5G', variant: '8 GB / 128 GB', price: 11990 },
  { name: 'Vivo V25 5G', variant: '8 GB / 128 GB', price: 10500 },
  { name: 'Vivo V25e', variant: '8 GB / 128 GB', price: 8900 },
  { name: 'Vivo V23 Pro 5G', variant: '8 GB / 128 GB', price: 12200 },
  { name: 'Vivo V23 5G', variant: '8 GB / 128 GB', price: 9930 },
  { name: 'Vivo V23e 5G', variant: '8 GB / 128 GB', price: 8200 },
  { name: 'Vivo V21 5G', variant: '8 GB / 128 GB', price: 8130 },
  { name: 'Vivo V21e 5G', variant: '8 GB / 128 GB', price: 6800 },
  { name: 'Vivo V20 (2021 Edition)', variant: '8 GB / 256 GB', price: 15760 },
  { name: 'Vivo V20 Pro 5G', variant: '8 GB / 128 GB', price: 6360 },
  { name: 'Vivo V20 (2020)', variant: '8 GB / 128 GB', price: 5950 },
  { name: 'Vivo V20', variant: '8 GB / 128 GB', price: 5950 },
  { name: 'Vivo V20 SE', variant: '8 GB / 128 GB', price: 4800 },
  { name: 'Vivo V19', variant: '8 GB / 128 GB', price: 14830 },

  // Page 3: 65 - 74
  { name: 'Vivo V17 Pro', variant: '8 GB / 128 GB', price: 5200 },
  { name: 'Vivo V17', variant: '8 GB / 128 GB', price: 4500 },
  { name: 'Vivo V15 Pro', variant: '6 GB / 128 GB', price: 4720 },
  { name: 'Vivo V15', variant: '6 GB / 64 GB', price: 3600 },
  { name: 'Vivo V11 Pro', variant: '6 GB / 64 GB', price: 3200 },
  { name: 'Vivo V11', variant: '6 GB / 64 GB', price: 2600 },
  { name: 'Vivo V9', variant: '4 GB / 64 GB', price: 2200 },
  { name: 'Vivo V9 Pro', variant: '4 GB / 64 GB', price: 2200 },
  { name: 'Vivo V9 Youth', variant: '4 GB / 64 GB', price: 2200 },
  { name: 'Vivo V7', variant: '4 GB / 32 GB', price: 1700 },
  { name: 'Vivo V7 Plus', variant: '4 GB / 32 GB', price: 1700 },
  { name: 'Vivo V5', variant: '4 GB / 32 GB', price: 1300 },
  { name: 'Vivo V5 Plus', variant: '4 GB / 32 GB', price: 1300 },
  { name: 'Vivo V5s', variant: '4 GB / 32 GB', price: 1300 },
  { name: 'Vivo V3', variant: '3 GB / 32 GB', price: 900 },
  { name: 'Vivo V3 Max', variant: '3 GB / 32 GB', price: 900 },

  // Page 3: 75 - 86
  { name: 'Vivo T3 Ultra 5G', variant: '8 GB / 128 GB', price: 19500 },
  { name: 'Vivo T3 Pro 5G', variant: '8 GB / 128 GB', price: 16940 },
  { name: 'Vivo T3 5G', variant: '8 GB / 128 GB', price: 11790 },
  { name: 'Vivo T3x 5G', variant: '4 GB / 128 GB', price: 8200 },
  { name: 'Vivo T3 Lite 5G', variant: '4 GB / 128 GB', price: 6900 },
  { name: 'Vivo T2 Pro 5G', variant: '8 GB / 128 GB', price: 12400 },
  { name: 'Vivo T2 5G', variant: '6 GB / 128 GB', price: 8800 },
  { name: 'Vivo T2x 5G', variant: '4 GB / 128 GB', price: 6600 },
  { name: 'Vivo T1 Pro 5G', variant: '6 GB / 128 GB', price: 7800 },
  { name: 'Vivo T1 5G', variant: '4 GB / 128 GB', price: 6200 },
  { name: 'Vivo T1 44W', variant: '4 GB / 128 GB', price: 5400 },
  { name: 'Vivo T1x', variant: '4 GB / 64 GB', price: 4800 },

  // Page 3: 87 - 94
  { name: 'Vivo Z1x', variant: '6 GB / 64 GB', price: 4200 },
  { name: 'Vivo Z1 Pro', variant: '4 GB / 64 GB', price: 3700 },
  { name: 'Vivo Z10', variant: '4 GB / 32 GB', price: 2400 },
  { name: 'Vivo Z3', variant: '4 GB / 32 GB', price: 2400 },
  { name: 'Vivo S1 Pro', variant: '8 GB / 128 GB', price: 4600 },
  { name: 'Vivo S1', variant: '4 GB / 128 GB', price: 3800 },
  { name: 'Vivo U20', variant: '4 GB / 64 GB', price: 3200 },
  { name: 'Vivo U10', variant: '3 GB / 32 GB', price: 2600 },
  { name: 'Vivo U1', variant: '3 GB / 32 GB', price: 1900 },

  // Page 4: 95 - 129
  { name: 'Vivo Y300 Plus 5G', variant: '8 GB / 128 GB', price: 13800 },
  { name: 'Vivo Y300 5G', variant: '8 GB / 128 GB', price: 12500 },
  { name: 'Vivo Y200 Pro 5G', variant: '8 GB / 128 GB', price: 14200 },
  { name: 'Vivo Y200 5G', variant: '8 GB / 128 GB', price: 12350 },
  { name: 'Vivo Y200e 5G', variant: '6 GB / 128 GB', price: 10500 },
  { name: 'Vivo Y100 5G', variant: '8 GB / 128 GB', price: 11000 },
  { name: 'Vivo Y100A 5G', variant: '8 GB / 256 GB', price: 11800 },
  { name: 'Vivo Y75 5G', variant: '8 GB / 128 GB', price: 7400 },
  { name: 'Vivo Y75 (4G)', variant: '8 GB / 128 GB', price: 6200 },
  { name: 'Vivo Y75', variant: '8 GB / 128 GB', price: 6200 },
  { name: 'Vivo Y73', variant: '8 GB / 128 GB', price: 6400 },
  { name: 'Vivo Y72 5G', variant: '8 GB / 128 GB', price: 6800 },
  { name: 'Vivo Y58 5G', variant: '8 GB / 128 GB', price: 10200 },
  { name: 'Vivo Y56 5G', variant: '8 GB / 128 GB', price: 8200 },
  { name: 'Vivo Y36', variant: '8 GB / 128 GB', price: 7000 },
  { name: 'Vivo Y35', variant: '8 GB / 128 GB', price: 6200 },
  { name: 'Vivo Y33T', variant: '8 GB / 128 GB', price: 5500 },
  { name: 'Vivo Y33s', variant: '8 GB / 128 GB', price: 5500 },
  { name: 'Vivo Y31 (2021)', variant: '6 GB / 128 GB', price: 4600 },
  { name: 'Vivo Y31', variant: '6 GB / 128 GB', price: 4600 },
  { name: 'Vivo Y30', variant: '4 GB / 128 GB', price: 3800 },
  { name: 'Vivo Y28 5G', variant: '4 GB / 128 GB', price: 7500 },
  { name: 'Vivo Y27', variant: '6 GB / 128 GB', price: 6100 },
  { name: 'Vivo Y22', variant: '4 GB / 64 GB', price: 4800 },
  { name: 'Vivo Y21T', variant: '4 GB / 64 GB', price: 4200 },
  { name: 'Vivo Y21e', variant: '4 GB / 64 GB', price: 4200 },
  { name: 'Vivo Y21G', variant: '4 GB / 64 GB', price: 4200 },
  { name: 'Vivo Y21 (2021)', variant: '4 GB / 64 GB', price: 3900 },
  { name: 'Vivo Y21', variant: '4 GB / 64 GB', price: 3900 },
  { name: 'Vivo Y20G', variant: '6 GB / 64 GB', price: 3800 },
  { name: 'Vivo Y20T', variant: '6 GB / 64 GB', price: 3800 },
  { name: 'Vivo Y20', variant: '4 GB / 64 GB', price: 3400 },
  { name: 'Vivo Y20i', variant: '4 GB / 64 GB', price: 3400 },
  { name: 'Vivo Y20A', variant: '4 GB / 64 GB', price: 3400 },
  { name: 'Vivo Y19', variant: '4 GB / 128 GB', price: 3500 },
  { name: 'Vivo Y18', variant: '4 GB / 64 GB', price: 5200 },
  { name: 'Vivo Y18e', variant: '4 GB / 64 GB', price: 5200 },
  { name: 'Vivo Y18t', variant: '4 GB / 64 GB', price: 5200 },
  { name: 'Vivo Y17', variant: '4 GB / 128 GB', price: 4400 },
  { name: 'Vivo Y17s', variant: '4 GB / 128 GB', price: 4400 },
  { name: 'Vivo Y16', variant: '3 GB / 32 GB', price: 3800 },
  { name: 'Vivo Y15', variant: '3 GB / 32 GB', price: 3000 },
  { name: 'Vivo Y15s', variant: '3 GB / 32 GB', price: 3000 },
  { name: 'Vivo Y15c', variant: '3 GB / 32 GB', price: 3000 },
  { name: 'Vivo Y12', variant: '3 GB / 32 GB', price: 2900 },
  { name: 'Vivo Y12s', variant: '3 GB / 32 GB', price: 2900 },
  { name: 'Vivo Y12G', variant: '3 GB / 32 GB', price: 2900 },
  { name: 'Vivo Y11 (2019)', variant: '3 GB / 32 GB', price: 2400 },
  { name: 'Vivo Y11', variant: '3 GB / 32 GB', price: 2400 },
  { name: 'Vivo Y03', variant: '4 GB / 64 GB', price: 3900 },
  { name: 'Vivo Y03t', variant: '4 GB / 64 GB', price: 3900 },
  { name: 'Vivo Y02', variant: '3 GB / 32 GB', price: 2800 },
  { name: 'Vivo Y02t', variant: '3 GB / 32 GB', price: 2800 },
  { name: 'Vivo Y02A', variant: '3 GB / 32 GB', price: 2800 },
  { name: 'Vivo Y01', variant: '2 GB / 32 GB', price: 2200 },
  { name: 'Vivo Y01A', variant: '2 GB / 32 GB', price: 2200 },

  // Page 5: 130 - 160
  { name: 'Vivo Y95', variant: '4 GB / 64 GB', price: 2400 },
  { name: 'Vivo Y93', variant: '3 GB / 32 GB', price: 2100 },
  { name: 'Vivo Y93s', variant: '3 GB / 32 GB', price: 2100 },
  { name: 'Vivo Y91', variant: '2 GB / 32 GB', price: 1900 },
  { name: 'Vivo Y91i', variant: '2 GB / 32 GB', price: 1900 },
  { name: 'Vivo Y90', variant: '2 GB / 16 GB', price: 1600 },
  { name: 'Vivo Y89', variant: '4 GB / 64 GB', price: 2000 },
  { name: 'Vivo Y85', variant: '4 GB / 64 GB', price: 1900 },
  { name: 'Vivo Y83', variant: '4 GB / 32 GB', price: 1800 },
  { name: 'Vivo Y83 Pro', variant: '4 GB / 32 GB', price: 1800 },
  { name: 'Vivo Y81', variant: '3 GB / 32 GB', price: 1700 },
  { name: 'Vivo Y81i', variant: '3 GB / 32 GB', price: 1700 },
  { name: 'Vivo Y71', variant: '3 GB / 16 GB', price: 1500 },
  { name: 'Vivo Y71i', variant: '3 GB / 16 GB', price: 1500 },
  { name: 'Vivo Y69', variant: '3 GB / 32 GB', price: 1400 },
  { name: 'Vivo Y66', variant: '3 GB / 32 GB', price: 1300 },
  { name: 'Vivo Y65', variant: '3 GB / 16 GB', price: 1200 },
  { name: 'Vivo Y55', variant: '2 GB / 16 GB', price: 1100 },
  { name: 'Vivo Y55s', variant: '2 GB / 16 GB', price: 1100 },
  { name: 'Vivo Y55L', variant: '2 GB / 16 GB', price: 1100 },
  { name: 'Vivo Y53', variant: '2 GB / 16 GB', price: 1000 },
  { name: 'Vivo Y53i', variant: '2 GB / 16 GB', price: 1000 },
  { name: 'Vivo Y51', variant: '2 GB / 16 GB', price: 900 },
  { name: 'Vivo Y51L', variant: '2 GB / 16 GB', price: 900 },
  { name: 'Vivo Y51A (2021)', variant: '6 GB / 128 GB', price: 4200 },
  { name: 'Vivo Y51A', variant: '6 GB / 128 GB', price: 4200 },
  { name: 'Vivo Y31 (Original Legacy)', variant: '1 GB / 8 GB', price: 600 },
  { name: 'Vivo Y31L', variant: '1 GB / 16 GB', price: 700 },
  { name: 'Vivo Y28 (Original Legacy)', variant: '1 GB / 8 GB', price: 550 },
  { name: 'Vivo Y27L', variant: '1 GB / 16 GB', price: 650 },
  { name: 'Vivo Y25', variant: '1 GB / 16 GB', price: 500 },
  { name: 'Vivo Y22 (Original Legacy)', variant: '1 GB / 4 GB', price: 400 },
  { name: 'Vivo Y21 (Legacy)', variant: '1 GB / 16 GB', price: 550 },
  { name: 'Vivo Y21L', variant: '1 GB / 16 GB', price: 550 },
  { name: 'Vivo Y15 (Original 2013/14)', variant: '512 MB / 4 GB', price: 350 },
  { name: 'Vivo Y15S (Original Legacy)', variant: '1 GB / 4 GB', price: 400 },
  { name: 'Vivo Y11 (Original 2014)', variant: '512 MB / 4 GB', price: 350 },
  { name: 'Vivo Y20 (Early G series legacy)', variant: '4 GB / 64 GB', price: 3100 },
  { name: 'Vivo Y12s (2021)', variant: '3 GB / 32 GB', price: 2950 },
  { name: 'Vivo Y1s', variant: '2 GB / 32 GB', price: 2100 },
  { name: 'Vivo Y02s', variant: '3 GB / 32 GB', price: 2700 },
  { name: 'Vivo Y01 (Core Go)', variant: '2 GB / 32 GB', price: 2150 }
];

function normalizeKey(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/^vivo\s+/i, '')
    .replace(/\b5g\b/gi, '')
    .replace(/\bplus\b/gi, '+')
    .replace(/\b(original legacy|original 2013\/14|early g series legacy|legacy|core go|diamond camera|waterfall display|pop-up pioneer|super amoled)\b/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

// Generate Fundu Buyback quote: Cashify Price + Random ₹500 to ₹1000 (stepped by ₹10)
function generateFunduPrice(cashifyPrice) {
  const randStep = 500 + Math.floor(Math.random() * 51) * 10;
  return cashifyPrice + randStep;
}

// Map entries with persistent random price per model
const modelPriceMap = new Map();
rawVivoList.forEach(item => {
  const funduPrice = generateFunduPrice(item.price);
  const key = normalizeKey(item.name);
  const entry = {
    ...item,
    funduPrice,
    key
  };
  modelPriceMap.set(key, entry);
  // Also index under exact raw lower name
  modelPriceMap.set(item.name.toLowerCase().trim(), entry);
});

function findVivoMatch(modelName) {
  if (!modelName) return null;
  const lower = modelName.toLowerCase().trim();
  if (modelPriceMap.has(lower)) return modelPriceMap.get(lower);
  const k = normalizeKey(modelName);
  if (modelPriceMap.has(k)) return modelPriceMap.get(k);

  // Partial substring matches
  for (const [dictKey, val] of modelPriceMap.entries()) {
    if (dictKey.length >= 4 && (k.includes(dictKey) || dictKey.includes(k))) {
      return val;
    }
  }
  return null;
}

async function run() {
  console.log(`Starting Vivo Base Price Sync with +₹500 to +₹1,000 random addition...`);

  // 1. UPDATE server/config/phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  const catalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));

  let catalogUpdatedCount = 0;
  const existingVivoKeys = new Set();

  catalog.forEach(item => {
    if (item.brand && item.brand.toLowerCase() === 'vivo') {
      const match = findVivoMatch(item.model);
      existingVivoKeys.add(normalizeKey(item.model));
      if (match) {
        item.base_resale_value = match.funduPrice;
        item.price = match.funduPrice;
        catalogUpdatedCount++;
      }
    }
  });

  // Add any completely missing Vivo models into phonesCatalog.json
  let catalogAddedCount = 0;
  rawVivoList.forEach(item => {
    const k = normalizeKey(item.name);
    if (!existingVivoKeys.has(k)) {
      const storagePart = item.variant.split('/')[1]?.trim() || '128 GB';
      const ramPart = item.variant.split('/')[0]?.trim() || '8 GB';
      catalog.push({
        brand: 'Vivo',
        model: item.name,
        release_year: 2024,
        ram_options: [ramPart, '8GB', '12GB'],
        storage_options: [storagePart, '256GB'],
        default_mrp: Math.round(item.funduPrice * 1.6),
        base_resale_value: item.funduPrice,
        price: item.funduPrice,
        image_url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
        popular_tag: 'Vivo Official Model',
        processor: 'High-Performance Processor',
        camera_spec: '50MP OIS Camera',
        battery_spec: '5000 mAh Fast Charging',
        display_spec: '6.78" AMOLED 120Hz',
        is_5g: item.name.includes('5G'),
        is_active: true
      });
      existingVivoKeys.add(k);
      catalogAddedCount++;
    }
  });

  fs.writeFileSync(phonesCatalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${catalogUpdatedCount} existing models, added ${catalogAddedCount} missing models.`);

  // 2. UPDATE src/data/indianPhonesCatalog.ts
  const indianCatalogPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
  let indianContent = fs.readFileSync(indianCatalogPath, 'utf8');

  let indianUpdated = 0;
  // Parse catalog array or regex replace
  rawVivoList.forEach(item => {
    const match = findVivoMatch(item.name);
    if (!match) return;
    const cleanName = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Look for object containing model: "..." or model: '...' and brand: "Vivo"
    const modelRegex = new RegExp(`(model:\\s*["']${cleanName}["'][\\s\\S]*?base_resale_value:\\s*)\\d+`, 'gi');
    if (modelRegex.test(indianContent)) {
      indianContent = indianContent.replace(modelRegex, `$1${match.funduPrice}`);
      indianUpdated++;
    }
  });
  fs.writeFileSync(indianCatalogPath, indianContent, 'utf8');
  console.log(`indianPhonesCatalog.ts: Replaced prices for ${indianUpdated} matching items.`);

  // 3. UPDATE src/data/masterModelCatalog.ts
  const masterCatalogPath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
  let masterContent = fs.readFileSync(masterCatalogPath, 'utf8');

  let masterUpdated = 0;
  rawVivoList.forEach(item => {
    const match = findVivoMatch(item.name);
    if (!match) return;
    const cleanName = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*["'](?:Vivo\\s+)?${cleanName}["'][\\s\\S]*?price:\\s*)\\d+`, 'gi');
    if (regex.test(masterContent)) {
      masterContent = masterContent.replace(regex, `$1${match.funduPrice}`);
      masterUpdated++;
    }
  });
  fs.writeFileSync(masterCatalogPath, masterContent, 'utf8');
  console.log(`masterModelCatalog.ts: Replaced prices for ${masterUpdated} matching items.`);

  // 4. UPDATE MongoDB Atlas Database
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
    const db = mongoose.connection.db;

    // Update masterphones collection
    let mongoMasterUpdated = 0;
    let mongoMasterInserted = 0;

    for (const item of rawVivoList) {
      const match = findVivoMatch(item.name);
      if (!match) continue;

      const filter = {
        brand: { $regex: /^vivo$/i },
        $or: [
          { model: new RegExp(`^${item.name.replace(/^vivo\s+/i, '')}$`, 'i') },
          { model: new RegExp(`^vivo\\s+${item.name.replace(/^vivo\s+/i, '')}$`, 'i') },
          { model: new RegExp(item.name.replace(/[^a-zA-Z0-9]/g, '.*'), 'i') }
        ]
      };

      const existing = await db.collection('masterphones').findOne(filter);
      if (existing) {
        await db.collection('masterphones').updateOne(
          { _id: existing._id },
          {
            $set: {
              base_resale_value: match.funduPrice,
              price: match.funduPrice,
              updated_at: new Date()
            }
          }
        );
        mongoMasterUpdated++;
      } else {
        await db.collection('masterphones').insertOne({
          brand: 'Vivo',
          model: item.name,
          release_year: 2024,
          ram_options: [item.variant.split('/')[0]?.trim() || '8GB'],
          storage_options: [item.variant.split('/')[1]?.trim() || '128GB'],
          default_mrp: Math.round(match.funduPrice * 1.6),
          base_resale_value: match.funduPrice,
          price: match.funduPrice,
          image_url: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x100-pro.jpg',
          popular_tag: 'Vivo Official Model',
          processor: 'High-Performance Processor',
          camera_spec: '50MP OIS Camera',
          battery_spec: '5000 mAh Fast Charging',
          display_spec: '6.78" AMOLED 120Hz',
          is_5g: item.name.includes('5G'),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
        mongoMasterInserted++;
      }

      // Upsert sellpriceconfigs for instant admin quote match
      const storageClean = (item.variant.split('/')[1]?.trim() || '128 GB').replace(/\s+/g, '');
      await db.collection('sellpriceconfigs').updateOne(
        {
          brand: { $regex: /^vivo$/i },
          model: new RegExp(`^${item.name.replace(/^vivo\s+/i, '')}$`, 'i')
        },
        {
          $set: {
            brand: 'Vivo',
            model: item.name.replace(/^vivo\s+/i, ''),
            storage: storageClean,
            base_price: match.funduPrice,
            box_bonus: 400,
            charger_bonus: 400,
            excellent_multiplier: 0.85,
            good_multiplier: 0.70,
            fair_multiplier: 0.55,
            is_active: true,
            updated_at: new Date()
          },
          $setOnInsert: {
            created_at: new Date()
          }
        },
        { upsert: true }
      );
    }

    console.log(`MongoDB masterphones: Updated ${mongoMasterUpdated}, Inserted ${mongoMasterInserted}.`);
    console.log(`MongoDB sellpriceconfigs: Synchronized all pricing configs.`);
  } catch (err) {
    console.error('MongoDB sync error:', err.message);
  } finally {
    await mongoose.disconnect();
  }

  console.log('✅ Vivo Price Update Complete!');
  process.exit(0);
}

run().catch(console.error);
