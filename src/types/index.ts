export type Product = {
  id: string;
  title: string;
  brand: string;
  model: string;
  ram: string | null;
  storage: string | null;
  color: string | null;
  condition: 'Excellent' | 'Good' | 'Fair';
  price: number;
  original_price: number | null;
  discount_percent: number;
  warranty_months: number;
  description: string | null;
  images: string[];
  is_approved: boolean;
  is_featured: boolean;
  stock: number;
  sold_count: number;
  seller_id: string | null;
  created_at: string;
};

export type SellRequest = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  ram: string | null;
  storage: string | null;
  condition: string;
  imei: string | null;
  accessories: string[];
  estimated_price: number | null;
  final_price: number | null;
  status: string;
  pickup_address: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
  notes: string | null;
  pickup_person_name: string | null;
  pickup_person_phone: string | null;
  created_at: string;
};

export type SellPriceConfig = {
  id: string;
  brand: string;
  model: string;
  storage: string | null;
  base_price: number;
  excellent_multiplier: number;
  good_multiplier: number;
  fair_multiplier: number;
  box_bonus: number;
  charger_bonus: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RepairBooking = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  problem: string;
  problem_detail: string | null;
  estimated_cost: number | null;
  final_cost: number | null;
  status: string;
  pickup_address: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
  technician_name: string | null;
  technician_phone: string | null;
  pickup_person_name: string | null;
  pickup_person_phone: string | null;
  tracking_id: string;
  created_at: string;
};

export type SparePart = {
  id: string;
  title: string;
  brand: string | null;
  category: string;
  compatible_models: string[];
  price: number;
  original_price: number | null;
  stock: number;
  description: string | null;
  images: string[];
  is_approved: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  product_id: string | null;
  spare_part_id: string | null;
  quantity: number;
  total_amount: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  delivery_address: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  created_at: string;
};

export type Dispatch = {
  id: string;
  order_id: string;
  delivery_person_name: string;
  delivery_person_phone: string;
  status: 'dispatched' | 'in_transit' | 'delivered' | 'returned';
  notes: string | null;
  dispatched_at: string;
  delivered_at: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string | null;
  product_id: string | null;
  service_type: 'buy' | 'sell' | 'repair' | 'spare_parts' | 'general';
  rating: number;
  comment: string;
  reviewer_name: string;
  location: string;
  is_approved: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'wholesaler' | 'admin';
  business_name: string | null;
  is_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteContentBlockKey =
  | 'hero_slides'
  | 'hero_highlights'
  | 'trust_stats'
  | 'utility_tags'
  | 'service_categories'
  | 'brand_strip'
  | 'sell_benefits'
  | 'sell_steps'
  | 'store_highlights'
  | 'reviews'
  | 'faqs'
  | 'articles'
  | 'marquee'
  | 'coupons';

export type SiteContentItem = Record<string, unknown>;

export type SiteContentBlock = {
  id: string;
  key: SiteContentBlockKey | string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  items: SiteContentItem[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HomeHeroSlide = {
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  statLabel?: string;
  statValue?: string;
};

export type HomeHighlight = {
  title: string;
  text: string;
  icon: 'Clock3' | 'Truck' | 'ShieldCheck' | 'TrendingUp' | 'Store' | 'FileText' | 'Sparkles';
};

export type HomeTrustStat = {
  label: string;
  value: string;
};

export type HomeServiceCategory = {
  id: 'sell' | 'buy' | 'repair' | 'store';
  title: string;
  description: string;
  href: string;
  badge: string;
};

export type HomeSellStep = {
  title: string;
  description: string;
};

export type HomeStoreHighlight = {
  title: string;
  desc: string;
  icon: 'Store' | 'TrendingUp' | 'RefreshCcw' | 'FileText';
};

export type HomeReview = {
  name: string;
  area: string;
  quote: string;
};

export type HomeFaq = {
  question: string;
  answer: string;
};

export type HomeArticle = {
  title: string;
  category: string;
  excerpt: string;
  readTime?: string;
  href: string;
};

export type HomeCoupon = {
  code: string;
  detail: string;
};

export const REPAIR_PROBLEMS = [
  { id: 'screen-broken', label: 'Broken / Cracked Screen', icon: 'Screen', baseCost: 1500 },
  { id: 'battery', label: 'Battery Replacement', icon: 'Battery', baseCost: 800 },
  { id: 'charging', label: 'Charging Port Issue', icon: 'Plug', baseCost: 600 },
  { id: 'water-damage', label: 'Water Damage Repair', icon: 'Droplet', baseCost: 2000 },
  { id: 'speaker', label: 'Speaker / Audio Issue', icon: 'Volume2', baseCost: 700 },
  { id: 'camera', label: 'Camera Repair', icon: 'Camera', baseCost: 1200 },
  { id: 'software', label: 'Software / OS Issue', icon: 'Cpu', baseCost: 500 },
  { id: 'network', label: 'Network / Signal Issue', icon: 'Wifi', baseCost: 900 },
  { id: 'button', label: 'Power / Volume Button', icon: 'ToggleLeft', baseCost: 600 },
  { id: 'other', label: 'Other Issue', icon: 'Wrench', baseCost: 1000 },
];

export const PHONE_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo',
  'Motorola', 'Google', 'Nothing', 'Poco', 'Redmi', 'iQOO', 'Asus', 'Nokia',
];

export const LUCKNOW_AREAS = [
  'Gomti Nagar', 'Hazratganj', 'Indira Nagar', 'Aliganj', 'Chowk',
  'Aminabad', 'Rajajipuram', 'Alambagh', 'Vikas Nagar', 'Janakipuram',
  'Faizabad Road', 'Sitapur Road', 'Telibagh', 'Jankipuram', 'Gomti Nagar Extension',
];
