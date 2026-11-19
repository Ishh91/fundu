import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import NumberField from './NumberField';
import { fetchPreviewModels, phoneKey, ruleLimits, type PricingRules } from '../../../lib/quoteRules';
import type { BrandModels, ModelStorages } from '../../../lib/phoneChoice';
import { estimateBackGlassRupees } from '../../../lib/backGlassEstimate';

interface BrandBackGlassSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
  /** Called when the admin focuses a per-model amount field so the right-side context panel can quote this phone. */
  onFocusField?: (field: {
    phone: { brand: string; model: string; storage: string; price: number };
    modelKey: string;
    fieldKind: 'back_glass';
  }) => void;
}

type Show = 'all' | 'own' | 'estimate';

const STEP = 10;
const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const startStorage = (model: ModelStorages) => (model.storages.includes('128 GB') ? '128 GB' : model.storages[0] ?? '128 GB');

/**
 * The back glass amount of every Android phone, one table per brand like the screen amounts above: what is taken off for a cracked,
 * missing or bent back panel. A phone with its own amount (measured on Cashify, or typed in here) is priced on it; any other phone
 * shows what the body damage share gives today, in grey, and is priced on that until an amount is typed in.
 */
export default function BrandBackGlassSection({ rules, live, onChange, onFocusField }: BrandBackGlassSectionProps) {
  const [brands, setBrands] = useState<BrandModels[] | null>(null);
  const [brand, setBrand] = useState('');
  const [search, setSearch] = useState('');
  const [show, setShow] = useState<Show>('all');
  const [failed, setFailed] = useState(false);
  const { rupees: backGlassRupees } = rules.backGlass;

  useEffect(() => {
    let alive = true;
    fetchPreviewModels()
      .then((list) => { if (alive) setBrands(list.filter((b) => b.brand.toLowerCase() !== 'apple')); })
      .catch(() => { if (alive) { setBrands([]); setFailed(true); } });
    return () => { alive = false; };
  }, []);

  const current = brands?.find((b) => b.brand === brand) ?? brands?.[0];
  const counts = useMemo(
    () => new Map((brands ?? []).map((b) => [b.brand, b.models.filter((m) => backGlassRupees[phoneKey(b.brand, m.model)] !== undefined).length])),
    [brands, backGlassRupees],
  );

  const rows = useMemo(() => {
    if (!current) return [];
    return current.models.map((model) => {
      const key = phoneKey(current.brand, model.model);
      const own = backGlassRupees[key];
      const estimate = own === undefined ? estimateBackGlassRupees(current.brand, model.model, startStorage(model), model.price ?? 0, rules) : null;
      return { model, key, own, estimate };
    });
  }, [current, backGlassRupees, rules]);

  const text = search.trim().toLowerCase();
  const shown = rows.filter((row) => row.model.model.toLowerCase().includes(text)
    && (show === 'all' || (show === 'own' ? row.own !== undefined : row.own === undefined)));

  const setAmount = (key: string, value: number | undefined) => {
    const next = { ...rules.backGlass.rupees };
    if (value === undefined) delete next[key];
    else next[key] = value;
    onChange({ ...rules, backGlass: { ...rules.backGlass, rupees: next } });
  };

  const focusPhone = (model: ModelStorages, key: string) => {
    if (!current || !onFocusField) return;
    onFocusField({
      phone: { brand: current.brand, model: model.model, storage: startStorage(model), price: model.price ?? 0 },
      modelKey: key,
      fieldKind: 'back_glass',
    });
  };

  return (
    <section className="card p-5 space-y-4" aria-labelledby="back-glass-rules">
      <div>
        <h3 id="back-glass-rules" className="font-display text-base font-black text-ink-900">Back glass amounts by brand</h3>
        <p className="text-sm text-ink-600">
          The same pattern as the screen amounts above: what is taken off a phone for a cracked, missing or bent back panel, in rupees, the same on
          every storage. It is the model's own amount as Cashify sets it, not a share of the price. A phone with an amount in the box is priced on it.
          A phone with an empty box shows in grey what the body damage share gives today, and is priced on that until an amount is typed in.
        </p>
      </div>

      {brands === null && <p className="text-sm text-ink-500">Loading the phones…</p>}
      {failed && <p role="alert" className="text-sm text-amber-700">The list of phones could not be loaded, so the amounts cannot be shown. Reload the page to try again.</p>}

      {brands && brands.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Brand">
            {brands.map((b) => (
              <button
                key={b.brand}
                type="button"
                role="tab"
                aria-selected={current?.brand === b.brand}
                onClick={() => { setBrand(b.brand); setSearch(''); }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${current?.brand === b.brand ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'}`}
              >
                {b.brand} <span className="font-normal text-ink-400">{counts.get(b.brand) ?? 0}/{b.models.length}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Find a ${current?.brand ?? ''} phone`} aria-label="Find a phone" className="input py-2 pl-9 text-sm" />
            </div>
            <select value={show} onChange={(event) => setShow(event.target.value as Show)} aria-label="Which phones to show" className="input w-auto py-2 text-sm">
              <option value="all">All phones</option>
              <option value="own">With their own amount</option>
              <option value="estimate">From the share (grey)</option>
            </select>
            <span className="text-xs text-ink-500">{shown.length} of {rows.length} phones</span>
          </div>

          <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-ink-200">
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_5.5rem_6.5rem] items-center gap-2 border-b border-ink-200 bg-ink-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
              <span>Phone</span><span>Admin price</span><span>Back glass ₹</span>
            </div>
            {shown.length === 0 && <p className="p-3 text-sm text-ink-500">No phone matches.</p>}
            {shown.map(({ model, key, own, estimate }) => {
              const liveOwn = live.backGlass.rupees[key];
              const changed = liveOwn !== own;
              return (
                <div key={model.model} className={`grid grid-cols-[1fr_5.5rem_6.5rem] items-center gap-2 border-b border-ink-100 px-3 py-1.5 last:border-b-0 ${changedClass(changed)}`}>
                  <div>
                    <div className="text-sm font-semibold text-ink-800">{model.model}</div>
                    {liveOwn === undefined && own !== undefined && <div className="text-[11px] text-emerald-700">new</div>}
                    {changed && liveOwn !== undefined && <div className="text-[11px] text-ink-500">live {rupees(liveOwn)}</div>}
                    {own === undefined && estimate === null && <div className="text-[11px] text-ink-400">no admin price</div>}
                  </div>
                  <span className="text-xs tabular-nums text-ink-500">{model.price ? rupees(model.price) : '—'}</span>
                  <div onFocus={() => focusPhone(model, key)}>
                    <NumberField
                      label={`${current?.brand} ${model.model} back glass amount`}
                      value={own}
                      optional
                      placeholder={estimate !== null ? String(estimate) : 'Back glass ₹'}
                      onChange={(v) => setAmount(key, v)}
                      min={ruleLimits.backGlassRupees[0]}
                      max={ruleLimits.backGlassRupees[1]}
                      step={STEP}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-500">
            A phone with no amount here keeps the body damage share from the table below. Cashify's amount is the offer for a flawless phone older
            than 11 months less the offer for the same phone with a broken back panel.
          </p>
        </>
      )}
    </section>
  );
}
