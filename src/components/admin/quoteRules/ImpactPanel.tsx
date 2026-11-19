import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Minus, Plus, X } from 'lucide-react';
import { fetchPreviewModels, type PricingRules } from '../../../lib/quoteRules';
import type { BrandModels, ModelStorages } from '../../../lib/phoneChoice';
import { IMPACT_SCENARIOS, computeImpactRow, impactPhoneKey, type ImpactPhone } from '../../../lib/quoteImpact';

interface ImpactPanelProps {
  rules: PricingRules;
  live: PricingRules;
  pinned: ImpactPhone[];
  onPin: (phone: ImpactPhone) => void;
  onUnpin: (phone: Pick<ImpactPhone, 'brand' | 'model' | 'storage'>) => void;
}

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const startStorage = (model: ModelStorages) => (model.storages.includes('128 GB') ? '128 GB' : model.storages[0] ?? '128 GB');

/**
 * A sticky panel that quotes a handful of reference phones under the live rules and the edited rules, side by side. It lets the
 * admin see what a draft change does to a real phone before saving. Everything is computed in the browser (quotePhone), so there
 * is no network round-trip per keystroke. Scenario (flawless, cracked, panel broken, etc.) and the pinned phones are the admin's
 * own choice; a phone whose rule the admin edits is pinned to the top automatically from the rule section's own callback.
 */
export default function ImpactPanel({ rules, live, pinned, onPin, onUnpin }: ImpactPanelProps) {
  const [open, setOpen] = useState(true);
  const [scenarioKey, setScenarioKey] = useState<string>(IMPACT_SCENARIOS[0].key);
  const [addBrand, setAddBrand] = useState('');
  const [addModel, setAddModel] = useState('');
  const [catalog, setCatalog] = useState<BrandModels[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPreviewModels().then((list) => { if (alive) setCatalog(list); }).catch(() => { if (alive) setCatalog([]); });
    return () => { alive = false; };
  }, []);

  const scenario = IMPACT_SCENARIOS.find((s) => s.key === scenarioKey) ?? IMPACT_SCENARIOS[0];

  // Defer the two rule sets so a burst of edits does not stall the render; the panel catches up a tick later.
  const deferredRules = useDeferredValue(rules);
  const deferredLive = useDeferredValue(live);

  const rows = useMemo(
    () => pinned.map((phone) => computeImpactRow(phone, scenario, deferredLive, deferredRules)),
    [pinned, scenario, deferredLive, deferredRules],
  );

  const brandList = catalog ?? [];
  const currentBrand = brandList.find((b) => b.brand === addBrand) ?? brandList[0];
  const modelOptions = currentBrand?.models ?? [];
  const chosenModel = modelOptions.find((m) => m.model === addModel) ?? null;

  const addPinned = () => {
    if (!currentBrand || !chosenModel) return;
    onPin({ brand: currentBrand.brand, model: chosenModel.model, storage: startStorage(chosenModel), price: chosenModel.price ?? 0 });
    setAddModel('');
  };

  return (
    <section className="card sticky top-2 z-20 border border-brand-200 bg-brand-50/40 p-4 space-y-3" aria-labelledby="impact-panel">
      <header className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="impact-panel-body" className="btn-outline px-2 py-1 text-xs">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} {open ? 'Hide' : 'Show'}
        </button>
        <h3 id="impact-panel" className="font-display text-sm font-black text-ink-900">Impact of your edits · {pinned.length} phone{pinned.length === 1 ? '' : 's'} pinned</h3>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-[11px] text-ink-600">Scenario</label>
          <select value={scenarioKey} onChange={(event) => setScenarioKey(event.target.value)} aria-label="Scenario" className="input w-auto py-1 text-xs">
            {IMPACT_SCENARIOS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </header>

      {open && (
        <div id="impact-panel-body" className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-xs text-ink-500">No phones pinned yet. Add one below, or start editing a rule for a specific phone &mdash; it will pin automatically.</p>
          ) : (
            <ul className="divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white">
              {rows.map(({ phone, liveOffer, draftOffer, delta }) => {
                const key = impactPhoneKey(phone);
                return (
                  <li key={key} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-3 py-2 text-sm">
                    <div>
                      <div className="font-semibold text-ink-800">{phone.brand} {phone.model}</div>
                      <div className="text-[11px] text-ink-500">{phone.storage}{phone.price > 0 ? ` · admin ${rupees(phone.price)}` : ' · no admin price'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-ink-400">Live</div>
                      <div className="tabular-nums font-medium text-ink-700">{liveOffer === null ? '—' : rupees(liveOffer)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-ink-400">Draft</div>
                      <div className="tabular-nums font-bold text-ink-900">{draftOffer === null ? '—' : rupees(draftOffer)}</div>
                    </div>
                    <div className="min-w-[4.5rem] text-right">
                      {delta === null ? (
                        <span className="text-[11px] text-ink-400">no change</span>
                      ) : delta === 0 ? (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-600"><Minus className="h-3 w-3" /> ₹0</span>
                      ) : delta > 0 ? (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700"><ArrowUp className="h-3 w-3" /> +{rupees(delta)}</span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-700"><ArrowDown className="h-3 w-3" /> {rupees(delta)}</span>
                      )}
                    </div>
                    <button type="button" onClick={() => onUnpin(phone)} aria-label={`Remove ${phone.brand} ${phone.model}`} className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"><X className="h-3.5 w-3.5" /></button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-white p-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Pin a phone</span>
            <select value={currentBrand?.brand ?? ''} onChange={(event) => { setAddBrand(event.target.value); setAddModel(''); }} aria-label="Brand" className="input w-auto py-1 text-xs" disabled={!catalog || catalog.length === 0}>
              {brandList.map((b) => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
            </select>
            <select value={addModel} onChange={(event) => setAddModel(event.target.value)} aria-label="Model" className="input w-auto py-1 text-xs" disabled={modelOptions.length === 0}>
              <option value="">Select model…</option>
              {modelOptions.map((m) => <option key={m.model} value={m.model}>{m.model}</option>)}
            </select>
            <button type="button" onClick={addPinned} disabled={!chosenModel} className="btn-primary px-2.5 py-1 text-xs"><Plus className="h-3 w-3" /> Pin</button>
          </div>

          <p className="text-[11px] text-ink-500">
            Offer is simulated as a phone older than 11 months with every accessory present. Save the draft to keep your edits across page
            loads, and publish them when you are ready to make them live.
          </p>
        </div>
      )}
    </section>
  );
}
