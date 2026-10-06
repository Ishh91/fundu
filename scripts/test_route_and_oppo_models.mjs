import { groupModelsBySeries, isSeriesSlug, BRAND_SERIES_DEFINITIONS } from '../src/data/brandSeriesCatalog.ts';
import { MASTER_MODEL_CATALOG } from '../src/pages/SellPhone.tsx';

console.log('Testing Oppo A & K Series resolution:');
const oppoModels = MASTER_MODEL_CATALOG.filter(m => m.brand.toLowerCase() === 'oppo');
console.log('Total Oppo models in catalog:', oppoModels.length);

const seriesGroups = groupModelsBySeries('oppo', oppoModels);
console.log('Oppo series groups:');
seriesGroups.forEach(g => {
  console.log(`- Series: ${g.name} (slug: ${g.slug}) => ${g.models.length} models`);
});

const targetSeries = seriesGroups.find(g => g.slug === 'oppo-a-k-series');
if (targetSeries && targetSeries.models.length > 0) {
  console.log('✅ PASS: oppo-a-k-series resolved with ' + targetSeries.models.length + ' models:');
  targetSeries.models.forEach(m => console.log('   * ' + m.model));
} else {
  console.error('❌ FAIL: oppo-a-k-series has 0 models');
  process.exit(1);
}

// Test Infinix Zero series
const infinixSeries = groupModelsBySeries('infinix', MASTER_MODEL_CATALOG.filter(m => m.brand.toLowerCase() === 'infinix'));
const zeroGroup = infinixSeries.find(g => g.slug === 'infinix-zero-series');
if (zeroGroup && zeroGroup.models.length > 0) {
  console.log('\n✅ PASS: infinix-zero-series resolved with ' + zeroGroup.models.length + ' models:');
  zeroGroup.models.forEach(m => console.log('   * ' + m.model));
} else {
  console.error('❌ FAIL: infinix-zero-series has 0 models');
  process.exit(1);
}
