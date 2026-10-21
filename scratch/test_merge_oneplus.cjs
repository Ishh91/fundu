const fs = require('fs');

function getModelDedupeKey(brand, model) {
  let clean = (model || '').toLowerCase().trim();
  const bClean = (brand || '').toLowerCase().trim();
  if (bClean && clean.startsWith(bClean)) {
    clean = clean.slice(bClean.length).trim();
  }
  // Normalize Fold / Flip 5G redundancy
  clean = clean.replace(/\b(fold|flip)\s*([0-9]+)\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(fold|flip)([0-9]+)5g\b/gi, '$1 $2');

  // Normalize 5G flagship naming redundancy (S20-S26, Note 20, OnePlus flagships, Pixels, etc.)
  clean = clean.replace(/\b(s2[0-9]|note\s*20|fold\s*[0-9]+|flip\s*[0-9]+|z\s*fold\s*[0-9]*|z\s*flip\s*[0-9]*)\s*(ultra|plus|\+|fe)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(oneplus\s*(?:8|9|10|11|12|13|14|15|open))\s*(pro|r|t)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(pixel\s*(?:[5-9]|1[0-9]))\s*(pro|a|xl)?\s*5g\b/gi, '$1 $2');

  // Strip generic trailing 5g/4g suffix for deduplication so identical models match
  clean = clean.replace(/\s+(?:5g|4g)$/i, '');

  return clean
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]/g, '');
}

const masterContent = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');
const indianContent = fs.readFileSync('./src/data/indianPhonesCatalog.ts', 'utf8');

// Parse master
const masterModels = [];
for (const match of masterContent.matchAll(/{\s*brand:\s*["']OnePlus["'],[^}]*model:\s*["']([^"']+)["']/g)) {
  masterModels.push(match[1]);
}

// Parse indian
const indianModels = [];
for (const match of indianContent.matchAll(/brand:\s*['"]OnePlus['"],\s*model:\s*['"]([^'"]+)['"]/g)) {
  indianModels.push(match[1]);
}

console.log('Master OnePlus models count:', masterModels.length);
console.log('Indian OnePlus models count:', indianModels.length);

const combinedMap = new Map();
masterModels.forEach(m => {
  const k = getModelDedupeKey('OnePlus', m);
  if (!combinedMap.has(k)) {
    combinedMap.set(k, { source: 'master', model: m });
  }
});

const notDeduplicated = [];
indianModels.forEach(m => {
  const k = getModelDedupeKey('OnePlus', m);
  if (!combinedMap.has(k)) {
    combinedMap.set(k, { source: 'indian', model: m });
    notDeduplicated.push(m);
  }
});

console.log('\nModels from indian NOT deduplicated against master (new additions):', notDeduplicated);

// Now check what SellBrandPage does:
// Look at series groups and how models are assigned
console.log('\nAll unique combined keys count:', combinedMap.size);
for (const [k, v] of combinedMap.entries()) {
  console.log(`Key: [${k}] -> ${v.model} (${v.source})`);
}
