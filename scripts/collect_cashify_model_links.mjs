import fs from 'fs';

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function collectAllBrandModelUrls() {
  const brandSlugs = [
    { brand: 'Apple', slug: 'sell-apple' },
    { brand: 'Samsung', slug: 'sell-samsung' },
    { brand: 'OnePlus', slug: 'sell-oneplus' },
    { brand: 'Xiaomi', slug: 'sell-xiaomi' },
    { brand: 'Vivo', slug: 'sell-vivo' },
    { brand: 'Oppo', slug: 'sell-oppo' },
    { brand: 'Realme', slug: 'sell-realme' },
    { brand: 'Google', slug: 'sell-google' },
    { brand: 'Motorola', slug: 'sell-motorola' },
    { brand: 'Nothing', slug: 'sell-nothing' },
    { brand: 'iQOO', slug: 'sell-iqoo' },
    { brand: 'Poco', slug: 'sell-poco' },
  ];

  const brandModelMap = {};

  for (const { brand, slug } of brandSlugs) {
    try {
      console.log(`Fetching brand page for ${brand} (${slug})...`);
      const text = await fetchPage(`https://www.cashify.in/sell-old-mobile-phone/${slug}`);
      const aRegex = /<a[^>]*href="(\/sell-old-mobile-phone\/used-[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      const modelLinks = [];
      let m;
      while ((m = aRegex.exec(text)) !== null) {
        const rawText = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        // Ignore generic popular phones from other brands
        if (
          brand !== 'Apple' && (rawText.toLowerCase().includes('iphone') || m[1].includes('iphone'))
        ) continue;
        if (
          brand !== 'Samsung' && (rawText.toLowerCase().includes('galaxy note 20') || m[1].includes('galaxy-note-20'))
        ) continue;
        if (
          brand !== 'OnePlus' && (rawText.toLowerCase().includes('oneplus 9 pro') || m[1].includes('oneplus-9-pro'))
        ) continue;
        if (
          brand !== 'Xiaomi' && (rawText.toLowerCase().includes('redmi note 4') || m[1].includes('redmi-note-4'))
        ) continue;

        modelLinks.push({ url: m[1], name: rawText, brand });
      }

      // Deduplicate by URL
      const unique = [];
      const seen = new Set();
      for (const item of modelLinks) {
        if (!seen.has(item.url)) {
          seen.add(item.url);
          unique.push(item);
        }
      }

      brandModelMap[brand] = unique;
      console.log(`Found ${unique.length} unique model links for ${brand}`);
    } catch (e) {
      console.error(`Error fetching ${brand}:`, e.message);
      brandModelMap[brand] = [];
    }
  }

  fs.writeFileSync('./scripts/cashify_brand_model_links.json', JSON.stringify(brandModelMap, null, 2));
  const total = Object.values(brandModelMap).reduce((acc, l) => acc + l.length, 0);
  console.log(`Total model links collected across all brands: ${total}`);
}

collectAllBrandModelUrls();
