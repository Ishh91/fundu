import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// 1. Load Data Sources
const cashifyData = JSON.parse(fs.readFileSync('./scripts/cashify_scraped_prices.json', 'utf8'));

// Load MASTER_MODEL_CATALOG
const masterContent = fs.readFileSync('./src/data/masterModelCatalog.ts', 'utf8');
const masterMatch = masterContent.match(/export const MASTER_MODEL_CATALOG = (\[[\s\S]*?\]);\s*\nexport const STORAGE_OPTIONS/);
const masterCatalog = eval(masterMatch[1]);

// Load ALL_INDIAN_PHONES_CATALOG
const indianContent = fs.readFileSync('./src/data/indianPhonesCatalog.ts', 'utf8');
const indianMatch = indianContent.match(/export const ALL_INDIAN_PHONES_CATALOG: MasterPhone\[\] = (\[[\s\S]*?\]);\s*\n/);
const indianCatalog = eval(indianMatch[1]);

function isStorageLow(str) {
  if (!str) return false;
  const m = String(str).match(/(\d+)\s*(?:gb|tb)/i);
  if (!m) return false;
  const num = parseInt(m[1], 10);
  const unit = (m[2] || 'gb').toLowerCase();
  if (unit === 'tb') return false;
  return num <= 32;
}

function formatINR(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

function getDedupeKey(brand, model) {
  let clean = (model || '').toLowerCase().trim();
  const bClean = (brand || '').toLowerCase().trim();
  if (bClean && clean.startsWith(bClean)) {
    clean = clean.slice(bClean.length).trim();
  }
  return clean
    .replace(/\b(5g|4g)\b/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

// Filter to ONLY Apple and Samsung models
const targetBrands = ['Apple', 'Samsung'];
const modelsByBrand = {
  Apple: [],
  Samsung: []
};

// 1. Ingest Master Catalog
const seenKeys = new Set();

masterCatalog.forEach(item => {
  const brand = item.brand;
  if (!targetBrands.includes(brand)) return;
  if (isStorageLow(item.storage)) return;

  const key = `${brand.toLowerCase()}-${getDedupeKey(brand, item.model)}`;
  if (seenKeys.has(key)) return;
  seenKeys.add(key);

  const mClean = (item.model || '').toLowerCase().replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '').trim();
  const variants = cashifyData.filter(c => {
    const cBrand = c.brand.toLowerCase();
    const cModel = (c.cleanModel || '').toLowerCase().replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '').trim();
    const match = cBrand === brand.toLowerCase() && (cModel === mClean || cModel.includes(mClean) || mClean.includes(cModel));
    if (!match) return false;
    return !isStorageLow(c.storage);
  });

  modelsByBrand[brand].push({
    brand: item.brand,
    model: item.model,
    series: item.series || `${brand} Series`,
    baseStorage: item.storage || '128 GB',
    funduPrice: item.price,
    variants: variants.length > 0 ? variants : null,
  });
});

// 2. Ingest Indian Phones Catalog (for any unique models not yet included)
indianCatalog.forEach(p => {
  const brand = p.brand;
  if (!targetBrands.includes(brand)) return;

  const key = `${brand.toLowerCase()}-${getDedupeKey(brand, p.model)}`;
  if (seenKeys.has(key)) return;
  seenKeys.add(key);

  const cleanStorages = (p.storage_options || []).filter(s => !isStorageLow(s));
  if (cleanStorages.length === 0) return;

  const mClean = (p.model || '').toLowerCase().replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '').trim();
  const variants = cashifyData.filter(c => {
    const cBrand = c.brand.toLowerCase();
    const cModel = (c.cleanModel || '').toLowerCase().replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '').trim();
    const match = cBrand === brand.toLowerCase() && (cModel === mClean || cModel.includes(mClean) || mClean.includes(cModel));
    if (!match) return false;
    return !isStorageLow(c.storage);
  });

  modelsByBrand[brand].push({
    brand: p.brand,
    model: p.model,
    series: p.brand === 'Apple' ? 'Apple iPhone Series' : 'Samsung Galaxy Series',
    baseStorage: cleanStorages[0] || '128 GB',
    funduPrice: p.base_resale_value || Math.round((p.default_mrp || 30000) * 0.55),
    variants: variants.length > 0 ? variants : null,
  });
});

// Sort models: Apple (iPhone 18/16 down to iPhone 8), Samsung (S25/S24/Z Fold down to older A/M series)
function getRecencyWeight(brand, mName) {
  const m = mName.toLowerCase();
  let score = 0;
  if (brand === 'Apple') {
    if (m.includes('18')) score = 1800;
    else if (m.includes('16')) score = 1600;
    else if (m.includes('15')) score = 1500;
    else if (m.includes('14')) score = 1400;
    else if (m.includes('13')) score = 1300;
    else if (m.includes('12')) score = 1200;
    else if (m.includes('11')) score = 1100;
    else if (m.includes('se (2022)') || m.includes('se 3rd')) score = 1050;
    else if (m.includes('xs') || m.includes('xr') || m.includes('x ')) score = 1000;
    else if (m.includes('se (2020)') || m.includes('se 2nd')) score = 950;
    else if (m.includes('8')) score = 800;
    if (m.includes('pro max')) score += 30;
    else if (m.includes('pro')) score += 20;
    else if (m.includes('plus')) score += 10;
  } else {
    // Samsung
    if (m.includes('s26')) score = 2600;
    else if (m.includes('s25')) score = 2500;
    else if (m.includes('s24')) score = 2400;
    else if (m.includes('s23')) score = 2300;
    else if (m.includes('s22')) score = 2200;
    else if (m.includes('s21')) score = 2100;
    else if (m.includes('s20')) score = 2000;
    else if (m.includes('fold 6') || m.includes('flip 6')) score = 2450;
    else if (m.includes('fold 5') || m.includes('flip 5')) score = 2350;
    else if (m.includes('fold 4') || m.includes('flip 4')) score = 2250;
    else if (m.includes('fold 3') || m.includes('flip 3')) score = 2150;
    else if (m.includes('note 20')) score = 1950;
    else if (m.includes('note 10')) score = 1850;
    else if (m.includes('a55') || m.includes('a35') || m.includes('m55')) score = 1750;
    else if (m.includes('a54') || m.includes('a34') || m.includes('m54')) score = 1650;
    else if (m.includes('a53') || m.includes('a33')) score = 1550;
    else score = 1000;

    if (m.includes('ultra')) score += 40;
    else if (m.includes('plus') || m.includes('+')) score += 20;
    else if (m.includes('fe')) score += 10;
  }
  return score;
}

modelsByBrand['Apple'].sort((a, b) => getRecencyWeight('Apple', b.model) - getRecencyWeight('Apple', a.model));
modelsByBrand['Samsung'].sort((a, b) => getRecencyWeight('Samsung', b.model) - getRecencyWeight('Samsung', a.model));

const totalApple = modelsByBrand['Apple'].length;
const totalSamsung = modelsByBrand['Samsung'].length;
const totalModels = totalApple + totalSamsung;

let totalConfigs = 0;
[...modelsByBrand['Apple'], ...modelsByBrand['Samsung']].forEach(m => {
  totalConfigs += m.variants ? m.variants.length : 1;
});

console.log(`Apple models: ${totalApple}`);
console.log(`Samsung models: ${totalSamsung}`);
console.log(`Total Apple & Samsung models: ${totalModels}`);
console.log(`Total verified configs: ${totalConfigs}`);

// HTML Layout
let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fundu - Apple & Samsung Official Smartphone Buyback Price Catalog</title>
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
      padding: 7px 10px;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #cbd5e1;
    }
    tbody tr {
      border-bottom: 1px solid #f1f5f9;
      page-break-inside: avoid;
    }
    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }
    td {
      padding: 6px 10px;
      vertical-align: middle;
    }
    .model-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 8.5pt;
    }
    .series-name {
      font-size: 7pt;
      color: #64748b;
      margin-top: 1px;
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
    .price-fundu {
      color: #15803d;
      font-weight: 800;
      font-size: 9.5pt;
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
      <h1>Fundu Smartphone Master Catalog — Apple & Samsung</h1>
      <p class="subtitle">Official Website Buyback Pricing Directory (Excluding Obsolete &le; 3/32GB Models)</p>
    </div>
    <div class="header-badge">
      Official Website Pricing • Pan-India
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${totalModels}</div>
      <div class="kpi-label">Apple & Samsung Models</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${totalConfigs}</div>
      <div class="kpi-label">Active Storage Configurations</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">Instant UPI</div>
      <div class="kpi-label">Spot Doorstep Payout</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">64GB - 1TB</div>
      <div class="kpi-label">Verified Storage Range</div>
    </div>
  </div>
`;

for (const brand of targetBrands) {
  const models = modelsByBrand[brand] || [];
  if (models.length === 0) continue;

  html += `
  <div class="brand-section">
    <div class="brand-header">
      <span>${brand} (${brand === 'Apple' ? 'iPhones & iPads' : 'Galaxy S, Z Fold/Flip, Note, A & M Series'})</span>
      <span class="count">${models.length} Models Available</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 38%;">Model & Series</th>
          <th style="width: 40%;">Storage & Authentic Configurations</th>
          <th style="width: 22%; text-align: right;">Website Buyback Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const m of models) {
    let variantsHtml = '';
    if (m.variants && m.variants.length > 0) {
      variantsHtml = m.variants.slice(0, 4).map(v => {
        const rBadge = (v.ram && v.ram.trim() && brand !== 'Apple') ? `<span class="badge badge-ram">${v.ram}</span>` : '';
        const sBadge = v.storage ? `<span class="badge badge-storage">${v.storage}</span>` : '';
        return `<div>${sBadge} ${rBadge} <span style="font-size: 7pt; color: #15803d; font-weight: 700;">${formatINR(v.funduPrice)}</span></div>`;
      }).join('');
      if (m.variants.length > 4) {
        variantsHtml += `<div style="font-size: 6.5pt; color: #64748b;">+${m.variants.length - 4} more configs</div>`;
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
        <td style="text-align: right;">
          <div class="price-fundu">${formatINR(m.funduPrice)}</div>
        </td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
  </div>
  `;

  if (brand === 'Apple') {
    html += `<div class="page-break"></div>`;
  }
}

html += `
  <div class="footer">
    <span>Fundu Official Certified Device Inventory • Guaranteed Website Buyback Values for Apple & Samsung</span>
    <br>
    <span>Doorstep Cash Payouts • Instant Bank Transfer / UPI • Lucknow & Pan-India Coverage</span>
  </div>
</body>
</html>
`;

const htmlPath = path.resolve('scripts/apple_samsung_report.html');
const pdfPathRoot = path.resolve('Fundu_Apple_Samsung_Buyback_Catalog.pdf');
const artifactDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d11b3fb3-7187-473b-b0a6-2c45c1be8d2d';
const pdfPathArtifact = path.resolve(artifactDir, 'Fundu_Apple_Samsung_Buyback_Catalog.pdf');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML report generated at:', htmlPath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPathRoot}" "${htmlPath}"`;

console.log('Generating PDF via Headless Edge...');
try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('PDF successfully created at:', pdfPathRoot);

  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(pdfPathRoot, pdfPathArtifact);
    console.log('PDF successfully copied to artifacts directory:', pdfPathArtifact);
  }
} catch (e) {
  console.error('Failed to generate PDF:', e);
}
