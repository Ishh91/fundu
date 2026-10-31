const fs = require('fs');
const path = require('path');

// Extract allBrandPrices from sync_all_seven_catalog_prices.cjs
const syncScriptContent = fs.readFileSync(path.join(__dirname, 'sync_all_seven_catalog_prices.cjs'), 'utf8');
const pStart = syncScriptContent.indexOf('const allBrandPrices = [');
const pEnd = syncScriptContent.indexOf('];\n\nfunction normalizeKey', pStart);
const arrayStr = syncScriptContent.substring(syncScriptContent.indexOf('[', pStart), pEnd + 1);
const allBrandPrices = eval(arrayStr);

console.log(`Loaded ${allBrandPrices.length} brand prices.`);

function normalizeKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^samsung\s+|^motorola\s+|^moto\s+|^infinix\s+|^google\s+|^honor\s+/i, '')
    .replace(/\s*5g\b/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// 1. UPDATE masterModelCatalog.ts
const masterPath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
const masterContent = fs.readFileSync(masterPath, 'utf8');
const mAnchor = masterContent.indexOf('export const MASTER_MODEL_CATALOG =');
const mStart = masterContent.indexOf('[', mAnchor);
const storageIdx = masterContent.indexOf('export const STORAGE_OPTIONS', mStart);
const mEnd = masterContent.lastIndexOf(']', storageIdx);

const masterList = JSON.parse(masterContent.substring(mStart, mEnd + 1));
let masterUpdated = 0;

masterList.forEach(item => {
  const normK = normalizeKey(item.model);
  const match = allBrandPrices.find(p => p.brand.toLowerCase() === item.brand.toLowerCase() && normalizeKey(p.name) === normK);
  if (match) {
    item.price = match.price;
    masterUpdated++;
  }
});

const newMasterContent = masterContent.substring(0, mStart) + JSON.stringify(masterList, null, 2) + masterContent.substring(mEnd + 1);
fs.writeFileSync(masterPath, newMasterContent, 'utf8');
console.log(`masterModelCatalog.ts updated: ${masterUpdated} model entries updated.`);

// 2. UPDATE indianPhonesCatalog.ts
const indianPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
const indianContent = fs.readFileSync(indianPath, 'utf8');
const iAnchor = indianContent.indexOf('ALL_INDIAN_PHONES_CATALOG');
const eqIdx = indianContent.indexOf('=', iAnchor);
const iStart = indianContent.indexOf('[', eqIdx);
const funcIdx = indianContent.indexOf('export function getIndianPhoneByModel');
const iEnd = indianContent.lastIndexOf(']', funcIdx);

const indianList = JSON.parse(indianContent.substring(iStart, iEnd + 1));
let indianUpdated = 0;

indianList.forEach(item => {
  const normK = normalizeKey(item.model);
  const match = allBrandPrices.find(p => p.brand.toLowerCase() === item.brand.toLowerCase() && normalizeKey(p.name) === normK);
  if (match) {
    item.base_resale_value = match.price;
    if (item.price) item.price = match.price;
    indianUpdated++;
  }
});

const newIndianContent = indianContent.substring(0, iStart) + JSON.stringify(indianList, null, 2) + indianContent.substring(iEnd + 1);
fs.writeFileSync(indianPath, newIndianContent, 'utf8');
console.log(`indianPhonesCatalog.ts updated: ${indianUpdated} model entries updated.`);
