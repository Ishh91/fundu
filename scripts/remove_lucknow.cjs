const fs = require('fs');
const path = require('path');

const replacements = [
  // 1. Brand & Title variations
  [/Fundu Lucknow Rider/g, 'Fundu Rider'],
  [/fundu lucknow rider/gi, 'Fundu Rider'],
  [/Fundu Lucknow/g, 'Fundu'],
  [/fundu lucknow/gi, 'Fundu'],
  [/Fundu is Lucknow's/g, 'Fundu is a premier'],
  [/Fundu is Lucknow’s/g, 'Fundu is a premier'],
  [/Lucknow's/g, 'Our'],
  [/Lucknow’s/g, 'Our'],

  // 2. Pricing & Quotes
  [/GUARANTEED LUCKNOW PAYOUT QUOTE/g, 'GUARANTEED PAYOUT QUOTE'],
  [/Guaranteed Lucknow Payout Quote/g, 'Guaranteed Payout Quote'],
  [/Lucknow Payout Quote/g, 'Payout Quote'],
  [/Price match guarantee across Lucknow/g, 'Price match guarantee at your doorstep'],
  [/price match guarantee across Lucknow/g, 'price match guarantee at your doorstep'],

  // 3. Warranty & Stock
  [/6 Months Warranty in Lucknow/g, '6 Months Replacement Warranty'],
  [/6 months warranty in Lucknow/g, '6 months replacement warranty'],
  [/6 Months replacement warranty in Lucknow/g, '6 Months replacement warranty'],
  [/warranty in Lucknow/g, 'replacement warranty'],
  [/Warranty in Lucknow/g, 'Replacement Warranty'],
  [/Lucknow Certified Warehouse Stock/g, 'Certified Warehouse Stock'],
  [/Lucknow Stock Ready/g, 'Stock Ready'],
  [/Lucknow Stock/g, 'Certified Stock'],
  [/Stock in Lucknow/g, 'Certified Stock'],

  // 4. Pickup & Service
  [/Free Lucknow Pickup/g, 'Free Doorstep Pickup'],
  [/free Lucknow pickup/g, 'free doorstep pickup'],
  [/Free Lucknow Doorstep Pickup/g, 'Free Doorstep Pickup'],
  [/Lucknow Pickup/g, 'Doorstep Pickup'],
  [/Lucknow pickup/g, 'Doorstep pickup'],
  [/Lucknow Free Delivery/g, 'Free Doorstep Delivery'],
  [/Free Delivery in Lucknow/g, 'Free Doorstep Delivery'],
  [/delivery in Lucknow/g, 'doorstep delivery'],
  [/Delivery in Lucknow/g, 'Doorstep Delivery'],
  [/7 Lucknow Store & Pickup Hubs/g, '7 Store & Pickup Hubs'],
  [/7 Lucknow Store/g, '7 Store'],
  [/Select Your Lucknow Area/g, 'Select Your Area'],
  [/Select your Lucknow area/g, 'Select your area'],
  [/Select Your Lucknow Localities/g, 'Select Your Area'],
  [/Lucknow Localities Covered/g, 'Service Localities Covered'],
  [/Lucknow Localities/g, 'Service Localities'],
  [/Services in Lucknow/g, 'Our Services'],
  [/services in Lucknow/g, 'our services'],
  [/across all 16 Lucknow zones/g, 'across all service zones'],
  [/across all Lucknow localities/g, 'across all service localities'],
  [/across all Lucknow pin codes/g, 'across all service pin codes'],
  [/across all Lucknow/g, 'across all service areas'],
  [/all Lucknow pin codes/g, 'all supported pin codes'],
  [/across Lucknow/g, 'at your doorstep'],
  [/Across Lucknow/g, 'At Your Doorstep'],
  [/ACROSS LUCKNOW/g, 'AT YOUR DOORSTEP'],
  [/Lucknow Support Desk/g, 'Support Desk'],
  [/Lucknow support desk/g, 'support desk'],
  [/Lucknow support team/g, 'support team'],
  [/Lucknow customers/g, 'customers'],
  [/Lucknow customer/g, 'customer'],
  [/Lucknow service hubs/g, 'service hubs'],
  [/Lucknow Service Hubs/g, 'Service Hubs'],
  [/Lucknow flagship/g, 'flagship store'],
  [/Lucknow Flagship/g, 'Flagship Store'],
  [/Lucknow Super Hub/g, 'Super Hub'],
  [/Lucknow exclusive hub/g, 'exclusive hub'],
  [/Lucknow Exclusive Hub/g, 'Exclusive Hub'],
  [/Lucknow Exclusive/g, 'Exclusive'],
  [/Lucknow exclusive/g, 'exclusive'],
  [/Lucknow Address/g, 'Doorstep Address'],
  [/Lucknow address/g, 'doorstep address'],
  [/Lucknow Area/g, 'Service Area'],
  [/Lucknow area/g, 'service area'],
  [/Lucknow agent/g, 'service agent'],
  [/Lucknow Agent/g, 'Service Agent'],
  [/Lucknow rider/g, 'delivery rider'],
  [/Lucknow Rider/g, 'Delivery Rider'],
  [/Lucknow executive/g, 'pickup executive'],
  [/Lucknow Executive/g, 'Pickup Executive'],
  [/Lucknow pin code/g, 'pin code'],
  [/Lucknow PIN Code/g, 'PIN Code'],
  [/Lucknow pin codes/g, 'pin codes'],
  [/Lucknow PIN codes/g, 'PIN codes'],
  [/Lucknow Store/g, 'Store Hub'],
  [/Lucknow store/g, 'store hub'],
  [/Lucknow hub/g, 'service hub'],
  [/Lucknow Hub/g, 'Service Hub'],
  [/Lucknow operations/g, 'doorstep operations'],
  [/Lucknow Operations/g, 'Doorstep Operations'],

  // 5. Questions / Specific copy
  [/selling my phone in Lucknow/g, 'selling my phone'],
  [/selling your phone in Lucknow/g, 'selling your phone'],
  [/selling old mobiles in Lucknow/g, 'selling old mobiles'],
  [/sell old phones in Lucknow/g, 'sell old phones'],
  [/Sell old phones in Lucknow/g, 'Sell old phones'],
  [/mobile repair in Lucknow/g, 'doorstep mobile repair'],
  [/Mobile repair in Lucknow/g, 'Doorstep mobile repair'],
  [/Mobile Repair in Lucknow/g, 'Doorstep Mobile Repair'],
  [/repair in Lucknow/g, 'doorstep repair'],
  [/Repair in Lucknow/g, 'Doorstep Repair'],
  [/buy refurbished iPhone in Lucknow/g, 'buy refurbished iPhone'],
  [/buy refurbished iPhones in Lucknow/g, 'buy refurbished iPhones'],
  [/buy refurbished phones in Lucknow/g, 'buy refurbished phones'],
  [/refurbished iPhones in Lucknow/g, 'refurbished iPhones'],
  [/refurbished devices in Lucknow/g, 'refurbished devices'],
  [/refurbished smartphones in Lucknow/g, 'refurbished smartphones'],
  [/refurbished tech in Lucknow/g, 'refurbished tech'],

  // 6. Generic "in Lucknow" / ", Lucknow"
  [/, Lucknow, Uttar Pradesh/g, ', Uttar Pradesh'],
  [/, Lucknow/g, ''],
  [/in Lucknow/g, 'at your doorstep'],
  [/In Lucknow/g, 'At Your Doorstep'],
  [/IN LUCKNOW/g, 'AT YOUR DOORSTEP']
];

function processFile(filePath) {
  if (!/\.(tsx|ts|jsx|js|json)$/i.test(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  // Specific fix for route /mobile-repair-in-lucknow -> /mobile-repair
  content = content.replace(/\/mobile-repair-in-lucknow/g, '/mobile-repair');

  // Specific fix for localStorage key or default text:
  content = content.replace(/['"]Lucknow['"]/g, "'Doorstep Service'");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist'].includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full);
    else processFile(full);
  }
}

walk('src');
walk('server');
console.log('Finished sweeping Lucknow from src and server.');
