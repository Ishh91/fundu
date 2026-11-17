// The brand, model and storage picked in the quote rules preview, and the rules for keeping the three consistent: a model belongs to
// its brand and a storage to its model, so changing one moves the others to something that exists.

export interface ModelStorages {
  model: string;
  storages: string[];
}

export interface BrandModels {
  brand: string;
  models: ModelStorages[];
}

export interface PhoneChoice {
  brand: string;
  model: string;
  storage: string;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The storage to start on for a model: 128 GB when it has it (what most phones are sold at), else the smallest. */
export function defaultStorage(storages: string[]): string {
  return storages.find((s) => s === '128 GB') ?? storages[0] ?? '';
}

/** The models of a brand, or none for a brand that is not in the list. */
export function modelsOf(brands: BrandModels[], brand: string): ModelStorages[] {
  return brands.find((b) => same(b.brand, brand))?.models ?? [];
}

/**
 * The models whose name contains every word typed, in any order ("14 plus" finds "iPhone 14 Plus"). The brand counts as part of the
 * name, because some models are saved without it: OnePlus "12", iQOO "7 5G".
 */
export function filterModels(models: ModelStorages[], text: string, brand = ''): ModelStorages[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return models;
  return models.filter((m) => {
    const name = `${brand} ${m.model}`.toLowerCase();
    return words.every((word) => name.includes(word));
  });
}

/**
 * The nearest choice that exists in the list to the one wanted: the same brand, model and storage when they are there; else the first
 * model of that brand (or the first brand), with its default storage. Empty strings when the list is empty.
 */
export function resolveChoice(brands: BrandModels[], wanted: Partial<PhoneChoice>): PhoneChoice {
  const brand = brands.find((b) => same(b.brand, wanted.brand ?? '')) ?? brands[0];
  if (!brand) return { brand: '', model: '', storage: '' };
  const model = brand.models.find((m) => same(m.model, wanted.model ?? '')) ?? brand.models[0];
  if (!model) return { brand: brand.brand, model: '', storage: '' };
  const storage = model.storages.find((s) => same(s, wanted.storage ?? '')) ?? defaultStorage(model.storages);
  return { brand: brand.brand, model: model.model, storage };
}
