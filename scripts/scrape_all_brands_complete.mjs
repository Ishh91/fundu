import fs from 'fs';

const linksData = JSON.parse(fs.readFileSync('./scripts/cashify_brand_model_links.json', 'utf8'));

// Load existing scraped prices so we don't duplicate Apple or existing records
let existingData = [];
if (fs.existsSync('./scripts/cashify_scraped_prices.json')) {
  existingData = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));
}

const seenUrls = new Set(existingData.map((d) => d.url));
const finalResults = [...existingData];

console.log(`Starting with ${finalResults.length} previously scraped records.`);

async function fetchHtml(url) {
  try {
    const res = await fetch(`https://www.cashify.in${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

function parseVariantData(html, url, defaultBrand) {
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

  let brand = defaultBrand;
  const brandMatch = fullPayload.match(/"brandName":"([^"]+)"/);
  if (brandMatch) brand = brandMatch[1];

  return {
    fullName: rawName,
    brand,
    cleanModel,
    ram,
    storage,
    cashifyPrice: getUpTo,
    funduPrice: getUpTo + 1000,
    url,
  };
}

async function scrapeBrandModels() {
  const brandsToProcess = [
    'Samsung',
    'OnePlus',
    'Xiaomi',
    'Vivo',
    'Oppo',
    'Realme',
    'Google',
    'Motorola',
    'Nothing',
    'iQOO',
    'Poco',
  ];

  const CONCURRENCY = 6;

  for (const brand of brandsToProcess) {
    const brandLinks = linksData[brand] || [];
    console.log(`\n=================== Processing Brand: ${brand} (${brandLinks.length} root links) ===================`);

    // Queue of URLs to visit for this brand
    const brandQueue = [...brandLinks.map((l) => l.url)];
    const visited = new Set();

    async function worker() {
      while (brandQueue.length > 0) {
        const url = brandQueue.shift();
        if (!url || visited.has(url)) continue;
        visited.add(url);

        if (seenUrls.has(url)) continue;

        const html = await fetchHtml(url);
        if (!html) continue;

        const record = parseVariantData(html, url, brand);
        if (record) {
          seenUrls.add(url);
          finalResults.push(record);
          console.log(`[${brand}] ${record.fullName} -> Cashify: ₹${record.cashifyPrice} | Fundu: ₹${record.funduPrice}`);
        } else {
          // If no direct price, this is a parent landing page. Find sub-variants:
          const escapedBase = url.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const variantRegex = new RegExp(`href="(${escapedBase}-[0-9a-z-]+)"`, 'gi');
          const childVariants = Array.from(new Set([...html.matchAll(variantRegex)].map((m) => m[1])));

          for (const cv of childVariants) {
            if (!visited.has(cv) && !seenUrls.has(cv)) {
              brandQueue.push(cv);
            }
          }
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    // Save progress after each brand
    fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(finalResults, null, 2));
    console.log(`Saved progress. Total scraped records now: ${finalResults.length}`);
  }

  console.log(`\n🎉 ALL BRANDS COMPLETE! Final Total: ${finalResults.length} records in scripts/cashify_scraped_prices.json`);
}

scrapeBrandModels();
