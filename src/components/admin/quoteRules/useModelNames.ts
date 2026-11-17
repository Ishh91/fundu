import { useEffect, useMemo, useState } from 'react';
import { fetchPreviewModels, phoneKey } from '../../../lib/quoteRules';
import type { BrandModels } from '../../../lib/phoneChoice';

/**
 * The names of Android models by their rule key ("samsunggalaxys21" -> "Samsung Galaxy S21"), from the sell price rows. Until the
 * list is loaded, or if it cannot be, a key has no name and the caller shows the key.
 */
export function useModelNames(): (key: string) => string {
  const [brands, setBrands] = useState<BrandModels[]>([]);

  useEffect(() => {
    let alive = true;
    fetchPreviewModels().then((list) => { if (alive) setBrands(list); }).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const names = useMemo(() => {
    const map = new Map<string, string>();
    for (const brand of brands) for (const model of brand.models) map.set(phoneKey(brand.brand, model.model), `${brand.brand} ${model.model}`);
    return map;
  }, [brands]);

  return (key: string) => names.get(key) ?? key;
}
