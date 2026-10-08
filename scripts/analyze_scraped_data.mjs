import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));
console.log('Total records:', data.length);
const brandCounts = {};
for (const item of data) {
  brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
}
console.log('Brand breakdown:');
for (const [b, c] of Object.entries(brandCounts)) {
  console.log(`  - ${b}: ${c} models/variants`);
}

console.log('\nSample records:');
console.log('Apple:', data.find(d => d.brand === 'Apple'));
console.log('Samsung:', data.find(d => d.brand === 'Samsung'));
console.log('OnePlus:', data.find(d => d.brand === 'OnePlus'));
console.log('Xiaomi:', data.find(d => d.brand === 'Xiaomi'));
console.log('Vivo:', data.find(d => d.brand === 'Vivo'));
console.log('OPPO:', data.find(d => d.brand === 'OPPO'));
console.log('Realme:', data.find(d => d.brand === 'Realme'));
console.log('Google:', data.find(d => d.brand === 'Google'));
console.log('Motorola:', data.find(d => d.brand === 'Motorola'));
console.log('POCO:', data.find(d => d.brand === 'POCO'));
console.log('iQOO:', data.find(d => d.brand === 'iQOO'));
