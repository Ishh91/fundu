import type {
  Product,
  SellRequest,
  SellPriceConfig,
  RepairBooking,
  Order,
  SparePart,
  Review,
  DeliveryAgent,
  MasterPhone,
  HeroPoster,
} from '../../types';

export type {
  Product,
  SellRequest,
  SellPriceConfig,
  RepairBooking,
  Order,
  SparePart,
  Review,
  DeliveryAgent,
  MasterPhone,
  HeroPoster,
};

export type AdminTab =
  | 'overview'
  | 'catalog'
  | 'sells'
  | 'orders'
  | 'repairs'
  | 'agents'
  | 'products'
  | 'pricing'
  | 'banners'
  | 'parts'
  | 'users'
  | 'reviews';

export const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  price_offered: 'bg-blue-50 text-blue-700 border border-blue-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  assigned: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  pickup_scheduled: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  picked_up: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  diagnosing: 'bg-purple-50 text-purple-700 border border-purple-200',
  repairing: 'bg-purple-50 text-purple-700 border border-purple-200',
  inspected: 'bg-blue-50 text-blue-700 border border-blue-200',
  repaired: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_transit: 'bg-blue-50 text-blue-700 border border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  open: 'bg-amber-50 text-amber-600 border border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  closed: 'bg-ink-100 text-ink-600 border border-ink-200',
};

export const POPULAR_OFFER_TAGS = [
  '🔥 Hot Deal',
  '⚡ Super Offer',
  '⭐ Best Value',
  '💥 40% OFF',
  '🎉 Festival Special',
  '👑 Bestseller',
  '🛡️ Certified Refurbished',
  '📍 Lucknow Exclusive',
  '⚡ Flash Deal',
];
