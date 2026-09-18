const fs = require('fs');

const API_KEY = '796f49e7850dc08f17c66c42f687e00d46ec2ba0';
const BASE_URL = 'https://api.mobileapi.dev';

async function fetchAllBrandModels(searchQuery, maxPages = 5) {
  let allDevices = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const url = `${BASE_URL}/devices/search/?key=${API_KEY}&name=${encodeURIComponent(searchQuery)}&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Page ${page}] HTTP ${res.status} for ${searchQuery}`);
        break;
      }
      const data = await res.json();
      const devices = data.devices || [];
      if (devices.length === 0) break;
      allDevices.push(...devices);
      if (allDevices.length >= (data.total || 100)) break;
    } catch (err) {
      console.warn(`Err page ${page}:`, err.message);
      break;
    }
  }
  return allDevices;
}

async function run() {
  const brands = [
    { brand: 'Apple', q: 'iPhone', maxPages: 10 },
    { brand: 'Samsung', q: 'Samsung', maxPages: 10 },
    { brand: 'OnePlus', q: 'OnePlus', maxPages: 10 },
    { brand: 'Xiaomi', q: 'Xiaomi', maxPages: 10 },
    { brand: 'Xiaomi', q: 'Redmi', maxPages: 10 },
    { brand: 'Xiaomi', q: 'Poco', maxPages: 10 },
    { brand: 'Realme', q: 'Realme', maxPages: 10 },
    { brand: 'Oppo', q: 'Oppo', maxPages: 10 },
    { brand: 'Vivo', q: 'Vivo', maxPages: 10 },
    { brand: 'Vivo', q: 'iQOO', maxPages: 5 },
    { brand: 'Google', q: 'Pixel', maxPages: 10 },
    { brand: 'Motorola', q: 'Motorola', maxPages: 10 },
    { brand: 'Motorola', q: 'Moto', maxPages: 10 },
    { brand: 'Nothing', q: 'Nothing', maxPages: 5 },
  ];

  const results = {};
  for (const b of brands) {
    console.log(`Fetching from MobileAPI for: ${b.brand} (${b.q})...`);
    const list = await fetchAllBrandModels(b.q, b.maxPages);
    console.log(`-> Got ${list.length} devices for ${b.q}`);
    if (!results[b.brand]) results[b.brand] = [];
    results[b.brand].push(...list);
  }

  // Save raw results to scratch
  fs.writeFileSync('scripts/api_fetched_devices.json', JSON.stringify(results, null, 2));
  console.log('Saved api_fetched_devices.json successfully!');
}

run();
