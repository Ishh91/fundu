import fs from 'fs';

const linksData = JSON.parse(fs.readFileSync('./scripts/cashify_brand_model_links.json', 'utf8'));

for (const [brand, list] of Object.entries(linksData)) {
  console.log(`${brand}: ${list.length} links`);
}
