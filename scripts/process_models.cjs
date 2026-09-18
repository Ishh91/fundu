const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

console.log('--- Summary of MobileAPI devices fetched ---');
for (const [brand, devices] of Object.entries(rawData)) {
  const phones = devices.filter(d => {
    const text = `${d.name} ${d.description || ''}`.toLowerCase();
    if (/\b(pad|watch|band|earbuds|buds|airpods|tv|tablet|pencil|keyboard)\b/i.test(text)) return false;
    return true;
  });
  console.log(`${brand}: ${phones.length} phones (out of ${devices.length} raw items)`);
  console.log(`   Sample names:`, phones.slice(0, 5).map(p => p.name).join(', '));
}

// Check indianPhonesCatalog.ts
const indianPhonesContent = fs.readFileSync('src/data/indianPhonesCatalog.ts', 'utf8');
const brandRegex = /brand:\s*['"]([^'"]+)['"]/g;
const indianCounts = {};
let m;
while ((m = brandRegex.exec(indianPhonesContent)) !== null) {
  indianCounts[m[1]] = (indianCounts[m[1]] || 0) + 1;
}
console.log('\n--- Counts in indianPhonesCatalog.ts ---');
console.log(indianCounts);

