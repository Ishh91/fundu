const fs = require('fs');

// Verify existing brandSeriesCatalog.ts
const originalCatalogPath = 'src/data/brandSeriesCatalog.ts';
const content = fs.readFileSync(originalCatalogPath, 'utf8');

console.log('Read brandSeriesCatalog.ts, total lines:', content.split('\n').length);
