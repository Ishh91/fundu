import { quotePhone, RESALE_BENCHMARKS, lookupResaleBenchmark } from '../fundu_phone_quote.mjs';

console.log('Testing raw quotePhone for iPhone 16 Pro:');
const b = lookupResaleBenchmark('Apple', 'iPhone 16 Pro', '128 GB');
console.log('Benchmark result:', b);

const qFlawless = quotePhone({
  brand: 'Apple',
  model: 'iPhone 16 Pro',
  storage: '128 GB',
  cosmetic_condition: 'flawless',
  powers_on: true,
  accessories: ['Original Box', 'Original Charger']
});
console.log('qFlawless:', qFlawless.offerAmount);

const qGood = quotePhone({
  brand: 'Apple',
  model: 'iPhone 16 Pro',
  storage: '128 GB',
  cosmetic_condition: 'good',
  powers_on: true,
  accessories: ['Original Box', 'Original Charger']
});
console.log('qGood:', qGood.offerAmount);
