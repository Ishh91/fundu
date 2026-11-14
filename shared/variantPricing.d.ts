export function gradeKey(condition: unknown): 'fair' | 'good' | 'superb';
export function storageGb(storage: unknown): number;
export function storageMultiplier(target: string, base?: string): number;
export function isPlausibleStorage(storage: unknown): boolean;
export function variantPrice(
  listing: { price?: number | null; storage?: string | null } | null | undefined,
  choice?: { storage?: string | null; condition?: string | null },
): number;
