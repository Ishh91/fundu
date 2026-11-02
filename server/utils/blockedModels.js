/**
 * Blocked / Removed phone models across the entire Fundu platform.
 * Ensures models requested for removal are NEVER returned via backend search,
 * autocomplete, fallbacks, or seeding.
 */

export const BLOCKED_PHONE_PATTERNS = [
  // Poco / Xiaomi (Requested removals)
  { brand: 'poco', pattern: /x3\s*gt/i, label: 'POCO X3 GT' },
  { brand: 'poco', pattern: /x4\s*gt/i, label: 'POCO X4 GT' },
  { brand: 'poco', pattern: /f3\s*gt/i, label: 'POCO F3 GT' },
  { brand: 'poco', pattern: /f4\s*gt/i, label: 'POCO F4 GT' },
  { brand: 'xiaomi', pattern: /poco\s*(x3\s*gt|x4\s*gt|f3\s*gt|f4\s*gt)/i, label: 'Xiaomi POCO GT' },

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

