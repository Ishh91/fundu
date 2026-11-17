import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import NumberField from './NumberField';
import { fetchPreviewModels, phoneKey, ruleLimits, type PricingRules } from '../../../lib/quoteRules';
import type { BrandModels, ModelStorages } from '../../../lib/phoneChoice';
import { estimateCrackRupees } from '../../../lib/screenEstimate';

interface BrandScreenSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

type Show = 'all' | 'own' | 'estimate';

const STEP = 10;
const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const startStorage = (model: ModelStorages) => (model.storages.includes('128 GB') ? '128 GB' : model.storages[0] ?? '128 GB');

/**
 * The screen amount of every Android phone, one table per brand like the iPhone table above: what is taken off for a cracked screen
 * and for a screen whose touch does not work. A phone with its own amount (measured on Cashify, or typed in here) is priced on it; any
 * other phone shows what the screen tables give today, in grey, and is priced on that until an amount is typed in.
 */
export default function BrandScreenSection({ rules, live, onChange }: BrandScreenSectionProps) {
  const [brands, setBrands] = useState<BrandModels[] | null>(null);
  const [brand, setBrand] = useState('');
  const [search, setSearch] = useState('');
  const [show, setShow] = useState<Show>('all');
  const [failed, setFailed] = useState(false);
  const { crackRupees, touchRupees } = rules.androidScreen;

  useEffect(() => {
    let alive = true;
    fetchPreviewModels()
      .then((list) => { if (alive) setBrands(list.filter((b) => b.brand.toLowerCase() !== 'apple')); })
      .catch(() => { if (alive) { setBrands([]); setFailed(true); } });
    return () => { alive = false; };
  }, []);

  const current = brands?.find((b) => b.brand === brand) ?? brands?.[0];
  const counts = useMemo(() => new Map((brands ?? []).map((b) => [b.brand, b.models.filter((m) => crackRupees[phoneKey(b.brand, m.model)] !== undefined).length])), [brands, crackRupees]);

  const rows = useMemo(() => {
    if (!current) return [];
    return current.models.map((model) => {
      const key = phoneKey(current.brand, model.model);
      const own = crackRupees[key];
      const estimate = own === undefined ? estimateCrackRupees(current.brand, model.model, startStorage(model), model.price ?? 0, rules) : null;
      return { model, key, own, estimate };
    });
  }, [current, crackRupees, rules]);

  const text = search.trim().toLowerCase();
  const shown = rows.filter((row) => row.model.model.toLowerCase().includes(text)
    && (show === 'all' || (show === 'own' ? row.own !== undefined : row.own === undefined)));

  const setAmount = (field: 'crackRupees' | 'touchRupees', key: string, value: number | undefined) => {
    const next = { ...rules.androidScreen[field] };
    if (value === undefined) delete next[key];
    else next[key] = value;
    const androidScreen = { ...rules.androidScreen, [field]: next };
    // A touch amount means nothing without a crack amount to go with it.
    if (field === 'crackRupees' && value === undefined) {
      const touch = { ...androidScreen.touchRupees };
      delete touch[key];
      androidScreen.touchRupees = touch;
    }
    onChange({ ...rules, androidScreen });
  };

  return (
    <section className="card p-5 space-y-4" aria-labelledby="android-screen-rules">
      <div>
        <h3 id="android-screen-rules" className="font-display text-base font-black text-ink-900">Screen amounts by brand</h3>
        <p className="text-sm text-ink-600">
          The same as the iPhone amounts above, for every other brand: what is taken off a phone for a cracked screen, in rupees, the same on every
          storage. It is the model's own amount as Cashify sets it, not a share of the price (an iQOO 15 on ₹40,950 is ₹5,950; a Galaxy S21 on ₹14,280
          is ₹5,350). A phone with an amount in the box is priced on it. A phone with an empty box shows in grey what the screen tables below give today,
          and is priced on that; on the phones measured that was off by about 20% on average, so type in Cashify's amount when you know it.
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
              <option value="estimate">From the tables (grey)</option>
            </select>
            <span className="text-xs text-ink-500">{shown.length} of {rows.length} phones</span>
          </div>

          <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-ink-200">
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_5.5rem_6.5rem_6.5rem] items-center gap-2 border-b border-ink-200 bg-ink-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
              <span>Phone</span><span>Admin price</span><span>Crack ₹</span><span>Touch ₹</span>
            </div>
            {shown.length === 0 && <p className="p-3 text-sm text-ink-500">No phone matches.</p>}
            {shown.map(({ model, key, own, estimate }) => {
              const touch = touchRupees[key];
              const liveCrack = live.androidScreen.crackRupees[key];
              const liveTouch = live.androidScreen.touchRupees[key];
              const changed = liveCrack !== own || liveTouch !== touch;
              const touchPlaceholder = own !== undefined ? Math.round((own * rules.appleScreen.multiples.touch_fault) / STEP) * STEP : estimate !== null ? Math.round((estimate * rules.appleScreen.multiples.touch_fault) / STEP) * STEP : null;
              return (
                <div key={model.model} className={`grid grid-cols-[1fr_5.5rem_6.5rem_6.5rem] items-center gap-2 border-b border-ink-100 px-3 py-1.5 last:border-b-0 ${changedClass(changed)}`}>
                  <div>
                    <div className="text-sm font-semibold text-ink-800">{model.model}</div>
                    {liveCrack === undefined && own !== undefined && <div className="text-[11px] text-emerald-700">new</div>}
                    {changed && liveCrack !== undefined && <div className="text-[11px] text-ink-500">live {rupees(liveCrack)}{liveTouch ? ` / touch ${rupees(liveTouch)}` : ''}</div>}
                    {own === undefined && estimate === null && <div className="text-[11px] text-ink-400">no admin price</div>}
                  </div>
                  <span className="text-xs tabular-nums text-ink-500">{model.price ? rupees(model.price) : '—'}</span>
                  <NumberField
                    label={`${current?.brand} ${model.model} crack amount`}
                    value={own}
                    optional
                    placeholder={estimate !== null ? String(estimate) : 'Crack ₹'}
                    onChange={(v) => setAmount('crackRupees', key, v)}
                    min={ruleLimits.crackRupees[0]}
                    max={ruleLimits.crackRupees[1]}
                    step={STEP}
                  />
                  <NumberField
                    label={`${current?.brand} ${model.model} touch amount`}
                    value={touch}
                    optional
                    placeholder={touchPlaceholder === null ? 'Touch ₹' : String(touchPlaceholder)}
                    onChange={(v) => (own !== undefined || v === undefined) && setAmount('touchRupees', key, v)}
                    min={ruleLimits.touchRupees[0]}
                    max={ruleLimits.touchRupees[1]}
                    step={STEP}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-500">
            Leave Touch ₹ empty to use the crack amount times the touch multiple in the iPhone section; the grey number is what that comes to. A touch amount
            needs a crack amount in the same row. Cashify's amount is the offer for a flawless phone less the offer with a cracked screen, older than 11 months.
          </p>
        </>
      )}
    </section>
  );
}
