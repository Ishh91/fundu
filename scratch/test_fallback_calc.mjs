import { getDynamicFallbackConfig } from '../src/lib/mobileApi.ts';
import { ALL_INDIAN_PHONES_CATALOG } from '../src/data/indianPhonesCatalog.ts';
import { MASTER_MODEL_CATALOG } from '../src/data/masterModelCatalog.ts';

const brand = 'Apple';
const model = 'Apple iPhone 16 Pro';
const storage = '128 GB';

// Check what master/indian/dynamic fallback gave:
const modelNorm = model.toLowerCase().trim();
const brandNorm = brand.toLowerCase().trim();

const master = MASTER_MODEL_CATALOG.find((m) =>
  m.model.toLowerCase() === modelNorm ||
  `${m.brand} ${m.model}`.toLowerCase() === `${brandNorm} ${modelNorm}` ||
  m.model.toLowerCase().includes(modelNorm)
);

console.log('Master found:', master);

const fallback = getDynamicFallbackConfig(brand, model, storage);
console.log('Fallback config:', fallback);
