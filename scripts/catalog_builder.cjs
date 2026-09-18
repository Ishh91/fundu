const fs = require('fs');

// Read API fetched devices
const apiData = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

// Helper to look up image from API dataset
function getApiThumb(brand, query) {
  const list = apiData[brand] || [];
  const q = query.toLowerCase().replace(/^(oneplus|xiaomi|redmi|poco|realme|oppo|vivo|google|motorola|moto|nothing)\s+/i, '').trim();
  for (const item of list) {
    const iname = item.name.toLowerCase();
    if (iname === q || (q.length > 2 && iname.includes(q)) || (iname.length > 2 && q.includes(iname))) {
      if (item.image_url) return item.image_url;
    }
  }
  return null;
}

console.log('Testing thumb lookups:');
console.log('OnePlus 12R:', getApiThumb('OnePlus', '12R'));
console.log('Google Pixel 8 Pro:', getApiThumb('Google', 'Pixel 8 Pro'));
console.log('Nothing Phone (2):', getApiThumb('Nothing', 'Phone (2)'));
console.log('Moto Edge 50:', getApiThumb('Motorola', 'Edge'));
