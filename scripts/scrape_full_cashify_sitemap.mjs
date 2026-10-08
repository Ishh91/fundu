import fs from 'fs';

let existingData = [];
if (fs.existsSync('./scripts/cashify_scraped_prices.json')) {
  existingData = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));
}

const seenUrls = new Set(existingData.map(d => d.url.replace(/^https:\/\/www\.cashify\.in/, '')));
console.log(`Starting with ${existingData.length} previously scraped items.`);

function getRealBrand(name, url) {
  const n = (name || '').toLowerCase();
  const u = (url || '').toLowerCase();
  if (n.includes('iphone') || n.includes('ipad') || n.includes('apple') || u.includes('apple') || u.includes('iphone')) return 'Apple';
  if (n.includes('samsung') || n.includes('galaxy') || u.includes('samsung')) return 'Samsung';
  if (n.includes('oneplus') || u.includes('oneplus')) return 'OnePlus';
  if (n.includes('redmi') || n.includes('xiaomi') || n.includes('mi ') || u.includes('xiaomi') || u.includes('redmi') || u.includes('mi-')) return 'Xiaomi';
  if (n.includes('realme') || u.includes('realme')) return 'Realme';
  if (n.includes('vivo') || u.includes('vivo')) return 'Vivo';
  if (n.includes('oppo') || u.includes('oppo')) return 'Oppo';
  if (n.includes('pixel') || n.includes('google') || u.includes('google')) return 'Google';
  if (n.includes('moto') || u.includes('motorola')) return 'Motorola';
  if (n.includes('nothing') || n.includes('cmf') || u.includes('nothing')) return 'Nothing';
  if (n.includes('iqoo') || u.includes('iqoo')) return 'iQOO';
  if (n.includes('poco') || u.includes('poco')) return 'Poco';
  return 'Other';
}

async function fetchHtml(url) {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://www.cashify.in${url}`;
    const res = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

function parseVariantData(html, url) {
  if (!html) return null;
  const nextFPushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  const fullPayload = nextFPushes.map((m) => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');

  const match = fullPayload.match(/"productName":"([^"]+)".*?"getUpTo":\s*(\d+)/);
  if (!match) return null;

  const rawName = match[1];
  const getUpTo = Number(match[2]);
  if (getUpTo <= 0) return null;

  let ram = '';
  let storage = '';
  let cleanModel = rawName;

  const specMatch = rawName.match(/\(([^)]+)\)/);
  if (specMatch) {
    const specStr = specMatch[1];
    cleanModel = rawName.replace(/\([^)]+\)/, '').trim();

    if (specStr.includes('/')) {
      const parts = specStr.split('/');
      ram = parts[0].trim();
      storage = parts[1].trim();
    } else if (specStr.toLowerCase().includes('ram')) {
      ram = specStr.trim();
    } else {
      storage = specStr.trim();
    }
  }

  const storageSpecMatch = fullPayload.match(/"storage":\[\{"id":\d+,"val":"[^"]*","dval":"([^"]+)"\}\]/);
  if (storageSpecMatch && !storage) storage = storageSpecMatch[1];

  const ramSpecMatch = fullPayload.match(/"ram":\[\{"id":\d+,"val":"[^"]*","dval":"([^"]+)"\}\]/);
  if (ramSpecMatch && !ram) ram = ramSpecMatch[1];

  let brand = getRealBrand(rawName, url);
  const brandMatch = fullPayload.match(/"brandName":"([^"]+)"/);
  if (brandMatch && brandMatch[1]) {
    const b = brandMatch[1];
    if (b.toLowerCase() !== 'apple' || rawName.toLowerCase().includes('iphone') || rawName.toLowerCase().includes('apple')) {
      brand = b;
    }
  }

  const relativeUrl = url.replace(/^https:\/\/www\.cashify\.in/, '');

  return {
    fullName: rawName,
    brand,
    cleanModel,
    ram,
    storage,
    cashifyPrice: getUpTo,
    funduPrice: getUpTo + 1000,
    url: relativeUrl,
  };
}

async function run() {
  console.log('Fetching sitemaps...');
  let allUrls = [];
  for (const xmlUrl of [
    'https://smp.cashify.in/uzi1/cashify/buyback/product-0.xml',
    'https://smp.cashify.in/uzi1/cashify/buyback/product-1.xml',
    'https://smp.cashify.in/uzi1/cashify/buyback/product-2.xml'
  ]) {
    const res = await fetch(xmlUrl);
    const text = await res.text();
    const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const phoneLocs = locs.filter(l => l.includes('/sell-old-mobile-phone/used-'));
    allUrls.push(...phoneLocs);
  }
  allUrls = [...new Set(allUrls)];
  const variantUrls = allUrls.filter(u => /-\d+-(?:gb|tb)$/i.test(u));

  const brands = ['apple', 'samsung', 'oneplus', 'xiaomi', 'redmi', 'mi-', 'vivo', 'oppo', 'realme', 'google', 'pixel', 'motorola', 'moto-', 'nothing', 'cmf', 'iqoo', 'poco'];
  const targetUrls = variantUrls.filter(u => {
    const low = u.toLowerCase();
    return brands.some(b => low.includes(b));
  });

  const pendingUrls = targetUrls.filter(u => {
    const rel = u.replace(/^https:\/\/www\.cashify\.in/, '');
    return !seenUrls.has(rel);
  });

  console.log(`Total target variant URLs: ${targetUrls.length}`);
  console.log(`Pending variant URLs to scrape: ${pendingUrls.length}`);

  const CONCURRENCY = 16;
  let activeIndex = 0;
  let countSuccess = 0;

  async function worker() {
    while (activeIndex < pendingUrls.length) {
      const idx = activeIndex++;
      const url = pendingUrls[idx];
      if (!url) break;

      const html = await fetchHtml(url);
      if (html) {
        const record = parseVariantData(html, url);
        if (record) {
          existingData.push(record);
          seenUrls.add(record.url);
          countSuccess++;
          if (countSuccess % 25 === 0 || countSuccess === pendingUrls.length) {
            console.log(`[${countSuccess}/${pendingUrls.length}] Fetched: ${record.fullName} -> Cashify: ₹${record.cashifyPrice} | Fundu: ₹${record.funduPrice}`);
            fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(existingData, null, 2));
          }
        }
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(existingData, null, 2));
  console.log(`\n🎉 Scraping complete! Total items now: ${existingData.length}`);
}

run();
