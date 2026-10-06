import { quotePhone, calculateHardwareVariantMultiplier, computeDynamicBenchmarkProceeds } from '../fundu_phone_quote.mjs';
import assert from 'node:assert';

console.log('=== TESTING DYNAMIC HARDWARE VARIANT PRICING ===\n');

// 1. Test multiplier calculations
const specsTest = [
  { ram: '6 GB', storage: '128 GB', label: '6/128' },
  { ram: '8 GB', storage: '128 GB', label: '8/128' },
  { ram: '6 GB', storage: '256 GB', label: '6/256' },
  { ram: '8 GB', storage: '256 GB', label: '8/256' },
  { ram: '12 GB', storage: '256 GB', label: '12/256' },
  { ram: '12 GB', storage: '512 GB', label: '12/512' },
  { ram: '16 GB', storage: '512 GB', label: '16/512' },
];

console.log('Multipliers for Android Smartphone:');
const mults = specsTest.map((s) => {
  const m = calculateHardwareVariantMultiplier(s.storage, s.ram, 'OnePlus');
  console.log(`- ${s.label.padEnd(8)}: ${m.toFixed(4)}x`);
  return { ...s, mult: m };
});

for (let i = 1; i < mults.length; i++) {
  assert(
    mults[i].mult > mults[i - 1].mult,
    `Expected ${mults[i].label} (${mults[i].mult}) > ${mults[i - 1].label} (${mults[i - 1].mult})`
  );
}
console.log('✔ All multipliers are strictly ascending as RAM & Storage increase!\n');

// 2. Test quotePhone quotes for OnePlus Nord 4
console.log('Testing Fundu quotes for OnePlus Nord 4:');
const quotes = specsTest.map((s) => {
  const res = quotePhone({
    brand: 'OnePlus',
    model: 'OnePlus Nord 4',
    storage: s.storage,
    ram: s.ram,
    powers_on: true,
    activation_lock_cleared: true,
    ownership_verified: true,
    cosmetic_condition: 'good',
    screen_condition: 'flawless',
    body_condition: 'flawless',
    battery_health: 'healthy',
  });
  console.log(`- ${s.label.padEnd(8)} (${s.ram} / ${s.storage}): ₹${res.offerAmount}`);
  return { ...s, offer: res.offerAmount };
});

for (let i = 1; i < quotes.length; i++) {
  assert(
    quotes[i].offer > quotes[i - 1].offer,
    `Expected offer for ${quotes[i].label} (₹${quotes[i].offer}) > ${quotes[i - 1].label} (₹${quotes[i - 1].offer})`
  );
}
console.log('✔ All quotes for OnePlus Nord 4 are strictly differentiated and ascending!\n');

// 3. Test Lenovo K10 Note (64GB 4GB vs 128GB 6GB)
console.log('Testing Lenovo K10 Note variants:');
const lenovo4_64 = quotePhone({
  brand: 'Lenovo',
  model: 'Lenovo K10 Note',
  storage: '64 GB',
  ram: '4 GB',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
});
const lenovo6_128 = quotePhone({
  brand: 'Lenovo',
  model: 'Lenovo K10 Note',
  storage: '128 GB',
  ram: '6 GB',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
});
console.log(`- 4 GB / 64 GB  : ₹${lenovo4_64.offerAmount}`);
console.log(`- 6 GB / 128 GB : ₹${lenovo6_128.offerAmount}`);
assert(lenovo6_128.offerAmount > lenovo4_64.offerAmount, '128GB/6GB should exceed 64GB/4GB');
console.log('✔ Lenovo K10 Note variant differentiation verified!\n');

// 4. Test Oppo Reno 12 variants
console.log('Testing Oppo Reno 12 variants:');
const oppo8_128 = quotePhone({
  brand: 'Oppo',
  model: 'Oppo Reno 12',
  storage: '128 GB',
  ram: '8 GB',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
});
const oppo8_256 = quotePhone({
  brand: 'Oppo',
  model: 'Oppo Reno 12',
  storage: '256 GB',
  ram: '8 GB',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
});
const oppo12_256 = quotePhone({
  brand: 'Oppo',
  model: 'Oppo Reno 12',
  storage: '256 GB',
  ram: '12 GB',
  powers_on: true,
  activation_lock_cleared: true,
  ownership_verified: true,
});
console.log(`- 8 GB / 128 GB : ₹${oppo8_128.offerAmount}`);
console.log(`- 8 GB / 256 GB : ₹${oppo8_256.offerAmount}`);
console.log(`- 12 GB / 256 GB: ₹${oppo12_256.offerAmount}`);

assert(oppo8_256.offerAmount > oppo8_128.offerAmount, '8/256 > 8/128');
assert(oppo12_256.offerAmount > oppo8_256.offerAmount, '12/256 > 8/256');
console.log('✔ Oppo Reno 12 8/128 vs 8/256 vs 12/256 strictly verified!\n');

console.log('🎉 ALL DYNAMIC VARIANT TESTS PASSED PERFECTLY!');
