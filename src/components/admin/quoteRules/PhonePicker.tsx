import { useEffect, useState } from 'react';
import { fetchPreviewModels } from '../../../lib/quoteRules';
import { defaultStorage, filterModels, modelsOf, resolveChoice, type BrandModels, type PhoneChoice } from '../../../lib/phoneChoice';

interface PhonePickerProps {
  value: PhoneChoice;
  onChange: (next: PhoneChoice) => void;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Brand, model and storage as three dropdowns, filled from the models that have a sell price. Changing the brand moves the model and
 * the storage to ones that exist for it. If the list cannot be loaded the three become text boxes, so a phone can still be tried.
 */
export default function PhonePicker({ value, onChange }: PhonePickerProps) {
  const [brands, setBrands] = useState<BrandModels[] | null>(null); // null while loading, [] when there is no list
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let alive = true;
    fetchPreviewModels()
      .then((list) => {
        if (!alive) return;
        setBrands(list);
        if (list.length > 0) onChange(resolveChoice(list, value));
      })
      .catch(() => { if (alive) setBrands([]); });
    return () => { alive = false; };
    // the list is read once, when the panel opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (brands !== null && brands.length === 0) {
    return (
      <>
        {(['brand', 'model', 'storage'] as const).map((field) => (
          <label key={field} className="text-xs font-semibold text-ink-600 capitalize">{field}
            <input className="input mt-1 py-2 text-sm" value={value[field]} onChange={(e) => onChange({ ...value, [field]: e.target.value })} />
          </label>
        ))}
        <p className="text-xs text-amber-700 sm:col-span-2 lg:col-span-4">The list of models could not be loaded, so type the brand, model and storage.</p>
      </>
    );
  }

  const loading = brands === null;
  const models = brands ? modelsOf(brands, value.brand) : [];
  const shown = filterModels(models, filter, value.brand);
  const current = models.find((m) => same(m.model, value.model));

  const changeBrand = (brand: string) => {
    setFilter('');
    if (brands) onChange(resolveChoice(brands, { brand }));
  };
  const changeModel = (model: string) => {
    if (brands) onChange(resolveChoice(brands, { brand: value.brand, model }));
  };
  const changeFilter = (text: string) => {
    setFilter(text);
    const matches = filterModels(models, text, value.brand);
    // The dropdown must never show a model other than the one that will be priced: if the chosen one is filtered out, move to the first match.
    // With no match there is nothing to price, so the choice is emptied and Compare is off, rather than pricing a model that is not shown.
    if (matches.length === 0) {
      onChange({ brand: value.brand, model: '', storage: '' });
    } else if (!matches.some((m) => same(m.model, value.model))) {
      onChange({ brand: value.brand, model: matches[0].model, storage: defaultStorage(matches[0].storages) });
    }
  };

  return (
    <>
      <label className="text-xs font-semibold text-ink-600">Brand
        <select className="input mt-1 py-2 text-sm" value={value.brand} disabled={loading} onChange={(e) => changeBrand(e.target.value)}>
          {loading && <option>Loading…</option>}
          {brands?.map((b) => <option key={b.brand} value={b.brand}>{b.brand} ({b.models.length})</option>)}
        </select>
      </label>
      <div className="text-xs font-semibold text-ink-600">
        <label htmlFor="preview-model">Model <span className="font-normal text-ink-400">({shown.length}{filter.trim() ? ` of ${models.length}` : ''})</span></label>
        <input
          value={filter}
          onChange={(e) => changeFilter(e.target.value)}
          placeholder="Type to narrow the list"
          aria-label="Narrow the list of models"
          disabled={loading}
          className="input mt-1 mb-1 py-1.5 text-xs"
        />
        <select id="preview-model" className="input py-2 text-sm" value={current ? current.model : ''} disabled={loading || shown.length === 0} onChange={(e) => changeModel(e.target.value)}>
          {loading && <option>Loading…</option>}
          {!loading && shown.length === 0 && <option value="">No model matches</option>}
          {shown.map((m) => <option key={m.model} value={m.model}>{m.model}</option>)}
        </select>
      </div>
      <label className="text-xs font-semibold text-ink-600">Storage
        {current && current.storages.length === 0
          ? <input className="input mt-1 py-2 text-sm" value={value.storage} placeholder="128 GB" onChange={(e) => onChange({ ...value, storage: e.target.value })} />
          : (
            <select className="input mt-1 py-2 text-sm" value={value.storage} disabled={loading || !current} onChange={(e) => onChange({ ...value, storage: e.target.value })}>
              {loading && <option>Loading…</option>}
              {current?.storages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
      </label>
    </>
  );
}
