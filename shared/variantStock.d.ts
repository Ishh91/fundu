export interface VariantStockEntry {
  storage: string;
  color: string;
  stock: number;
}

export function tracksVariantStock(doc: { variant_stock?: VariantStockEntry[] | null } | null | undefined): boolean;
export function findVariantEntry(
  doc: { storage?: string | null; color?: string | null; variant_stock?: VariantStockEntry[] | null } | null | undefined,
  choice?: { storage?: string | null; color?: string | null },
): VariantStockEntry | null;
export function entryStock(entry: { stock?: unknown } | null | undefined): number;
export function totalVariantStock(entries: Array<{ stock?: unknown }> | null | undefined): number;
export function cleanVariantStock(entries: unknown): VariantStockEntry[];
export function pruneVariantStock(entries: unknown, storages: string[], colors: string[]): VariantStockEntry[];
