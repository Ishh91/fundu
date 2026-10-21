const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, '../src/data/indianPhonesCatalog.ts'), 'utf8').split('\n');
const firstPart = lines.slice(0, 3744).join('\n');

const blocks = firstPart.split(/\{\s*id:/g);
console.log(`Original authentic models before sync bloat: ${blocks.length - 1}`);

const models = [];
for (let i = 1; i < blocks.length; i++) {
  const block = 'id:' + blocks[i];
  const bMatch = /brand:\s*['"]([^'"]+)['"]/.exec(block);
  const mMatch = /model:\s*['"]([^'"]+)['"]/.exec(block);
  const iMatch = /image_url:\s*['"]([^'"]+)['"]/.exec(block);
  const idMatch = /id:\s*['"]([^'"]+)['"]/.exec(block);

  if (bMatch && mMatch) {
    models.push({
      id: idMatch ? idMatch[1] : '',
      brand: bMatch[1],
      model: mMatch[1],
      image: iMatch ? iMatch[1] : '',
    });
  }
}

const byBrand = {};
models.forEach(m => {
  const b = m.brand;
  byBrand[b] = (byBrand[b] || 0) + 1;
});
console.log('Brands breakdown in first part:', byBrand);

// Check duplicates in first part
function getDedupeKey(brand, model) {
  const b = (brand || '').toLowerCase().trim();
  let m = (model || '').toLowerCase().trim();
  m = m.replace(new RegExp(`^${b}\\s+`, 'i'), '');
  m = m.replace(/\b5g\b/gi, '').replace(/\b4g\b/gi, '');
  m = m.replace(/[\s\-_]+/g, ' ').trim();
  return `${b}:::${m}`;
}

const seen = new Map();
const dupes = [];
models.forEach(item => {
  const key = getDedupeKey(item.brand, item.model);
  if (seen.has(key)) {
    dupes.push({ first: seen.get(key), second: item });
  } else {
    seen.set(key, item);
  }
});

console.log(`Duplicates in authentic first part: ${dupes.length}`);
dupes.forEach(d => console.log(`  - [${d.first.brand}] ${d.first.model} vs ${d.second.model}`));
