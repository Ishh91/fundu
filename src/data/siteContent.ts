import type {
  HomeArticle,
  HomeCoupon,
  HomeFaq,
  HomeHeroSlide,
  HomeHighlight,
  HomeReview,
  HomeSellStep,
  HomeServiceCategory,
  HomeStoreHighlight,
  HomeTrustStat,
  SiteContentBlock,
  SiteContentBlockKey,
} from '../types';

export const HOME_HERO_SLIDES: HomeHeroSlide[] = [
  {
    badge: 'Sell First',
    title: 'Sell your old phone before its value drops.',
    description: 'Get a faster quote, schedule pickup, and move from lookup to payout with fewer steps.',
    primaryCtaLabel: 'Check Sell Value',
    primaryCtaHref: '/sell',
    secondaryCtaLabel: 'How selling works',
    secondaryCtaHref: '#sell-steps',
    statLabel: 'Average payout window',
    statValue: '30 min',
  },
  {
    badge: 'Refurbished Deals',
    title: 'Buy refurbished phones with pricing clarity and warranty visible upfront.',
    description: 'Browse verified inventory, compare storage variants, and skip noisy catalog browsing.',
    primaryCtaLabel: 'Browse Deals',
    primaryCtaHref: '/buy',
    secondaryCtaLabel: 'Visit Store',
    secondaryCtaHref: '/store',
    statLabel: 'Devices inspected',
    statValue: '15K+',
  },
  {
    badge: 'Repair Support',
    title: 'Book repair, pickup, and device support from the same phone-first flow.',
    description: 'Battery, screen, charging, and camera issues can all move through a cleaner booking journey.',
    primaryCtaLabel: 'Book Repair',
    primaryCtaHref: '/repair',
    secondaryCtaLabel: 'Contact Us',
    secondaryCtaHref: '/contact',
    statLabel: 'Areas covered',
    statValue: '30+',
  },
];

export const HOME_HERO_HIGHLIGHTS: HomeHighlight[] = [
  { icon: 'Clock3', title: 'Fast quote', text: 'Quick estimate after exact device selection.' },
  { icon: 'Truck', title: 'Doorstep support', text: 'Pickup and drop assistance across Lucknow.' },
  { icon: 'ShieldCheck', title: 'Trust layers', text: 'Warranty, verification, and guided updates.' },
];

export const HOME_REVIEWS: HomeReview[] = [
  {
    name: 'Aayushi Verma',
    area: 'Gomti Nagar',
    quote: 'Fundu gave me a better quote than two local shops. Pickup happened the same evening and payment landed before the rider left.',
  },
  {
    name: 'Rizwan Ahmad',
    area: 'Hazratganj',
    quote: 'The phone condition matched the listing, battery health was explained clearly, and the store staff felt trustworthy.',
  },
  {
    name: 'Surbhi Singh',
    area: 'Indira Nagar',
    quote: 'My iPhone screen repair was smooth from lookup to doorstep return. The status updates made the whole thing feel reliable.',
  },
];

export const HOME_FAQS: HomeFaq[] = [
  {
    question: 'How does Fundu verify phone condition before buying or selling?',
    answer: 'We combine device checks, cosmetic grading, and verification notes so users can see a clearer quality picture before making a decision.',
  },
  {
    question: 'Do I need to log in before getting a phone value?',
    answer: 'You can start the lookup and valuation journey first. Login is required when you confirm pickup, payment, or purchase details.',
  },
  {
    question: 'Is doorstep pickup available for both sell and repair?',
    answer: 'Yes. Fundu offers scheduled doorstep pickup across Lucknow for sell requests and repair bookings.',
  },
  {
    question: 'Can I browse by brand and storage before buying?',
    answer: 'Yes. The shared lookup lets you choose brand, model, and storage across Buy, Sell, and Repair journeys.',
  },
];

export const HOME_ARTICLES: HomeArticle[] = [
  {
    title: 'How to get the best resale value for your old phone',
    category: 'Sell Smart',
    excerpt: 'A quick checklist for battery health, box, bill, and cosmetic condition before you schedule a pickup.',
    readTime: '4 min read',
    href: '/articles',
  },
  {
    title: 'What to check before buying a refurbished iPhone',
    category: 'Buyer Guide',
    excerpt: 'From storage variants to display quality and warranty terms, here is what actually matters.',
    readTime: '5 min read',
    href: '/articles',
  },
  {
    title: 'Top signs your battery needs a replacement',
    category: 'Repair Guide',
    excerpt: 'Fast drain, random shutdowns, swelling, and how to act before the problem gets worse.',
    readTime: '3 min read',
    href: '/articles',
  },
];

export const HOME_COUPONS: HomeCoupon[] = [
  { code: 'FUNDU200', detail: 'Up to Rs. 200 off on featured phone purchases' },
  { code: 'REPAIR150', detail: 'Flat Rs. 150 off on selected repair bookings' },
  { code: 'SELLBOOST', detail: 'Extra value boost on eligible premium phone sell requests' },
];

export const PROMO_MESSAGES = [
  'Free pickup across Lucknow',
  'AI-assisted device verification',
  'Exclusive store pricing this week',
  'Document Doctor consultation is free',
  'Partner with Fundu for business sourcing',
];

export const HOME_SERVICE_CATEGORIES: HomeServiceCategory[] = [
  {
    id: 'sell',
    title: 'Sell Old Phone',
    description: 'Instant value estimate, doorstep pickup, and quick payout support.',
    href: '/sell',
    badge: 'Most popular',
  },
  {
    id: 'buy',
    title: 'Buy Refurbished',
    description: 'Shop verified phones with warranty, grading clarity, and fair pricing.',
    href: '/buy',
    badge: 'Verified stock',
  },
  {
    id: 'repair',
    title: 'Repair Your Device',
    description: 'Screen, battery, camera, charging, and doorstep service booking.',
    href: '/repair',
    badge: 'Pickup support',
  },
  {
    id: 'store',
    title: 'Fundu Store',
    description: 'Curated deals, partner inventory, and exclusive offer-led collections.',
    href: '/store',
    badge: 'Store deals',
  },
];

export const HOME_TRUST_STATS: HomeTrustStat[] = [
  { label: 'Phones evaluated', value: '15K+' },
  { label: 'Happy customers', value: '9K+' },
  { label: 'Serviceable areas', value: '30+' },
  { label: 'Avg. payout time', value: '30 min' },
];

export const HOME_BRAND_GRID = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Vivo',
  'Oppo',
  'Realme',
  'Nothing',
];

export const HOME_SELL_STEPS: HomeSellStep[] = [
  {
    title: 'Choose your exact device',
    description: 'Select brand, model, and storage so pricing starts from the right baseline.',
  },
  {
    title: 'Get an instant price range',
    description: 'Condition and accessories refine the estimate before pickup scheduling.',
  },
  {
    title: 'Doorstep pickup and final check',
    description: 'A quick inspection confirms the final value with no unnecessary back and forth.',
  },
  {
    title: 'Receive payment quickly',
    description: 'Once approved, payout is processed fast so the journey feels trustworthy.',
  },
];

export const HOME_BENEFITS = [
  'Instant price guidance for old phones',
  'Refurbished phones with visible warranty info',
  'Free pickup and drop support across Lucknow',
  'AI-assisted verification and cleaner device lookup',
  'Dedicated business sourcing and store collections',
  'Repair booking designed for speed, not confusion',
];

export const HOME_STORE_HIGHLIGHTS: HomeStoreHighlight[] = [
  { icon: 'Store', title: 'Exclusive collections', desc: 'Curated phones, smart offers, and cleaner inventory browsing.' },
  { icon: 'TrendingUp', title: 'Business sourcing', desc: 'Support for retailers, resellers, and repeat procurement conversations.' },
  { icon: 'RefreshCcw', title: 'Recycle & exchange', desc: 'Value recovery options for devices that are not ideal for resale.' },
  { icon: 'FileText', title: 'Document Doctor', desc: 'Invoice, ownership, and paperwork support alongside device services.' },
];

const buildBlock = (
  key: SiteContentBlockKey,
  sort_order: number,
  options: Partial<Pick<SiteContentBlock, 'title' | 'subtitle' | 'description' | 'cta_label' | 'cta_href' | 'secondary_cta_label' | 'secondary_cta_href'>> & {
    items: Array<Record<string, unknown> | string>;
  },
): SiteContentBlock => ({
  id: `default-${key}`,
  key,
  title: options.title ?? null,
  subtitle: options.subtitle ?? null,
  description: options.description ?? null,
  cta_label: options.cta_label ?? null,
  cta_href: options.cta_href ?? null,
  secondary_cta_label: options.secondary_cta_label ?? null,
  secondary_cta_href: options.secondary_cta_href ?? null,
  items: options.items.map((item) => (typeof item === 'string' ? { value: item } : item)),
  is_active: true,
  sort_order,
  created_at: '1970-01-01T00:00:00.000Z',
  updated_at: '1970-01-01T00:00:00.000Z',
});

export const DEFAULT_SITE_CONTENT_BLOCKS: SiteContentBlock[] = [
  buildBlock('hero_slides', 10, {
    title: 'Instant phone resale & buyback experience, Fundu flows',
    subtitle: 'Sell old phone, buy refurbished, and book repair from one cleaner marketplace.',
    description: 'Fundu ab phone-first journey pe focused hai. Exact device lookup se start karo, instant value samjho, verified stock browse karo, aur repair booking ko simpler banao.',
    cta_label: 'Get Phone Value',
    cta_href: '/sell',
    secondary_cta_label: 'Browse Refurbished Phones',
    secondary_cta_href: '/buy',
    items: HOME_HERO_SLIDES,
  }),
  buildBlock('hero_highlights', 20, {
    items: HOME_HERO_HIGHLIGHTS,
  }),
  buildBlock('trust_stats', 30, {
    items: HOME_TRUST_STATS,
  }),
  buildBlock('utility_tags', 40, {
    items: [
      'Instant device lookup',
      'Free doorstep pickup',
      'Warranty-backed refurbished phones',
    ],
  }),
  buildBlock('service_categories', 50, {
    title: 'Our Categories',
    subtitle: 'A homepage shaped around the journeys users actually need',
    description: 'Structure ko is tarah tighten kiya gaya hai ki Sell sabse prominent rahe, Buy inventory-led lage, aur Repair booking me friction kam ho.',
    items: HOME_SERVICE_CATEGORIES,
  }),
  buildBlock('brand_strip', 60, {
    title: 'Top brands',
    items: HOME_BRAND_GRID,
  }),
  buildBlock('sell_benefits', 70, {
    title: 'Sell-first design',
    subtitle: 'Old phone bechne ka flow ab homepage se hi obvious hai',
    description: 'Fundu clarity ka core point yehi tha: user ko turant samajh aaye ki first action kya hai. Isliye Sell journey ko sabse strong hierarchy di gayi hai.',
    items: HOME_BENEFITS,
  }),
  buildBlock('sell_steps', 80, {
    items: HOME_SELL_STEPS,
  }),
  buildBlock('store_highlights', 90, {
    title: 'Storefront, business sourcing, and value-add services in one place',
    description: 'Public shopping aur business enquiries ko clearer cards aur stronger CTA buckets me organize kiya gaya hai, taaki users ko next step obvious lage.',
    cta_label: 'Visit Store',
    cta_href: '/store',
    secondary_cta_label: 'Business With Us',
    secondary_cta_href: '/partner',
    items: HOME_STORE_HIGHLIGHTS,
  }),
  buildBlock('reviews', 100, {
    title: 'Customer Reviews',
    subtitle: 'Real reasons users trust Fundu',
    items: HOME_REVIEWS,
  }),
  buildBlock('marquee', 110, {
    items: [
      'Sell in minutes with lookup-first valuation',
      'Doorstep pickup across Lucknow',
      'Repair offers and booking support live now',
      'Exclusive store collections available',
      'Coupon codes visible across categories',
      'Document Doctor consultation is free',
    ],
  }),
  buildBlock('faqs', 120, {
    title: 'FAQ',
    subtitle: 'Trust questions ka quick answer',
    description: 'Pricing, pickup, repair, aur shared lookup ke around jo common doubts hote hain, unhe homepage ke niche visible rakha gaya hai.',
    items: HOME_FAQS,
  }),
  buildBlock('articles', 130, {
    title: 'Trending Articles',
    subtitle: 'Content blocks that support trust and repeat visits',
    cta_label: 'Read all articles',
    cta_href: '/articles',
    items: HOME_ARTICLES,
  }),
  buildBlock('coupons', 140, {
    items: HOME_COUPONS,
  }),
];

export const DEFAULT_SITE_CONTENT_BLOCKS_BY_KEY = DEFAULT_SITE_CONTENT_BLOCKS.reduce<Record<string, SiteContentBlock>>((acc, block) => {
  acc[block.key] = block;
  return acc;
}, {});

export const getSiteContentBlock = (
  blocks: SiteContentBlock[],
  key: SiteContentBlockKey,
): SiteContentBlock => blocks.find((block) => block.key === key) ?? DEFAULT_SITE_CONTENT_BLOCKS_BY_KEY[key];

export const getBlockStringItems = (
  blocks: SiteContentBlock[],
  key: SiteContentBlockKey,
): string[] => {
  const block = getSiteContentBlock(blocks, key);
  return (block.items ?? [])
    .map((item) => (typeof item?.value === 'string' ? item.value : typeof item === 'string' ? item : ''))
    .filter(Boolean);
};

export const getBlockItems = <T extends Record<string, unknown>>(
  blocks: SiteContentBlock[],
  key: SiteContentBlockKey,
): T[] => {
  const block = getSiteContentBlock(blocks, key);
  return (block.items ?? []) as T[];
};
