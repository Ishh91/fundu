const fs = require('fs');
const path = require('path');

console.log('--- STARTING CATALOG CLEANUP (REMOVING <= 3/32 MODELS) ---');

// Helper to check if a storage string is <= 32GB
function isStorageLow(str) {
  if (!str) return false;
  const m = String(str).match(/(\d+)\s*(?:gb|tb)/i);
  if (!m) return false;
  const num = parseInt(m[1], 10);
  const unit = (m[2] || 'gb').toLowerCase();
  if (unit === 'tb') return false;
  return num <= 32;
}

// ========================================================
// 1. UPDATE src/data/masterModelCatalog.ts
// ========================================================
const masterPath = path.resolve('src/data/masterModelCatalog.ts');
let masterContent = fs.readFileSync(masterPath, 'utf8');

// Extract MASTER_MODEL_CATALOG
const masterMatch = masterContent.match(/export const MASTER_MODEL_CATALOG = (\[[\s\S]*?\]);\s*\nexport const STORAGE_OPTIONS/);
if (!masterMatch) {
  throw new Error('Could not find MASTER_MODEL_CATALOG array in masterModelCatalog.ts');
}

let masterList = eval(masterMatch[1]);
console.log(`Original MASTER_MODEL_CATALOG count: ${masterList.length}`);

// Also grab the tail items accidentally in FAQS_LIST
const tailMatch = masterContent.match(/export const FAQS_LIST = \[([\s\S]*?)\];/);
if (tailMatch) {
  const faqsStr = tailMatch[1];
  const tailObjMatches = faqsStr.match(/\{ brand: '.*?'[^\n}]+\}/g);
  if (tailObjMatches) {
    for (const objStr of tailObjMatches) {
      try {
        const item = eval('(' + objStr + ')');
        if (item && item.model && !masterList.some(m => m.model === item.model)) {
          masterList.push(item);
        }
      } catch (e) {}
    }
  }
}

// Filter out <= 32GB
const filteredMaster = masterList.filter(item => !isStorageLow(item.storage));
console.log(`Filtered MASTER_MODEL_CATALOG count (>32GB): ${filteredMaster.length} (Removed: ${masterList.length - filteredMaster.length})`);

// Extract FAQs cleanly (only items with q and a)
const cleanFaqs = [
  { q: 'Is entering the IMEI number required while booking online?', a: 'No, entering your IMEI number online is completely optional! If you prefer, our executive will simply verify it at your doorstep during pickup.' },
  { q: 'How do I check my phone IMEI number?', a: 'Simply open your phone dialer app and type *#06#. A 15-digit IMEI number will appear instantly on screen.' },
  { q: 'When do I get paid for my old phone?', a: 'Payout is instant! Our Doorstep pickup executive inspects your device at your doorstep and transfers cash or UPI directly into your account on spot before taking the phone.' },
  { q: 'Is doorstep pickup 100% free across all service localities?', a: 'Yes! Pickup is 100% FREE with zero hidden charges across all service areas areas including Gomti Nagar, Hazratganj, Indira Nagar, Aliganj, Mahanagar, Ashiyana, Chowk, Rajajipuram, and Jankipuram.' },
  { q: 'What documents are required to sell an old phone?', a: 'You only need a valid Govt ID proof (Aadhaar Card or Driving License) and the phone itself. Having the original box or invoice gives you extra cash bonuses!' },
  { q: 'What happens to my personal data on the phone?', a: 'Fundu performs an automated, military-grade factory data wipe right at your doorstep before handing over the digital receipt.' },
  { q: 'Do you buy non-working or screen-damaged phones?', a: 'Yes! We buy phones in all conditions — flawless, minor body scratches, cracked display glass, or faulty battery.' },
  { q: 'How is the final cash quote calculated?', a: 'Our automated AI algorithm checks live resale market rates and adjusts for screen condition, body condition, hardware defects, warranty status, and original box/charger accessories.' },
  { q: 'Can I cancel or reschedule my doorstep pickup slot?', a: 'Yes, you can easily reschedule or cancel your pickup slot anytime by calling our Doorstep helpline at +91-9839122345.' },
  { q: 'Is Fundu better than local offline shops at your doorstep?', a: 'Yes! With Fundu, you get algorithmic highest price guarantee, zero market bargaining, free doorstep visit, and instant spot payment.' },
  { q: 'How long is the instant price quote valid?', a: 'Your Fundu price quote is guaranteed and locked in for 7 full days from the time of booking.' },
  { q: 'Can I sell multiple phones at once?', a: 'Absolutely! You can book individual sell requests or inform our executive during doorstep visit for bulk spot cash payouts.' },
  { q: 'What if my phone brand is not listed?', a: 'You can use our live search bar or contact our customer hotline +91-9839122345 for custom manual valuation.' },
  { q: 'Do I get a legal seller invoice?', a: 'Yes, an official digital seller invoice & receipt is sent to your mobile number immediately upon completion of pickup.' }
];

// Reconstruct masterModelCatalog.ts
const headerSection = masterContent.substring(0, masterContent.indexOf('export const MASTER_MODEL_CATALOG = ['));
const newMasterArrayStr = 'export const MASTER_MODEL_CATALOG = ' + JSON.stringify(filteredMaster, null, 2) + ';\n';
const footerSection = `export const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

export const ACCESSORIES_LIST = [
  { id: 'Original Box', label: 'Original Box with IMEI', bonus: '+ ₹300' },
  { id: 'Original Charger', label: 'Original Brand Charger', bonus: '+ ₹300' },
  { id: 'Valid Bill', label: 'Valid Purchase Bill / Invoice', bonus: '+ ₹200' },
];

export const HARDWARE_DEFECTS = [
  { id: 'camera', label: 'Camera Fault (Front/Back Lens or Autofocus Issue)' },
  { id: 'charging_port', label: 'Charging Port / Connection Fault' },
  { id: 'speaker_mic', label: 'Speaker / Earpiece / Microphone Fault' },
  { id: 'biometrics', label: 'Biometrics Fault (Face ID or Fingerprint)' },
];

export const FAQS_LIST = ${JSON.stringify(cleanFaqs, null, 2)};
`;

fs.writeFileSync(masterPath, headerSection + newMasterArrayStr + footerSection, 'utf8');
console.log('✅ Updated src/data/masterModelCatalog.ts');


// ========================================================
// 2. UPDATE src/data/indianPhonesCatalog.ts
// ========================================================
const indianPath = path.resolve('src/data/indianPhonesCatalog.ts');
const indianContent = fs.readFileSync(indianPath, 'utf8');
const indianMatch = indianContent.match(/export const ALL_INDIAN_PHONES_CATALOG: MasterPhone\[\] = (\[[\s\S]*?\]);\s*\n/);
if (!indianMatch) {
  throw new Error('Could not find ALL_INDIAN_PHONES_CATALOG array in indianPhonesCatalog.ts');
}

let indianList = eval(indianMatch[1]);
console.log(`Original ALL_INDIAN_PHONES_CATALOG count: ${indianList.length}`);

// Filter out models where all storage options are <= 32GB
const filteredIndian = indianList.filter(item => {
  const storages = item.storage_options || [];
  const maxStorage = Math.max(...storages.map(s => {
    const m = String(s).match(/(\d+)\s*(?:gb|tb)/i);
    return m ? parseInt(m[1], 10) : 0;
  }), 0);
  return maxStorage > 32;
}).map(item => {
  // Strip <= 32GB options
  const newStorages = (item.storage_options || []).filter(s => !isStorageLow(s));
  return {
    ...item,
    storage_options: newStorages.length > 0 ? newStorages : ['64GB', '128GB']
  };
});

console.log(`Filtered ALL_INDIAN_PHONES_CATALOG count: ${filteredIndian.length} (Removed: ${indianList.length - filteredIndian.length})`);

const indianHeader = `import type { MasterPhone } from '../types';\n\nexport const ALL_INDIAN_PHONES_CATALOG: MasterPhone[] = `;
const indianArrayStr = JSON.stringify(filteredIndian, null, 2) + ';\n\n';

// Keep the helper functions at bottom of indianPhonesCatalog.ts
const helpersIndex = indianContent.indexOf('export function findIndianPhone(');
let indianHelpers = '';
if (helpersIndex !== -1) {
  indianHelpers = indianContent.substring(helpersIndex);
} else {
  // fallback search
  const endBracketIndex = indianContent.lastIndexOf('export function');
  if (endBracketIndex !== -1) indianHelpers = indianContent.substring(endBracketIndex);
}

fs.writeFileSync(indianPath, indianHeader + indianArrayStr + indianHelpers, 'utf8');
console.log('✅ Updated src/data/indianPhonesCatalog.ts');


// ========================================================
// 3. UPDATE server/config/phonesCatalog.json
// ========================================================
const serverCatalogPath = path.resolve('server/config/phonesCatalog.json');
let serverPhones = JSON.parse(fs.readFileSync(serverCatalogPath, 'utf8'));
console.log(`Original server phonesCatalog.json count: ${serverPhones.length}`);

const filteredServer = serverPhones.filter(item => {
  const s0 = (item.storage_options && item.storage_options[0]) || item.storage || '';
  if (isStorageLow(s0)) return false;
  
  // Also check if all storages are <= 32GB
  const storages = item.storage_options || (item.storage ? [item.storage] : []);
  const maxStorage = Math.max(...storages.map(s => {
    const m = String(s).match(/(\d+)\s*(?:gb|tb)/i);
    return m ? parseInt(m[1], 10) : 0;
  }), 0);
  if (maxStorage > 0 && maxStorage <= 32) return false;

  return true;
}).map(item => {
  if (item.storage_options) {
    const cleanS = item.storage_options.filter(s => !isStorageLow(s));
    item.storage_options = cleanS.length > 0 ? cleanS : ['64GB', '128GB'];
  }
  return item;
});

console.log(`Filtered server phonesCatalog.json count: ${filteredServer.length} (Removed: ${serverPhones.length - filteredServer.length})`);
fs.writeFileSync(serverCatalogPath, JSON.stringify(filteredServer, null, 2), 'utf8');
console.log('✅ Updated server/config/phonesCatalog.json');

console.log('--- CLEANUP SCRIPT FINISHED SUCCESSFULLY ---');
