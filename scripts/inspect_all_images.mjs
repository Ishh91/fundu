import fs from 'fs';
import { ALL_INDIAN_PHONES_CATALOG } from '../src/data/indianPhonesCatalog.ts';
import { MOBILE_API_THUMBS } from '../src/data/deviceImageDictionary.ts';
import { getCleanPhoneImage, BRAND_FRONT_FALLBACKS } from '../src/lib/phoneImages.ts';

console.log('--- STARTING COMPREHENSIVE IMAGE AUDIT ---');

// 1. Audit ALL_INDIAN_PHONES_CATALOG
let indianTotal = ALL_INDIAN_PHONES_CATALOG.length;
let indianUnsplash = 0;
let indianRepetitive = 0;
let indianResolvedSpecific = 0;
let indianFallback = 0;

for (const p of ALL_INDIAN_PHONES_CATALOG) {
  const resolved = getCleanPhoneImage(p.brand, p.model, p.image_url);
  if (resolved.includes('unsplash.com')) indianUnsplash++;
  if (/([a-z0-9]+)-\1-/i.test(resolved)) indianRepetitive++;
  
  const brandFallback = BRAND_FRONT_FALLBACKS[p.brand.toLowerCase()];
  if (brandFallback && resolved === brandFallback) {
    indianFallback++;
  } else {
    indianResolvedSpecific++;
  }
}

console.log(`ALL_INDIAN_PHONES_CATALOG (${indianTotal} devices):`);
console.log(`- Resolved specific authentic renders: ${indianResolvedSpecific} (${((indianResolvedSpecific/indianTotal)*100).toFixed(1)}%)`);
console.log(`- Fallbacks to brand default: ${indianFallback}`);
console.log(`- Unsplash stock photos: ${indianUnsplash}`);
console.log(`- Fake repetitive URLs: ${indianRepetitive}`);

// 2. Audit MASTER_MODEL_CATALOG in SellPhone.tsx
const sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');
const lines = sellPhoneContent.split('\n');

const masterModels = [];
for (const line of lines) {
  const m = line.match(/brand:\s*"([^"]+)",\s*series:\s*"([^"]+)",\s*model:\s*"([^"]+)",\s*storage:[^,]+,\s*price:[^,]+,\s*image:\s*"([^"]+)"/);
  if (m) {
    masterModels.push({ brand: m[1], series: m[2], model: m[3], image: m[4] });
  }
}

let masterTotal = masterModels.length;
let masterUnsplash = 0;
let masterRepetitive = 0;
let masterResolvedSpecific = 0;
let masterFallback = 0;
const fallbackExamples = [];

for (const m of masterModels) {
  const resolved = getCleanPhoneImage(m.brand, m.model, m.image);
  if (resolved.includes('unsplash.com')) masterUnsplash++;
  if (/([a-z0-9]+)-\1-/i.test(resolved)) masterRepetitive++;
  
  const brandFallback = BRAND_FRONT_FALLBACKS[m.brand.toLowerCase()];
  if (brandFallback && resolved === brandFallback) {
    masterFallback++;
    if (fallbackExamples.length < 10) {
      fallbackExamples.push(`${m.brand} ${m.model}`);
    }
  } else {
    masterResolvedSpecific++;
  }
}

console.log(`\nMASTER_MODEL_CATALOG (${masterTotal} devices):`);
console.log(`- Resolved specific authentic renders: ${masterResolvedSpecific} (${((masterResolvedSpecific/masterTotal)*100).toFixed(1)}%)`);
console.log(`- Fallbacks to brand default: ${masterFallback}`);
console.log(`- Unsplash stock photos: ${masterUnsplash}`);
console.log(`- Fake repetitive URLs: ${masterRepetitive}`);
if (fallbackExamples.length > 0) {
  console.log('Sample models using brand fallback:', fallbackExamples);
}

// 3. Test Popular Models Sample
const testList = [
  { brand: 'Samsung', model: 'Galaxy S24 Ultra' },
  { brand: 'Samsung', model: 'Galaxy A14 5G' },
  { brand: 'Samsung', model: 'Galaxy Z Fold5' },
  { brand: 'Samsung', model: 'Galaxy S23 FE' },
  { brand: 'Apple', model: 'iPhone 15 Pro Max' },
  { brand: 'Apple', model: 'iPhone 13' },
  { brand: 'Apple', model: 'iPhone 11' },
  { brand: 'OnePlus', model: 'OnePlus 12' },
  { brand: 'OnePlus', model: 'OnePlus Nord CE 4' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro+' },
  { brand: 'Realme', model: 'Realme 12 Pro+' },
  { brand: 'Vivo', model: 'Vivo V30 Pro' },
  { brand: 'Google', model: 'Pixel 8' },
  { brand: 'Nothing', model: 'Nothing Phone 2a' }
];

console.log('\nPopular Models Check:');
for (const item of testList) {
  console.log(`${item.brand} ${item.model} -> ${getCleanPhoneImage(item.brand, item.model)}`);
}
