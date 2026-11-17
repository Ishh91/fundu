import mongoose from 'mongoose';
import { PricingRules } from '../models/PricingRules.js';
import { createPricingRulesService } from './pricingRulesService.js';

/** The quote rules service for this server, on the real database. */
export const pricingRules = createPricingRulesService({
  model: PricingRules,
  isReady: () => mongoose.connection.readyState === 1,
});
