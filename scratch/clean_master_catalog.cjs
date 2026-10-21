const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log(`Original content length: ${content.length}`);

// 1. Filter out unreleased/hallucinated devices
const hallucinatedPatterns = [
  /{\s*brand:\s*["']Apple["'],\s*series:[^}]+model:\s*["']Apple iPhone 1[78][^}]+},?\n?/g,
  /{\s*brand:\s*["']Google["'],\s*series:[^}]+model:\s*["']Google Pixel 1[01][^}]+},?\n?/g,
  /{\s*brand:\s*["']Google["'],\s*series:[^}]+model:\s*["']Google Pixel 9a[^}]+},?\n?/g,
  /{\s*brand:\s*["']iQOO["'],\s*series:[^}]+model:\s*["']iQOO 15[^}]+},?\n?/g,
  /{\s*brand:\s*["']iQOO["'],\s*series:[^}]+model:\s*["']iQOO Neo 10[^}]+},?\n?/g,
  /{\s*brand:\s*["']iQOO["'],\s*series:[^}]+model:\s*["']iQOO Z1[01][^}]+},?\n?/g,
  /{\s*brand:\s*["']Samsung["'],\s*series:[^}]+model:\s*["']Samsung Galaxy S2[67][^}]+},?\n?/g,
  /{\s*brand:\s*["']Samsung["'],\s*series:[^}]+model:\s*["']Samsung Galaxy Z Fold [78][^}]+},?\n?/g,
  /{\s*brand:\s*["']Samsung["'],\s*series:[^}]+model:\s*["']Samsung Galaxy Z Flip [78][^}]+},?\n?/g,
  /{\s*brand:\s*["']Realme["'],\s*series:[^}]+model:\s*["']Realme Narzo 80[^}]+},?\n?/g,
];

hallucinatedPatterns.forEach(pattern => {
  content = content.replace(pattern, '');
});

// 2. Fix Google Pixel image URLs
const pixelImageFixes = [
  { match: 'model: "Google Pixel 3a", storage: "64 GB", price: 5500, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 3a", storage: "64 GB", price: 5500, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a.jpg"' },
  { match: 'model: "Google Pixel 3a XL", storage: "64 GB", price: 6000, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 3a XL", storage: "64 GB", price: 6000, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-3a-xl.jpg"' },
  { match: 'model: "Google Pixel 4 XL", storage: "64 GB", price: 8000, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 4 XL", storage: "64 GB", price: 8000, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4-xl.jpg"' },
  { match: 'model: "Google Pixel 4a", storage: "128 GB", price: 5240, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 4a", storage: "128 GB", price: 5240, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-4a.jpg"' },
  { match: 'model: "Google Pixel 5", storage: "128 GB", price: 11000, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 5", storage: "128 GB", price: 11000, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-5-5g.jpg"' },
  { match: 'model: "Google Pixel 6", storage: "128 GB", price: 14000, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 6", storage: "128 GB", price: 14000, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6.jpg"' },
  { match: 'model: "Google Pixel 6a", storage: "128 GB", price: 11750, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 6a", storage: "128 GB", price: 11750, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6a.jpg"' },
  { match: 'model: "Google Pixel 7", storage: "128 GB", price: 16050, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 7", storage: "128 GB", price: 16050, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-.jpg"' },
  { match: 'model: "Google Pixel 7 Pro", storage: "128 GB", price: 19670, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro.jpg"', replacement: 'model: "Google Pixel 7 Pro", storage: "128 GB", price: 19670, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7-pro-.jpg"' },
  { match: 'model: "Google Pixel 7a", storage: "128 GB", price: 19210, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 7a", storage: "128 GB", price: 19210, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-7a.jpg"' },
  { match: 'model: "Google Pixel 8", storage: "128 GB", price: 26040, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 8", storage: "128 GB", price: 26040, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg"' },
  { match: 'model: "Google Pixel 8a", storage: "128 GB", price: 25350, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 8a", storage: "128 GB", price: 25350, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg"' },
  { match: 'model: "Google Pixel 9", storage: "128 GB", price: 38630, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 9", storage: "128 GB", price: 38630, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg"' },
  { match: 'model: "Google Pixel 9 Pro", storage: "128 GB", price: 50490, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel 9 Pro", storage: "128 GB", price: 50490, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-.jpg"' },
  { match: 'model: "Google Pixel Fold", storage: "256 GB", price: 55000, image: "https://api.mobileapi.dev/devices/777/thumb.png"', replacement: 'model: "Google Pixel Fold", storage: "256 GB", price: 55000, image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-fold.jpg"' },
];

pixelImageFixes.forEach(({ match, replacement }) => {
  content = content.replace(match, replacement);
});

// 3. Fix doubled iqoo-iqoo- in GSMArena image links
content = content.replace(/https:\/\/fdn2\.gsmarena\.com\/vv\/bigpic\/iqoo-iqoo-/g, 'https://fdn2.gsmarena.com/vv/bigpic/vivo-iqoo-');

// 4. Fix specific known iQOO images
content = content.replace(/vivo-iqoo-12\.jpg/g, 'vivo-iqoo12.jpg');
content = content.replace(/vivo-iqoo-11-5g\.jpg/g, 'vivo-iqoo-11.jpg');
content = content.replace(/vivo-iqoo-13-5g\.jpg/g, 'vivo-iqoo-13.jpg');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated masterModelCatalog.ts!');
