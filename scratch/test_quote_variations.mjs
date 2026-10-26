import { quotePhone, lookupResaleBenchmark, RESALE_BENCHMARKS } from '../fundu_phone_quote.mjs';

const testModels = [
  'iPhone 16 Pro',
  'Apple iPhone 16 Pro',
  '16 Pro',
  'iPhone 16',
  'iPhone 15 Pro'
];

for (const m of testModels) {
  const qFlawless = quotePhone({
    brand: 'Apple',
    model: m,
    storage: '128 GB',
    cosmetic_condition: 'flawless',
    powers_on: true,
    accessories: ['Original Box', 'Original Charger']
  });
  const qGood = quotePhone({
    brand: 'Apple',
    model: m,
    storage: '128 GB',
    cosmetic_condition: 'good',
    powers_on: true,
    accessories: ['Original Box', 'Original Charger']
  });
  console.log(`Model: "${m}" -> Flawless: ${qFlawless.offerAmount}, Good: ${qGood.offerAmount}`);
}
