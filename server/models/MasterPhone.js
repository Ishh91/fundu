import mongoose from 'mongoose';
import { createSchema } from './baseSchema.js';

const masterPhoneSchema = createSchema({
  brand: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true, index: true },
  release_year: { type: Number, required: true, index: true },
  ram_options: { type: [String], default: ['4GB', '6GB', '8GB'] },
  storage_options: { type: [String], default: ['64GB', '128GB', '256GB'] },
  default_mrp: { type: Number, default: 29999 },
  base_resale_value: { type: Number, default: 12999 },
  image_url: { type: String, default: null },
  video_url: { type: String, default: null },
  custom_image: { type: Boolean, default: false, index: true },
  popular_tag: { type: String, default: null },
  processor: { type: String, default: null },
  camera_spec: { type: String, default: null },
  battery_spec: { type: String, default: null },
  display_spec: { type: String, default: null },
  is_5g: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true, index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// High-speed compound indexes for instant brand and model lookups
masterPhoneSchema.index({ brand: 1, model: 1, is_active: 1 });
masterPhoneSchema.index({ brand: 1, is_active: 1 });
masterPhoneSchema.index({ is_active: 1, updated_at: -1 });

export const MasterPhone = mongoose.models.MasterPhone || mongoose.model('MasterPhone', masterPhoneSchema);
