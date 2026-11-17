import mongoose from 'mongoose';
import { createSchema } from './baseSchema.js';

// One document per saved set of quote rules (see fundu_pricing_rules.mjs).
//   draft     - the one set being edited; it never prices a quote.
//   published - the set every quote uses now (the highest version).
//   archived  - an earlier published set, kept so it can be rolled back to.
const pricingRulesSchema = createSchema({
  version: { type: Number, default: null, index: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], required: true, index: true },
  rules: { type: mongoose.Schema.Types.Mixed, required: true },
  note: { type: String, default: '', trim: true, maxlength: 300 },
  based_on_version: { type: Number, default: null },
  updated_by: { type: String, default: '' },
  published_by: { type: String, default: '' },
  published_at: { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

pricingRulesSchema.index({ status: 1, version: -1 });

export const PricingRules = mongoose.models.PricingRules || mongoose.model('PricingRules', pricingRulesSchema);
