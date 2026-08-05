import mongoose from 'mongoose';
import { createSchema } from './baseSchema.js';

const orderSchema = createSchema({
  user_id: { type: String, required: true },
  product_id: { type: String, default: null },
  spare_part_id: { type: String, default: null },
  quantity: { type: Number, default: 1 },
  total_amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  payment_method: { type: String, default: null },
  payment_status: { type: String, default: 'pending' },
  delivery_address: { type: String, default: null },
  delivery_name: { type: String, default: null },
  delivery_phone: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
