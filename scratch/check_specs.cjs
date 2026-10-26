const fs = require('fs');
const content = fs.readFileSync('src/lib/deviceSpecs.ts', 'utf8');

const regexMatches = content.match(/pattern:\s*\/[^\n]+\/i,\s*variants:\s*\[[\s\S]*?\]/g) || [];
console.log('Total rules in deviceSpecs.ts:', regexMatches.length);

const lowRules = regexMatches.filter(r => {
  return r.includes('32 GB') || r.includes('16 GB') || r.includes('8 GB') || r.includes('4 GB');
});
console.log('Rules mentioning <=32GB:', lowRules.length);
lowRules.forEach(r => console.log(r.slice(0, 150) + '...\n'));
