import fs from 'fs';

const tasks = JSON.parse(fs.readFileSync('./scripts/resolved_variant_urls.json', 'utf8'));

let finalResults = [];
if (fs.existsSync('./scripts/cashify_scraped_prices.json')) {
  finalResults = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));
}

const seenUrls = new Set(finalResults.map(r => r.url));
console.log(`Starting scraper with ${finalResults.length} existing items.`);
console.log(`Tasks to check: ${tasks.length}`);

const pendingTasks = tasks.filter(t => !seenUrls.has(t.url));
console.log(`Pending variant URLs to fetch: ${pendingTasks.length}`);

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

function parseVariantData(html, url, defaultBrand, fallbackName) {
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

async function run() {
  const CONCURRENCY = 14;
  let activeIndex = 0;
  let countSuccess = 0;

  async function worker() {
    while (activeIndex < pendingTasks.length) {
      const idx = activeIndex++;
      const item = pendingTasks[idx];
      if (!item) break;

      const html = await fetchHtml(item.url);
      if (html) {
        const record = parseVariantData(html, item.url, item.brand, item.name);
        if (record) {
          finalResults.push(record);
          seenUrls.add(item.url);
          countSuccess++;
          if (countSuccess % 15 === 0 || countSuccess === pendingTasks.length) {
            console.log(`[${countSuccess}/${pendingTasks.length}] Fetched: ${record.fullName} -> Cashify: ₹${record.cashifyPrice} | Fundu: ₹${record.funduPrice}`);
            fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(finalResults, null, 2));
          }
        }
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(finalResults, null, 2));
  console.log(`Finished scraping! Total final records: ${finalResults.length}`);
}

run();
