const fs = require('fs');

// We simulate SellBrandPage
const bscCode = fs.readFileSync('./src/data/brandSeriesCatalog.ts', 'utf8');
const mmcCode = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');

// Parse master
const masterModels = [];
for (const match of mmcCode.matchAll(/{\s*brand:\s*["']OnePlus["'],\s*series:\s*["']([^"']+)["'],\s*model:\s*["']([^"']+)["'],\s*storage:\s*["']([^"']+)["'],\s*price:\s*([0-9]+),\s*image:\s*["']([^"']+)["']/g)) {
  masterModels.push({
    brand: 'OnePlus',
    series: match[1],
    model: match[2],
    storage: match[3],
    price: Number(match[4]),
    image: match[5]
  });
}

// In SellBrandPage.tsx:
// 1. masterList deduplicated using combinedMap:
function getModelDedupeKey(brand, model) {
  let clean = (model || '').toLowerCase().trim();
  const bClean = (brand || '').toLowerCase().trim();
  if (bClean && clean.startsWith(bClean)) {
    clean = clean.slice(bClean.length).trim();
  }
  clean = clean.replace(/\b(fold|flip)\s*([0-9]+)\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(fold|flip)([0-9]+)5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(s2[0-9]|note\s*20|fold\s*[0-9]+|flip\s*[0-9]+|z\s*fold\s*[0-9]*|z\s*flip\s*[0-9]*)\s*(ultra|plus|\+|fe)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(oneplus\s*(?:8|9|10|11|12|13|14|15|open))\s*(pro|r|t)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(pixel\s*(?:[5-9]|1[0-9]))\s*(pro|a|xl)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\s+(?:5g|4g)$/i, '');
  return clean.replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
}

const combinedMap = new Map();
masterModels.forEach((m) => {
  const key = getModelDedupeKey('OnePlus', m.model);
  if (!combinedMap.has(key)) {
    combinedMap.set(key, m);
  }
});
const allBrandModels = Array.from(combinedMap.values());
console.log('allBrandModels count:', allBrandModels.length);

// What about seriesGroups?
// Let's check if seriesGroups has models that repeat or if displayedModels repeats
console.log('Models in allBrandModels:');
allBrandModels.forEach(m => console.log(' - ', m.model, '| Series:', m.series));
