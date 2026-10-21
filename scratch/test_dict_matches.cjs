const fs = require('fs');

const dictCode = fs.readFileSync('./src/data/deviceImageDictionary.ts', 'utf8');

// Parse MOBILE_API_THUMBS
const regex = /"([^"]+)":\s*"([^"]+)"/g;
let m;
const thumbs = {};
while ((m = regex.exec(dictCode)) !== null) {
  thumbs[m[1].toLowerCase()] = m[2];
}

console.log('Total keys in MOBILE_API_THUMBS:', Object.keys(thumbs).length);

const testModels = [
  'oneplus 13', 'oneplus 13r', 'oneplus 12', 'oneplus 12r',
  'oneplus 11', 'oneplus 11r', 'oneplus 10 pro', 'oneplus 10t', 'oneplus 10r',
  'oneplus 9 pro', 'oneplus 9rt', 'oneplus 9', 'oneplus 9r',
  'oneplus 8 pro', 'oneplus 8t', 'oneplus 8',
  'oneplus 7t pro', 'oneplus 7t', 'oneplus 7 pro', 'oneplus 7',
  'oneplus 6t', 'oneplus 6', 'oneplus 5t', 'oneplus 5', 'oneplus 3t', 'oneplus 3',
  'oneplus nord 4', 'oneplus nord 3', 'oneplus nord 2t', 'oneplus nord 2',
  'oneplus nord ce4', 'oneplus nord ce4 lite', 'oneplus nord ce3', 'oneplus nord ce3 lite',
  'oneplus nord ce 2', 'oneplus nord ce 2 lite', 'oneplus nord ce', 'oneplus nord',
  'oneplus open'
];

console.log('\nChecking testModels in MOBILE_API_THUMBS:');
for (const tm of testModels) {
  const direct = thumbs[tm];
  const withOp = thumbs[`oneplus ${tm}`];
  const found = direct || withOp;
  console.log(`${tm}: ${found ? 'FOUND -> ' + found : 'NOT FOUND'}`);
}
