const fs = require('fs');

const phonesCatalog = JSON.parse(fs.readFileSync('server/config/phonesCatalog.json', 'utf8'));
const masterContent = fs.readFileSync('src/data/masterModelCatalog.ts', 'utf8');
const indianContent = fs.readFileSync('src/data/indianPhonesCatalog.ts', 'utf8');

const targets = [
  { name: 'OnePlus Nord CE 5', q: ['nord ce 5', 'nord ce5'] },
  { name: 'OnePlus Nord CE 3', q: ['nord ce 3', 'nord ce3'] },
  { name: 'OnePlus Nord CE 3 Lite', q: ['nord ce 3 lite', 'nord ce3 lite'] },
  { name: 'OnePlus Nord CE 2 Lite', q: ['nord ce 2 lite', 'nord ce2 lite'] },
  { name: 'OnePlus Nord 6', q: ['nord 6'] },
  { name: 'OnePlus Nord 5', q: ['nord 5'] },
  { name: 'Xiaomi 11X Pro', q: ['11x pro', 'mi 11x pro'] },
  { name: 'Samsung Galaxy S26 FE', q: ['s26 fe', 's26fe'] },
  { name: 'Samsung Galaxy Z Flip 8', q: ['flip 8', 'flip8'] },
  { name: 'Samsung Galaxy Z Fold 8', q: ['fold 8', 'fold8'] },
  { name: 'Samsung Galaxy A8', q: ['galaxy a8', ' a8 '] },
];

console.log('=== TARGET MODELS AUDIT ===');
for (const t of targets) {
  const inMaster = t.q.some(query => masterContent.toLowerCase().includes(query.trim()));
  const inIndian = t.q.some(query => indianContent.toLowerCase().includes(query.trim()));
  const inCatalog = phonesCatalog.filter(p => t.q.some(query => p.model.toLowerCase().includes(query.trim())));

  console.log(`${t.name}:`);
  console.log(`  in masterModelCatalog.ts: ${inMaster}`);
  console.log(`  in indianPhonesCatalog.ts: ${inIndian}`);
  console.log(`  in phonesCatalog.json: ${inCatalog.map(p => p.brand + ' ' + p.model).join(', ') || 'NONE'}`);
}
