const fs = require('fs');

// Read files
const masterCatalogCode = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');

// Parse MASTER_MODEL_CATALOG OnePlus entries
const onePlusMaster = [];
const lines = masterCatalogCode.split('\n');
for (const line of lines) {
  if (line.includes('brand: "OnePlus"') || line.includes("brand: 'OnePlus'")) {
    const mMatch = line.match(/model:\s*["']([^"']+)["']/);
    const sMatch = line.match(/series:\s*["']([^"']+)["']/);
    const stgMatch = line.match(/storage:\s*["']([^"']+)["']/);
    const prMatch = line.match(/price:\s*([0-9]+)/);
    const imgMatch = line.match(/image:\s*["']([^"']+)["']/);
    if (mMatch) {
      onePlusMaster.push({
        brand: 'OnePlus',
        series: sMatch ? sMatch[1] : 'OnePlus',
        model: mMatch[1],
        storage: stgMatch ? stgMatch[1] : '128 GB',
        price: prMatch ? Number(prMatch[1]) : 20000,
        image: imgMatch ? imgMatch[1] : ''
      });
    }
  }
}

console.log('OnePlus models in master:', onePlusMaster.length);

// Check model names
const modelCounts = {};
for (const m of onePlusMaster) {
  modelCounts[m.model] = (modelCounts[m.model] || 0) + 1;
}

const repeatedNames = Object.entries(modelCounts).filter(([k, v]) => v > 1);
console.log('Direct repeated model names in MASTER_MODEL_CATALOG:', repeatedNames);

// Check getModelDedupeKey
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

const keyMap = {};
for (const m of onePlusMaster) {
  const k = getModelDedupeKey(m.brand, m.model);
  if (!keyMap[k]) keyMap[k] = [];
  keyMap[k].push(m.model);
}

console.log('\nKey collisions under getModelDedupeKey:');
for (const [k, models] of Object.entries(keyMap)) {
  if (models.length > 1) {
    console.log(`Key: "${k}" ->`, models);
  }
}

console.log('\nAll unique OnePlus models currently in master:');
console.log(onePlusMaster.map(m => m.model).sort());
