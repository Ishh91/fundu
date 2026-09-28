const fs = require('fs');
const path = require('path');

const targetReplacements = [
  // BrandLogo
  ['<span className="hidden sm:inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">\n          LUCKNOW\n        </span>', ''],
  ['LUCKNOW', 'DOORSTEP'],

  // CustomerDetailsModal
  ['Complete Doorstep Address (Lucknow)', 'Complete Doorstep Address'],

  // PopularBrands & SellFlow
  ['Lucknow Doorstep Service', 'Doorstep Express Service'],
  ['Lucknow repair guarantees', 'Repair guarantees'],
  ['Free Same-Day Lucknow Delivery', 'Free Same-Day Doorstep Delivery'],
  ['Lucknow doorstep customer support', 'dedicated doorstep customer support'],

  // Trust & Testimonials
  ['Verified Lucknow Rating', 'Verified Customer Rating'],
  ['DEFAULT_LUCKNOW_TESTIMONIALS', 'DEFAULT_TESTIMONIALS'],
  ['Verified Lucknow Feedback', 'Verified Customer Feedback'],
  ['Why Lucknow Trusts Fundu Over Local Shops', 'Why Customers Trust Fundu Over Local Shops'],

  // LiveExecutiveTracker
  ['Hazratganj, Central Lucknow', 'Hazratganj, Central Zone'],
  ['Gomti Nagar, East Lucknow', 'Gomti Nagar, East Zone'],
  ['Aliganj, North Lucknow', 'Aliganj, North Zone'],
  ['Ashiyana, South Lucknow', 'Ashiyana, South Zone'],
  ['Chowk, Old Lucknow', 'Chowk, Old City Zone'],
  ['Rajajipuram, West Lucknow', 'Rajajipuram, West Zone'],
  ['📍 Lucknow Central Hub', '📍 Central Service Hub'],
  ['Direct support from Lucknow Central Desk', 'Direct support from Central Service Desk'],
  ['LUCKNOW_GEO', 'SERVICE_GEO'],
  ['Live Lucknow Visual Map Canvas', 'Live Visual Map Canvas'],

  // Navbar & Locality
  ['title="Fundu services Lucknow"', 'title="Fundu Doorstep Services"'],
  ['Fundu is exclusively operational across Lucknow', 'Fundu delivers doorstep service across all active service areas'],
  ['7 Lucknow Store & Pickup Hubs', '7 Store & Pickup Hubs'],
  ['Free doorstep pickup across Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar & all Lucknow!', 'Free doorstep pickup across all active service zones!'],
  ['across Gomti Nagar, Hazratganj & all Lucknow.', 'across all major service zones.'],

  // Admin pages
  ['Lucknow Delivery Fleet', 'Delivery Fleet'],
  ['Lucknow Dispatch Fleet', 'Dispatch Fleet'],
  ['Primary Lucknow Operational Zone', 'Primary Operational Zone'],
  ['Exclusive entry for Lucknow Central Operations & Catalog Management', 'Exclusive entry for Central Operations & Catalog Management'],
  ['<span>Lucknow Central Hub · </span>', '<span>Central Hub · </span>'],
  ['Private workspace for Lucknow doorstep inspection & delivery executives.', 'Private workspace for doorstep inspection & delivery executives.'],
  ['Lucknow Doorstep Device Inspection & Express Pickups', 'Doorstep Device Inspection & Express Pickups'],
  ['Lucknow Coverage', 'Service Coverage'],
  ['Verified Lucknow Testimonials & Reviews', 'Verified Customer Testimonials & Reviews'],

  // Order Success
  ['Lucknow Order Confirmed', 'Order Confirmed'],
  ['Our Lucknow doorstep delivery team is preparing your package.', 'Our doorstep delivery team is preparing your package.'],
  ['Help other Lucknow shoppers by rating your service', 'Help other shoppers by rating your service'],

  // BuyPhones
  ['our Lucknow technician', 'our certified technician'],
  ['Certified Refurbished Marketplace · Lucknow', 'Certified Refurbished Marketplace'],
  ['Free Lucknow Delivery', 'Free Doorstep Delivery'],

  // ProductDetail
  ['LUCKNOW_PINCODE_MAP', 'SERVICE_PINCODE_MAP'],
  ['Chowk / Old Lucknow', 'Chowk / Old City'],
  ['local Lucknow database', 'local service database'],

  // Repair
  ['Lucknow Express', 'Express Service'],
  ['Lucknow Doorstep Repair Center', 'Doorstep Repair Center'],
  ['Lucknow Doorstep Repair', 'Doorstep Repair'],
  ['Schedule Lucknow Doorstep Repair', 'Schedule Doorstep Repair'],
  ['Lucknow Repair Area / Locality', 'Repair Area / Locality'],
  ['preferred date & Lucknow location', 'preferred date & location'],
  ['Free Lucknow Doorstep Visit', 'Free Doorstep Visit'],

  // SearchActionPage
  ['Free Lucknow Doorstep Service', 'Free Doorstep Service'],
  ['free Lucknow doorstep pickup', 'free doorstep pickup'],
  ['same-day Lucknow delivery', 'same-day doorstep delivery'],

  // SellBrandPage & SellPhone
  ['call our Lucknow helpline', 'call our customer helpline'],
  ['live Lucknow market demand', 'live market demand'],
  ['real-time Lucknow resale market demand', 'real-time resale market demand'],
  ['contact our Lucknow hotline', 'contact our customer hotline'],
  ['Fundu - Sell Old Mobile Phone Lucknow', 'Fundu - Sell Old Mobile Phone'],
  ['What Lucknow Sellers Say', 'What Verified Sellers Say'],
  ['(12,400+ Verified Lucknow Deals)', '(12,400+ Verified Deals)'],
  ['Pre-Approved Spot Cash Valuation · Lucknow', 'Pre-Approved Spot Cash Valuation'],
  ['Schedule Lucknow Doorstep Pickup', 'Schedule Doorstep Pickup'],
  ['Select Lucknow Locality / Cluster', 'Select Locality / Cluster'],

  // Vendor
  ['Lucknow Mobile Vendor', 'Partner Mobile Vendor'],
  ['Lucknow Partner Store', 'Official Partner Store'],
  ['Lucknow Mobile Buyback & Repair Network', 'Mobile Buyback & Repair Network'],
  ['Official Vendor Hub · Lucknow', 'Official Vendor Hub'],
  ['Lucknow Vendor Limit & Wallet', 'Vendor Limit & Wallet'],
  ['Lucknow Mobile Buyback & Repair Service Hub', 'Mobile Buyback & Repair Service Hub'],
  ['Lucknow Vendor Network · ', 'Partner Vendor Network · '],

  // Server
  ['Fundu Admin (Lucknow)', 'Fundu Admin'],
  ['Rohit Verma (Lucknow Fleet)', 'Rohit Verma (Delivery Fleet)'],
  ['Lucknow Doorstep Security', 'Doorstep Security'],
  ['DEFAULT_LUCKNOW_AGENTS', 'DEFAULT_AGENTS'],
  ['default Lucknow delivery field executives', 'default delivery field executives'],
  ['Lucknow doorstep delivery & pickup operations', 'doorstep delivery & pickup operations'],
  ['Lucknow Localized Copy', 'Localized Copy'],
  ['Please be available at your Lucknow doorstep.', 'Please be available at your doorstep.'],
  ['Fundu B2B Lucknow', 'Fundu B2B'],
  ['auto-assign delivery / pickup executive for Lucknow', 'auto-assign delivery / pickup executive'],
  ['delivery / pickup executive for Lucknow', 'delivery / pickup executive']
];

function processFile(filePath) {
  if (!/\.(tsx|ts|jsx|js|html)$/i.test(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [pattern, replacement] of targetReplacements) {
    if (typeof pattern === 'string') {
      content = content.split(pattern).join(replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
  }

  // Any remaining loose "Lucknow" words in JSX/text (excluding variable names)
  content = content.replace(/(?<![_a-zA-Z])Lucknow(?![_a-zA-Z])/g, 'Doorstep');
  content = content.replace(/(?<![_a-zA-Z])lucknow(?![_a-zA-Z])/g, 'doorstep');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'scripts'].includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full);
    else processFile(full);
  }
}

walk('src');
walk('server');
console.log('Finished deep sweep of Lucknow.');
