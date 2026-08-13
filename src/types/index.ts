-export type Product = {
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
  offer_tag?: string | null;
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
  imei_photo?: string | null;
  device_photos?: {
    front?: string | null;
    back?: string | null;
    edges?: string | null;
    bill_box?: string | null;
  } | null;
  diagnostics?: {
    screen_touch?: boolean;
    cameras?: boolean;
    battery_health?: string | number | null;
    biometrics?: boolean;
    speaker_mic?: boolean;
    charging_port?: boolean;
  } | null;
  accessories: string[];
  estimated_price: number | null;
  final_price: number | null;
  status: string;
  pickup_address: string | null;
  pickup_area?: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
  notes: string | null;
  assigned_agent_id?: string | null;
  pickup_person_name: string | null;
  pickup_person_phone: string | null;
  estimated_arrival_time?: string | null;
  payout_method?: string | null;
  payout_details?: string | null;
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
  [x: string]: any;
  delivery_person_name: string;
  delivery_person_phone: any;
  id: string;
  user_id: string;
  brand: string;
  model: string;
  problem: string;
  problem_detail: string | null;
  device_photos?: string[];
  estimated_cost: number | null;
  final_cost: number | null;
  status: string;
  pickup_address: string | null;
  pickup_area?: string | null;
  pickup_date: string | null;
  pickup_slot: string | null;
  assigned_agent_id?: string | null;
  technician_name: string | null;
  technician_phone: string | null;
  pickup_person_name: string | null;
  pickup_person_phone: string | null;
  estimated_arrival_time?: string | null;
  tracking_id: string;
  created_at: string;
};

export type SparePart = {
  model: any;
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
  items: boolean;
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
  delivery_area?: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_slot?: string | null;
  assigned_agent_id?: string | null;
  delivery_person_name?: string | null;
  delivery_person_phone?: string | null;
  estimated_arrival_time?: string | null;
  tracking_id?: string;
  created_at: string;
};

export type DeliveryAgent = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: 'available' | 'on_delivery' | 'busy' | 'offline';
  zones: string[];
  current_orders_count: number;
  max_capacity: number;
  vehicle_type: string;
  vehicle_number?: string | null;
  rating: number;
  total_completed: number;
  is_active: boolean;
  avatar_url?: string | null;
  current_locality: string;
  created_at: string;
};

export type MasterPhone = {
  [x: string]: string;
  id: string;
  brand: string;
  model: string;
  release_year: number;
  ram_options: string[];
  storage_options: string[];
  default_mrp: number;
  base_resale_value: number;
  image_url: string | null;
  popular_tag: string | null;
  processor: string | null;
  camera_spec: string | null;
  battery_spec: string | null;
  display_spec: string | null;
  is_5g: boolean;
  is_active: boolean;
  created_at?: string;
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
