import { storageGb } from '../../../shared/variantPricing.js';
import { cleanVariantStock, entryStock, totalVariantStock } from '../../../shared/variantStock.js';
import type { VariantStockEntry } from '../../../shared/variantStock.js';

interface VariantStockEditorProps {
  storages: string[];
  colors: string[];
  value: VariantStockEntry[];
  onChange: (next: VariantStockEntry[]) => void;
  /** The listing's own storage and colour, and its single stock number: where existing stock goes when counting starts. */
  ownStorage: string;
  ownColor: string;
  singleStock: number;
}

const sameStorage = (a: string, b: string): boolean => (storageGb(a) && storageGb(a) === storageGb(b)) || a === b;
const sameColor = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

const stockFor = (value: VariantStockEntry[], storage: string, color: string): number => {
  const hit = value.find((entry) => sameStorage(entry.storage, storage) && sameColor(entry.color, color));
  return hit ? entryStock(hit) : 0;
};

/**
 * One stock number for every storage + colour the listing offers. The total is what the Buy cards
 * show; the numbers decide which exact combination a customer can still order.
 */
export default function VariantStockEditor({
  storages,
  colors,
  value,
  onChange,
  ownStorage,
  ownColor,
  singleStock,
}: VariantStockEditorProps) {
  const rows = storages.flatMap((storage) => colors.map((color) => ({ storage, color })));
  if (rows.length === 0) return null;

  if (value.length === 0) {
    const startCounting = () =>
      onChange(
        cleanVariantStock(
          rows.map((row) => ({
            ...row,
            stock: sameStorage(row.storage, ownStorage) && sameColor(row.color, ownColor) ? singleStock : 0,
          })),
        ),
      );
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-emerald-900">
          Stock is one number for the whole listing ({singleStock}). Count it per storage and colour to stop customers ordering a combination you do not have.
        </p>
        <button
          type="button"
          onClick={startCounting}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          Count stock per variant
        </button>
      </div>
    );
  }

  const setStock = (storage: string, color: string, raw: string) => {
    const units = Math.max(0, Math.floor(Number(raw) || 0));
    const next = rows.map((row) => ({
      ...row,
      stock: row.storage === storage && row.color === color ? units : stockFor(value, row.storage, row.color),
    }));
    onChange(cleanVariantStock(next));
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-[11px] font-extrabold text-emerald-950">📦 Stock per storage and colour</label>
        <span className="text-[11px] font-black text-emerald-800">Total: {totalVariantStock(value)} units</span>
      </div>
      <button
        type="button"
        onClick={() => onChange([])}
        className="mb-2 text-[10px] font-bold text-emerald-800 underline"
      >
        Go back to one stock number
      </button>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {rows.map(({ storage, color }) => (
          <label
            key={`${storage}|${color}`}
            className="flex items-center justify-between gap-2 rounded-lg bg-white border border-emerald-100 px-2.5 py-1.5 text-xs font-bold text-ink-800"
          >
            <span className="truncate">
              {storage} · {color}
            </span>
            <input
              type="number"
              min={0}
              value={stockFor(value, storage, color)}
              onChange={(e) => setStock(storage, color, e.target.value)}
              aria-label={`Stock for ${storage} ${color}`}
              className="input w-20 py-1 text-xs font-bold"
            />
          </label>
        ))}
      </div>
      <p className="mt-2 text-[10px] font-medium text-emerald-900">
        A combination with 0 cannot be ordered. The total here replaces the single Stock Units number.
      </p>
    </div>
  );
}
