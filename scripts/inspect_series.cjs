const fs = require('fs');
const content = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');

const brandNames = ['apple', 'samsung', 'oneplus', 'xiaomi', 'vivo', 'realme', 'google', 'motorola', 'nothing', 'oppo'];
for (const b of brandNames) {
  const match = content.match(new RegExp('\\b' + b + ':\\s*\\[([\\s\\S]*?)\\](?=,\\s*[a-z0-9_-]+:|\\s*\\};)'));
  if (match) {
    const names = [];
    const nameRe = /name:\s*['"]([^'"]+)['"]/g;
    let nm;
    while ((nm = nameRe.exec(match[1])) !== null) {
      names.push(nm[1]);
    }
    console.log(`${b} (${names.length} series):`, names);
  } else {
    console.log(`${b}: NOT DEFINED`);
  }
}
