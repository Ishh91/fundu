const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/indianPhonesCatalog.ts'), 'utf8');

const idRegex = /id:\s*['"]([^'"]+)['"]/g;
const brandRegex = /brand:\s*['"]([^'"]+)['"]/g;
const modelRegex = /model:\s*['"]([^'"]+)['"]/g;
const imgRegex = /image_url:\s*['"]([^'"]+)['"]/g;

// Split by blocks `{` and `}`
const blocks = content.split(/\{\s*id:/g);
console.log(`Total blocks in ALL_INDIAN_PHONES_CATALOG: ${blocks.length - 1}`);

const indianModels = [];
for (let i = 1; i < blocks.length; i++) {
  const block = 'id:' + blocks[i];
  const bMatch = /brand:\s*['"]([^'"]+)['"]/.exec(block);
  const mMatch = /model:\s*['"]([^'"]+)['"]/.exec(block);
  const iMatch = /image_url:\s*['"]([^'"]+)['"]/.exec(block);
  const idMatch = /id:\s*['"]([^'"]+)['"]/.exec(block);

  if (bMatch && mMatch) {
    indianModels.push({
      id: idMatch ? idMatch[1] : '',
      brand: bMatch[1],
      model: mMatch[1],
      image: iMatch ? iMatch[1] : '',
    });
  }
}

console.log(`Parsed ${indianModels.length} models from indianPhonesCatalog.`);

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
indianModels.forEach(item => {
  const key = getDedupeKey(item.brand, item.model);
  if (seen.has(key)) {
    dupes.push({ first: seen.get(key), second: item });
  } else {
    seen.set(key, item);
  }
});

console.log(`\nDuplicates within ALL_INDIAN_PHONES_CATALOG: ${dupes.length}`);
dupes.slice(0, 30).forEach(d => {
  console.log(`  - [${d.first.brand}] "${d.first.model}" (${d.first.id}) <==> "${d.second.model}" (${d.second.id})`);
});
