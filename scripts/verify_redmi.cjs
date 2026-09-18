const fs = require('fs');
const content = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');
const idx = content.indexOf("id: 'redmi-note-11'");
console.log('Found id redmi-note-11 at:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 400));
}
