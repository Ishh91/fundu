import fs from 'fs';

const linksData = JSON.parse(fs.readFileSync('./scripts/cashify_brand_model_links.json', 'utf8'));

// Flatten all links
const allModelUrls = [];
for (const [brand, list] of Object.entries(linksData)) {
  for (const item of list) {
    allModelUrls.push({ brand, url: item.url, name: item.name });
  }
}

console.log(`Loaded ${allModelUrls.length} model links from brand links JSON.`);

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
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

function parseModelDetails(html, url, defaultBrand) {
  if (!html) return { items: [], siblings: [] };
  const nextFPushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  const fullPayload = nextFPushes.map(m => m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')).join('\n');

  const items = [];

  // Match detail with productName and getUpTo
  const detailMatch = fullPayload.match(/"productName":"([^"]+)"[^{}]*?"getUpTo":\s*(\d+)/);
  if (detailMatch) {
    const rawName = detailMatch[1];
    const getUpTo = Number(detailMatch[2]);
    if (getUpTo > 0) {
      // Parse RAM and Storage from rawName, e.g. "Apple iPhone 14 (6 GB/128 GB)"
      let ram = '';
      let storage = '';
      let cleanModel = rawName;

      const specMatch = rawName.match(/\(([^)]+)\)/);
      if (specMatch) {
        const specStr = specMatch[1]; // "6 GB/128 GB" or "128 GB" or "4 GB RAM"
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

      // Check specs object in fullPayload
      const storageSpecMatch = fullPayload.match(/"storage":\[\{"id":\d+,"val":"[^"]*","dval":"([^"]+)"\}\]/);
      if (storageSpecMatch && !storage) {
        storage = storageSpecMatch[1];
      }
      const ramSpecMatch = fullPayload.match(/"ram":\[\{"id":\d+,"val":"[^"]*","dval":"([^"]+)"\}\]/);
      if (ramSpecMatch && !ram) {
        ram = ramSpecMatch[1];
      }

      // Clean brand from model name if repeated
      let brand = defaultBrand;
      const brandMatch = fullPayload.match(/"brandName":"([^"]+)"/);
      if (brandMatch) brand = brandMatch[1];

      items.push({
        fullName: rawName,
        brand: brand,
        cleanModel: cleanModel,
        ram: ram,
        storage: storage,
        cashifyPrice: getUpTo,
        funduPrice: getUpTo + 1000,
        url: url,
      });
    }
  }

  // Find all sibling variant URLs on the page
  const variantHrefs = [...html.matchAll(/href="(\/sell-old-mobile-phone\/used-[^"]+)"/g)].map(m => m[1]);
  const urlBase = url.replace(/\/$/, '').split('/').pop();
  const basePrefix = urlBase.split('-').slice(0, 4).join('-');
  const siblings = Array.from(new Set(variantHrefs)).filter(h => h !== url && h.includes(basePrefix));

  return { items, siblings };
}

async function runScraper() {
  const visited = new Set();
  const queue = [...allModelUrls];
  const results = [];
  const CONCURRENCY = 8;

  console.log(`Starting Cashify Catalog Scraper with concurrency ${CONCURRENCY}...`);

  let processedCount = 0;

  async function worker() {
    while (queue.length > 0) {
      const target = queue.shift();
      if (!target || visited.has(target.url)) continue;
      visited.add(target.url);

      const html = await fetchPage(`https://www.cashify.in${target.url}`);
      processedCount++;

      if (html) {
        const { items, siblings } = parseModelDetails(html, target.url, target.brand);
        if (items.length > 0) {
          results.push(...items);
          console.log(`[${results.length}] ${items[0].fullName} -> Cashify: ₹${items[0].cashifyPrice} | Fundu (+1000): ₹${items[0].funduPrice}`);
        }

        // Add newly discovered sibling variants to the queue
        for (const sib of siblings) {
          if (!visited.has(sib)) {
            queue.push({ brand: target.brand, url: sib, name: '' });
          }
        }
      }

      if (processedCount % 50 === 0) {
        console.log(`Progress: Processed ${processedCount} URLs | Total Price Records Found: ${results.length} | Queue: ${queue.length}`);
        // Save intermediate results
        fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(results, null, 2));
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`Scraping complete! Total price records collected: ${results.length}`);
  fs.writeFileSync('./scripts/cashify_scraped_prices.json', JSON.stringify(results, null, 2));
}

runScraper();
