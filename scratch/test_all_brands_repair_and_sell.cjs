const fs = require('fs');
const path = require('path');

// Read files
const masterContent = fs.readFileSync(path.join(__dirname, '../src/data/masterModelCatalog.ts'), 'utf8');
const indianContent = fs.readFileSync(path.join(__dirname, '../src/data/indianPhonesCatalog.ts'), 'utf8');

// Parse masterModelCatalog
const masterRegex = /{\s*brand:\s*["']([^"']+)["'],\s*series:\s*["']([^"']+)["'],\s*model:\s*["']([^"']+)["'],\s*storage:\s*["']([^"']+)["'],\s*price:\s*(\d+),\s*image:\s*["']([^"']+)["']\s*}/g;
const masterModels = [];
let m;
while ((m = masterRegex.exec(masterContent)) !== null) {
  masterModels.push({
    brand: m[1],
    series: m[2],
    model: m[3],
    storage: m[4],
    price: parseInt(m[5], 10),
    image: m[6],
  });
}

// Parse indianPhonesCatalog
const indianBlocks = indianContent.split(/\{\s*id:/g);
const indianModels = [];
for (let i = 1; i < indianBlocks.length; i++) {
  const b = 'id:' + indianBlocks[i];
  const bM = /brand:\s*['"]([^'"]+)['"]/.exec(b);
  const mM = /model:\s*['"]([^'"]+)['"]/.exec(b);
  const iM = /image_url:\s*['"]([^'"]+)['"]/.exec(b);
  if (bM && mM) {
    indianModels.push({
      brand: bM[1],
      model: mM[1],
      image: iM ? iM[1] : '',
      series: '',
    });
  }
}

function getDedupeKey(brand, model) {
  let clean = (model || '').toLowerCase().trim();
  const bClean = (brand || '').toLowerCase().trim();
  if (bClean && clean.startsWith(bClean)) {
    clean = clean.slice(bClean.length).trim();
  }
  clean = clean.replace(/\b(marble\s*edition|mclaren\s*edition|mclaren|150w|edition)\b/gi, '');
  clean = clean.replace(/\b(fold|flip)\s*([0-9]+)\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(s2[0-9]|note\s*20|fold\s*[0-9]+|flip\s*[0-9]+|z\s*fold\s*[0-9]*|z\s*flip\s*[0-9]*)\s*(ultra|plus|\+|fe)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(oneplus\s*(?:8|9|10|11|12|13|14|15|open))\s*(pro|r|t)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(pixel\s*(?:[5-9]|1[0-9]))\s*(pro|a|xl)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\s+(?:5g|4g)$/i, '');
  clean = clean.replace(/nord\s*ce\s*/gi, 'nordce');
  return clean.replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '');
}

const brands = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'iQOO', 'Oppo', 'Google', 'Nothing', 'Motorola'];

console.log('=====================================================');
console.log('REPAIR & SELL MODEL AUDIT ACROSS ALL BRANDS');
console.log('=====================================================');

brands.forEach(brand => {
  const bKey = brand.toLowerCase();
  
  // 1. Sell catalog items for this brand
  const sellBrandModels = masterModels.filter(item => item.brand.toLowerCase() === bKey);
  const seenSell = new Map();
  const sellDupes = [];
  sellBrandModels.forEach(item => {
    const k = getDedupeKey(item.brand, item.model);
    if (seenSell.has(k)) {
      sellDupes.push({ first: seenSell.get(k), second: item });
    } else {
      seenSell.set(k, item);
    }
  });

  // 2. Repair combined list simulation
  const indForBrand = indianModels.filter(item => item.brand.toLowerCase() === bKey);
  const combinedRepair = [...sellBrandModels];
  indForBrand.forEach(im => {
    const k = getDedupeKey(im.brand, im.model);
    if (!combinedRepair.some(cm => getDedupeKey(cm.brand, cm.model) === k)) {
      combinedRepair.push(im);
    }
  });

  const seenRepair = new Map();
  const repairDupes = [];
  combinedRepair.forEach(item => {
    const k = getDedupeKey(item.brand, item.model);
    if (seenRepair.has(k)) {
      repairDupes.push({ first: seenRepair.get(k), second: item });
    } else {
      seenRepair.set(k, item);
    }
  });

  // Check bad images
  const badImgs = combinedRepair.filter(item => 
    !item.image ||
    item.image.includes('777/thumb') ||
    item.image.includes('apple-apple-') ||
    item.image.includes('google-google-') ||
    item.image.includes('iqoo-iqoo-')
  );

  console.log(`\n[${brand.toUpperCase()}]:`);
  console.log(`  Sell models: ${sellBrandModels.length} (duplicates: ${sellDupes.length})`);
  console.log(`  Repair models: ${combinedRepair.length} (duplicates: ${repairDupes.length})`);
  console.log(`  Broken/fake images: ${badImgs.length}`);

  if (sellDupes.length > 0) {
    sellDupes.forEach(d => console.log(`    ⚠️ Sell Dupe: "${d.first.model}" vs "${d.second.model}"`));
  }
  if (repairDupes.length > 0) {
    repairDupes.forEach(d => console.log(`    ⚠️ Repair Dupe: "${d.first.model}" vs "${d.second.model}"`));
  }
  if (badImgs.length > 0) {
    badImgs.forEach(b => console.log(`    ❌ Bad image: [${b.model}] -> ${b.image}`));
  }
});
