/**
 * Blocked / Removed phone models across the entire Fundu platform.
 * Ensures models requested for removal are NEVER returned via backend search,
 * autocomplete, fallbacks, or seeding.
 */

export const BLOCKED_PHONE_PATTERNS = [
  // OnePlus (Requested removals)
  { brand: 'oneplus', pattern: /\b8\s*5g\s*uw\b/i, label: 'OnePlus 8 5G UW' },

  // Xiaomi / Redmi (Requested removals)
  { brand: 'xiaomi', pattern: /note\s*12t\s*pro/i, label: 'Redmi Note 12T Pro' },
  { brand: 'redmi', pattern: /note\s*12t\s*pro/i, label: 'Redmi Note 12T Pro' },
  { brand: 'xiaomi', pattern: /note\s*13r\s*pro/i, label: 'Redmi Note 13R Pro' },
  { brand: 'redmi', pattern: /note\s*13r\s*pro/i, label: 'Redmi Note 13R Pro' },
  { brand: 'xiaomi', pattern: /note\s*12r\s*pro/i, label: 'Redmi Note 12R Pro' },
  { brand: 'redmi', pattern: /note\s*12r\s*pro/i, label: 'Redmi Note 12R Pro' },
  { brand: 'xiaomi', pattern: /note\s*11e\b/i, label: 'Redmi Note 11E' },
  { brand: 'redmi', pattern: /note\s*11e\b/i, label: 'Redmi Note 11E' },
  { brand: 'xiaomi', pattern: /note\s*11s\b/i, label: 'Redmi Note 11S' },
  { brand: 'redmi', pattern: /note\s*11s\b/i, label: 'Redmi Note 11S' },
  { brand: 'xiaomi', pattern: /(?:note\s*10t\s*pro|mi\s*10t\s*pro|10t\s*pro)/i, label: 'Redmi Note 10T Pro / Mi 10T Pro' },
  { brand: 'redmi', pattern: /(?:note\s*10t\s*pro|mi\s*10t\s*pro|10t\s*pro)/i, label: 'Redmi Note 10T Pro / Mi 10T Pro' },
  { brand: 'xiaomi', pattern: /note\s*13r\b(?!\s*pro)/i, label: 'Redmi Note 13R' },
  { brand: 'redmi', pattern: /note\s*13r\b(?!\s*pro)/i, label: 'Redmi Note 13R' },
  { brand: 'xiaomi', pattern: /note\s*12s\b/i, label: 'Redmi Note 12S' },
  { brand: 'redmi', pattern: /note\s*12s\b/i, label: 'Redmi Note 12S' },
  { brand: 'xiaomi', pattern: /note\s*12r\b(?!\s*pro)/i, label: 'Redmi Note 12R' },
  { brand: 'redmi', pattern: /note\s*12r\b(?!\s*pro)/i, label: 'Redmi Note 12R' },
  { brand: 'xiaomi', pattern: /(?:^|\b)(?:xiaomi\s*|mi\s*)13(?:\s*5g|\s*4g)?(?!\s*(?:pro|ultra|t\b|t\s*pro|c\b|r\b|x\b|lite|s\b))(?:$|\b)/i, label: 'Xiaomi 13 base' },
  { brand: 'xiaomi', pattern: /\b13\s*lite\b/i, label: 'Xiaomi 13 Lite' },
  { brand: 'xiaomi', pattern: /\b12\s*lite\b/i, label: 'Xiaomi 12 Lite' },
  { brand: 'xiaomi', pattern: /\bcivi\s*3\b/i, label: 'Xiaomi Civi 3' },

  // Vivo (Requested removals)
  { brand: 'vivo', pattern: /\bnex\s*dual\s*display\b/i, label: 'Vivo NEX Dual Display Edition' },

  // Poco / Xiaomi (Requested removals)
  { brand: 'poco', pattern: /x3\s*gt/i, label: 'POCO X3 GT' },
  { brand: 'poco', pattern: /x4\s*gt/i, label: 'POCO X4 GT' },
  { brand: 'poco', pattern: /f3\s*gt/i, label: 'POCO F3 GT' },
  { brand: 'poco', pattern: /f4\s*gt/i, label: 'POCO F4 GT' },
  { brand: 'xiaomi', pattern: /poco\s*(x3\s*gt|x4\s*gt|f3\s*gt|f4\s*gt)/i, label: 'Xiaomi POCO GT' },
  { brand: 'xiaomi', pattern: /note\s*12\s*turbo/i, label: 'Redmi Note 12 Turbo' },
  { brand: 'redmi', pattern: /note\s*12\s*turbo/i, label: 'Redmi Note 12 Turbo' },
  { brand: 'xiaomi', pattern: /discovery\s*edition/i, label: 'Redmi Note 12 Discovery Edition' },
  { brand: 'redmi', pattern: /discovery\s*edition/i, label: 'Redmi Note 12 Discovery Edition' },
  { brand: 'xiaomi', pattern: /note\s*10\s*je\b/i, label: 'Redmi Note 10 JE' },
  { brand: 'redmi', pattern: /note\s*10\s*je\b/i, label: 'Redmi Note 10 JE' },

  // iQOO / Vivo (Requested removals)
  { brand: 'iqoo', pattern: /z9\s*turbo/i, label: 'iQOO Z9 Turbo' },
  { brand: 'vivo', pattern: /z9\s*turbo/i, label: 'Vivo iQOO Z9 Turbo' },

  // Oppo (Requested removals)
  { brand: 'oppo', pattern: /find\s*x7\s*ultra/i, label: 'Oppo Find X7 Ultra' },

  // Apple (Antique / Obsolete classic models and oversized iPads requested for removal)
  { brand: 'apple', pattern: /\b(?:apple\s*)?iphone\s*(?:(?:[1-5]|2g|3g|3gs)[sc]?|original)\b/i, label: 'iPhone 5s and older classic series' },
  { brand: 'apple', pattern: /\bipad\s*(?:pro\s*13|air\s*13|10\.9)\b/i, label: 'iPad Pro 13, iPad Air 13, iPad 10.9' },

  // Infinix (Requested removals)
  { brand: 'infinix', pattern: /hot\s*20i/i, label: 'Infinix Hot 20i' },
  { brand: 'infinix', pattern: /hot\s*20s|hot\s*20\s*s/i, label: 'Infinix Hot 20s' },
  { brand: 'infinix', pattern: /zero\s*30/i, label: 'Infinix zero 30' },
  { brand: 'infinix', pattern: /hot\s*40\s*pro/i, label: 'Infinix hot 40 pro' },
  { brand: 'infinix', pattern: /hot\s*50i/i, label: 'Infinix hot 50i' },
  { brand: 'infinix', pattern: /hot\s*12i/i, label: 'Infinix hot 12i' },

  // OnePlus
  { brand: 'oneplus', pattern: /ace\s*3v/i, label: 'OnePlus ace 3v' },
  { brand: 'oneplus', pattern: /ace\s*2v/i, label: 'OnePlus ace 2v' },
  { brand: 'oneplus', pattern: /nord\s*n30/i, label: 'OnePlus nord n30' },

  // Motorola
  { brand: 'motorola', pattern: /\b(?:moto\s*)?g\s*(?:0?[1-9]s?|10)\b|\bmoto\s*g\b(?!\s*(?:1[1-9]|[2-9]\d|\d{3}))/i, label: 'Motorola Moto G10 and below' },
  { brand: 'motorola', pattern: /razr\s*60/i, label: 'Motorola razr 60' },
  { brand: 'motorola', pattern: /razr\s*50\s*ultra/i, label: 'Motorola razr 50 ultra' },
  { brand: 'motorola', pattern: /razr\s*40\s*ultra/i, label: 'Motorola razr 40 ultra' },
  { brand: 'motorola', pattern: /razr\s*40(?!\s*ultra)/i, label: 'Motorola razr 40' },
  { brand: 'motorola', pattern: /edge\s*50\s*fusion/i, label: 'Motorola edge 50 fusion' },
  { brand: 'motorola', pattern: /edge\s*40\s*pro/i, label: 'Motorola edge 40 pro' },
  { brand: 'motorola', pattern: /edge\s*40\s*neo/i, label: 'Motorola edge 40 neo' },
  { brand: 'motorola', pattern: /edge\s*40(?!\s*pro|\s*neo)/i, label: 'Motorola edge 40' },
  { brand: 'motorola', pattern: /edge\s*30\s*ultra/i, label: 'Motorola edge 30 ultra' },
  { brand: 'motorola', pattern: /edge\s*30\s*fusion/i, label: 'Motorola edge 30 fusion' },
  { brand: 'motorola', pattern: /edge\s*30(?!\s*ultra|\s*fusion|\s*pro|\s*neo|\s*lite)/i, label: 'Motorola edge 30' },
  { brand: 'motorola', pattern: /edge\s*s\s*30|edge\s*s30/i, label: 'Motorola edge s 30' },
  { brand: 'motorola', pattern: /backflip/i, label: 'Motorola backflip' },
  { brand: 'motorola', pattern: /droid\s*x2|drodix\s*x2/i, label: 'Motorola DRODIX X2' },
  { brand: 'motorola', pattern: /atrix\s*hd/i, label: 'Motorola Atrix HD' },
  { brand: 'motorola', pattern: /mc9500/i, label: 'Motorola MC9500-K' },
];

export function isBlockedPhone(brand, model) {
  if (!model) return false;
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();
  const isPocoXiaomi = b.includes('poco') || b.includes('xiaomi');
  for (const t of BLOCKED_PHONE_PATTERNS) {
    let brandMatches = !b;
    if (t.brand === 'poco' || t.brand === 'xiaomi') {
      brandMatches = isPocoXiaomi || m.includes('poco');
    } else if (t.brand === 'motorola') {
      brandMatches = b === 'moto' || b.includes('motorola');
    } else {
      brandMatches = !b || b.includes(t.brand);
    }
    if (brandMatches && t.pattern.test(m)) {
      return true;
    }
  }
  return false;
}

