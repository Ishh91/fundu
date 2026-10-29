import type { Product } from '../types';

/**
 * Normalizes a model string to its core base identifier,
 * stripping out capacity, color, and grade suffixes so that
 * variants like "iPhone 13 (128GB) - Midnight" and "iPhone 13"
 * resolve to the exact same model key.
 */
export function normalizeModelKey(brand: string, model: string, title?: string): string {
  const cleanBrand = (brand || '').trim().toLowerCase();
  let base = (model || title || '').trim().toLowerCase();

  // Strip brand prefix if repeated in model
  if (base.startsWith(cleanBrand)) {
    base = base.slice(cleanBrand.length).trim();
  }

  // Remove parenthesized specs, storage notations, and color tags
  base = base
    .replace(/\s*\((128|256|512|64|32|16|8|1|2)\s*(gb|tb|ssd|ram)?.*?\)/gi, '')
    .replace(/\b(128|256|512|64|32|16|8|1tb|2tb)\s*(gb|tb|ssd)?\b/gi, '')
    .replace(/\b(ram|rom|ssd|hdd|wifi|cellular|5g|4g)\b/gi, '')
    .replace(/\s*-\s*(midnight|starlight|space grey|silver|black|blue|purple|gold|white|green).*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `${cleanBrand}__${base}`;
}

/**
 * Deduplicates a list of products by unique model.
 * If multiple variants exist for the same model (e.g. 128GB and 256GB),
 * they are merged into a single primary card:
 * - Starting price = lowest variant price
 * - Available storages = union of all storages
 * - Available colors = union of all colors
 * - Available RAMs = union of all RAMs
 * - Stock = total combined stock
 * - is_featured = true if any variant is featured
 */
export function deduplicateProductsByModel(products: Product[]): Product[] {
  if (!Array.isArray(products) || products.length <= 1) return products;

  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const key = normalizeModelKey(product.brand, product.model, product.title);
    const existing = groups.get(key);
    if (existing) {
      existing.push(product);
    } else {
      groups.set(key, [product]);
    }
  }

  const result: Product[] = [];

  for (const [, group] of groups.entries()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    // Pick primary: prefer featured, then newest or lowest price
    const featuredItem = group.find((p) => p.is_featured);
    const primary = featuredItem || group[0];

    // Collect all storages
    const allStorages = new Set<string>();
    for (const p of group) {
      if (Array.isArray(p.available_storages)) {
        p.available_storages.forEach((s) => s && allStorages.add(s.trim()));
      }
      if (p.storage) {
        allStorages.add(p.storage.trim());
      }
    }

    // Collect all colors
    const allColors = new Set<string>();
    for (const p of group) {
      if (Array.isArray(p.available_colors)) {
        p.available_colors.forEach((c) => c && allColors.add(c.trim()));
      }
      if (p.color) {
        allColors.add(p.color.trim());
      }
    }

    // Collect all RAMs
    const allRams = new Set<string>();
    for (const p of group) {
      if (Array.isArray(p.available_rams)) {
        p.available_rams.forEach((r) => r && allRams.add(r.trim()));
      }
      if (p.ram) {
        allRams.add(p.ram.trim());
      }
    }

    const minPrice = Math.min(...group.map((p) => Number(p.price) || 999999));
    const maxMrp = Math.max(...group.map((p) => Number(p.original_price) || 0));
    const totalStock = group.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const anyFeatured = group.some((p) => p.is_featured);

    const merged: Product = {
      ...primary,
      price: minPrice !== 999999 ? minPrice : primary.price,
      original_price: maxMrp > 0 ? maxMrp : primary.original_price,
      stock: totalStock,
      is_featured: anyFeatured,
      available_storages: allStorages.size > 0 ? Array.from(allStorages) : primary.available_storages,
      available_colors: allColors.size > 0 ? Array.from(allColors) : primary.available_colors,
      available_rams: allRams.size > 0 ? Array.from(allRams) : primary.available_rams,
    };

    result.push(merged);
  }

  return result;
}

