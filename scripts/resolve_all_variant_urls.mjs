import fs from 'fs';

const linksData = JSON.parse(fs.readFileSync('./scripts/cashify_brand_model_links.json', 'utf8'));

async function fetchHtml(url) {
  try {
    const res = await fetch(`https://www.cashify.in${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

async function run() {
  const brands = [
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
    'Poco'
  ];

  const allVariantTasks = []; // { brand, url, modelName }
  const seenVariantUrls = new Set();

  for (const brand of brands) {
    const modelLinks = linksData[brand] || [];
    console.log(`Resolving parent URLs for ${brand} (${modelLinks.length} models)...`);

    for (const item of modelLinks) {
      const url = item.url;
      // If it already ends with storage like -64-gb or -128-gb or -1-tb
      if (/-\d+-(?:gb|tb)$/i.test(url)) {
        if (!seenVariantUrls.has(url)) {
          seenVariantUrls.add(url);
          allVariantTasks.push({ brand, url, name: item.name });
        }
      } else {
        // Fetch parent to discover child variants
        const html = await fetchHtml(url);
        if (!html) continue;

        // Match all variant links on this page that belong to this phone
        // e.g. /sell-old-mobile-phone/used-[slug]...-\d+-(?:gb|tb)
        // Clean base slug: e.g. /sell-old-mobile-phone/used-samsung-galaxy-s24-ultra
        const baseSlug = url.split('/').pop().replace(/^used-/, '');
        // Variant link regex
        const vRegex = new RegExp(`/sell-old-mobile-phone/used-[a-z0-9-]*${baseSlug.slice(0, 15)}[a-z0-9-]*-\\d+-(?:gb|tb)`, 'gi');
        const matches = [...html.matchAll(vRegex)].map(m => m[0]);
        
        // Also look for child links inside quotes
        const generalRegex = /\/sell-old-mobile-phone\/used-[a-z0-9-]+-\d+-(?:gb|tb)/gi;
        const generalMatches = [...html.matchAll(generalRegex)].map(m => m[0]);

        const combined = [...new Set([...matches, ...generalMatches])];
        // Filter those that match brand or phone keywords
        const filtered = combined.filter(u => {
          const lower = u.toLowerCase();
          const brandLower = brand.toLowerCase();
          return lower.includes(brandLower) || lower.includes(baseSlug.slice(0, 10));
        });

        if (filtered.length > 0) {
          for (const vu of filtered) {
            if (!seenVariantUrls.has(vu)) {
              seenVariantUrls.add(vu);
              allVariantTasks.push({ brand, url: vu, name: item.name });
            }
          }
        } else {
          // If no variants found, keep the url itself as fallback
          if (!seenVariantUrls.has(url)) {
            seenVariantUrls.add(url);
            allVariantTasks.push({ brand, url, name: item.name });
          }
        }
      }
    }
  }

  console.log(`Total resolved variant URLs across all brands: ${allVariantTasks.length}`);
  fs.writeFileSync('./scripts/resolved_variant_urls.json', JSON.stringify(allVariantTasks, null, 2));
}

run();
