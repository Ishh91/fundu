import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// 1. Load Data Sources
const cashifyData = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));

// Extract MASTER_MODEL_CATALOG from SellPhone.tsx
const sellPhoneContent = fs.readFileSync('./src/pages/SellPhone.tsx', 'utf8');
const masterMatch = sellPhoneContent.match(/export const MASTER_MODEL_CATALOG = \[([\s\S]*?)\];/);
const masterCatalog = eval('[' + masterMatch[1] + ']');

console.log(`Loaded ${masterCatalog.length} models from MASTER_MODEL_CATALOG.`);
console.log(`Loaded ${cashifyData.length} variants from Cashify database.`);

function formatINR(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

// Group models by brand
const brandOrder = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Vivo',
  'Oppo',
  'Realme',
  'Google',
  'Motorola',
  'Nothing',
  'iQOO',
  'Poco',
  'Infinix',
  'Tecno',
  'Itel',
  'Lenovo'
];

const modelsByBrand = {};
brandOrder.forEach(b => { modelsByBrand[b] = []; });

masterCatalog.forEach(item => {
  const brand = item.brand || 'Other';
  if (!modelsByBrand[brand]) modelsByBrand[brand] = [];
  
  // Find variants from cashifyData for this model
  const mClean = (item.model || '').toLowerCase().replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '').trim();
  const variants = cashifyData.filter(c => {
    const cBrand = c.brand.toLowerCase();
    const cModel = c.cleanModel.toLowerCase().replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '').trim();
    return cBrand === brand.toLowerCase() && (cModel === mClean || cModel.includes(mClean) || mClean.includes(cModel));
  });

  modelsByBrand[brand].push({
    model: item.model,
    series: item.series || `${brand} Series`,
    baseStorage: item.storage || '128 GB',
    funduPrice: item.price,
    cashifyBenchmark: item.price > 1000 ? item.price - 1000 : item.price,
    variants: variants.length > 0 ? variants : null,
  });
});

// HTML Template
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fundu - Complete Smartphone Models & Pricing Catalog</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 10mm 14mm 10mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
      }
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      line-height: 1.35;
    }
    .header {
      background: linear-gradient(135deg, #09090b 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0 0 4px 0;
      font-size: 16pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .header .subtitle {
      font-size: 8.5pt;
      color: #cbd5e1;
      margin: 0;
    }
    .header-badge {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid #22c55e;
      color: #4ade80;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      text-align: center;
    }
    .kpi-value {
      font-size: 13pt;
      font-weight: 800;
      color: #0284c7;
      margin-bottom: 2px;
    }
    .kpi-label {
      font-size: 7pt;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-section {
      margin-bottom: 14px;
      page-break-inside: auto;
    }
    .brand-header {
      background: #0f172a;
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 5px 5px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 10pt;
      margin-top: 10px;
    }
    .brand-header .count {
      font-size: 7.5pt;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-top: none;
      margin-bottom: 8px;
    }
    thead th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 6px 8px;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e1;
    }
    tbody tr {
      border-bottom: 1px solid #f1f5f9;
      page-break-inside: avoid;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody td {
      padding: 5px 8px;
      vertical-align: top;
    }
    .model-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 8.5pt;
    }
    .series-name {
      font-size: 7pt;
      color: #64748b;
    }
    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 600;
      margin: 1px 2px 1px 0;
    }
    .badge-storage {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .badge-ram {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }
    .price-cashify {
      color: #64748b;
      font-size: 7.5pt;
      text-decoration: line-through;
    }
    .price-fundu {
      color: #15803d;
      font-weight: 800;
      font-size: 9pt;
    }
    .price-bonus {
      background: #dcfce7;
      color: #166534;
      font-size: 6.5pt;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      margin-left: 3px;
    }
    .page-break {
      page-break-after: always;
    }
    .footer {
      font-size: 7pt;
      color: #94a3b8;
      text-align: center;
      margin-top: 15px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>Fundu Smartphone Master Catalog</h1>
      <p class="subtitle">Complete List of All Available Phone Models • Live Cashify + ₹1,000 Price Guarantee</p>
    </div>
    <div class="header-badge">
      Live Synced • Pan-India
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${masterCatalog.length}</div>
      <div class="kpi-label">Available Models</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${cashifyData.length}</div>
      <div class="kpi-label">Verified Variants</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">+₹1,000</div>
      <div class="kpi-label">Price Advantage</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">16 Brands</div>
      <div class="kpi-label">Pan-India Catalog</div>
    </div>
  </div>
`;

// Render each brand's models
let bIndex = 0;
for (const brand of brandOrder) {
  const models = modelsByBrand[brand] || [];
  if (models.length === 0) continue;
  bIndex++;

  html += `
  <div class="brand-section">
    <div class="brand-header">
      <span>${brand}</span>
      <span class="count">${models.length} Models Available</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 32%;">Model & Series</th>
          <th style="width: 36%;">Storage & Authentic Configurations</th>
          <th style="width: 16%;">Cashify Base</th>
          <th style="width: 16%; text-align: right;">Fundu Sell Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const m of models) {
    let variantsHtml = '';
    if (m.variants && m.variants.length > 0) {
      // Show up to 3 variants
      variantsHtml = m.variants.slice(0, 3).map(v => {
        const rBadge = v.ram ? `<span class="badge badge-ram">${v.ram}</span>` : '';
        const sBadge = v.storage ? `<span class="badge badge-storage">${v.storage}</span>` : '';
        return `<div>${sBadge} ${rBadge} <span style="font-size: 7pt; color: #15803d; font-weight: 700;">${formatINR(v.funduPrice)}</span></div>`;
      }).join('');
      if (m.variants.length > 3) {
        variantsHtml += `<div style="font-size: 6.5pt; color: #64748b;">+${m.variants.length - 3} more configs</div>`;
      }
    } else {
      variantsHtml = `<span class="badge badge-storage">${m.baseStorage}</span>`;
    }

    html += `
      <tr>
        <td>
          <div class="model-name">${m.model}</div>
          <div class="series-name">${m.series}</div>
        </td>
        <td>${variantsHtml}</td>
        <td>
          <div class="price-cashify">${formatINR(m.cashifyBenchmark)}</div>
        </td>
        <td style="text-align: right;">
          <div class="price-fundu">${formatINR(m.funduPrice)} <span class="price-bonus">+1K</span></div>
        </td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
  </div>
  `;

  // Page break after major brands
  if (brand === 'Apple' || brand === 'Samsung' || brand === 'Xiaomi' || brand === 'Vivo' || brand === 'Realme' || brand === 'Google') {
    html += `<div class="page-break"></div>`;
  }
}

html += `
  <div class="footer">
    <span>Fundu Official Certified Device Inventory • Price Guarantee: Cashify Benchmark + ₹1,000 Across All Models</span>
    <br>
    <span>Doorstep Cash Payouts • Instant Bank Transfer / UPI • Lucknow & Pan-India</span>
  </div>
</body>
</html>
`;

const htmlPath = path.resolve('scripts/all_models_report.html');
const pdfPathRoot = path.resolve('Fundu_All_Available_Models_Price_Catalog.pdf');
const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\fd7ac9a6-dd48-47e2-bc75-73d5c16bd058';
const pdfPathArtifact = path.resolve(artifactDir, 'Fundu_All_Available_Models_Price_Catalog.pdf');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML report generated at:', htmlPath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPathRoot}" "${htmlPath}"`;

console.log('Generating PDF via Headless Edge...');
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('PDF successfully created at:', pdfPathRoot);

  // Copy to artifacts directory
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(pdfPathRoot, pdfPathArtifact);
    console.log('PDF successfully copied to artifacts directory:', pdfPathArtifact);
  }
} catch (e) {
  console.error('Failed to generate PDF:', e);
}
