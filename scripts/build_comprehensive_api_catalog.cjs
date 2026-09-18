const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

// Helper to look up an image from MobileDevAPI
function getApiThumb(brand, query, fallback) {
  const list = rawData[brand] || [];
  const q = query.toLowerCase().replace(/^(oneplus|xiaomi|redmi|poco|realme|oppo|vivo|google|motorola|moto|nothing)\s+/i, '').trim();
  for (const item of list) {
    const iname = item.name.toLowerCase();
    if (iname === q || (q.length > 2 && iname.includes(q)) || (iname.length > 2 && q.includes(iname))) {
      if (item.image_url) return item.image_url;
    }
  }
  return fallback;
}

// Check Note 11 models specifically
const xiaomiDevices = rawData.Xiaomi || [];
const note11s = xiaomiDevices.filter(d => d.name.toLowerCase().includes('11'));
console.log('Note 11 related in Xiaomi API data:', note11s.map(d => d.name));
