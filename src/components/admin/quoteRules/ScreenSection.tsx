import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import NumberField from './NumberField';
import { SCREEN_STATE_LABELS, modelKey, modelLabelFromKey, ruleLimits, screenStateKeys, type PricingRules } from '../../../lib/quoteRules';

interface ScreenSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const byKey = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

export default function ScreenSection({ rules, live, onChange }: ScreenSectionProps) {
  const [search, setSearch] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCrack, setNewCrack] = useState<number | undefined>(undefined);
  const screen = rules.appleScreen;

  const keys = useMemo(() => Object.keys(screen.crackRupees).sort(byKey), [screen.crackRupees]);
  const shown = keys.filter((key) => modelLabelFromKey(key).toLowerCase().includes(search.trim().toLowerCase()));

  const setScreen = (patch: Partial<PricingRules['appleScreen']>) => onChange({ ...rules, appleScreen: { ...screen, ...patch } });
  const setCrack = (key: string, value: number | undefined) => {
    const next = { ...screen.crackRupees };
    if (value === undefined) {
      delete next[key];
      const touch = { ...screen.touchRupees };
      delete touch[key];
      setScreen({ crackRupees: next, touchRupees: touch });
      return;
    }
    next[key] = value;
    setScreen({ crackRupees: next });
  };
  const setTouch = (key: string, value: number | undefined) => {
    const next = { ...screen.touchRupees };
    if (value === undefined) delete next[key];
    else next[key] = value;
    setScreen({ touchRupees: next });
  };

  const addModel = () => {
    const key = modelKey(newModel);
    if (key.length < 2 || newCrack === undefined || screen.crackRupees[key] !== undefined) return;
    setCrack(key, newCrack);
    setNewModel('');
    setNewCrack(undefined);
  };

  const sampleKey = 'iphone14';
  const sampleCrack = screen.crackRupees[sampleKey];

  return (
    <section className="card p-5 space-y-5" aria-labelledby="screen-rules">
      <div>
        <h3 id="screen-rules" className="font-display text-base font-black text-ink-900">iPhone screen amounts</h3>
        <p className="text-sm text-ink-600">
          What is taken off an iPhone for a cracked screen, in rupees, the same on every storage. It is the model's own amount, as Cashify does it,
          not a share of the price. An iPhone that is not listed is priced by its price range instead.
        </p>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an iPhone" aria-label="Find an iPhone" className="input py-2 pl-9 text-sm" />
          </div>
          <span className="text-xs text-ink-500">{shown.length} of {keys.length} models</span>
        </div>
        <div className="max-h-[26rem] overflow-y-auto rounded-xl border border-ink-200">
          <div className="sticky top-0 z-10 grid grid-cols-[1fr_6.5rem_6.5rem_2.25rem] items-center gap-2 border-b border-ink-200 bg-ink-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
            <span>Model</span><span>Crack ₹</span><span>Touch ₹</span><span />
          </div>
          {shown.length === 0 && <p className="p-3 text-sm text-ink-500">No model matches.</p>}
          {shown.map((key) => {
            const crack = screen.crackRupees[key];
            const touch = screen.touchRupees[key];
            const changed = live.appleScreen.crackRupees[key] !== crack || live.appleScreen.touchRupees[key] !== touch;
            return (
              <div key={key} className={`grid grid-cols-[1fr_6.5rem_6.5rem_2.25rem] items-center gap-2 border-b border-ink-100 px-3 py-1.5 last:border-b-0 ${changedClass(changed)}`}>
                <div>
                  <div className="text-sm font-semibold text-ink-800">{modelLabelFromKey(key)}</div>
                  {live.appleScreen.crackRupees[key] === undefined
                    ? <div className="text-[11px] text-emerald-700">new</div>
                    : changed && <div className="text-[11px] text-ink-500">live {rupees(live.appleScreen.crackRupees[key])}{live.appleScreen.touchRupees[key] ? ` / touch ${rupees(live.appleScreen.touchRupees[key])}` : ''}</div>}
                </div>
                <NumberField label={`${modelLabelFromKey(key)} crack amount`} value={crack} onChange={(v) => setCrack(key, v === undefined ? crack : v)} min={ruleLimits.crackRupees[0]} max={ruleLimits.crackRupees[1]} step={10} />
                <NumberField label={`${modelLabelFromKey(key)} touch amount`} value={touch} optional placeholder={`${Math.round(crack * screen.multiples.touch_fault / 10) * 10 || ''}`} onChange={(v) => setTouch(key, v)} min={ruleLimits.touchRupees[0]} max={ruleLimits.touchRupees[1]} step={10} />
                <button type="button" onClick={() => setCrack(key, undefined)} aria-label={`Remove ${modelLabelFromKey(key)}`} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-ink-500">Leave Touch ₹ empty to use the crack amount times the touch multiple below; the grey number is what that comes to.</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-2.5">
          <input value={newModel} onChange={(event) => setNewModel(event.target.value)} placeholder="Add a model, e.g. iPhone 18" aria-label="New iPhone model" className="input min-w-[10rem] flex-1 py-2 text-sm" />
          <NumberField label="New model crack amount" value={newCrack} optional placeholder="Crack ₹" onChange={setNewCrack} min={ruleLimits.crackRupees[0]} max={ruleLimits.crackRupees[1]} step={10} className="w-28" />
          <button type="button" onClick={addModel} disabled={modelKey(newModel).length < 2 || newCrack === undefined || screen.crackRupees[modelKey(newModel)] !== undefined} className="btn-outline px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Add model
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-ink-800">Every other screen state, as a multiple of the crack</h4>
        <p className="mb-2 text-xs text-ink-500">
          On Cashify these were the same on an iPhone 14, an iPhone 17 Pro Max, a Galaxy S26 Ultra and a Galaxy S25 Ultra.
          {sampleCrack ? ` The last column shows what each one is on an iPhone 14 (${rupees(sampleCrack)} for a crack).` : ''}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {screenStateKeys.map((state) => (
            <div key={state} className={`flex items-center gap-2 rounded-xl border border-ink-200 p-2 ${changedClass(live.appleScreen.multiples[state] !== screen.multiples[state])}`}>
              <span className="flex-1 text-sm text-ink-700">{SCREEN_STATE_LABELS[state] ?? state}</span>
              {state === 'cracked'
                ? <span className="w-20 px-3 text-sm font-mono text-ink-500">1</span>
                : <NumberField label={`${SCREEN_STATE_LABELS[state] ?? state} multiple`} value={screen.multiples[state]} onChange={(v) => v !== undefined && setScreen({ multiples: { ...screen.multiples, [state]: v } })} min={ruleLimits.multiple[0]} max={ruleLimits.multiple[1]} className="w-20" />}
              <span className="w-16 text-right text-[11px] text-ink-500">{sampleCrack ? rupees(sampleCrack * (screen.multiples[state] ?? 0)) : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border border-ink-200 p-3 sm:max-w-md ${changedClass(live.appleScreen.maxShare !== screen.maxShare)}`}>
        <label className="label text-xs">Most a screen can take off</label>
        <NumberField label="Most a screen can take off" value={screen.maxShare} onChange={(v) => v !== undefined && setScreen({ maxShare: v })} min={ruleLimits.maxShare[0]} max={ruleLimits.maxShare[1]} />
        <p className="mt-1.5 text-[11px] leading-snug text-ink-500">As a share of the phone's value. A guard for a cheap phone with a big amount, so a screen never takes more than this. Live: {live.appleScreen.maxShare}</p>
      </div>
    </section>
  );
}
