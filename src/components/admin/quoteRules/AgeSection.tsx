import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import NumberField from './NumberField';
import PhonePicker from './PhonePicker';
import { AGE_FIELDS, fetchPreviewModels, modelKey, modelLabelFromKey, phoneKey, ruleLimits, type PricingRules } from '../../../lib/quoteRules';
import type { BrandModels, PhoneChoice } from '../../../lib/phoneChoice';

interface AgeSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');

export default function AgeSection({ rules, live, onChange }: AgeSectionProps) {
  const [newModel, setNewModel] = useState('');
  const [newFactor, setNewFactor] = useState<number | undefined>(0.75);
  const [oldChoice, setOldChoice] = useState<PhoneChoice>({ brand: '', model: '', storage: '' });
  const [oldFactor, setOldFactor] = useState<number | undefined>(0.95);
  const [brands, setBrands] = useState<BrandModels[]>([]);

  // The names of the models on the old Android list come from the sell price rows; without them the key is shown.
  useEffect(() => {
    let alive = true;
    fetchPreviewModels().then((list) => { if (alive) setBrands(list); }).catch(() => undefined);
    return () => { alive = false; };
  }, []);
  const androidNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const brand of brands) for (const model of brand.models) names.set(phoneKey(brand.brand, model.model), `${brand.brand} ${model.model}`);
    return names;
  }, [brands]);
  const androidLabel = (key: string) => androidNames.get(key) ?? key;

  const setAge = (patch: Partial<PricingRules['age']>) => onChange({ ...rules, age: { ...rules.age, ...patch } });
  const setRecent = (key: string, factor: number | undefined) => {
    const next = { ...rules.age.recentIphone };
    if (factor === undefined) delete next[key];
    else next[key] = factor;
    setAge({ recentIphone: next });
  };

  const setOldAndroid = (key: string, factor: number | undefined) => {
    const next = { ...rules.age.oldAndroid };
    if (factor === undefined) delete next[key];
    else next[key] = factor;
    setAge({ oldAndroid: next });
  };
  // An iPhone has its own rules above, so the old Android list takes no Apple phone.
  const oldKey = oldChoice.brand && oldChoice.model && oldChoice.brand.toLowerCase() !== 'apple' ? phoneKey(oldChoice.brand, oldChoice.model) : '';

  const addRecent = () => {
    const key = modelKey(newModel);
    if (!key.startsWith('iphone') || newFactor === undefined) return;
    setRecent(key, newFactor);
    setNewModel('');
  };

  return (
    <section className="card p-5 space-y-5" aria-labelledby="age-rules">
      <div>
        <h3 id="age-rules" className="font-display text-base font-black text-ink-900">Age factor</h3>
        <p className="text-sm text-ink-600">
          What a phone is offered as a share of its admin price, by how old it is. 1.00 is the full price; 0.80 takes 20% off.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AGE_FIELDS.map((field) => (
          <div key={field.key} className={`rounded-xl border border-ink-200 p-3 ${changedClass(rules.age[field.key] !== live.age[field.key])}`}>
            <label className="label text-xs">{field.label}</label>
            <NumberField label={field.label} value={rules.age[field.key]} onChange={(v) => v !== undefined && setAge({ [field.key]: v })} min={ruleLimits.age[field.key][0]} max={ruleLimits.age[field.key][1]} />
            <p className="mt-1.5 text-[11px] leading-snug text-ink-500">{field.hint} Live: {live.age[field.key]}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border border-ink-200 p-3 sm:max-w-md ${changedClass(rules.age.oldIphone !== live.age.oldIphone)}`}>
        <label className="label text-xs">Old iPhone, older than 11 months</label>
        <NumberField label="Old iPhone age factor" value={rules.age.oldIphone} onChange={(v) => v !== undefined && setAge({ oldIphone: v })} min={ruleLimits.age.oldIphone[0]} max={ruleLimits.age.oldIphone[1]} />
        <p className="mt-1.5 text-[11px] leading-snug text-ink-500">
          Every iPhone launched in 2022 or before (iPhone 14 family, SE, 13, 12, 11, XS, XR, X, 8 and older). Cashify pays them about 0.96 of its market price. Live: {live.age.oldIphone}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(rules.age.samsungOver11 !== live.age.samsungOver11)}`}>
          <label className="label text-xs">Samsung, older than 11 months</label>
          <NumberField label="Samsung age factor" value={rules.age.samsungOver11} onChange={(v) => v !== undefined && setAge({ samsungOver11: v })} min={ruleLimits.age.samsungOver11[0]} max={ruleLimits.age.samsungOver11[1]} />
          <p className="mt-1.5 text-[11px] leading-snug text-ink-500">Every Samsung not on the old Android list below. Cashify pays about 0.77 of its market price. Live: {live.age.samsungOver11}</p>
        </div>
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(rules.age.androidOver11 !== live.age.androidOver11)}`}>
          <label className="label text-xs">Other Android, older than 11 months</label>
          <NumberField label="Other Android age factor" value={rules.age.androidOver11} onChange={(v) => v !== undefined && setAge({ androidOver11: v })} min={ruleLimits.age.androidOver11[0]} max={ruleLimits.age.androidOver11[1]} />
          <p className="mt-1.5 text-[11px] leading-snug text-ink-500">OnePlus, Realme, Vivo, Oppo, Xiaomi, Poco, iQOO, Motorola, Nothing, Google and the rest, not on the old Android list. Cashify pays about 0.72 of its market price. Live: {live.age.androidOver11}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-ink-800">Old Android phones, older than 11 months</h4>
        <p className="mb-2 text-xs text-ink-500">Cashify pays about 0.95 of its market price for a phone that is a few years old (Galaxy S21, S23 FE, OnePlus 10T). A phone listed here gets its own factor instead of the two above.</p>
        <div className="max-h-72 divide-y divide-ink-100 overflow-y-auto rounded-xl border border-ink-200">
          {Object.entries(rules.age.oldAndroid).length === 0 && <p className="p-3 text-sm text-ink-500">No Android phone is on the old list.</p>}
          {Object.entries(rules.age.oldAndroid).map(([key, factor]) => (
            <div key={key} className={`flex items-center gap-3 p-2.5 ${changedClass(live.age.oldAndroid[key] !== factor)}`}>
              <span className="flex-1 text-sm font-semibold text-ink-800">{androidLabel(key)}</span>
              <span className="hidden text-[11px] text-ink-400 sm:inline">live {live.age.oldAndroid[key] ?? 'none'}</span>
              <NumberField label={`${androidLabel(key)} age factor`} value={factor} onChange={(v) => v !== undefined && setOldAndroid(key, v)} min={ruleLimits.age.oldAndroid[0]} max={ruleLimits.age.oldAndroid[1]} className="w-24" />
              <button type="button" onClick={() => setOldAndroid(key, undefined)} aria-label={`Remove ${androidLabel(key)}`} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 grid items-end gap-2 rounded-xl bg-ink-50 p-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <PhonePicker value={oldChoice} onChange={setOldChoice} />
          <NumberField label="Old Android age factor" value={oldFactor} onChange={setOldFactor} min={ruleLimits.age.oldAndroid[0]} max={ruleLimits.age.oldAndroid[1]} className="w-24" />
          <button type="button" onClick={() => { if (oldKey && oldFactor !== undefined) setOldAndroid(oldKey, oldFactor); }} disabled={!oldKey || oldFactor === undefined} className="btn-outline px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-ink-800">Newest iPhones, older than 11 months</h4>
        <p className="mb-2 text-xs text-ink-500">An iPhone listed here gets its own factor. Any other iPhone newer than 2022 uses the “older than 11 months” factor above.</p>
        <div className="divide-y divide-ink-100 rounded-xl border border-ink-200">
          {Object.entries(rules.age.recentIphone).length === 0 && <p className="p-3 text-sm text-ink-500">No iPhone has its own factor.</p>}
          {Object.entries(rules.age.recentIphone).map(([key, factor]) => (
            <div key={key} className={`flex items-center gap-3 p-2.5 ${changedClass(live.age.recentIphone[key] !== factor)}`}>
              <span className="flex-1 text-sm font-semibold text-ink-800">{modelLabelFromKey(key)}</span>
              <span className="hidden text-[11px] text-ink-400 sm:inline">live {live.age.recentIphone[key] ?? 'none'}</span>
              <NumberField label={`${modelLabelFromKey(key)} age factor`} value={factor} onChange={(v) => v !== undefined && setRecent(key, v)} min={ruleLimits.age.recentIphone[0]} max={ruleLimits.age.recentIphone[1]} className="w-24" />
              <button type="button" onClick={() => setRecent(key, undefined)} aria-label={`Remove ${modelLabelFromKey(key)}`} className="rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 bg-ink-50 p-2.5">
            <input
              value={newModel}
              onChange={(event) => setNewModel(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') addRecent(); }}
              placeholder="iPhone 17e"
              aria-label="New iPhone model"
              className="input min-w-[10rem] flex-1 py-2 text-sm"
            />
            <NumberField label="New iPhone age factor" value={newFactor} onChange={setNewFactor} min={ruleLimits.age.recentIphone[0]} max={ruleLimits.age.recentIphone[1]} className="w-24" />
            <button type="button" onClick={addRecent} disabled={!modelKey(newModel).startsWith('iphone') || newFactor === undefined} className="btn-outline px-3 py-2 text-sm">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
