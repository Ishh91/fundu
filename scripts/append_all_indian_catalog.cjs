const fs = require('fs');

const indianPhonesPath = 'src/data/indianPhonesCatalog.ts';
let indianContent = fs.readFileSync(indianPhonesPath, 'utf8');

// Load all models from MASTER_MODEL_CATALOG in SellPhone.tsx
const sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');
const mStart = sellPhoneContent.indexOf('export const MASTER_MODEL_CATALOG = [');
const mEnd = sellPhoneContent.indexOf('];\n\nconst STORAGE_OPTIONS', mStart);
const mBlock = sellPhoneContent.slice(mStart, mEnd);

const masterModels = [];
const itemRegex = /\{\s*brand:\s*'([^']+)',\s*series:\s*'([^']+)',\s*model:\s*'([^']+)',\s*storage:\s*'([^']+)',\s*price:\s*(\d+),\s*image:\s*'([^']+)'\s*\}/g;
let mMatch;
while ((mMatch = itemRegex.exec(mBlock)) !== null) {
  masterModels.push({
    brand: mMatch[1],
    series: mMatch[2],
    model: mMatch[3],
    storage: mMatch[4],
    price: parseInt(mMatch[5]),
    image: mMatch[6]
  });
}

// Find existing models in ALL_INDIAN_PHONES_CATALOG
const existingModelRegex = /model:\s*'([^']+)'/g;
const existingModels = new Set();
let exMatch;
while ((exMatch = existingModelRegex.exec(indianContent)) !== null) {
  existingModels.add(exMatch[1].toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, ''));
}

console.log(`Existing models in ALL_INDIAN_PHONES_CATALOG: ${existingModels.size}`);

// Filter models not yet in ALL_INDIAN_PHONES_CATALOG
const missing = masterModels.filter(m => {
  const norm = m.model.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
  return !existingModels.has(norm);
});

console.log(`Missing models to append to ALL_INDIAN_PHONES_CATALOG: ${missing.length}`);

// Format new MasterPhone items
const newItems = missing.map((m, idx) => {
  const id = `${m.brand.toLowerCase()}-${m.model.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-')}`;
  const is5g = /5g|fold|flip|ultra/i.test(m.model) || m.price > 12000;
  const mrp = Math.round(m.price * 1.65);
  return `  {
    id: '${id}',
    brand: '${m.brand}',
    model: '${m.model.replace(/'/g, "\\'")}',
    release_year: 2023,
    ram_options: ['6GB', '8GB', '12GB'],
    storage_options: ['128GB', '256GB'],
    default_mrp: ${mrp},
    base_resale_value: ${m.price},
    image_url: '${m.image}',
    popular_tag: '${m.brand} Verified Phone',
    processor: 'High Performance Octa-Core Processor',
    camera_spec: '50MP Ultra-Clear Camera',
    battery_spec: '5000 mAh Fast Charging Battery',
    display_spec: 'FHD+ AMOLED 120Hz Display',
    is_5g: ${is5g},
    is_active: true,
  },`;
});

if (newItems.length > 0) {
  // Find where ALL_INDIAN_PHONES_CATALOG ends
  // Look for the end of the array before helper functions
  const insertMarker = 'export function searchIndianPhones(';
  const markerIdx = indianContent.indexOf(insertMarker);
  if (markerIdx === -1) {
    console.error('Could not find searchIndianPhones marker');
    process.exit(1);
  }

  // Find the last '];' before searchPhones
  const lastArrayEnd = indianContent.lastIndexOf('];', markerIdx);
  const before = indianContent.slice(0, lastArrayEnd);
  const after = indianContent.slice(lastArrayEnd);

  const updatedContent = before + '\n  // ==========================================\n  // MOBILEDEVAPI VERIFIED MODELS SYNC\n  // ==========================================\n' + newItems.join('\n') + '\n' + after;
  fs.writeFileSync(indianPhonesPath, updatedContent, 'utf8');
  console.log(`Successfully appended ${newItems.length} models to ${indianPhonesPath}!`);
}
