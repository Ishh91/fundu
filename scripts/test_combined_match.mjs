import fs from 'fs';
import { ALL_INDIAN_PHONES_CATALOG } from '../src/data/indianPhonesCatalog.ts';
import { MOBILE_API_THUMBS } from '../src/data/deviceImageDictionary.ts';

const combined = { ...MOBILE_API_THUMBS };

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

for (const p of ALL_INDIAN_PHONES_CATALOG) {
  if (p.image_url && !p.image_url.includes('unsplash') && !p.image_url.includes('777/thumb')) {
    const full = normalize(`${p.brand} ${p.model}`);
    const mod = normalize(p.model);
    combined[full] = p.image_url;
    combined[mod] = p.image_url;
  }
}

const sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');
const lines = sellPhoneContent.split('\n');

const catalog = [];
for (const line of lines) {
  const m = line.match(/brand:\s*"([^"]+)",\s*series:\s*"([^"]+)",\s*model:\s*"([^"]+)"/);
  if (m) {
    catalog.push({ brand: m[1], series: m[2], model: m[3] });
  }
}

let matched = 0;
let missing = [];

const sortedKeys = Object.keys(combined).sort((a, b) => b.length - a.length);

for (const item of catalog) {
  const full = normalize(`${item.brand} ${item.model}`);
  const mod = normalize(item.model);

  if (combined[full] || combined[mod]) {
    matched++;
  } else {
    // Try smart keyword match
    const found = sortedKeys.find(k => (k.length >= 4 && (full === k || full.includes(k) || mod.includes(k))));
    if (found) {
      matched++;
    } else {
      missing.push(`${item.brand} | ${item.model}`);
    }
  }
}

console.log(`Matched: ${matched} / ${catalog.length} (${((matched/catalog.length)*100).toFixed(1)}%)`);
console.log(`Missing count: ${missing.length}`);
if (missing.length > 0) {
  console.log('Sample missing:', missing.slice(0, 20));
}
