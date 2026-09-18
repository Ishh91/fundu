const fs = require('fs');
let code = fs.readFileSync('scripts/generate_all_brand_catalogs.cjs', 'utf8');
const matches = code.match(/image:\s*'[^']+'\)/g);
console.log('Matches with trailing ):', matches);
code = code.replace(/(image:\s*'[^']+)'\)/g, "$1'");
fs.writeFileSync('scripts/generate_all_brand_catalogs.cjs', code, 'utf8');
console.log('Fixed trailing parentheses in image URLs!');
