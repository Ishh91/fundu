const fs = require('fs');
const path = require('path');
const https = require('https');

const content = fs.readFileSync(path.join(__dirname, '../src/data/masterModelCatalog.ts'), 'utf8');

const regex = /{\s*brand:\s*["']([^"']+)["'],\s*series:\s*["']([^"']+)["'],\s*model:\s*["']([^"']+)["'],\s*storage:\s*["']([^"']+)["'],\s*price:\s*(\d+),\s*image:\s*["']([^"']+)["']\s*}/g;
const models = [];
let m;
while ((m = regex.exec(content)) !== null) {
  models.push({
    brand: m[1],
    series: m[2],
    model: m[3],
    image: m[6],
  });
}

console.log(`Total models: ${models.length}`);

// Check unique images
const uniqueImages = [...new Set(models.map(m => m.image))];
console.log(`Unique image URLs: ${uniqueImages.length}`);

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.request(
        {
          method: 'HEAD',
          host: u.hostname,
          path: u.pathname + u.search,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 4000,
        },
        (res) => {
          resolve({ url, status: res.statusCode });
        }
      );
      req.on('error', () => resolve({ url, status: 500 }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 408 });
      });
      req.end();
    } catch (e) {
      resolve({ url, status: 0 });
    }
  });
}

async function run() {
  console.log('Sampling 100 image URLs...');
  const sample = uniqueImages.slice(0, 100);
  const results = await Promise.all(sample.map(checkUrl));
  const bad = results.filter(r => r.status !== 200);
  console.log(`Bad URLs in 100 sample: ${bad.length}`);
  bad.forEach(b => console.log(`  - Status ${b.status}: ${b.url}`));
}

run();
