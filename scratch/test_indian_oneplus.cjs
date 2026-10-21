const fs = require('fs');
const content = fs.readFileSync('./src/data/indianPhonesCatalog.ts', 'utf8');

// find all brand: 'OnePlus' or brand: "OnePlus"
const regex = /{\s*brand:\s*['"]OnePlus['"],\s*model:\s*['"]([^'"]+)['"]/gi;
let match;
const indianModels = [];
while ((match = regex.exec(content)) !== null) {
  indianModels.push(match[1]);
}
console.log('Total OnePlus models in indianPhonesCatalog:', indianModels.length);
console.log(indianModels);
