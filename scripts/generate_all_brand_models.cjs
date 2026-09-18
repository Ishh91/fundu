const fs = require('fs');

// Read raw fetched MobileAPI devices
const rawApi = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

console.log('MobileAPI loaded. Analyzing models...');

// Print unique phone names per brand from MobileAPI
for (const [brand, list] of Object.entries(rawApi)) {
  const names = Array.from(new Set(
    list
      .filter(d => !/\b(watch|pad|band|buds|airpods|tv|tablet)\b/i.test(d.name))
      .map(d => d.name)
  ));
  console.log(`\n=== ${brand} from MobileAPI (${names.length} models) ===`);
  console.log(names.slice(0, 15).join(', '));
}
