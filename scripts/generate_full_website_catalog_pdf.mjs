import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// 1. Import Catalogs
import { MASTER_MODEL_CATALOG } from '../src/pages/SellPhone.tsx';
import { ALL_INDIAN_PHONES_CATALOG } from '../src/data/indianPhonesCatalog.ts';
import { getModelHardwareSpecs } from '../src/lib/deviceSpecs.ts';

// Buy Phones Inventory from BuyPhones.tsx
const BUY_INVENTORY = [
  { brand: 'Apple', model: 'iPhone 15 Pro', ram: '8 GB', storage: '128 GB', color: 'Natural Titanium', condition: 'Excellent', price: 84999, original_price: 134900, discount: 37, warranty: '6 Months' },
  { brand: 'Apple', model: 'iPhone 14', ram: '6 GB', storage: '128 GB', color: 'Midnight Blue', condition: 'Excellent', price: 46999, original_price: 69900, discount: 33, warranty: '6 Months' },
  { brand: 'Apple', model: 'iPhone 13', ram: '4 GB', storage: '128 GB', color: 'Starlight', condition: 'Excellent', price: 37999, original_price: 59900, discount: 37, warranty: '6 Months' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', ram: '12 GB', storage: '256 GB', color: 'Titanium Gray', condition: 'Excellent', price: 89999, original_price: 129999, discount: 31, warranty: '6 Months' },
  { brand: 'Samsung', model: 'Galaxy S23', ram: '8 GB', storage: '128 GB', color: 'Phantom Black', condition: 'Excellent', price: 39999, original_price: 74999, discount: 47, warranty: '6 Months' },
  { brand: 'OnePlus', model: 'OnePlus 12', ram: '12 GB', storage: '256 GB', color: 'Silky Black', condition: 'Excellent', price: 45999, original_price: 64999, discount: 29, warranty: '6 Months' },
  { brand: 'OnePlus', model: 'OnePlus 11R', ram: '8 GB', storage: '128 GB', color: 'Sonic Black', condition: 'Good', price: 24999, original_price: 39999, discount: 38, warranty: '6 Months' },
  { brand: 'Google', model: 'Pixel 8', ram: '8 GB', storage: '128 GB', color: 'Hazel Gray', condition: 'Excellent', price: 43999, original_price: 75999, discount: 42, warranty: '6 Months' },
  { brand: 'Nothing', model: 'Phone (2a)', ram: '8 GB', storage: '128 GB', color: 'White', condition: 'Excellent', price: 18999, original_price: 25999, discount: 27, warranty: '6 Months' },
  { brand: 'Nothing', model: 'Phone (2)', ram: '12 GB', storage: '256 GB', color: 'Dark Grey', condition: 'Excellent', price: 28999, original_price: 44999, discount: 36, warranty: '6 Months' },
  { brand: 'Nothing', model: 'CMF Phone 1', ram: '6 GB', storage: '128 GB', color: 'Black', condition: 'Excellent', price: 13499, original_price: 17999, discount: 25, warranty: '6 Months' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', ram: '8 GB', storage: '256 GB', color: 'Coral Purple', condition: 'Good', price: 17499, original_price: 25999, discount: 33, warranty: '6 Months' },
  { brand: 'Vivo', model: 'Vivo V30 Pro', ram: '8 GB', storage: '256 GB', color: 'Classic Black', condition: 'Excellent', price: 28999, original_price: 41999, discount: 31, warranty: '6 Months' },
  { brand: 'Oppo', model: 'Oppo Reno 11', ram: '8 GB', storage: '128 GB', color: 'Wave Green', condition: 'Good', price: 21999, original_price: 32999, discount: 33, warranty: '6 Months' },
  { brand: 'Realme', model: 'Realme 12 Pro+', ram: '8 GB', storage: '256 GB', color: 'Submarine Blue', condition: 'Excellent', price: 21499, original_price: 31999, discount: 33, warranty: '6 Months' },
  { brand: 'Motorola', model: 'Motorola Edge 50 Pro', ram: '8 GB', storage: '256 GB', color: 'Moonlight Pearl', condition: 'Excellent', price: 25499, original_price: 36999, discount: 31, warranty: '6 Months' },
  { brand: 'Tecno', model: 'Tecno Camon 30 Premier', ram: '12 GB', storage: '512 GB', color: 'Alps Snowy Silver', condition: 'Excellent', price: 27999, original_price: 43999, discount: 36, warranty: '6 Months' },
  { brand: 'Tecno', model: 'Tecno Pova 6 Pro', ram: '8 GB', storage: '256 GB', color: 'Meteorite Grey', condition: 'Good', price: 15499, original_price: 21999, discount: 30, warranty: '6 Months' },
  { brand: 'Itel', model: 'Itel Color Pro 5G', ram: '6 GB', storage: '128 GB', color: 'River Blue', condition: 'Excellent', price: 8499, original_price: 12999, discount: 35, warranty: '6 Months' },
  { brand: 'Itel', model: 'Itel S23+', ram: '8 GB', storage: '256 GB', color: 'Elemental Blue', condition: 'Good', price: 9999, original_price: 14999, discount: 33, warranty: '6 Months' },
  { brand: 'Poco', model: 'POCO X6 Pro', ram: '8 GB', storage: '256 GB', color: 'Racing Yellow', condition: 'Excellent', price: 21999, original_price: 30999, discount: 29, warranty: '6 Months' },
  { brand: 'iQOO', model: 'iQOO Neo 9 Pro', ram: '8 GB', storage: '128 GB', color: 'Fiery Red', condition: 'Excellent', price: 29999, original_price: 39999, discount: 25, warranty: '6 Months' },
];

// Helper to format currency
function formatINR(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

// 2. Aggregate SELL Models by Brand
const brandsSet = new Set([
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo',
  'Realme', 'Nothing', 'Google', 'Motorola', 'Lenovo', 'Poco',
  'iQOO', 'Tecno', 'Itel', 'Infinix'
]);

// Group master models by brand
const sellByBrand = {};
brandsSet.forEach(b => { sellByBrand[b] = []; });

// Insert master catalog models
MASTER_MODEL_CATALOG.forEach(m => {
  const b = m.brand || 'Other';
  if (!sellByBrand[b]) sellByBrand[b] = [];
  
  // Get authentic hardware specs
  const specs = getModelHardwareSpecs(b, m.model);
  const storagesWithRams = specs.storages.map(stg => {
    const rams = specs.getRamsForStorage(stg);
    return {
      storage: stg,
      rams: rams.length > 0 ? rams : (b.toLowerCase().includes('apple') ? ['Apple Unified'] : [])
    };
  });

  sellByBrand[b].push({
    model: m.model,
    series: m.series || 'Standard',
    basePrice: m.price,
    storagesWithRams
  });
});

// Also add any unique models from ALL_INDIAN_PHONES_CATALOG (e.g. Lenovo, older classics)
ALL_INDIAN_PHONES_CATALOG.forEach(p => {
  const b = p.brand;
  if (!sellByBrand[b]) sellByBrand[b] = [];
  const exists = sellByBrand[b].some(item => item.model.toLowerCase() === p.model.toLowerCase());
  if (!exists) {
    const specs = getModelHardwareSpecs(b, p.model);
    const storagesWithRams = specs.storages.map(stg => {
      const rams = specs.getRamsForStorage(stg);
      return {
        storage: stg,
        rams: rams.length > 0 ? rams : (b.toLowerCase().includes('apple') ? ['Apple Unified'] : [])
      };
    });

    sellByBrand[b].push({
      model: p.model,
      series: 'Indian Lineup',
      basePrice: p.base_resale_value || Math.round(p.default_mrp * 0.5),
      storagesWithRams
    });
  }
});

// Group BUY models by brand
const buyByBrand = {};
BUY_INVENTORY.forEach(item => {
  if (!buyByBrand[item.brand]) buyByBrand[item.brand] = [];
  buyByBrand[item.brand].push(item);
});

// 3. Build HTML Output
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fundu - Complete Smartphone Catalog: Buy & Sell Models with Hardware Specs</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 12mm 12mm 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.4;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header {
      border-bottom: 3px solid #344257;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 22pt;
      font-weight: 900;
      color: #344257;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .sub-title {
      font-size: 11pt;
      font-weight: 700;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .tag {
      font-size: 8pt;
      font-weight: 700;
      color: #0f766e;
      background: #ccfbf1;
      padding: 3px 8px;
      border-radius: 999px;
      display: inline-block;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
    }
    .summary-card div {
      text-align: center;
    }
    .summary-card strong {
      display: block;
      font-size: 13pt;
      color: #344257;
    }
    h2.section-header {
      font-size: 13pt;
      font-weight: 800;
      color: #ffffff;
      background: #344257;
      padding: 6px 12px;
      border-radius: 6px;
      margin: 20px 0 10px 0;
    }
    h3.brand-header {
      font-size: 11pt;
      font-weight: 800;
      color: #1e293b;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 16px 0 8px 0;
      display: flex;
      justify-content: space-between;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 800;
      color: #334155;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 1px 5px;
      border-radius: 3px;
      margin: 1px;
    }
    .badge-storage {
      background: #e0e7ff;
      color: #3730a3;
    }
    .badge-ram {
      background: #fef3c7;
      color: #92400e;
    }
    .badge-cond {
      background: #dcfce7;
      color: #15803d;
      font-weight: 800;
    }
    .badge-price {
      font-weight: 800;
      color: #0f172a;
    }
    .page-break {
      page-break-after: always;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 20px;
      font-size: 7.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1 class="brand-title">FUNDU</h1>
      <p class="sub-title">Complete Website Smartphone Catalog: Buy & Sell Matrix with Authentic Specs</p>
    </div>
    <div style="text-align: right;">
      <span class="tag">VERIFIED LIVE INVENTORY & PRICING</span>
      <p style="font-size: 8pt; color: #64748b; margin-top: 3px;">Certified Doorstep Buyback & Refurbished Store</p>
    </div>
  </div>

  <div class="summary-card">
    <div>
      <strong>16 Brands</strong>
      Covered across India
    </div>
    <div>
      <strong>180+ Models</strong>
      Live for Instant Selling
    </div>
    <div>
      <strong>22 Featured Models</strong>
      In Certified Buy Inventory
    </div>
    <div>
      <strong>100% Verified Specs</strong>
      Only Launched Combinations
    </div>
  </div>

  <h2 class="section-header">PART 1: BUY STORE (CERTIFIED REFURBISHED PHONES AVAILABLE FOR PURCHASE)</h2>
  <p style="font-size: 8.5pt; color: #64748b; margin-bottom: 8px;">
    All models available in the <strong>/buy</strong> section. Each phone includes 32-point inspection, 6-Month Fundu Warranty, and Free Express Doorstep Delivery.
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Brand</th>
        <th style="width: 25%;">Model Name</th>
        <th style="width: 18%;">Available Specs (RAM / Storage)</th>
        <th style="width: 14%;">Grade & Color</th>
        <th style="width: 16%;">Fundu Price</th>
        <th style="width: 15%;">Original MRP (Save)</th>
      </tr>
    </thead>
    <tbody>
`;

BUY_INVENTORY.forEach(item => {
  html += `
    <tr>
      <td><strong>${item.brand}</strong></td>
      <td><strong>${item.model}</strong></td>
      <td><span class="badge badge-ram">${item.ram}</span> + <span class="badge badge-storage">${item.storage}</span></td>
      <td><span class="badge badge-cond">${item.condition}</span><br><span style="font-size: 7.5pt; color: #64748b;">${item.color}</span></td>
      <td><span class="badge-price">${formatINR(item.price)}</span></td>
      <td><del style="color: #94a3b8;">${formatINR(item.original_price)}</del><br><span style="color: #16a34a; font-weight: 700; font-size: 7.5pt;">Save ${item.discount}%</span></td>
    </tr>
  `;
});

html += `
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2 class="section-header">PART 2: SELL PHONE (MODELS & EXACT SPECS ACCEPTED FOR SPOT CASH BUYBACK)</h2>
  <p style="font-size: 8.5pt; color: #64748b; margin-bottom: 8px;">
    Live on <strong>/sell</strong>. Each model strictly filters unlaunched RAM tiers based on the chosen Storage. Baseline pricing represents standard spot cash valuation.
  </p>
`;

// Render each brand's models for Sell
const targetBrands = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Nothing', 'Google', 'Vivo', 'Oppo', 'Realme', 'Lenovo', 'Motorola', 'Poco', 'iQOO', 'Tecno', 'Itel', 'Infinix'];

targetBrands.forEach((brand, bIdx) => {
  const models = sellByBrand[brand] || [];
  if (models.length === 0) return;

  html += `
    <h3 class="brand-header">
      <span>${brand} (${models.length} Models)</span>
      <span style="font-size: 8pt; font-weight: 600; color: #64748b;">Doorstep Cash Payouts Available</span>
    </h3>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Model Name</th>
          <th style="width: 20%;">Series</th>
          <th style="width: 40%;">Authentic Launched Storage & RAM Combinations</th>
          <th style="width: 15%;">Benchmark Value</th>
        </tr>
      </thead>
      <tbody>
  `;

  models.forEach(m => {
    const specsList = m.storagesWithRams.map(s => {
      const ramText = s.rams.length > 0 ? s.rams.map(r => `<span class="badge badge-ram">${r}</span>`).join(' ') : '';
      return `<div><span class="badge badge-storage">${s.storage}</span> ${ramText ? `&rarr; ${ramText}` : ''}</div>`;
    }).join('');

    html += `
      <tr>
        <td><strong>${m.model}</strong></td>
        <td><span style="font-size: 8pt; color: #475569;">${m.series}</span></td>
        <td>${specsList}</td>
        <td><span class="badge-price">${formatINR(m.basePrice)}</span></td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  // Page break after every 2-3 brands to keep pages crisp
  if (bIdx === 1 || bIdx === 3 || bIdx === 6 || bIdx === 9 || bIdx === 12) {
    html += `<div class="page-break"></div>`;
  }
});

html += `
  <div class="footer">
    <span>Fundu Complete Device Catalog • Internal Reference & Seller Guide</span>
    <span>Generated: October 2026 • Valid Across All Service Areas</span>
  </div>

</body>
</html>
`;

const htmlFilePath = path.resolve('scripts/full_catalog_report.html');
const pdfFilePath = path.resolve('Fundu_Complete_Brand_Models_Buy_Sell_Catalog.pdf');

fs.writeFileSync(htmlFilePath, html, 'utf-8');
console.log('Written full_catalog_report.html. Compiling PDF via Edge Headless...');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfFilePath}" "${htmlFilePath}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('✔ Catalog PDF successfully created at:', pdfFilePath);
} catch (err) {
  console.error('Failed to generate catalog PDF:', err);
}
