import fs from 'fs';
import path from 'path';

import { MOBILE_API_THUMBS } from '../src/data/deviceImageDictionary.ts';
const thumbs = MOBILE_API_THUMBS;

const sellPhoneContent = fs.readFileSync('src/pages/SellPhone.tsx', 'utf8');
const lines = sellPhoneContent.split('\n');

const catalog = [];
for (const line of lines) {
  const m = line.match(/brand:\s*"([^"]+)",\s*series:\s*"([^"]+)",\s*model:\s*"([^"]+)"/);
  if (m) {
    catalog.push({ brand: m[1], series: m[2], model: m[3] });
  }
}

console.log('Catalog items count:', catalog.length);
console.log('Thumbs dictionary count:', Object.keys(thumbs).length);

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

let directMatch = 0;
let fuzzyMatch = 0;
let missing = [];

const thumbKeys = Object.keys(thumbs).sort((a, b) => b.length - a.length);

for (const item of catalog) {
  const full = normalize(`${item.brand} ${item.model}`);
  const mod = normalize(item.model);

  if (thumbs[full] || thumbs[mod]) {
    directMatch++;
  } else {
    // Try word matching
    const found = thumbKeys.find(k => k === full || k === mod || (k.length > 5 && (full.includes(k) || k.includes(mod))));
    if (found) {
      fuzzyMatch++;
    } else {
      missing.push(`${item.brand} | ${item.model}`);
    }
  }
}

console.log(`Direct matches: ${directMatch}`);
console.log(`Fuzzy matches: ${fuzzyMatch}`);
console.log(`Total matched: ${directMatch + fuzzyMatch} / ${catalog.length}`);
console.log(`Missing count: ${missing.length}`);
if (missing.length > 0) {
  console.log('Sample missing:', missing.slice(0, 15));
}
