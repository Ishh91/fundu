const fs = require('fs');

// 1. Analyze SellPhone.tsx MASTER_MODEL_CATALOG
const sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');
const brandRegex = /brand:\s*['"]([^'"]+)['"]/g;
const catalogBrands = {};
let match;
while ((match = brandRegex.exec(sellPhoneContent)) !== null) {
  const b = match[1];
  catalogBrands[b] = (catalogBrands[b] || 0) + 1;
}
console.log('--- Current MASTER_MODEL_CATALOG counts ---');
console.log(catalogBrands);

// 2. Analyze brandSeriesCatalog.ts
const brandSeriesContent = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');
console.log('\n--- Checking brandSeriesCatalog series definitions ---');
const definedBrands = ['apple', 'samsung', 'oneplus', 'xiaomi', 'vivo', 'realme', 'google', 'motorola', 'nothing'];
for (const b of definedBrands) {
  const brandStart = brandSeriesContent.indexOf(`${b}: [`);
  if (brandStart !== -1) {
    const chunk = brandSeriesContent.slice(brandStart, brandStart + 2500);
    const hasDef = chunk.includes('defaultModels:');
    console.log(`${b}: has defaultModels = ${hasDef}`);
  }
}
