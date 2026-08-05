import mongoose from 'mongoose';
import { createSchema } from './baseSchema.js';

const sellRequestSchema = createSchema({
  user_id: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  ram: { type: String, default: null },
  storage: { type: String, default: null },
  condition: { type: String, required: true },
  imei: { type: String, default: null },
  accessories: { type: [String], default: [] },
  estimated_price: { type: Number, default: null },
  final_price: { type: Number, default: null },
  status: { type: String, default: 'pending' },
  pickup_address: { type: String, default: null },
  pickup_date: { type: String, default: null },
  pickup_slot: { type: String, default: null },
  notes: { type: String, default: null },
  pickup_person_name: { type: String, default: null },
  pickup_person_phone: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const SellRequest = mongoose.models.SellRequest || mongoose.model('SellRequest', sellRequestSchema);
