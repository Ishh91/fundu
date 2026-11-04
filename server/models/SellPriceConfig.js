import mongoose from 'mongoose';
import { createSchema } from './baseSchema.js';

const sellPriceConfigSchema = createSchema({
  brand: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true, index: true },
  storage: { type: String, default: null, trim: true },
  base_price: { type: Number, required: true },
  excellent_multiplier: { type: Number, default: 0.7 },
  good_multiplier: { type: Number, default: 0.55 },
  fair_multiplier: { type: Number, default: 0.4 },
  box_bonus: { type: Number, default: 500 },
  charger_bonus: { type: Number, default: 300 },
  is_active: { type: Boolean, default: true, index: true },
  is_locked: { type: Boolean, default: false },
  manual_override: { type: Boolean, default: false },
  image_url: { type: String, default: null },
  custom_image: { type: Boolean, default: false, index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// High-speed compound indexes for 0ms price lookups
sellPriceConfigSchema.index({ brand: 1, model: 1, storage: 1 });
sellPriceConfigSchema.index({ brand: 1, model: 1, is_active: 1 });
sellPriceConfigSchema.index({ is_active: 1, updated_at: -1 });

export const SellPriceConfig = mongoose.models.SellPriceConfig || mongoose.model('SellPriceConfig', sellPriceConfigSchema);
