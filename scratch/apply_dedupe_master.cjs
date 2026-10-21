const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
let content = fs.readFileSync(filePath, 'utf8');

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

const kept = [];
const seenKeys = new Map();
const toRemoveRaws = new Set();

items.forEach(item => {
  const is4G5GPair = /\b4g\b/i.test(item.model);
  const key = is4G5GPair ? `${item.brand.toLowerCase()}:::${item.model.toLowerCase()}` : getDedupeKey(item.brand, item.model);
  
  if (seenKeys.has(key)) {
    const existing = seenKeys.get(key);
    const preferNew = (
      (item.model.includes('(') && !existing.model.includes('(')) ||
      (item.model.includes('+') && !existing.model.includes('+')) ||
      (item.model.includes('Flip ') && existing.model.includes('Flip') && !existing.model.includes('Flip ')) ||
      (item.model.includes('Fold ') && existing.model.includes('Fold') && !existing.model.includes('Fold ')) ||
      (item.model.includes('Reno ') && !existing.model.includes('Reno '))
    );

    if (preferNew) {
      toRemoveRaws.add(existing.raw);
      toRemoveRaws.delete(item.raw);
      const idx = kept.indexOf(existing);
      kept[idx] = item;
      seenKeys.set(key, item);
    } else {
      toRemoveRaws.add(item.raw);
    }
  } else {
    seenKeys.set(key, item);
    kept.push(item);
  }
});

console.log(`Total duplicate entries to remove: ${toRemoveRaws.size}`);

// Remove from content
toRemoveRaws.forEach(raw => {
  // Replace the raw string and any trailing comma / whitespace / newline
  const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetRegex = new RegExp(`[\\t ]*${escaped},?\\r?\\n?`, 'g');
  content = content.replace(targetRegex, '');
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed all duplicate models from masterModelCatalog.ts!');
