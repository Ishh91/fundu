/**
 * Lightweight model sorting, recency scoring, and deduplication utilities.
 * Completely decoupled from brandSeriesCatalog to keep the initial page bundle minimal.
 */

export function getModelDedupeKey(brand: string, model: string): string {
  let clean = (model || '').toLowerCase().trim();
  const bClean = (brand || '').toLowerCase().trim();
  if (bClean && clean.startsWith(bClean)) {
    clean = clean.slice(bClean.length).trim();
  }
  // Normalize special editions & redundant suffixes
  clean = clean.replace(/\b(marble\s*edition|150w|edition)\b/gi, '');

  // Normalize Fold / Flip 5G redundancy
  clean = clean.replace(/\b(fold|flip)\s*([0-9]+)\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(fold|flip)([0-9]+)5g\b/gi, '$1 $2');

  // Normalize 5G flagship naming redundancy (S20-S26, Note 20, OnePlus flagships, Pixels, etc.)
  clean = clean.replace(/\b(s2[0-9]|note\s*20|fold\s*[0-9]+|flip\s*[0-9]+|z\s*fold\s*[0-9]*|z\s*flip\s*[0-9]*)\s*(ultra|plus|\+|fe)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(oneplus\s*(?:8|9|10|11|12|13|14|15|open))\s*(pro|r|t)?\s*5g\b/gi, '$1 $2');
  clean = clean.replace(/\b(pixel\s*(?:[5-9]|1[0-9]))\s*(pro|a|xl)?\s*5g\b/gi, '$1 $2');

  // Strip generic trailing 5g/4g suffix for deduplication so identical models match
  clean = clean.replace(/\s+(?:5g|4g)$/i, '');

  // Normalize Nord CE spacing
  clean = clean.replace(/nord\s*ce\s*/gi, 'nordce');

  return clean
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates a deterministic chronological recency score for any phone or device model.
 * Higher score = Newer model (e.g. iPhone 18 Pro Max > iPhone 17 Pro > iPhone 16 > iPhone 5s > iPhone 4).
 */
export function getDeviceRecencyScore(
  brand: string,
  modelName: string,
  releaseYear?: number,
  price?: number
): number {
  const bLower = (brand || '').toLowerCase().trim();
  const mLower = (modelName || '').toLowerCase().trim();

  // 1. Tablet / iPad penalty so tablets sort below phones
  const isTablet = /\b(ipad|tablet|tab\s*[a-z0-9]|pad)\b/i.test(mLower);

  // 2. Apple / iPhone
  if (bLower === 'apple' || bLower === 'iphone') {
    if (isTablet) {
      let tabletScore = 400000;
      if (/\b(m4|2024)\b/i.test(mLower)) tabletScore += 50000;
      else if (/\b(m2|2023|2022)\b/i.test(mLower)) tabletScore += 40000;
      else if (/\b(2021|2020)\b/i.test(mLower)) tabletScore += 30000;
      else if (/\b(2019|2018)\b/i.test(mLower)) tabletScore += 20000;
      if (/\bpro\b/i.test(mLower)) tabletScore += 5000;
      if (/\bair\b/i.test(mLower)) tabletScore += 3000;
      return tabletScore + (price ? Math.min(2000, price / 50) : 0);
    }

    let score = 1000000;
    // Check generation
    if (/\b18\b/i.test(mLower)) score += 180000;
    else if (/\b(17|17e|air)\b/i.test(mLower)) score += 170000;
    else if (/\b(16|16e)\b/i.test(mLower)) score += 160000;
    else if (/\b15\b/i.test(mLower)) score += 150000;
    else if (/\b14\b/i.test(mLower)) score += 140000;
    else if (/\b13\b/i.test(mLower)) score += 130000;
    else if (/\b12\b/i.test(mLower)) score += 120000;
    else if (/\b11\b/i.test(mLower)) score += 110000;
    else if (/\b(xs|xr|x\b)/i.test(mLower)) score += 100000;
    else if (/\b8\b/i.test(mLower)) score += 80000;
    else if (/\b7\b/i.test(mLower)) score += 70000;
    else if (/\b6s\b/i.test(mLower)) score += 65000;
    else if (/\b6\b/i.test(mLower)) score += 60000;
    else if (/\bse\b/i.test(mLower)) {
      if (/3rd|2022/i.test(mLower)) score += 135000;
      else if (/2nd|2020/i.test(mLower)) score += 115000;
      else score += 65000;
    } else if (/\b5s\b/i.test(mLower)) score += 55000;
    else if (/\b5c\b/i.test(mLower)) score += 52000;
    else if (/\b5\b/i.test(mLower)) score += 50000;
    else if (/\b4s\b/i.test(mLower)) score += 45000;
    else if (/\b4\b/i.test(mLower)) score += 40000;
    else if (/\b3gs\b/i.test(mLower)) score += 35000;
    else if (/\b3g\b/i.test(mLower)) score += 30000;
    else if (/\b(original|iphone\s*1\b|\biphone\b$)/i.test(mLower)) score += 10000;
    else score += 160000;

    // Sub-tier ordering
    if (/pro\s*max/i.test(mLower)) score += 900;
    else if (/\bpro\b/i.test(mLower)) score += 800;
    else if (/\bplus\b/i.test(mLower)) score += 700;
    else if (/\bair\b/i.test(mLower)) score += 650;
    else if (/\bmini\b/i.test(mLower)) score += 450;
    else if (/\b(16e|17e|e\b)/i.test(mLower)) score += 350;
    else score += 500;

    return score + (price ? Math.min(100, price / 1000) : 0);
  }

  // 3. Samsung
  if (bLower === 'samsung') {
    let score = 1000000;
    if (/\bs26\b/i.test(mLower)) score += 260000;
    else if (/\bfold\s*7|flip\s*7/i.test(mLower)) score += 255000;
    else if (/\bs25\b/i.test(mLower)) score += 250000;
    else if (/\bfold\s*6|flip\s*6/i.test(mLower)) score += 245000;
    else if (/\bs24\b/i.test(mLower)) score += 240000;
    else if (/\bfold\s*5|flip\s*5/i.test(mLower)) score += 235000;
    else if (/\bs23\b/i.test(mLower)) score += 230000;
    else if (/\bfold\s*4|flip\s*4/i.test(mLower)) score += 225000;
    else if (/\bs22\b/i.test(mLower)) score += 220000;
    else if (/\bfold\s*3|flip\s*3/i.test(mLower)) score += 215000;
    else if (/\bs21\b/i.test(mLower)) score += 210000;
    else if (/\bfold\s*2|flip\s*2/i.test(mLower)) score += 205000;
    else if (/\bs20\b/i.test(mLower)) score += 200000;
    else if (/\bfold|flip/i.test(mLower)) score += 195000;
    else if (/\bs10\b/i.test(mLower)) score += 100000;
    else if (/\bs9\b/i.test(mLower)) score += 90000;
    else if (/\bs8\b/i.test(mLower)) score += 80000;
    else if (/\bnote\s*20\b/i.test(mLower)) score += 200000;
    else if (/\bnote\s*10\b/i.test(mLower)) score += 100000;
    else if (/\bnote\s*9\b/i.test(mLower)) score += 90000;
    else if (/\bnote\s*8\b/i.test(mLower)) score += 80000;
    else if (/\ba\d+/i.test(mLower)) {
      const aNum = parseInt(mLower.match(/a(\d+)/i)?.[1] || '0', 10);
      const gen = aNum % 10;
      const tier = Math.floor(aNum / 10);
      score += 150000 + gen * 10000 + tier * 1000;
    } else if (/\b(m|f)\d+/i.test(mLower)) {
      const mfNum = parseInt(mLower.match(/[mf](\d+)/i)?.[1] || '0', 10);
      const gen = mfNum % 10;
      const tier = Math.floor(mfNum / 10);
      score += 140000 + gen * 10000 + tier * 1000;
    } else if (/\bj\d+/i.test(mLower)) {
      const jNum = parseInt(mLower.match(/j(\d+)/i)?.[1] || '0', 10);
      score += 50000 + jNum * 5000;
    } else {
      score += 100000;
    }

    if (/ultra/i.test(mLower)) score += 900;
    else if (/plus|\+/i.test(mLower)) score += 750;
    else if (/pro/i.test(mLower)) score += 700;
    else if (/fe/i.test(mLower)) score += 500;
    else if (/5g/i.test(mLower)) score += 450;
    else score += 400;

    return score + (price ? Math.min(100, price / 1000) : 0);
  }

  // 4. Google Pixel
  if (bLower === 'google' || bLower === 'pixel') {
    let score = 1000000;
    if (/\b10\b/i.test(mLower)) score += 100000;
    else if (/\b9\b/i.test(mLower)) score += 90000;
    else if (/\b8\b/i.test(mLower)) score += 80000;
    else if (/\b7\b/i.test(mLower)) score += 70000;
    else if (/\b6\b/i.test(mLower)) score += 60000;
    else if (/\b5\b/i.test(mLower)) score += 50000;
    else if (/\b4\b/i.test(mLower)) score += 40000;
    else if (/\b3\b/i.test(mLower)) score += 30000;
    else score += 20000;

    if (/pro\s*fold/i.test(mLower)) score += 950;
    else if (/fold/i.test(mLower)) score += 900;
    else if (/pro\s*xl/i.test(mLower)) score += 850;
    else if (/pro/i.test(mLower)) score += 800;
    else if (/\ba\b/i.test(mLower)) score += 200;
    else score += 400;

    return score + (price ? Math.min(100, price / 1000) : 0);
  }

  // 5. OnePlus
  if (bLower === 'oneplus') {
    let score = 1000000;
    if (/\b13\b/i.test(mLower)) score += 130000;
    else if (/\b12\b/i.test(mLower)) score += 120000;
    else if (/\b11\b/i.test(mLower)) score += 110000;
    else if (/\b10\b/i.test(mLower)) score += 100000;
    else if (/\b9\b/i.test(mLower)) score += 90000;
    else if (/\b8\b/i.test(mLower)) score += 80000;
    else if (/\b7\b/i.test(mLower)) score += 70000;
    else if (/\b6\b/i.test(mLower)) score += 60000;
    else if (/\b5\b/i.test(mLower)) score += 50000;
    else if (/open/i.test(mLower)) score += 125000;
    else if (/nord\s*4|ce\s*4/i.test(mLower)) score += 110000;
    else if (/nord\s*3|ce\s*3/i.test(mLower)) score += 90000;
    else if (/nord\s*2|ce\s*2/i.test(mLower)) score += 70000;
    else if (/nord/i.test(mLower)) score += 60000;
    else score += 50000;

    if (/pro/i.test(mLower)) score += 800;
    else if (/r\b/i.test(mLower)) score += 650;
    else if (/t\b/i.test(mLower)) score += 500;
    else score += 400;

    return score + (price ? Math.min(100, price / 1000) : 0);
  }

  // Universal Fallback for Xiaomi, Vivo, Realme, Motorola, etc.
  let genScore = 1000000;
  if (releaseYear && releaseYear >= 2000) {
    genScore += (releaseYear - 2000) * 10000;
  } else {
    // Extract numbers in model name
    const matches = mLower.match(/\b(\d{1,3})\b/g);
    if (matches && matches.length > 0) {
      const topNum = Math.max(...matches.map((n) => parseInt(n, 10)).filter((n) => n < 300));
      if (topNum > 0) {
        genScore += Math.min(250000, topNum * 1000);
      }
    }
  }

  if (/ultra/i.test(mLower)) genScore += 900;
  else if (/pro\s*max/i.test(mLower)) genScore += 900;
  else if (/pro\s*\+/i.test(mLower)) genScore += 850;
  else if (/pro/i.test(mLower)) genScore += 800;
  else if (/plus|\+/i.test(mLower)) genScore += 700;
  else if (/gt|turbo/i.test(mLower)) genScore += 600;
  else if (/5g/i.test(mLower)) genScore += 450;
  else if (/lite|play|core|go/i.test(mLower)) genScore += 100;
  else genScore += 350;

  return genScore + (price ? Math.min(100, price / 1000) : 0);
}

/**
 * Sorts any list of phone models chronologically from latest (top) to oldest (bottom).
 */
export function sortDeviceModelsLatestFirst<
  T extends { model?: string; name?: string; price?: number; release_year?: number; brand?: string; storage?: string }
>(brand: string, models: T[]): T[] {
  return [...models].sort((a, b) => {
    const nameA = a.model || a.name || '';
    const nameB = b.model || b.name || '';
    const brandA = a.brand || brand;
    const brandB = b.brand || brand;
    const scoreA = getDeviceRecencyScore(brandA, nameA, a.release_year, a.price);
    const scoreB = getDeviceRecencyScore(brandB, nameB, b.release_year, b.price);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    if (priceB !== priceA) {
      return priceB - priceA;
    }
    return nameA.localeCompare(nameB);
  });
}

