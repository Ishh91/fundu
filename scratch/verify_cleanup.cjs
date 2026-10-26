const fs = require('fs');

console.log('=== VERIFYING FINAL CLEANUP ACROSS ALL DATA SOURCES ===');

// 1. MASTER_MODEL_CATALOG
const masterContent = fs.readFileSync('src/data/masterModelCatalog.ts', 'utf8');
const masterMatch = masterContent.match(/export const MASTER_MODEL_CATALOG = (\[[\s\S]*?\]);\s*\nexport const STORAGE_OPTIONS/);
const masterCatalog = eval(masterMatch[1]);
console.log(`\n1. MASTER_MODEL_CATALOG Total Models: ${masterCatalog.length}`);
const lowMaster = masterCatalog.filter(m => {
  const match = (m.storage || '').match(/(\d+)\s*(?:gb|tb)/i);
  return match && parseInt(match[1], 10) <= 32;
});
console.log(`   Models with storage <= 32GB in MASTER_MODEL_CATALOG: ${lowMaster.length}`);
if (lowMaster.length > 0) {
  console.error('   FAILED: Found low storage models:', lowMaster);
} else {
  console.log('   PASSED: 0 models with storage <= 32GB.');
}

// 2. ALL_INDIAN_PHONES_CATALOG
const indianContent = fs.readFileSync('src/data/indianPhonesCatalog.ts', 'utf8');
const indianMatch = indianContent.match(/export const ALL_INDIAN_PHONES_CATALOG: MasterPhone\[\] = (\[[\s\S]*?\]);\s*\n/);
const indianCatalog = eval(indianMatch[1]);
console.log(`\n2. ALL_INDIAN_PHONES_CATALOG Total Models: ${indianCatalog.length}`);
const lowIndian = indianCatalog.filter(m => {
  const storages = (m.storage_options || []).map(s => {
    const match = String(s).match(/(\d+)\s*(?:gb|tb)/i);
    return match ? parseInt(match[1], 10) : 0;
  });
  const maxStorage = Math.max(...storages, 0);
  return maxStorage <= 32;
});
console.log(`   Models with maxStorage <= 32GB in ALL_INDIAN_PHONES_CATALOG: ${lowIndian.length}`);
const hasAnyLowStorage = indianCatalog.filter(m => (m.storage_options || []).some(s => {
  const match = String(s).match(/(\d+)\s*(?:gb|tb)/i);
  return match && parseInt(match[1], 10) <= 32;
}));
console.log(`   Models offering any <= 32GB storage option: ${hasAnyLowStorage.length}`);

// 3. phonesCatalog.json
const serverCatalog = JSON.parse(fs.readFileSync('server/config/phonesCatalog.json', 'utf8'));
console.log(`\n3. server/config/phonesCatalog.json Total Models: ${serverCatalog.length}`);
const lowServer = serverCatalog.filter(m => {
  const s0 = (m.storage_options && m.storage_options[0]) || m.storage || '';
  const match = String(s0).match(/(\d+)\s*(?:gb|tb)/i);
  return match && parseInt(match[1], 10) <= 32;
});
console.log(`   Models with base storage <= 32GB in phonesCatalog.json: ${lowServer.length}`);

// 4. all_models_report.html
const html = fs.readFileSync('scripts/all_models_report.html', 'utf8');
const count32 = (html.match(/badge-storage">32\s*GB<\/span>/gi) || []).length;
const count16 = (html.match(/badge-storage">16\s*GB<\/span>/gi) || []).length;
const count8 = (html.match(/badge-storage">8\s*GB<\/span>/gi) || []).length;
const count4 = (html.match(/badge-storage">4\s*GB<\/span>/gi) || []).length;
console.log(`\n4. scripts/all_models_report.html:`);
console.log(`   32 GB storage badges: ${count32}`);
console.log(`   16 GB storage badges: ${count16}`);
console.log(`   8 GB storage badges: ${count8}`);
console.log(`   4 GB storage badges: ${count4}`);

console.log('\n=== VERIFICATION COMPLETE ===');
