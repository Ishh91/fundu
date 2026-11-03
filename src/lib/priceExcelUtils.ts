import * as XLSX from 'xlsx';

export interface PriceExcelRow {
  brand: string;
  model: string;
  storage: string;
  base_price: number;
  default_mrp?: number;
  excellent_multiplier?: number;
  good_multiplier?: number;
  fair_multiplier?: number;
  box_bonus?: number;
  charger_bonus?: number;
  is_active?: boolean;
  image_url?: string;
}

export interface ParseExcelResult {
  validRows: PriceExcelRow[];
  totalRows: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Normalizes an object's keys to lowercase alphanumeric for flexible column matching
 */
function normalizeKey(k: string): string {
  return String(k || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Exports current models and valuations to an Excel (.xlsx) file
 */
export function exportSellPricesToExcel(
  models: Array<{
    brand: string;
    model: string;
    storage?: string;
    base_price: number;
    default_mrp?: number;
    excellent_multiplier?: number;
    good_multiplier?: number;
    fair_multiplier?: number;
    box_bonus?: number;
    charger_bonus?: number;
    is_active?: boolean;
    image_url?: string;
  }>,
  customFilename?: string
): void {
  if (typeof window === 'undefined') return;

  const rows = models.map((m) => ({
    'Brand': m.brand,
    'Model': m.model,
    'Storage Variant': m.storage || '128 GB',
    'Base Price (₹)': Math.round(m.base_price || 0),
    'Default MRP (₹)': m.default_mrp ? Math.round(m.default_mrp) : '',
    'Flawless Multiplier': Number(m.excellent_multiplier ?? 1.0),
    'Good Multiplier': Number(m.good_multiplier ?? 0.70),
    'Fair Multiplier': Number(m.fair_multiplier ?? 0.55),
    'Box Bonus (₹)': Math.round(m.box_bonus ?? 0),
    'Charger Bonus (₹)': Math.round(m.charger_bonus ?? 0),
    'Status': m.is_active === false ? 'Disabled' : 'Active',
    'Image URL': m.image_url || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set professional auto-widths
  worksheet['!cols'] = [
    { wch: 15 }, // Brand
    { wch: 30 }, // Model
    { wch: 16 }, // Storage Variant
    { wch: 16 }, // Base Price (₹)
    { wch: 16 }, // Default MRP (₹)
    { wch: 18 }, // Flawless Multiplier
    { wch: 16 }, // Good Multiplier
    { wch: 16 }, // Fair Multiplier
    { wch: 14 }, // Box Bonus (₹)
    { wch: 16 }, // Charger Bonus (₹)
    { wch: 12 }, // Status
    { wch: 45 }, // Image URL
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fundu Sell Prices');

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = customFilename || `fundu_sell_prices_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into validated PriceExcelRow items
 */
export async function parsePricesFromExcelFile(file: File): Promise<ParseExcelResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel file has no worksheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error('Could not read worksheet.');
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
  const validRows: PriceExcelRow[] = [];
  const errors: string[] = [];
  let skippedCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const rowNum = i + 2; // Row 1 is header

    // Map keys flexibly
    const lookup: Record<string, any> = {};
    Object.keys(raw).forEach((k) => {
      lookup[normalizeKey(k)] = raw[k];
    });

    const brand = String(
      lookup['brand'] || lookup['make'] || lookup['company'] || ''
    ).trim();

    const model = String(
      lookup['model'] || lookup['phonemodel'] || lookup['devicename'] || lookup['device'] || lookup['phone'] || ''
    ).trim();

    const storageRaw = String(
      lookup['storagevariant'] || lookup['storage'] || lookup['variant'] || lookup['capacity'] || lookup['gb'] || ''
    ).trim();

    const basePriceRaw =
      lookup['baseprice'] ||
      lookup['basepriceinr'] ||
      lookup['price'] ||
      lookup['buybackprice'] ||
      lookup['rate'] ||
      lookup['valuation'];

    const basePrice = Number(String(basePriceRaw).replace(/[^0-9.]/g, ''));

    if (!brand || !model) {
      skippedCount++;
      errors.push(`Row ${rowNum}: Missing Brand or Model name.`);
      continue;
    }

    if (isNaN(basePrice) || basePrice <= 0) {
      skippedCount++;
      errors.push(`Row ${rowNum} (${brand} ${model}): Invalid or missing base price.`);
      continue;
    }

    const mrpRaw = lookup['defaultmrp'] || lookup['mrp'] || lookup['mrpvalue'] || lookup['retailprice'];
    const mrp = mrpRaw ? Number(String(mrpRaw).replace(/[^0-9.]/g, '')) : undefined;

    const excellentMult = Number(lookup['flawlessmultiplier'] || lookup['excellentmultiplier'] || 1.0);
    const goodMult = Number(lookup['goodmultiplier'] || 0.70);
    const fairMult = Number(lookup['fairmultiplier'] || 0.55);

    const boxBonusRaw = lookup['boxbonus'] || lookup['box'];
    const boxBonus = boxBonusRaw !== undefined && boxBonusRaw !== '' ? Number(String(boxBonusRaw).replace(/[^0-9.]/g, '')) : 0;

    const chargerBonusRaw = lookup['chargerbonus'] || lookup['charger'];
    const chargerBonus = chargerBonusRaw !== undefined && chargerBonusRaw !== '' ? Number(String(chargerBonusRaw).replace(/[^0-9.]/g, '')) : 0;

    const statusVal = String(lookup['status'] || lookup['isactive'] || lookup['active'] || '').toLowerCase();
    const isActive = !(statusVal === 'disabled' || statusVal === 'inactive' || statusVal === 'false' || statusVal === '0');

    const imageUrl = String(lookup['imageurl'] || lookup['image'] || lookup['photo'] || '').trim();

    // Standardize storage (e.g. 128 -> 128 GB, 128GB -> 128 GB)
    let storage = storageRaw;
    if (storage) {
      const matchGb = storage.match(/(\d+)\s*(?:gb|tb)/i);
      if (matchGb) {
        const num = matchGb[1];
        const unit = /tb/i.test(storage) ? 'TB' : 'GB';
        storage = `${num} ${unit}`;
      }
    } else {
      storage = '128 GB';
    }

    validRows.push({
      brand,
      model,
      storage,
      base_price: basePrice,
      default_mrp: mrp && !isNaN(mrp) ? mrp : undefined,
      excellent_multiplier: !isNaN(excellentMult) ? excellentMult : 1.0,
      good_multiplier: !isNaN(goodMult) ? goodMult : 0.70,
      fair_multiplier: !isNaN(fairMult) ? fairMult : 0.55,
      box_bonus: !isNaN(boxBonus) ? boxBonus : 0,
      charger_bonus: !isNaN(chargerBonus) ? chargerBonus : 0,
      is_active: isActive,
      image_url: imageUrl || undefined,
    });
  }

  return {
    validRows,
    totalRows: rawRows.length,
    skippedCount,
    errors,
  };
}
