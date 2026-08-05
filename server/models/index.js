import { User } from './User.js';
import { Product } from './Product.js';
import { SparePart } from './SparePart.js';
import { SellRequest } from './SellRequest.js';
import { SellPriceConfig } from './SellPriceConfig.js';
import { RepairBooking } from './RepairBooking.js';
import { Order } from './Order.js';
import { Dispatch } from './Dispatch.js';
import { Review } from './Review.js';
import { SupportTicket } from './SupportTicket.js';

export {
  User,
  Product,
  SparePart,
  SellRequest,
  SellPriceConfig,
  RepairBooking,
  Order,
  Dispatch,
  Review,
  SupportTicket,
};

export const TABLE_MODELS = {
  profiles: User,
  products: Product,
  spare_parts: SparePart,
  sell_requests: SellRequest,
  sell_price_configs: SellPriceConfig,
  repair_bookings: RepairBooking,
  orders: Order,
  dispatches: Dispatch,
  reviews: Review,
  support_tickets: SupportTicket,
};

export const getModel = (table) => {
  const model = TABLE_MODELS[table];
  if (!model) {
    const error = new Error(`Unknown table: ${table}`);
    error.status = 404;
    throw error;
  }
  return model;
};
