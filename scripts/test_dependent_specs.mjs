import { getModelHardwareSpecs } from '../src/lib/deviceSpecs.ts';
import assert from 'node:assert';

console.log('=== TESTING DEPENDENT HARDWARE SPECS (STORAGE <-> RAM) ===\n');

// 1. OnePlus Nord 4
const opNord4 = getModelHardwareSpecs('OnePlus', 'OnePlus Nord 4');
console.log('OnePlus Nord 4:');
console.log('  Available storages:', opNord4.storages);
const nord4_128_rams = opNord4.getRamsForStorage('128 GB');
const nord4_256_rams = opNord4.getRamsForStorage('256 GB');
console.log('  RAMs for 128 GB:', nord4_128_rams);
console.log('  RAMs for 256 GB:', nord4_256_rams);

assert.deepStrictEqual(nord4_128_rams, ['8 GB'], '128GB on Nord 4 must only have 8GB');
assert.deepStrictEqual(nord4_256_rams, ['8 GB', '12 GB'], '256GB on Nord 4 must have 8GB and 12GB');
console.log('✔ OnePlus Nord 4 passed!\n');

// 2. Lenovo K10 Note
const lenovoK10 = getModelHardwareSpecs('Lenovo', 'Lenovo K10 Note');
console.log('Lenovo K10 Note:');
console.log('  Available storages:', lenovoK10.storages);
const k10_64_rams = lenovoK10.getRamsForStorage('64 GB');
const k10_128_rams = lenovoK10.getRamsForStorage('128 GB');
console.log('  RAMs for 64 GB:', k10_64_rams);
console.log('  RAMs for 128 GB:', k10_128_rams);

assert.deepStrictEqual(k10_64_rams, ['4 GB'], '64GB on K10 Note must only have 4GB');
assert.deepStrictEqual(k10_128_rams, ['6 GB'], '128GB on K10 Note must only have 6GB');
console.log('✔ Lenovo K10 Note passed!\n');

// 3. Apple iPhone 16 Pro
const ip16Pro = getModelHardwareSpecs('Apple', 'iPhone 16 Pro');
console.log('iPhone 16 Pro:');
console.log('  Available storages:', ip16Pro.storages);
const ip_rams = ip16Pro.getRamsForStorage('128 GB');
console.log('  RAMs for 128 GB:', ip_rams);

assert.deepStrictEqual(ip_rams, [], 'Apple must have 0 RAM options');
console.log('✔ Apple iPhone passed!\n');

// 4. Nothing Phone (2)
const nothing2 = getModelHardwareSpecs('Nothing', 'Nothing Phone (2)');
console.log('Nothing Phone (2):');
console.log('  Available storages:', nothing2.storages);
const np2_128_rams = nothing2.getRamsForStorage('128 GB');
const np2_256_rams = nothing2.getRamsForStorage('256 GB');
console.log('  RAMs for 128 GB:', np2_128_rams);
console.log('  RAMs for 256 GB:', np2_256_rams);

assert.deepStrictEqual(np2_128_rams, ['8 GB'], '128GB on Nothing 2 must only have 8GB');
assert.deepStrictEqual(np2_256_rams, ['12 GB'], '256GB on Nothing 2 must only have 12GB');
console.log('✔ Nothing Phone (2) passed!\n');

console.log('🎉 ALL DEPENDENT HARDWARE SPECS TESTS PASSED!');
