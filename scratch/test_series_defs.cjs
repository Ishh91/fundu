const fs = require('fs');

// Let's inspect inferModelSeries and groupModelsBySeries in brandSeriesCatalog.ts
const code = fs.readFileSync('./src/data/brandSeriesCatalog.ts', 'utf8');

// Let's extract the oneplus definition
const oneplusDefMatch = code.match(/oneplus:\s*\[([\s\S]*?)\],\s*xiaomi:/);
if (oneplusDefMatch) {
  console.log('Found oneplus defs in brandSeriesCatalog.ts');
}

// Let's check what series definitions exist for OnePlus:
const defNameRegex = /name:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = defNameRegex.exec(oneplusDefMatch[1])) !== null) {
  console.log('Series def:', m[1]);
}
