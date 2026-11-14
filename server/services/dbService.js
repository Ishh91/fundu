import mongoose, { Types } from 'mongoose';
import { getModel, Order, User, VendorLedger, WholesaleOrder, WholesaleInventory, Product, SparePart } from '../models/index.js';
import { createHttpError } from '../utils/error.js';
import {
  buildMongoFilter,
  combineFilters,
  normalizeDoc,
  parseSelect,
  parseSort,
} from '../utils/dbHelpers.js';
import { canAdminTable, isWholesaler, requireAuth, requireTableAdmin } from '../middleware/auth.js';
import { STAFF_ROLE, sanitizePermissions } from '../config/permissions.js';
import { autoAssignDeliveryAgent } from './dispatchService.js';
import { triggerEventNotification } from './notificationService.js';
import { quotePhone } from '../../fundu_phone_quote.mjs';
import { createPhoneQuote } from './quoteService.js';
import { isTrustedOrderWriter, secureCustomerOrder } from './orderSecurity.js';
import { getRazorpayCredentials } from './razorpayService.js';
import { postBuybackToLedger, postRepairToLedger, shouldRestoreStock } from './vendorLedgerService.js';

export const getReadScope = async (table, auth, filters, select) => {
  const baseFilter = buildMongoFilter(filters);

  switch (table) {
    case 'profiles': {
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      const profileId = Types.ObjectId.isValid(auth.sub) ? new Types.ObjectId(auth.sub) : auth.sub;
      return combineFilters(baseFilter, { $or: [{ _id: profileId }, { id: auth.sub }] });
    }
    case 'products':
    case 'spare_parts':
      if (canAdminTable(auth, table)) return baseFilter;
      if (!auth?.sub) return combineFilters(baseFilter, { is_approved: true });
      return combineFilters(baseFilter, { $or: [{ is_approved: true }, { seller_id: auth.sub }] });
    case 'sell_requests':
    case 'repair_bookings':
    case 'orders': {
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      const userMatch = Types.ObjectId.isValid(auth.sub)
        ? {
            $or: [
              { user_id: auth.sub },
              { user_id: new Types.ObjectId(auth.sub) },
              { assigned_vendor_id: auth.sub },
            ],
          }
        : { $or: [{ user_id: auth.sub }, { assigned_vendor_id: auth.sub }] };
      return combineFilters(baseFilter, userMatch);
    }
    case 'sell_price_configs':
    case 'repair_price_configs':
    case 'repair_catalogs':
      if (canAdminTable(auth, table)) return baseFilter;
      // If client explicitly requested is_active filter (e.g. is_active=false to sync deleted/disabled models), respect it
      if (filters && Array.isArray(filters) && filters.some((f) => f.field === 'is_active')) {
        return baseFilter;
      }
      // If client is syncing catalog fields to check is_active status
      if (typeof select === 'string' && select.includes('is_active')) {
        return baseFilter;
      }
      return combineFilters(baseFilter, { is_active: true });
    case 'dispatches': {
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      const orders = await Order.find({ user_id: auth.sub }).select('_id');
      const orderIds = orders.map((order) => order._id.toString());
      return combineFilters(baseFilter, { order_id: { $in: orderIds } });
    }
    case 'delivery_agents':
    case 'master_phones':
    case 'phones':
    case 'site_content':
    case 'banners':
    case 'wholesale_inventories':
    case 'wholesale_inventory':
      return baseFilter;
    case 'wholesale_orders':
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      return combineFilters(baseFilter, { vendor_id: auth.sub });
    case 'vendor_ledgers':
    case 'vendor_ledger':
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      return combineFilters(baseFilter, { vendor_id: auth.sub });
    case 'support_tickets':
    case 'contact_messages':
    case 'contact_queries':
      requireAuth(auth);
      return canAdminTable(auth, table) ? baseFilter : combineFilters(baseFilter, { user_id: auth.sub });
    case 'reviews':
      if (canAdminTable(auth, table)) return baseFilter;
      return combineFilters(baseFilter, { is_approved: true });
    default:
      throw createHttpError(404, `Unknown table: ${table}`);
  }
};

export const getWriteScope = async (table, auth, filters) => {
  const baseFilter = buildMongoFilter(filters);

  switch (table) {
    case 'profiles':
      requireAuth(auth);
      const profileId = Types.ObjectId.isValid(auth.sub) ? new Types.ObjectId(auth.sub) : auth.sub;
      return canAdminTable(auth, table) ? baseFilter : combineFilters(baseFilter, { _id: profileId });
    case 'products':
    case 'spare_parts':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) {
        if (!isWholesaler(auth)) throw createHttpError(403, 'Wholesaler access required.');
        return combineFilters(baseFilter, { seller_id: auth.sub });
      }
      return baseFilter;
    case 'sell_requests':
    case 'repair_bookings':
    case 'orders': {
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      const userMatch = Types.ObjectId.isValid(auth.sub)
        ? {
            $or: [
              { user_id: auth.sub },
              { user_id: new Types.ObjectId(auth.sub) },
              { assigned_vendor_id: auth.sub },
            ],
          }
        : { $or: [{ user_id: auth.sub }, { assigned_vendor_id: auth.sub }] };
      return combineFilters(baseFilter, userMatch);
    }
    case 'wholesale_orders':
      requireAuth(auth);
      if (canAdminTable(auth, table)) return baseFilter;
      return combineFilters(baseFilter, { vendor_id: auth.sub });
    case 'wholesale_inventories':
    case 'wholesale_inventory':
      requireAuth(auth);
      if (!canAdminTable(auth, table) && !isWholesaler(auth)) throw createHttpError(403, 'Vendor access required.');
      return baseFilter;
    case 'vendor_ledgers':
    case 'vendor_ledger':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
      return baseFilter;
    case 'sell_price_configs':
    case 'repair_price_configs':
    case 'repair_catalogs':
    case 'delivery_agents':
    case 'master_phones':
    case 'phones':
    case 'dispatches':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
      return baseFilter;
    case 'site_content':
    case 'banners':
    case 'support_tickets':
    case 'contact_messages':
    case 'contact_queries':
    case 'reviews':
      requireTableAdmin(auth, table);
      return baseFilter;
    default:
      throw createHttpError(404, `Unknown table: ${table}`);
  }
};

/**
 * Only the super admin reaches this for profiles. Permissions are limited to
 * known keys and only kept on staff accounts, so a role change away from
 * "staff" always clears them.
 */
const withSanitizedPermissions = (payload) => {
  const touchesAccess = payload.role !== undefined || payload.permissions !== undefined;
  if (!touchesAccess) return payload;
  if (payload.role !== undefined && payload.role !== STAFF_ROLE) {
    return { ...payload, permissions: [] };
  }
  return { ...payload, permissions: sanitizePermissions(payload.permissions) };
};

const CUSTOMER_LOCKED_ORDER_FIELDS = [
  'total_amount', 'items', 'quantity', 'payment_status', 'payment_method', 'delivery_otp',
  'delivery_otp_created_at', 'razorpay_order_id', 'razorpay_payment_id',
];

export const preparePayload = (table, action, input, auth) => {
  const payload = { ...input };
  delete payload.id;
  delete payload._id;

  switch (table) {
    case 'profiles':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) {
        const out = {
          full_name: payload.full_name ?? null,
          phone: payload.phone ?? null,
          business_name: payload.business_name ?? null,
          avatar_url: payload.avatar_url ?? null,
          updated_at: payload.updated_at ?? new Date().toISOString(),
        };
        if (payload.email !== undefined) {
          const cleanEmail = String(payload.email || '').toLowerCase().trim();
          if (cleanEmail) {
            out.email = cleanEmail;
          }
        }
        return out;
      }
      return withSanitizedPermissions(payload);
    case 'products':
    case 'spare_parts':
      requireAuth(auth);
      if (!canAdminTable(auth, table) && !isWholesaler(auth)) throw createHttpError(403, 'Wholesaler access required.');
      if (!canAdminTable(auth, table)) {
        payload.seller_id = auth.sub;
        if (action === 'insert' || action === 'upsert') payload.is_approved = false;
      }
      return payload;
    case 'wholesale_inventories':
    case 'wholesale_inventory':
      requireAuth(auth);
      if (!canAdminTable(auth, table) && !isWholesaler(auth)) throw createHttpError(403, 'Vendor access required.');
      return payload;
    case 'wholesale_orders':
      requireAuth(auth);
      if (!canAdminTable(auth, table) && !payload.vendor_id) {
        payload.vendor_id = auth.sub;
      }
      return payload;
    case 'vendor_ledgers':
    case 'vendor_ledger':
      requireTableAdmin(auth, table);
      return payload;
    case 'sell_requests': {
      if (auth?.sub) {
        payload.user_id = auth.sub;
      } else if (!payload.user_id) {
        payload.user_id = `guest_${Date.now()}`;
      }

      // Preserve exact price shown to customer on their screen (do not overwrite client's accepted quote)
      const rawPrice = payload.estimated_price ?? payload.valuation_price;
      const clientPrice = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN;
      const hasValidClientPrice = !isNaN(clientPrice) && clientPrice > 0;

      if (hasValidClientPrice) {
        payload.estimated_price = Math.round(clientPrice);
        payload.valuation_price = Math.round(clientPrice);
      } else if (action === 'insert' && payload.brand && payload.model) {
        // Fallback calculation only when no valid price was submitted by customer
        const quoteInputs = {
          brand: payload.brand,
          model: payload.model,
          storage: payload.storage || '128 GB',
          powers_on: payload.can_make_calls !== false && payload.diagnostics?.screen_touch !== false,
          activation_lock_cleared: payload.activation_lock_cleared !== false,
          ownership_verified: payload.ownership_verified !== false,
          liquid_damage: payload.liquid_damage === true,
          cosmetic_condition: payload.body_condition || payload.condition || 'good',
          screen_condition: payload.screen_condition || 'flawless',
          body_condition: payload.body_condition || 'flawless',
          battery_health: payload.diagnostics?.battery_health || 'healthy',
          defects: Array.isArray(payload.defects) ? payload.defects : [],
          accessories: Array.isArray(payload.accessories) ? payload.accessories : [],
          under_warranty: payload.under_warranty === true,
        };

        const serverQuote = quotePhone(quoteInputs);
        if (serverQuote.status === 'quoted') {
          payload.estimated_price = serverQuote.offerAmount;
          payload.valuation_price = serverQuote.offerAmount;
          if (!payload.policy_version) payload.policy_version = serverQuote.policyVersion;
          if (!payload.quote_id) payload.quote_id = serverQuote.quoteId;
          if (!payload.condition_summary || !payload.condition_summary.length) payload.condition_summary = serverQuote.conditionSummary;
        } else if (serverQuote.status === 'requires_manual_review') {
          payload.status = 'requires_manual_review';
          payload.estimated_price = null;
          payload.valuation_price = null;
          payload.review_reason = serverQuote.reason;
          payload.notes = (payload.notes ? `${payload.notes} | ` : '') + `Routed to manual inspection: ${serverQuote.message}`;
        }
      }
      return payload;
    }
    case 'repair_bookings':
      if (auth?.sub) {
        payload.user_id = auth.sub;
      } else if (!payload.user_id) {
        payload.user_id = `guest_${Date.now()}`;
      }
      return payload;
    case 'sell_price_configs':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
      payload.storage = payload.storage ? String(payload.storage).trim() : null;
      return payload;
    case 'repair_price_configs':
    case 'repair_catalogs':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
      if (payload.brand) payload.brand = String(payload.brand).trim();
      if (payload.model) payload.model = String(payload.model).trim();
      return payload;
    case 'delivery_agents':
    case 'master_phones':
    case 'phones':
    case 'site_content':
    case 'banners':
      requireTableAdmin(auth, table);
      return payload;
    case 'orders':
      if (action === 'insert' || action === 'upsert') {
        if (!payload.delivery_name || !payload.delivery_phone) {
          throw createHttpError(400, 'Delivery name and phone are required.');
        }
      }
      if (auth?.sub && !canAdminTable(auth, table) && (action === 'insert' || action === 'upsert')) {
        payload.user_id = auth.sub;
      }
      if (!canAdminTable(auth, table) && !isTrustedOrderWriter(auth) && action !== 'insert' && action !== 'upsert') {
        // A customer may change an order's status, never its price, payment or handover code.
        for (const field of CUSTOMER_LOCKED_ORDER_FIELDS) delete payload[field];
      }
      return payload;
    case 'dispatches':
      requireAuth(auth);
      if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
      if (payload.status === 'delivered' && !payload.delivered_at) {
        payload.delivered_at = new Date().toISOString();
      }
      return payload;
    case 'reviews':
      if (auth?.sub) payload.user_id = auth.sub;
      if (!canAdminTable(auth, table)) {
        if (action === 'insert' || action === 'upsert') payload.is_approved = false;
        else delete payload.is_approved;
      }
      return payload;
    case 'support_tickets':
      if (auth?.sub) payload.user_id = auth.sub;
      return payload;
    default:
      throw createHttpError(404, `Unknown table: ${table}`);
  }
};

/**
 * Product videos uploaded as base64 "data:" URLs are megabytes each. List
 * pages only need the card image, so those inline videos are left out of list
 * responses and flagged with `has_video` (the product page still loads the
 * video by id). People who can edit the product - admins, inventory staff and
 * its seller - keep the full document so saving an edit never drops the video.
 */
export const withoutInlineProductVideos = (table, auth, docs) => {
  if (table !== 'products' || !Array.isArray(docs) || canAdminTable(auth, table)) return docs;

  const canEdit = (doc) => isWholesaler(auth) && Boolean(auth?.sub) && String(doc?.seller_id) === String(auth.sub);
  const hasInlineVideo = (doc) => typeof doc?.video_url === 'string' && doc.video_url.startsWith('data:');

  return docs.map((doc) => (hasInlineVideo(doc) && !canEdit(doc) ? { ...doc, video_url: null, has_video: true } : doc));
};

export const queryTable = async (table, { auth, filters, sort, select, single, limit, offset }) => {
  const Model = getModel(table);
  const scope = await getReadScope(table, auth, filters, select);
  const sortConfig = parseSort(sort);
  const selectConfig = parseSelect(select);

  let query = Model.find(scope).lean();
  if (sortConfig) query = query.sort(sortConfig);
  if (selectConfig) query = query.select(selectConfig);
  if (Number.isInteger(offset) && offset > 0) query = query.skip(offset);
  if (typeof limit === 'number' && limit > 0) query = query.limit(limit);

  if (single) {
    try {
      const doc = await Model.findOne(scope).sort(sortConfig).select(selectConfig).lean();
      return normalizeDoc(doc);
    } catch (e) {
      console.warn(`Notice querying single ${table}:`, e?.message || e);
      return null;
    }
  }

  let docs = [];
  try {
    docs = await query;
  } catch (e) {
    console.warn(`Notice querying ${table}:`, e?.message || e);
    return [];
  }
  const normalized = withoutInlineProductVideos(table, auth, normalizeDoc(docs));

  // Auto-enrich customer contact info for sell_requests, repair_bookings, orders if missing
  if ((table === 'sell_requests' || table === 'repair_bookings' || table === 'orders') && normalized) {
    const list = Array.isArray(normalized) ? normalized : [normalized];
    const userIds = [...new Set(list.map((d) => d.user_id).filter((id) => id && !String(id).startsWith('guest_')))];
    if (userIds.length > 0) {
      try {
        const validUserIds = userIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (validUserIds.length > 0) {
          const users = await User.find({ _id: { $in: validUserIds } }).select('_id full_name phone email').lean();
          const userMap = new Map(users.map((u) => [u._id.toString(), u]));
          for (const item of list) {
            if (item.user_id && userMap.has(String(item.user_id))) {
              const u = userMap.get(String(item.user_id));
              if (!item.customer_name) item.customer_name = u.full_name || item.delivery_name || item.pickup_person_name;
              if (!item.customer_phone) item.customer_phone = u.phone || item.delivery_phone || item.pickup_person_phone;
              if (!item.customer_email) item.customer_email = u.email;
            }
          }
        }
      } catch (e) {
        // silent fallback
      }
    }

    // Auto-enrich assigned vendor details for sell_requests and repair_bookings if missing
    if (table === 'sell_requests' || table === 'repair_bookings') {
      const vendorIds = [...new Set(list.map((d) => d.assigned_vendor_id).filter(Boolean))];
      if (vendorIds.length > 0) {
        try {
          const validObjIds = vendorIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
          if (validObjIds.length > 0) {
            const vendors = await User.find({ _id: { $in: validObjIds } }).select('_id id full_name business_name phone email address').lean();
            const vMap = new Map();
            vendors.forEach((v) => {
              if (v._id) vMap.set(v._id.toString(), v);
              if (v.id) vMap.set(String(v.id), v);
            });
            for (const item of list) {
              if (item.assigned_vendor_id && vMap.has(String(item.assigned_vendor_id))) {
                const v = vMap.get(String(item.assigned_vendor_id));
                const shopName = v.business_name || v.full_name;
                if (shopName && (!item.assigned_vendor_name || item.assigned_vendor_name === 'Partner Store' || item.assigned_vendor_name === 'Assigned Partner Store')) {
                  item.assigned_vendor_name = shopName;
                }
                if (!item.vendor_phone) item.vendor_phone = v.phone;
                if (!item.vendor_business_name) item.vendor_business_name = v.business_name;
              }
            }
          }
        } catch (e) {
          // silent fallback
        }
      }
    }
  }

  return normalized;
};

const DB_CONNECTED = 1;

/**
 * Writes must fail cleanly while MongoDB is unreachable. With command
 * buffering off, Mongoose throws from inside a driver callback when a write
 * is attempted without a connection, which would crash the whole process
 * instead of failing the one request.
 */
export const assertDatabaseReady = (readyState = mongoose.connection.readyState) => {
  if (readyState !== DB_CONNECTED) {
    throw createHttpError(503, 'The database is temporarily unavailable. Nothing was saved - please try again in a minute.');
  }
};

const findCatalogItem = async (kind, id) => {
  const Model = kind === 'spare_parts' ? SparePart : Product;
  const filter = Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { id }] } : { id };
  return Model.findOne(filter).lean();
};

const orderSecurityDeps = () => ({
  lookup: async (kind, id) => {
    const doc = await findCatalogItem(kind, id);
    return doc ? { ...doc, id: String(doc._id) } : null;
  },
  paymentUsed: async (paymentId) => Boolean(await Order.exists({ razorpay_payment_id: paymentId })),
  creds: getRazorpayCredentials(),
});

export const insertIntoTable = async (table, { auth, values, single }) => {
  assertDatabaseReady();
  const Model = getModel(table);
  const items = Array.isArray(values) ? values : [values];
  const preparedItems = [];

  for (const item of items) {
    let prepared = preparePayload(table, 'insert', item, auth);

    if (table === 'orders' && !canAdminTable(auth, table)) {
      prepared = await secureCustomerOrder(prepared, auth, orderSecurityDeps());
    }

    // Auto-populate customer contact details from Auth Profile
    if (auth?.sub && (table === 'sell_requests' || table === 'repair_bookings' || table === 'orders')) {
      try {
        const u = await User.findById(auth.sub);
        if (u) {
          if (!prepared.customer_name) prepared.customer_name = u.full_name || prepared.delivery_name;
          if (!prepared.customer_phone) prepared.customer_phone = u.phone || prepared.delivery_phone;
          if (!prepared.customer_email) prepared.customer_email = u.email;
        }
      } catch (err) {
        // silent fallback
      }
    }

    // Auto-assign delivery / pickup executive
    if (table === 'sell_requests' && !prepared.assigned_agent_id) {
      try {
        const assigned = await autoAssignDeliveryAgent({
          area: prepared.pickup_area,
          fullAddress: prepared.pickup_address,
          slot: prepared.pickup_slot,
          date: prepared.pickup_date,
          type: 'sell',
        });
        if (assigned?.assigned_agent_id) {
          prepared.assigned_agent_id = assigned.assigned_agent_id;
          prepared.pickup_person_name = assigned.pickup_person_name;
          prepared.pickup_person_phone = assigned.pickup_person_phone;
          prepared.estimated_arrival_time = assigned.estimated_arrival_time;
          if (prepared.status === 'pending') prepared.status = 'assigned';
        }
      } catch (e) {
        console.warn('Notice auto-assigning agent:', e);
      }
    } else if (table === 'orders' && !prepared.assigned_agent_id) {
      try {
        const assigned = await autoAssignDeliveryAgent({
          area: prepared.delivery_area,
          fullAddress: prepared.delivery_address,
          slot: prepared.delivery_slot,
          type: 'order',
        });
        if (assigned?.assigned_agent_id) {
          prepared.assigned_agent_id = assigned.assigned_agent_id;
          prepared.delivery_person_name = assigned.delivery_person_name;
          prepared.delivery_person_phone = assigned.delivery_person_phone;
          prepared.estimated_arrival_time = assigned.estimated_arrival_time;
          if (prepared.status === 'pending') prepared.status = 'assigned';
        }
      } catch (e) {
        console.warn('Notice auto-assigning agent for order:', e);
      }
    } else if (table === 'repair_bookings' && !prepared.assigned_agent_id) {
      try {
        const assigned = await autoAssignDeliveryAgent({
          area: prepared.pickup_area,
          fullAddress: prepared.pickup_address,
          slot: prepared.pickup_slot,
          date: prepared.pickup_date,
          type: 'repair',
        });
        if (assigned?.assigned_agent_id) {
          prepared.assigned_agent_id = assigned.assigned_agent_id;
          prepared.pickup_person_name = assigned.pickup_person_name;
          prepared.pickup_person_phone = assigned.pickup_person_phone;
          prepared.technician_name = assigned.pickup_person_name;
          prepared.technician_phone = assigned.pickup_person_phone;
          prepared.estimated_arrival_time = assigned.estimated_arrival_time;
          if (prepared.status === 'pending') prepared.status = 'assigned';
        }
      } catch (e) {
        console.warn('Notice auto-assigning technician:', e);
      }
    }

    preparedItems.push(prepared);
  }

  if (table === 'profiles') {
    throw createHttpError(400, 'Profiles are created through auth registration.');
  }

  // Handle B2B Wholesale Order processing before insert
  if (table === 'wholesale_orders') {
    for (const order of preparedItems) {
      if (order.payment_method === 'credit' && order.vendor_id) {
        try {
          const vendor = await User.findById(order.vendor_id);
          if (vendor) {
            const balanceBefore = vendor.outstanding_balance || 0;
            const balanceAfter = balanceBefore + (order.total_amount || 0);
            await User.findByIdAndUpdate(vendor._id, { outstanding_balance: balanceAfter });

            // Record in VendorLedger
            await VendorLedger.create({
              vendor_id: vendor._id.toString(),
              vendor_name: vendor.business_name || vendor.full_name || order.vendor_name,
              type: 'credit_purchase',
              amount: order.total_amount,
              balance_before: balanceBefore,
              balance_after: balanceAfter,
              reference_order_id: order.id || 'B2B_PURCHASE',
              payment_mode: 'Fundu Credit (Khata)',
              notes: `Credit order placed for ${order.items?.length || 1} device(s)`,
            });
          }
        } catch (err) {
          console.warn('Notice processing wholesale credit ledger:', err);
        }
      }

      // Mark purchased inventory items as sold / decrease stock
      if (Array.isArray(order.items)) {
        for (const it of order.items) {
          if (it.inventory_id) {
            try {
              await WholesaleInventory.findByIdAndUpdate(it.inventory_id, { status: 'sold', $inc: { stock: -1 } });
            } catch (e) {
              console.warn('Notice updating wholesale inventory status:', e);
            }
          }
        }
      }
    }
  }

  // Handle Consumer Order stock reduction
  if (table === 'orders') {
    for (const order of preparedItems) {
      if (Array.isArray(order.items)) {
        for (const it of order.items) {
          const pId = it.product_id || it.id || it._id;
          const qty = Math.max(Number(it.quantity) || 1, 1);
          if (pId) {
            try {
              await Product.findOneAndUpdate(
                { $or: [{ _id: Types.ObjectId.isValid(pId) ? new Types.ObjectId(pId) : null }, { id: pId }] },
                { $inc: { stock: -qty } }
              );
            } catch (err) {
              console.warn('Notice updating product stock for order:', err);
            }
          }
        }
      }
    }
  }

  // Handle Vendor Ledger entries (e.g. Cash repayment from vendor)
  if (table === 'vendor_ledgers' || table === 'vendor_ledger') {
    for (const ledger of preparedItems) {
      if (ledger.type === 'cash_repayment' && ledger.vendor_id) {
        try {
          const vendor = await User.findById(ledger.vendor_id);
          if (vendor) {
            const balanceBefore = vendor.outstanding_balance || 0;
            const balanceAfter = Math.max(0, balanceBefore - (ledger.amount || 0));
            ledger.balance_before = balanceBefore;
            ledger.balance_after = balanceAfter;
            await User.findByIdAndUpdate(vendor._id, { outstanding_balance: balanceAfter });
          }
        } catch (err) {
          console.warn('Notice updating vendor balance on cash repayment:', err);
        }
      } else if (ledger.type === 'credit_limit_set' && ledger.vendor_id) {
        try {
          await User.findByIdAndUpdate(ledger.vendor_id, { credit_limit: ledger.amount, is_b2b_approved: true });
        } catch (err) {
          console.warn('Notice updating vendor credit limit:', err);
        }
      }
    }
  }

  const docs = await Model.insertMany(preparedItems);
  const normalized = normalizeDoc(docs);

  // Background Automated Notification Triggers
  try {
    const docList = Array.isArray(normalized) ? normalized : [normalized];
    for (const doc of docList) {
      if (table === 'orders') {
        triggerEventNotification('order_created', doc);
      } else if (table === 'sell_requests') {
        triggerEventNotification('sell_request_created', doc);
      } else if (table === 'repair_bookings') {
        triggerEventNotification('repair_created', doc);
      } else if (table === 'wholesale_orders') {
        triggerEventNotification('wholesale_order_created', doc);
      } else if (table === 'vendor_ledgers' || table === 'vendor_ledger') {
        triggerEventNotification('vendor_ledger_updated', doc);
      }
    }
  } catch (notifErr) {
    console.warn('Notification trigger notice:', notifErr);
  }

  return single ? normalized[0] ?? null : normalized;
};

/**
 * Trims an update's reply to the columns the client asked for, so saving a
 * small edit does not send a multi-MB document (photos, video) back down.
 * "*" or no selection returns the full document as before.
 */
export const pickSelectedFields = (doc, select) => {
  if (!doc || typeof select !== 'string') return doc;
  const fields = select.split(',').map((field) => field.trim()).filter(Boolean);
  if (fields.length === 0 || fields.includes('*')) return doc;

  const pick = (item) => Object.fromEntries(fields.filter((field) => field in item).map((field) => [field, item[field]]));
  return Array.isArray(doc) ? doc.map(pick) : pick(doc);
};

export const updateTable = async (table, { auth, filters, values, single, select }) => {
  assertDatabaseReady();
  const Model = getModel(table);
  const scope = await getWriteScope(table, auth, filters);
  const payload = preparePayload(table, 'update', values, auth);

  // Order statuses before the write, so stock is restored only on the update that cancels.
  const previousOrderStatus = new Map();
  if (table === 'orders') {
    const before = await Model.find(scope).select('status').lean();
    before.forEach((order) => previousOrderStatus.set(String(order._id), order.status));
  }

  let updatedDoc = null;
  if (single) {
    const doc = await Model.findOneAndUpdate(scope, payload, { new: true, runValidators: false });
    updatedDoc = normalizeDoc(doc);
  } else {
    await Model.updateMany(scope, payload, { runValidators: false });
    const docs = await Model.find(scope);
    updatedDoc = normalizeDoc(docs);
  }

  // Background Status Change & Vendor Commission / Credit Ledger Updates
  try {
    const docList = Array.isArray(updatedDoc) ? updatedDoc : [updatedDoc];
    for (const doc of docList) {
      if (doc) {
        if (table === 'orders') {
          if (doc.status === 'dispatched') triggerEventNotification('order_dispatched', doc);
          else if (doc.status === 'delivered') triggerEventNotification('order_delivered', doc);
          else if (shouldRestoreStock(previousOrderStatus.get(String(doc.id)), doc.status)) {
            // Restore inventory stock for cancelled order items
            if (Array.isArray(doc.items)) {
              for (const it of doc.items) {
                const pId = it.product_id || it.id || it._id;
                const qty = Math.max(Number(it.quantity) || 1, 1);
                if (pId) {
                  try {
                    await Product.findOneAndUpdate(
                      { $or: [{ _id: Types.ObjectId.isValid(pId) ? new Types.ObjectId(pId) : null }, { id: pId }] },
                      { $inc: { stock: qty } }
                    );
                  } catch (err) {
                    console.warn('Notice restoring stock for cancelled order:', err);
                  }
                }
              }
            }
          }
        } else if (table === 'sell_requests') {
          if (doc.status === 'completed' || doc.status === 'picked_up') triggerEventNotification('sell_request_completed', doc);
          await postBuybackToLedger(doc);
        } else if (table === 'repair_bookings') {
          await postRepairToLedger(doc);
        }
      }
    }
  } catch (e) {
    console.warn('Notice on status change notification:', e);
  }

  return pickSelectedFields(updatedDoc, select);
};

export const upsertTable = async (table, { auth, values, single }) => {
  assertDatabaseReady();
  if (table === 'profiles') {
    requireAuth(auth);
    const payload = preparePayload(table, 'upsert', values, auth);
    const targetId = canAdminTable(auth, table) && values?.id ? values.id : auth.sub;
    const doc = await User.findByIdAndUpdate(targetId, payload, { new: true, upsert: false, runValidators: false });
    return normalizeDoc(doc);
  }

  if (table === 'site_content' || table === 'banners') {
    const Model = getModel(table);
    const payload = preparePayload(table, 'upsert', values, auth);
    if (payload.key) {
      const doc = await Model.findOneAndUpdate({ key: payload.key }, payload, { new: true, upsert: true, runValidators: false });
      return normalizeDoc(doc);
    }
  }

  if (table === 'repair_price_configs' || table === 'repair_catalogs') {
    const Model = getModel(table);
    const payload = preparePayload(table, 'upsert', values, auth);
    const match = {
      product_type: payload.product_type || 'smartphone',
      brand: new RegExp(`^${payload.brand?.trim()}$`, 'i'),
      model: new RegExp(`^${payload.model?.trim()}$`, 'i'),
    };
    const doc = await Model.findOneAndUpdate(match, payload, { new: true, upsert: true, runValidators: false, setDefaultsOnInsert: true });
    return normalizeDoc(doc);
  }

  if (table === 'sell_price_configs') {
    requireAuth(auth);
    if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
    const Model = getModel(table);
    const payload = preparePayload(table, 'upsert', values, auth);
    const rawBrand = (payload.brand || '').trim();
    let rawModel = (payload.model || '').trim();
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }
    const brandRegex = new RegExp(`^${rawBrand}$`, 'i');
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped})$`, 'i');
    const match = {
      brand: brandRegex,
      model: modelRegex,
    };
    if (payload.storage) {
      const storageClean = payload.storage.replace(/\s+/g, '\\s*');
      match.storage = new RegExp(`^${storageClean}$`, 'i');
    }
    payload.updated_at = new Date();
    const doc = await Model.findOneAndUpdate(match, payload, { new: true, upsert: true, runValidators: false, setDefaultsOnInsert: true });

    // Synchronize is_active state to master_phones so catalog remains 100% consistent
    if (payload.is_active !== undefined) {
      try {
        const MP = getModel('master_phones');
        await MP.updateMany(
          { brand: brandRegex, model: modelRegex },
          { $set: { is_active: payload.is_active } }
        );
      } catch {}
    }

    return normalizeDoc(doc);
  }

  if (table === 'master_phones' || table === 'phones') {
    requireAuth(auth);
    if (!canAdminTable(auth, table)) throw createHttpError(403, 'Admin access required.');
    const Model = getModel(table);
    const payload = preparePayload(table, 'upsert', values, auth);
    const rawBrand = (payload.brand || '').trim();
    let rawModel = (payload.model || '').trim();
    if (rawBrand && rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
      rawModel = rawModel.slice(rawBrand.length).trim();
    }
    const brandRegex = new RegExp(`^${rawBrand}$`, 'i');
    const modelEscaped = rawModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const modelRegex = new RegExp(`^(${modelEscaped}|${rawBrand}\\s+${modelEscaped})$`, 'i');
    const match = {
      brand: brandRegex,
      model: modelRegex,
    };
    payload.updated_at = new Date();
    const doc = await Model.findOneAndUpdate(match, payload, {
      new: true,
      upsert: true,
      runValidators: false,
      setDefaultsOnInsert: true,
    });
    return normalizeDoc(doc);
  }

  return insertIntoTable(table, { auth, values, single });
};

export const deleteFromTable = async (table, { auth, filters }) => {
  assertDatabaseReady();
  const Model = getModel(table);
  const scope = await getWriteScope(table, auth, filters);
  const result = await Model.deleteMany(scope);
  return { count: result.deletedCount };
};
