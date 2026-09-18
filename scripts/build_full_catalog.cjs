const fs = require('fs');

// We have the raw MobileAPI data in scripts/api_fetched_devices.json
const rawMobileApi = JSON.parse(fs.readFileSync('scripts/api_fetched_devices.json', 'utf8'));

console.log('Building full catalog from MobileAPI data and verified specifications...');
