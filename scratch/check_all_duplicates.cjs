const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/masterModelCatalog.ts'), 'utf8');

// Match all objects in MASTER_MODEL_CATALOG
const models = [];
const regex = /{\s*brand:\s*["']([^"']+)["'],\s*series:\s*["']([^"']+)["'],\s*model:\s*["']([^"']+)["'],\s*storage:\s*["']([^"']+)["'],\s*price:\s*(\d+),\s*image:\s*["']([^"']+)["']\s*}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  models.push({
    brand: match[1],
    series: match[2],
    model: match[3],
    storage: match[4],
    price: parseInt(match[5], 10),
    image: match[6],
  });
}

console.log(`Total models parsed from MASTER_MODEL_CATALOG: ${models.length}`);

// Normalization for duplicate checking
function getDedupeKey(brand, model) {
  const b = (brand || '').toLowerCase().trim();
  let m = (model || '').toLowerCase().trim();
  m = m.replace(new RegExp(`^${b}\\s+`, 'i'), '');
  m = m.replace(/\b5g\b/gi, '').replace(/\b4g\b/gi, '');
  m = m.replace(/\b(marble|mclaren|olympic|bts|star wars|edition)\b/gi, '');
  m = m.replace(/[\s\-_]+/g, ' ').trim();
  return `${b}:::${m}`;
}

const byBrand = {};
models.forEach(m => {
  const b = m.brand.toLowerCase();
  if (!byBrand[b]) byBrand[b] = [];
  byBrand[b].push(m);
});

console.log('\n======================================================');
console.log('1. DUPLICATE MODELS PER BRAND IN MASTER_MODEL_CATALOG');
console.log('======================================================');
for (const [brand, list] of Object.entries(byBrand)) {
  const seen = new Map();
  const dupes = [];
  list.forEach(item => {
    const key = getDedupeKey(item.brand, item.model);
    if (seen.has(key)) {
      dupes.push({ first: seen.get(key), second: item });
    } else {
      seen.set(key, item);
    }
  });

  if (dupes.length > 0) {
    console.log(`\n[${brand.toUpperCase()}] ${dupes.length} duplicates out of ${list.length} models:`);
    dupes.forEach(d => {
      console.log(`  - "${d.first.model}" (${d.first.series}) <==> "${d.second.model}" (${d.second.series})`);
    });
  } else {
    console.log(`[${brand.toUpperCase()}]: 0 duplicates (${list.length} models)`);
  }
}

console.log('\n======================================================');
console.log('2. BROKEN / FAKE / PLACEHOLDER IMAGES');
console.log('======================================================');
const fakeImages = models.filter(m => 
  m.image.includes('777/thumb') || 
  m.image.includes('apple-apple-') || 
  m.image.includes('google-google-') ||
  m.image.includes('iqoo-iqoo-') ||
  m.image.includes('samsung-samsung-') ||
  m.image.includes('xiaomi-xiaomi-')
);
console.log(`Found ${fakeImages.length} broken/fake image URLs in MASTER_MODEL_CATALOG:`);
fakeImages.slice(0, 30).forEach(m => {
  console.log(`  - [${m.brand}] ${m.model}: ${m.image}`);
});

console.log('\n======================================================');
console.log('3. UNRELEASED / HALLUCINATED PHONES');
console.log('======================================================');
const hallucinated = models.filter(m => {
  const name = m.model.toLowerCase();
  return (
    name.includes('iphone 18') ||
    name.includes('iphone 17') ||
    name.includes('galaxy s26') ||
    name.includes('galaxy s27') ||
    name.includes('z fold 7') ||
    name.includes('z fold 8') ||
    name.includes('z flip 7') ||
    name.includes('z flip 8') ||
    name.includes('iqoo 15') ||
    name.includes('pixel 10')
  );
});
console.log(`Found ${hallucinated.length} unreleased/hallucinated models:`);
hallucinated.forEach(m => console.log(`  - [${m.brand}] ${m.model}`));
