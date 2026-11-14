/**
 * Pure SEO metadata resolver: maps a pathname to its title, description,
 * canonical path and indexability. No DOM access, so it can be unit-tested
 * and reused by the sitemap generator.
 */

/** The host the site actually serves on (thefundu.com 308-redirects here). */
export const SITE_ORIGIN = 'https://www.thefundu.com';

const BRAND_SUFFIX = ' | Fundu';

export type SeoMeta = {
  title: string;
  description: string;
  /** Canonical path, always starting with "/" and without query or trailing slash. */
  canonicalPath: string;
  noindex: boolean;
};

type StaticPage = { title: string; description: string };

const STATIC_PAGES: Record<string, StaticPage> = {
  '/': {
    title: 'Sell Old Phone, Buy Refurbished & Doorstep Repair | Fundu',
    description:
      'Sell old smartphones for instant UPI/cash at your doorstep, buy certified refurbished iPhones & Galaxy phones with 6-month warranty, and book 30-minute doorstep repair.',
  },
  '/sell': {
    title: 'Sell Old Phone Online for Instant Cash | Fundu',
    description:
      'Get the best instant valuation for your old smartphone. Free doorstep pickup and on-the-spot cash or UPI payment from Fundu.',
  },
  '/buy': {
    title: 'Buy Certified Refurbished Phones with Warranty | Fundu',
    description:
      'Buy 42-point quality inspected refurbished iPhones, Samsung Galaxy and OnePlus phones with 6 months warranty and doorstep delivery.',
  },
  '/repair': {
    title: 'Doorstep Mobile Repair in 30 Minutes | Fundu',
    description:
      'Book certified mobile repair at your home or office. 30-minute screen and battery replacement with genuine parts and a 6-month repair warranty.',
  },
  '/spare-parts': {
    title: 'Genuine Mobile Spare Parts Online | Fundu',
    description:
      'OEM-specification replacement screens, batteries, camera modules and charging ports for iPhone, Samsung, OnePlus and Xiaomi phones.',
  },
  '/about': {
    title: 'About Fundu | Sell, Buy & Repair Phones at Your Doorstep',
    description:
      'Learn about Fundu, the trusted platform for selling old phones, buying audited refurbished mobiles and booking doorstep repairs.',
  },
  '/contact': {
    title: 'Contact Fundu | Customer Support & Doorstep Pickup',
    description:
      'Contact the Fundu customer support team, book a doorstep pickup or get help with an order, sale or repair booking.',
  },
  '/partner': {
    title: 'Partner with Fundu | B2B Mobile Wholesale Network',
    description:
      'Join the Fundu B2B wholesale partner program. Trade phone lots, manage your vendor account and source certified refurbished inventory.',
  },
  '/store': {
    title: 'Fundu Store | Refurbished Phones & Accessories',
    description: 'Visit the Fundu store for certified refurbished smartphones, accessories and doorstep services.',
  },
  '/brand': {
    title: 'Shop & Sell Phones by Brand | Fundu',
    description: 'Browse Apple, Samsung, OnePlus, Xiaomi, Vivo, Oppo and more brands to sell, buy or repair your phone with Fundu.',
  },
  '/recycle': {
    title: 'Recycle Your Old Phone Responsibly | Fundu',
    description: 'Recycle old and dead mobile phones responsibly with Fundu and get the best value for e-waste with free doorstep pickup.',
  },
  '/articles': {
    title: 'Phone Buying, Selling & Repair Guides | Fundu',
    description: 'Guides and tips from Fundu on selling your old phone, choosing a refurbished smartphone and taking care of your device.',
  },
  '/buy-laptops': {
    title: 'Buy Certified Refurbished Laptops | Fundu',
    description: 'Certified refurbished laptops with warranty and doorstep delivery from Fundu.',
  },
  '/login': {
    title: 'Sign In | Fundu',
    description: 'Sign in to your Fundu account to track orders, sell requests and repair bookings.',
  },
};

/** Alternate URLs that render the same page as another path. */
const STATIC_ALIASES: Record<string, string> = {
  '/sell-old-mobile-phone': '/sell',
  '/mobile-repair': '/repair',
  '/doorstep-mobile-repair': '/repair',
  '/festival': '/buy',
  '/buy-laptop': '/buy-laptops',
  '/register': '/login',
};

/** Private or transactional areas that should never appear in search results. */
const NOINDEX_PREFIXES = [
  '/admin',
  '/vendor',
  '/wholesaler',
  '/delivery',
  '/rider',
  '/fleet-desk',
  '/dashboard',
  '/profile',
  '/cart',
  '/checkout',
  '/payment',
  '/order-success',
  '/login',
  '/search',
  '/demo-condition-filter',
];

const WORD_CASING: Record<string, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  oneplus: 'OnePlus',
  iqoo: 'iQOO',
  poco: 'POCO',
  oppo: 'OPPO',
  realme: 'realme',
  lg: 'LG',
  htc: 'HTC',
  asus: 'ASUS',
  rog: 'ROG',
  se: 'SE',
  fe: 'FE',
  gt: 'GT',
  ce: 'CE',
  '5g': '5G',
  '4g': '4G',
  gb: 'GB',
  tb: 'TB',
};

const MAX_ALNUM_CODE_LENGTH = 5;

const humanizeWord = (word: string): string => {
  if (WORD_CASING[word]) return WORD_CASING[word];
  // Model codes such as "s24", "a55" or "x200" read best in upper case.
  if (/\d/.test(word) && /[a-z]/.test(word) && word.length <= MAX_ALNUM_CODE_LENGTH) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1);
};

/** "iphone-13-pro-max" -> "iPhone 13 Pro Max" */
export const humanizeSlug = (slug: string): string =>
  slug
    .toLowerCase()
    .split('-')
    .filter(Boolean)
    .map(humanizeWord)
    .join(' ');

const stripPrefix = (slug: string, prefix: 'sell' | 'repair'): string =>
  slug.toLowerCase().replace(new RegExp(`^(${prefix}-)+`), '');

const normalizePath = (pathname: string): string => {
  const withoutQuery = pathname.split(/[?#]/)[0] || '/';
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

const withBrand = (title: string): string => `${title}${BRAND_SUFFIX}`;

/** Avoids "Apple Apple iPhone 13" when the model slug already starts with the brand. */
const joinBrandAndModel = (brand: string, model: string): string =>
  model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;

const isSeriesLikeSlug = (slug: string): boolean => slug.endsWith('-series') || slug.endsWith('-models');

function sellMeta(segments: string[]): Omit<SeoMeta, 'noindex'> {
  const brandSlug = stripPrefix(segments[0], 'sell');
  const brand = humanizeSlug(brandSlug);

  if (segments.length === 1) {
    return {
      title: withBrand(`Sell Old ${brand} Phone Online for Instant Cash`),
      description: `Sell your old ${brand} mobile phone online at the best price. Get an instant quote, free doorstep pickup and on-the-spot cash or UPI payment with Fundu.`,
      canonicalPath: `/sell/${brandSlug}`,
    };
  }

  const isSeriesRoute = segments[1] === 'series' && segments.length >= 3;
  const leafSlug = stripPrefix(isSeriesRoute ? segments[2] : segments[1], 'sell');
  const leaf = humanizeSlug(leafSlug);

  if (isSeriesRoute || isSeriesLikeSlug(leafSlug)) {
    const series = joinBrandAndModel(brand, leaf.replace(/ (Series|Models)$/, ''));
    return {
      title: withBrand(`Sell Old ${series} Series Phones for Instant Cash`),
      description: `Sell any old ${series} series phone online. Check the best resale price, book a free doorstep pickup and get paid instantly by cash or UPI.`,
      canonicalPath: `/sell/${brandSlug}/series/${leafSlug}`,
    };
  }

  const modelSlug = leafSlug.replace(new RegExp(`^(${brandSlug}-)+`), '') || leafSlug;
  const device = joinBrandAndModel(brand, humanizeSlug(modelSlug));
  return {
    title: withBrand(`Sell Old ${device} for Instant Cash`),
    description: `Sell your old ${device} online at the best price. Get an instant quote in 60 seconds, free doorstep pickup and immediate cash or UPI payment with Fundu.`,
    canonicalPath: `/sell/${brandSlug}/${modelSlug}`,
  };
}

function repairMeta(segments: string[]): Omit<SeoMeta, 'noindex'> {
  if (segments[0] === 'issue' && segments[1]) {
    const issueSlug = segments[1].toLowerCase();
    const issue = humanizeSlug(issueSlug);
    return {
      title: withBrand(`Mobile ${issue} Repair at Your Doorstep`),
      description: `Book doorstep mobile ${issue.toLowerCase()} repair with Fundu. Certified technicians, genuine parts, transparent pricing and a 6-month repair warranty.`,
      canonicalPath: `/repair/issue/${issueSlug}`,
    };
  }

  const brandSlug = stripPrefix(segments[0], 'repair');
  const brand = humanizeSlug(brandSlug);

  if (segments.length === 1) {
    return {
      title: withBrand(`${brand} Mobile Repair at Your Doorstep`),
      description: `Book ${brand} phone repair at your home or office. Screen, battery and charging port replacement with genuine parts and a 6-month warranty.`,
      canonicalPath: `/repair/${brandSlug}`,
    };
  }

  const isSeriesRoute = segments[1] === 'series' && segments.length >= 3;
  const leafSlug = stripPrefix(isSeriesRoute ? segments[2] : segments[1], 'repair');
  const leaf = humanizeSlug(leafSlug);

  if (isSeriesRoute || isSeriesLikeSlug(leafSlug)) {
    const series = joinBrandAndModel(brand, leaf.replace(/ (Series|Models)$/, ''));
    return {
      title: withBrand(`${series} Series Repair at Your Doorstep`),
      description: `Doorstep repair for ${series} series phones. Screen, battery and charging port replacement with genuine parts and a 6-month warranty.`,
      canonicalPath: `/repair/${brandSlug}/series/${leafSlug}`,
    };
  }

  const device = joinBrandAndModel(brand, leaf);
  return {
    title: withBrand(`${device} Repair at Your Doorstep`),
    description: `Book ${device} screen, battery and charging port repair at your doorstep. Genuine parts, certified technicians and a 6-month repair warranty.`,
    canonicalPath: `/repair/${brandSlug}/${leafSlug}`,
  };
}

const NOT_FOUND_META: StaticPage = {
  title: 'Page Not Found | Fundu',
  description: 'The page you are looking for does not exist or has been moved.',
};

/** Resolves SEO metadata for any app pathname. Unknown paths are treated as not found. */
export function resolveSeoMeta(pathname: string): SeoMeta {
  const path = normalizePath(pathname);
  const canonicalStatic = STATIC_ALIASES[path] || path;
  const noindex = NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}-`));

  const staticPage = STATIC_PAGES[canonicalStatic];
  if (staticPage) {
    return { ...staticPage, canonicalPath: canonicalStatic, noindex };
  }

  if (noindex) {
    return {
      title: 'Fundu',
      description: STATIC_PAGES['/'].description,
      canonicalPath: path,
      noindex: true,
    };
  }

  const segments = path.split('/').filter(Boolean);
  const [root, ...rest] = segments;

  if ((root === 'sell' || root === 'sell-old-mobile-phone') && rest.length > 0) {
    return { ...sellMeta(rest), noindex: false };
  }

  if ((root === 'repair' || root === 'mobile-repair') && rest.length > 0) {
    return { ...repairMeta(rest), noindex: false };
  }

  if (root === 'doorstep-mobile-repair' && rest.length === 1) {
    return { ...repairMeta(['issue', rest[0]]), noindex: false };
  }

  if (root === 'product' && rest.length === 1) {
    return {
      title: 'Certified Refurbished Phone with Warranty | Fundu',
      description: 'Buy this 42-point quality inspected refurbished smartphone with 6 months warranty and doorstep delivery from Fundu.',
      canonicalPath: path,
      noindex: false,
    };
  }

  return { ...NOT_FOUND_META, canonicalPath: path, noindex: true };
}
