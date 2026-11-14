/**
 * Admin-panel access control (client side).
 *
 * - "admin" is the super admin: every section, plus Users & Roles.
 * - "staff" can open the admin panel but only sees the sections they were granted.
 *
 * The server enforces the same rules; this file only decides what to show.
 * Keep the permission keys in sync with server/config/permissions.js.
 */
import type { AdminTab } from '../pages/admin/adminTypes';

export const STAFF_ROLE = 'staff';
export const ADMIN_ROLE = 'admin';

export type AdminPermission =
  | 'orders'
  | 'sell_requests'
  | 'repairs'
  | 'inventory'
  | 'sell_pricing'
  | 'repair_pricing'
  | 'fleet'
  | 'vendors'
  | 'content';

export type AdminPermissionOption = {
  key: AdminPermission;
  label: string;
  description: string;
};

export const ADMIN_PERMISSION_OPTIONS: AdminPermissionOption[] = [
  { key: 'orders', label: 'Order Management', description: 'Customer orders and dispatch status' },
  { key: 'sell_requests', label: 'Sell Requests', description: 'Phone buyback requests and pickups' },
  { key: 'repairs', label: 'Repair Bookings', description: 'Repair bookings and diagnostics' },
  { key: 'inventory', label: 'Inventory', description: 'Store inventory and spare parts stock' },
  { key: 'sell_pricing', label: 'Sell Pricing', description: 'Sell prices, phone catalog and competitor radar' },
  { key: 'repair_pricing', label: 'Repair Pricing', description: 'Repair price catalog' },
  { key: 'fleet', label: 'Delivery Fleet', description: 'Delivery agents and serviceable pincodes' },
  { key: 'vendors', label: 'Vendors', description: 'Vendor accounts, wholesale stock and ledger' },
  { key: 'content', label: 'Website Content', description: 'Banners, customer reviews and contact queries' },
];

/** The permission each admin tab needs. `null` means any admin-panel user may open it. */
const TAB_PERMISSION: Record<AdminTab, AdminPermission | null | 'admin_only'> = {
  overview: null,
  orders: 'orders',
  sells: 'sell_requests',
  repairs: 'repairs',
  products: 'inventory',
  parts: 'inventory',
  catalog: 'sell_pricing',
  pricing: 'sell_pricing',
  competitor_radar: 'sell_pricing',
  repair_pricing: 'repair_pricing',
  agents: 'fleet',
  pincodes: 'fleet',
  wholesalers: 'vendors',
  banners: 'content',
  reviews: 'content',
  contact: 'content',
  users: 'admin_only',
  errors: 'admin_only',
};

const ALL_ADMIN_TABS = Object.keys(TAB_PERMISSION) as AdminTab[];
const KNOWN_PERMISSIONS = new Set<string>(ADMIN_PERMISSION_OPTIONS.map((option) => option.key));

export const canAccessAdminPanel = (role?: string | null): boolean => role === ADMIN_ROLE || role === STAFF_ROLE;

export const isAdminPermission = (value: string): value is AdminPermission => KNOWN_PERMISSIONS.has(value);

/** The admin tabs a user with this role and these permissions may open. */
export function getAllowedAdminTabs(role?: string | null, permissions?: readonly string[] | null): AdminTab[] {
  if (role === ADMIN_ROLE) return ALL_ADMIN_TABS;
  if (role !== STAFF_ROLE) return [];

  const granted = new Set(permissions ?? []);
  return ALL_ADMIN_TABS.filter((tab) => {
    const required = TAB_PERMISSION[tab];
    if (required === null) return true;
    if (required === 'admin_only') return false;
    return granted.has(required);
  });
}

/** Short human-readable summary, e.g. "Inventory, Sell Pricing". */
export function describePermissions(permissions?: readonly string[] | null): string {
  const granted = new Set(permissions ?? []);
  const labels = ADMIN_PERMISSION_OPTIONS.filter((option) => granted.has(option.key)).map((option) => option.label);
  return labels.length > 0 ? labels.join(', ') : 'No access granted yet';
}
