const fs = require('fs');

const indCode = fs.readFileSync('./src/data/indianPhonesCatalog.ts', 'utf8');
const lines = indCode.split('\n');

const opModels = [];
let curBrand = '';
let curModel = '';

for (const line of lines) {
  const bMatch = line.match(/brand:\s*['"]([^'"]+)['"]/);
  if (bMatch) curBrand = bMatch[1];
  const mMatch = line.match(/model:\s*['"]([^'"]+)['"]/);
  if (mMatch) {
    curModel = mMatch[1];
    if (curBrand.toLowerCase() === 'oneplus') {
      opModels.push(curModel);
    }
  }
}

console.log('OnePlus models in ALL_INDIAN_PHONES_CATALOG:');
console.log(opModels);
