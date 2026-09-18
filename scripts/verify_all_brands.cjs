const fs = require('fs');

// Test that all brand pages have series and models
const sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');
const brandSeriesContent = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');

// Parse MASTER_MODEL_CATALOG
const mStart = sellPhoneContent.indexOf('export const MASTER_MODEL_CATALOG = [');
const mEnd = sellPhoneContent.indexOf('];\n\nconst STORAGE_OPTIONS', mStart);
const mBlock = sellPhoneContent.slice(mStart, mEnd);

const models = [];
const itemRegex = /\{\s*brand:\s*'([^']+)',\s*series:\s*'([^']+)',\s*model:\s*'([^']+)',\s*storage:\s*'([^']+)',\s*price:\s*(\d+),\s*image:\s*'([^']+)'\s*\}/g;
let mMatch;
while ((mMatch = itemRegex.exec(mBlock)) !== null) {
  models.push({
    brand: mMatch[1],
    series: mMatch[2],
    model: mMatch[3],
    storage: mMatch[4],
    price: parseInt(mMatch[5]),
    image: mMatch[6]
  });
}

console.log(`Total models parsed in MASTER_MODEL_CATALOG: ${models.length}`);

// Test brands
const testBrands = ['apple', 'samsung', 'oneplus', 'xiaomi', 'realme', 'oppo', 'vivo', 'google', 'motorola', 'nothing'];
for (const b of testBrands) {
  const brandModels = models.filter(m => m.brand.toLowerCase() === b);
  console.log(`Brand [${b}]: ${brandModels.length} models`);
  // Series count
  const seriesNames = [...new Set(brandModels.map(m => m.series))];
  console.log(`  -> Series (${seriesNames.length}): ${seriesNames.join(', ')}`);
}
