const fs = require('fs');

// We will read brandSeriesCatalog.ts and masterModelCatalog.ts
const bscCode = fs.readFileSync('./src/data/brandSeriesCatalog.ts', 'utf8');
const mmcCode = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');

// Let's create a bundle or evaluation to run groupModelsBySeries('oneplus', MASTER_MODEL_CATALOG)
// Let's see what groups and models are generated
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

console.log('Total master models parsed:', masterModels.length);

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

// Check how many models in master are duplicates
const seen = new Set();
const dupes = [];
for (const m of masterModels) {
  const k = getModelDedupeKey(m.brand, m.model);
  if (seen.has(k)) {
    dupes.push({ key: k, model: m.model });
  } else {
    seen.add(k);
  }
}
console.log('Dupes in masterModels directly:', dupes);
