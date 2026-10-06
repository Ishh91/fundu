import { MASTER_MODEL_CATALOG } from '../src/pages/SellPhone.tsx';
import { groupModelsBySeries, BRAND_SERIES_DEFINITIONS } from '../src/data/brandSeriesCatalog.ts';

const oppoModels = MASTER_MODEL_CATALOG.filter(m => m.brand.toLowerCase() === 'oppo');
console.log('Oppo models in MASTER_MODEL_CATALOG count:', oppoModels.length);

const series = groupModelsBySeries('oppo', oppoModels);
console.log('Series for Oppo:');
series.forEach(s => {
  console.log(`- Series: ${s.name} (slug: ${s.slug}, id: ${s.id}) -> models count: ${s.models.length}`);
  s.models.forEach(m => console.log(`    * ${m.model}`));
});

const akGroup = series.find(s => s.slug === 'oppo-a-k-series' || s.id === 'oppo-a-k');
console.log('\nFound oppo-a-k-series group:', akGroup ? akGroup.name : 'NOT FOUND');
if (akGroup) {
  console.log('Models in akGroup:', akGroup.models.length);
}
