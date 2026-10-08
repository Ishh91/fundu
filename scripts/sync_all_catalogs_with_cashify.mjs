import fs from 'fs';

// 1. Load Cashify Scraped Prices
const cashifyData = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));
console.log(`Loaded ${cashifyData.length} Cashify scraped variants.`);

// Normalize model name helper
function normalizeModelName(str, brand) {
  let s = (str || '').toLowerCase();
  if (brand) {
    const b = brand.toLowerCase();
    s = s.replace(new RegExp(`^${b}\\s*`, 'i'), '');
  }
  s = s.replace(/\s+5g\b/i, '');
  return s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Group Cashify variants by unique device (brand + cleanModel)
const modelGroups = new Map();

for (const item of cashifyData) {
  const brand = item.brand;
  const cleanModel = item.cleanModel;
  const key = `${brand.toLowerCase()}:::${normalizeModelName(cleanModel, brand)}`;
  
  if (!modelGroups.has(key)) {
    modelGroups.set(key, {
      brand,
      cleanModel,
      variants: [],
      storages: new Set(),
      rams: new Set(),
      minPrice: Infinity,
      baseVariant: null,
    });
  }
  const group = modelGroups.get(key);
  group.variants.push(item);
  if (item.storage) group.storages.add(item.storage);
  if (item.ram) group.rams.add(item.ram);
  if (item.funduPrice < group.minPrice) {
    group.minPrice = item.funduPrice;
    group.baseVariant = item;
  }
}

console.log(`Identified ${modelGroups.size} unique phone models from Cashify.`);

// Helper to get image URL for a model
function getPhoneImageUrl(model, brand) {
  const clean = model.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const bClean = brand.toLowerCase();
  return `https://fdn2.gsmarena.com/vv/bigpic/${bClean}-${clean}.jpg`;
}

// =========================================================================
// STEP 1: Update fundu_phone_quote.mjs (RESALE_BENCHMARKS)
// =========================================================================
console.log('\n--- Syncing fundu_phone_quote.mjs ---');
const quoteFileContent = fs.readFileSync('./fundu_phone_quote.mjs', 'utf8');

const benchmarkRegex = /export const RESALE_BENCHMARKS = \[([\s\S]*?)\];/;
const benchmarkMatch = quoteFileContent.match(benchmarkRegex);

if (!benchmarkMatch) {
  throw new Error('Could not find RESALE_BENCHMARKS in fundu_phone_quote.mjs');
}

const benchmarksMap = new Map();

const rawExistingLines = benchmarkMatch[1].trim().split('\n');
for (const line of rawExistingLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('{') && trimmed.includes('brand:') && trimmed.includes('proceeds:')) {
    try {
      const obj = eval(`(${trimmed.replace(/,$/, '')})`);
      const key = `${obj.brand.toLowerCase()}:::${normalizeModelName(obj.model, obj.brand)}:::${(obj.storage || '').toLowerCase().replace(/\s+/g, '')}`;
      benchmarksMap.set(key, obj);
    } catch (e) {}
  }
}

console.log(`Existing benchmarks loaded: ${benchmarksMap.size}`);

let updatedBenchmarksCount = 0;
let newBenchmarksCount = 0;

for (const variant of cashifyData) {
  const normStorage = (variant.storage || '128 GB').toLowerCase().replace(/\s+/g, '');
  const key = `${variant.brand.toLowerCase()}:::${normalizeModelName(variant.cleanModel, variant.brand)}:::${normStorage}`;

  const entry = {
    brand: variant.brand,
    model: variant.cleanModel,
    storage: variant.storage || '128 GB',
    proceeds: variant.funduPrice, // CASHIFY PRICE + 1000
    lastUpdated: '2026-10-08',
  };

  if (benchmarksMap.has(key)) {
    updatedBenchmarksCount++;
  } else {
    newBenchmarksCount++;
  }
  benchmarksMap.set(key, entry);
}

console.log(`Benchmarks: Updated ${updatedBenchmarksCount}, Inserted ${newBenchmarksCount}, Total now: ${benchmarksMap.size}`);

const benchmarkEntries = Array.from(benchmarksMap.values());
benchmarkEntries.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));

const newBenchmarkCode = 'export const RESALE_BENCHMARKS = [\n' +
  benchmarkEntries.map(b => `  { brand: '${b.brand}', model: ${JSON.stringify(b.model)}, storage: '${b.storage}', proceeds: ${b.proceeds}, lastUpdated: '${b.lastUpdated || '2026-10-08'}' },`).join('\n') +
  '\n];';

const updatedQuoteFile = quoteFileContent.replace(benchmarkRegex, newBenchmarkCode);
fs.writeFileSync('./fundu_phone_quote.mjs', updatedQuoteFile, 'utf8');
console.log('Successfully updated fundu_phone_quote.mjs with exact Cashify + 1000 benchmarks!');

// =========================================================================
// STEP 2: Update src/pages/SellPhone.tsx (MASTER_MODEL_CATALOG)
// =========================================================================
console.log('\n--- Syncing src/pages/SellPhone.tsx MASTER_MODEL_CATALOG ---');
const sellPhoneContent = fs.readFileSync('./src/pages/SellPhone.tsx', 'utf8');

const masterCatalogRegex = /export const MASTER_MODEL_CATALOG = \[([\s\S]*?)\];/;
const masterMatch = sellPhoneContent.match(masterCatalogRegex);

if (!masterMatch) {
  throw new Error('Could not find MASTER_MODEL_CATALOG in SellPhone.tsx');
}

const masterCatalogMap = new Map();
const existingMasterLines = masterMatch[1].trim().split('\n');
for (const line of existingMasterLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('{') && trimmed.includes('brand:') && trimmed.includes('model:')) {
    try {
      const obj = eval(`(${trimmed.replace(/,$/, '')})`);
      const key = `${obj.brand.toLowerCase()}:::${normalizeModelName(obj.model, obj.brand)}`;
      masterCatalogMap.set(key, obj);
    } catch (e) {}
  }
}

console.log(`Existing MASTER_MODEL_CATALOG entries: ${masterCatalogMap.size}`);

let masterUpdatedCount = 0;
let masterImportedCount = 0;

for (const [key, item] of masterCatalogMap.entries()) {
  if (modelGroups.has(key)) {
    const group = modelGroups.get(key);
    item.price = group.minPrice; // Cashify min price + 1000
    masterUpdatedCount++;
  }
}

for (const [key, group] of modelGroups.entries()) {
  if (!masterCatalogMap.has(key)) {
    const newItem = {
      brand: group.brand,
      series: `${group.brand} Series`,
      model: group.cleanModel,
      storage: group.baseVariant ? group.baseVariant.storage : (Array.from(group.storages)[0] || '128 GB'),
      price: group.minPrice,
      image: getPhoneImageUrl(group.cleanModel, group.brand),
    };
    masterCatalogMap.set(key, newItem);
    masterImportedCount++;
  }
}

console.log(`MASTER_MODEL_CATALOG: Updated ${masterUpdatedCount}, Imported ${masterImportedCount}, Total now: ${masterCatalogMap.size}`);

const masterEntries = Array.from(masterCatalogMap.values());
masterEntries.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));

const newMasterCatalogCode = 'export const MASTER_MODEL_CATALOG = [\n' +
  masterEntries.map(m => `  { brand: ${JSON.stringify(m.brand)}, series: ${JSON.stringify(m.series || m.brand)}, model: ${JSON.stringify(m.model)}, storage: ${JSON.stringify(m.storage || '128 GB')}, price: ${m.price}, image: ${JSON.stringify(m.image)} },`).join('\n') +
  '\n];';

const updatedSellPhone = sellPhoneContent.replace(masterCatalogRegex, newMasterCatalogCode);
fs.writeFileSync('./src/pages/SellPhone.tsx', updatedSellPhone, 'utf8');
console.log('Successfully updated src/pages/SellPhone.tsx with exact Cashify + 1000 catalog!');

// =========================================================================
// STEP 3: Update src/data/indianPhonesCatalog.ts (O(N) Block Parsing)
// =========================================================================
console.log('\n--- Syncing src/data/indianPhonesCatalog.ts ---');
const indianCatalogContent = fs.readFileSync('./src/data/indianPhonesCatalog.ts', 'utf8');

const blocks = indianCatalogContent.split('\n  {');
console.log(`Split indianPhonesCatalog into ${blocks.length} blocks.`);

let indianUpdatedCount = 0;
const matchedKeysInCatalog = new Set();

for (let i = 1; i < blocks.length; i++) {
  let block = blocks[i];
  const brandMatch = block.match(/brand:\s*'([^']+)'/);
  const modelMatch = block.match(/model:\s*'([^']+)'/);
  
  if (brandMatch && modelMatch) {
    const brand = brandMatch[1];
    const model = modelMatch[1];
    const key = `${brand.toLowerCase()}:::${normalizeModelName(model, brand)}`;
    
    if (modelGroups.has(key)) {
      matchedKeysInCatalog.add(key);
      const group = modelGroups.get(key);
      // Replace base_resale_value
      blocks[i] = block.replace(/base_resale_value:\s*\d+/, `base_resale_value: ${group.minPrice}`);
      indianUpdatedCount++;
    }
  }
}

console.log(`Updated base_resale_value for ${indianUpdatedCount} models in ALL_INDIAN_PHONES_CATALOG.`);

// Check for missing models in indianPhonesCatalog to append
const missingForIndian = [];
for (const [key, group] of modelGroups.entries()) {
  if (!matchedKeysInCatalog.has(key)) {
    missingForIndian.push(group);
  }
}

console.log(`Found ${missingForIndian.length} models to import into ALL_INDIAN_PHONES_CATALOG.`);

let updatedIndianContent = blocks.join('\n  {');

if (missingForIndian.length > 0) {
  const appendedItems = missingForIndian.map(g => {
    const slug = `${g.brand.toLowerCase()}-${g.cleanModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/^-|-$/g, '');
    const storages = Array.from(g.storages).map(s => s.replace(/\s+/g, ''));
    const rams = Array.from(g.rams).map(r => r.replace(/\s+/g, ''));
    const mrp = Math.round((g.minPrice * 1.5) / 100) * 100;

    return `  {
    id: '${slug}',
    brand: '${g.brand}',
    model: ${JSON.stringify(g.cleanModel)},
    release_year: 2023,
    ram_options: ${JSON.stringify(rams.length ? rams : ['6GB', '8GB'])},
    storage_options: ${JSON.stringify(storages.length ? storages : ['128GB', '256GB'])},
    default_mrp: ${mrp},
    base_resale_value: ${g.minPrice},
    image_url: ${JSON.stringify(getPhoneImageUrl(g.cleanModel, g.brand))},
    popular_tag: '${g.brand} Verified Resale Model',
    processor: 'Octa-core High Performance',
    camera_spec: 'High Resolution AI Camera',
    battery_spec: '5000 mAh All-Day Battery',
    display_spec: 'Full HD+ High Refresh Display',
    is_5g: ${g.cleanModel.toLowerCase().includes('5g')},
    is_active: true,
  },`;
  }).join('\n');

  const endBracketIndex = updatedIndianContent.lastIndexOf('];');
  if (endBracketIndex !== -1) {
    updatedIndianContent = updatedIndianContent.slice(0, endBracketIndex) +
      '\n  // ==========================================\n  // CASHIFY IMPORTED CERTIFIED RESALE MODELS\n  // ==========================================\n' +
      appendedItems + '\n' +
      updatedIndianContent.slice(endBracketIndex);
    console.log(`Appended ${missingForIndian.length} imported models into ALL_INDIAN_PHONES_CATALOG!`);
  }
}

fs.writeFileSync('./src/data/indianPhonesCatalog.ts', updatedIndianContent, 'utf8');

console.log('\n=============================================');
console.log('🎉 SYNC COMPLETE ACROSS ALL CATALOGS & ENGINES!');
console.log('=============================================');
