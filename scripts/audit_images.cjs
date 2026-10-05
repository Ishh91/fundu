const fs = require('fs');

function auditCatalog() {
  console.log('=== COMPREHENSIVE PHONE IMAGE AUDIT ===\n');

  // Check indianPhonesCatalog.ts
  const indianContent = fs.readFileSync('src/data/indianPhonesCatalog.ts', 'utf8');
  const models = [];
  const r = /\{[\s\r\n]*id:\s*'([^']+)',[\s\S]*?brand:\s*'([^']+)',[\s\S]*?model:\s*'([^']+)',[\s\S]*?image_url:\s*'([^']+)'/g;
  let m;
  while ((m = r.exec(indianContent)) !== null) {
    models.push({ id: m[1], brand: m[2], model: m[3], image_url: m[4] });
  }
  console.log('Total models in indianPhonesCatalog:', models.length);

  let unsplashCount = 0;
  let gsmarenaCount = 0;
  let mobileApiCount = 0;
  let otherCount = 0;
  const unsplashMap = {};

  models.forEach(item => {
    if (item.image_url.includes('unsplash.com')) {
      unsplashCount++;
      const key = item.image_url.split('?')[0];
      if (!unsplashMap[key]) unsplashMap[key] = [];
      unsplashMap[key].push(`${item.brand} ${item.model}`);
    } else if (item.image_url.includes('gsmarena.com')) {
      gsmarenaCount++;
    } else if (item.image_url.includes('mobileapi.dev')) {
      mobileApiCount++;
    } else {
      otherCount++;
    }
  });

  console.log('Image types:');
  console.log('  Unsplash (random lifestyle/stock photos!):', unsplashCount);
  console.log('  GSMArena:', gsmarenaCount);
  console.log('  MobileAPI:', mobileApiCount);
  console.log('  Other:', otherCount);

  console.log('\n--- 1. Models using Generic Unsplash Stock Photos (Total ' + unsplashCount + ') ---');
  for (const [url, list] of Object.entries(unsplashMap)) {
    console.log(`\nURL: ${url}`);
    console.log(`Count: ${list.length} phones`);
    console.log(`Examples: ${list.slice(0, 10).join(', ')}${list.length > 10 ? ' ... and more' : ''}`);
  }

  // Check brandSeriesCatalog.ts
  const brandSeriesContent = fs.readFileSync('src/data/brandSeriesCatalog.ts', 'utf8');
  const bModelRegex = /brand:\s*'([^']+)',\s*series:\s*'([^']+)',\s*model:\s*'([^']+)',\s*storage:\s*'([^']+)',\s*price:\s*(\d+),\s*image:\s*'([^']+)'/g;
  let bm;
  const seriesMismatches = [];
  while ((bm = bModelRegex.exec(brandSeriesContent)) !== null) {
    const brand = bm[1];
    const series = bm[2];
    const model = bm[3];
    const image = bm[6];
    const filename = image.split('/').pop().toLowerCase();
    
    // Check if filename doesn't match the model
    const mLower = model.toLowerCase();
    
    // Specific well-known checks
    if (mLower.includes('iphone 17') && filename.includes('iphone-16')) {
      seriesMismatches.push({ brand, model, issue: `iPhone 17 model using iPhone 16 image (${filename})` });
    } else if (mLower.includes('iphone 12 pro') && !filename.includes('pro')) {
      seriesMismatches.push({ brand, model, issue: `iPhone 12 Pro using base iPhone 12 image (${filename})` });
    } else if (mLower.includes('iphone 11 pro') && !filename.includes('pro')) {
      seriesMismatches.push({ brand, model, issue: `iPhone 11 Pro using base iPhone 11 image (${filename})` });
    } else if (mLower.includes('iphone xs') && filename.includes('apple-iphone-x.jpg')) {
      seriesMismatches.push({ brand, model, issue: `iPhone XS using iPhone X image (${filename})` });
    } else if (mLower.includes('iphone 3g') && filename.includes('3gs')) {
      seriesMismatches.push({ brand, model, issue: `iPhone 3G using iPhone 3GS image (${filename})` });
    } else if (mLower.includes('galaxy s25') && filename.includes('s24')) {
      seriesMismatches.push({ brand, model, issue: `Galaxy S25 using Galaxy S24 image (${filename})` });
    } else if (mLower.includes('oneplus 13') && filename.includes('oneplus-12')) {
      seriesMismatches.push({ brand, model, issue: `OnePlus 13 using OnePlus 12 image (${filename})` });
    }
  }

  console.log('\n--- 2. brandSeriesCatalog.ts Mismatched Models (Total ' + seriesMismatches.length + ') ---');
  seriesMismatches.forEach(m => console.log(`[${m.brand}] ${m.model} => ${m.issue}`));

  // Check phoneImages.ts
  const phoneImagesContent = fs.readFileSync('src/lib/phoneImages.ts', 'utf8');
  console.log('\n--- 3. phoneImages.ts Hardcoded Mappings with Discrepancies ---');
  const exactRenderMatches = [...phoneImagesContent.matchAll(/\{\s*keyword:\s*'([^']+)',\s*url:\s*'([^']+)'\s*\}/g)];
  for (const [_, kw, url] of exactRenderMatches) {
    const fn = url.split('/').pop();
    if (kw.includes('17') && fn.includes('16')) {
      console.log(`Keyword "${kw}" => ${fn} (iPhone 16 used for iPhone 17)`);
    } else if (kw.includes('s25') && fn.includes('s24')) {
      console.log(`Keyword "${kw}" => ${fn} (Galaxy S24 used for Galaxy S25)`);
    } else if (kw.includes('oneplus 9') && !kw.includes('pro') && fn.includes('pro')) {
      console.log(`Keyword "${kw}" => ${fn} (OnePlus 9 Pro used for base OnePlus 9)`);
    } else if (['camon', 'spark', 'pova', 'tecno', 'itel', 'infinix', 'poco', 'iqoo'].includes(kw)) {
      console.log(`Broad fallback keyword "${kw}" => ${fn} (Single device image forced for whole brand/line)`);
    }
  }
}

auditCatalog();
