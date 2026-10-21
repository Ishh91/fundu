const fs = require('fs');

const masterContent = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');

// Parse all items
const items = [];
const lines = masterContent.split('\n');
for (const line of lines) {
  const bMatch = line.match(/brand:\s*["']([^"']+)["']/);
  const mMatch = line.match(/model:\s*["']([^"']+)["']/);
  const imgMatch = line.match(/image:\s*["']([^"']+)["']/);
  if (bMatch && mMatch && imgMatch) {
    items.push({
      brand: bMatch[1],
      model: mMatch[1],
      image: imgMatch[1]
    });
  }
}

console.log('Total items in masterModelCatalog:', items.length);

// Count image domains
const domains = {};
items.forEach(it => {
  try {
    const u = new URL(it.image);
    domains[u.hostname] = (domains[u.hostname] || 0) + 1;
  } catch (e) {
    domains['invalid'] = (domains['invalid'] || 0) + 1;
  }
});
console.log('Image domains breakdown:');
console.log(domains);
