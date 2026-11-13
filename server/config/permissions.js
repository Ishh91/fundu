/**
 * Admin-panel access control.
 *
 * - role "admin" is the super admin: full access, and the only role that can
 *   manage users, roles and permissions.
 * - role "staff" can sign in to the admin panel but may only manage the areas
 *   listed in the user's `permissions` array.
 *
 * Keep the permission keys in sync with src/lib/adminPermissions.ts.
 */

export const STAFF_ROLE = 'staff';

export const PERMISSIONS = Object.freeze([
  'orders',
  'sell_requests',
  'repairs',
  'inventory',
  'sell_pricing',
  'repair_pricing',
  'fleet',
  'vendors',
  'content',
]);

/** Which permission lets a staff member manage each database table. */
export const TABLE_PERMISSION = Object.freeze({
  orders: 'orders',
  dispatches: 'orders',
  sell_requests: 'sell_requests',
  repair_bookings: 'repairs',
  products: 'inventory',
  spare_parts: 'inventory',
  sell_price_configs: 'sell_pricing',
  master_phones: 'sell_pricing',
  phones: 'sell_pricing',
  repair_price_configs: 'repair_pricing',
  repair_catalogs: 'repair_pricing',
  delivery_agents: 'fleet',
  wholesale_orders: 'vendors',
  wholesale_inventories: 'vendors',
  wholesale_inventory: 'vendors',
  vendor_ledgers: 'vendors',
  vendor_ledger: 'vendors',
  site_content: 'content',
  banners: 'content',
  reviews: 'content',
  support_tickets: 'content',
  contact_messages: 'content',
  contact_queries: 'content',
  // "profiles" is intentionally absent: only the super admin manages users.
});

/** Returns only known permission keys, de-duplicated. Anything else is dropped. */
export const sanitizePermissions = (input) => {
  if (!Array.isArray(input)) return [];
  return PERMISSIONS.filter((permission) => input.includes(permission));
};
