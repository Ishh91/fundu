import { quotePhone, RESALE_BENCHMARKS } from '../fundu_phone_quote.mjs';
import fs from 'fs';

const cashifyData = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));

const testDevices = [
  { brand: 'Apple', model: 'Apple iPhone 15 Pro Max', storage: '256 GB' },
  { brand: 'Apple', model: 'Apple iPhone 14', storage: '128 GB' },
  { brand: 'Apple', model: 'Apple iPhone 13', storage: '128 GB' },
  { brand: 'Samsung', model: 'Samsung Galaxy S24 Ultra', storage: '256 GB' },
  { brand: 'Samsung', model: 'Samsung Galaxy A14 5G', storage: '64 GB' },
  { brand: 'OnePlus', model: 'OnePlus 12', storage: '256 GB' },
  { brand: 'OnePlus', model: 'OnePlus 12R', storage: '128 GB' },
  { brand: 'Google', model: 'Google Pixel 7a', storage: '128 GB' },
  { brand: 'Vivo', model: 'Vivo V11 Pro', storage: '64 GB' },
];

console.log('========================================================================================');
console.log('LIVE VERIFICATION: FUNDU QUOTE vs CASHIFY BENCHMARK (+1000)');
console.log('========================================================================================');

for (const d of testDevices) {
  const normStorage = d.storage.toLowerCase().replace(/\s+/g, '');
  const cMatch = cashifyData.find(c => 
    c.brand.toLowerCase() === d.brand.toLowerCase() &&
    (c.cleanModel.toLowerCase().includes(d.model.toLowerCase()) || d.model.toLowerCase().includes(c.cleanModel.toLowerCase())) &&
    (c.storage || '').toLowerCase().replace(/\s+/g, '') === normStorage
  );

  const quote = quotePhone({
    brand: d.brand,
    model: d.model,
    storage: d.storage,
    powers_on: true,
    activation_lock_cleared: true,
    ownership_verified: true,
    cosmetic_condition: 'flawless',
    screen_condition: 'flawless',
    body_condition: 'flawless',
    battery_health: 'healthy',
    defects: [],
    accessories: ['Original Box', 'Original Charger', 'Valid Bill'],
  });

  const cashifyPrice = cMatch ? cMatch.cashifyPrice : 'N/A';
  const expectedFunduPrice = cMatch ? cMatch.funduPrice : 'N/A';
  
  console.log(`Model: ${d.brand} ${d.model} (${d.storage})`);
  console.log(`  -> Cashify Price: ₹${cashifyPrice}`);
  console.log(`  -> Fundu Scraped (+1000): ₹${expectedFunduPrice}`);
  console.log(`  -> Fundu Flawless Offer: ₹${quote.offerAmount}`);
  console.log('----------------------------------------------------------------------------------------');
}
