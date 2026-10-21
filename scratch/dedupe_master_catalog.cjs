const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
const content = fs.readFileSync(filePath, 'utf8');

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
  return `${bClean}:::${clean.replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '')}`;
}

// Extract objects
const regex = /{\s*brand:\s*["']([^"']+)["'],\s*series:\s*["']([^"']+)["'],\s*model:\s*["']([^"']+)["'],\s*storage:\s*["']([^"']+)["'],\s*price:\s*(\d+),\s*image:\s*["']([^"']+)["']\s*}/g;
const items = [];
let m;
while ((m = regex.exec(content)) !== null) {
  items.push({
    raw: m[0],
    brand: m[1],
    series: m[2],
    model: m[3],
    storage: m[4],
    price: parseInt(m[5], 10),
    image: m[6],
  });
}

console.log(`Total models in master: ${items.length}`);

const kept = [];
const seenKeys = new Map();
const removed = [];

items.forEach(item => {
  const is4G5GPair = /\b4g\b/i.test(item.model);
  const key = is4G5GPair ? `${item.brand.toLowerCase()}:::${item.model.toLowerCase()}` : getDedupeKey(item.brand, item.model);
  
  if (seenKeys.has(key)) {
    const existing = seenKeys.get(key);
    // Decision on which one to prefer:
    const preferNew = (
      (item.model.includes('(') && !existing.model.includes('(')) ||
      (item.model.includes('+') && !existing.model.includes('+')) ||
      (item.model.includes('Flip ') && existing.model.includes('Flip') && !existing.model.includes('Flip ')) ||
      (item.model.includes('Fold ') && existing.model.includes('Fold') && !existing.model.includes('Fold ')) ||
      (item.model.includes('Reno ') && !existing.model.includes('Reno '))
    );

    if (preferNew) {
      removed.push(existing);
      const idx = kept.indexOf(existing);
      kept[idx] = item;
      seenKeys.set(key, item);
    } else {
      removed.push(item);
    }
  } else {
    seenKeys.set(key, item);
    kept.push(item);
  }
});

console.log(`Kept: ${kept.length}, Removed duplicates: ${removed.length}`);
console.log('\nAll removed duplicates within brand:');
removed.forEach(r => console.log(`  - Removed: [${r.brand}] "${r.model}" (${r.series})`));
