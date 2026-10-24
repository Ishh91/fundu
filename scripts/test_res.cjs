const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('server/config/phonesCatalog.json', 'utf8'));

function resolve(rawBrand, rawModel) {
  const bNorm = (rawBrand || '').toLowerCase().trim();
  let mNorm = (rawModel || '').toLowerCase().trim();
  mNorm = mNorm.replace(/^(sell-old-|old-sell-|sell-|old-|used-)+/g, '').replace(/^(sell\s+|old\s+|used\s+)+/g, '').trim();
  if (bNorm && mNorm.startsWith(bNorm)) mNorm = mNorm.slice(bNorm.length).trim();
  const stripped = mNorm.replace(/[\s-]+/g, '');
  return catalog.find(p => {
    const pb = (p.brand || '').toLowerCase().trim();
    if (pb !== bNorm && !bNorm.includes(pb)) return false;
    let pm = (p.model || '').toLowerCase().trim();
    if (pb && pm.startsWith(pb)) pm = pm.slice(pb.length).trim();
    const pStripped = pm.replace(/[\s-]+/g, '');
    return pStripped === stripped || pm === mNorm;
  });
}

console.log('Resolved:', resolve('Samsung', 'Sell Samsung Galaxy Z Flip 4'));
