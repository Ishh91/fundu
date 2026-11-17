import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import NumberField from './NumberField';
import { AGE_FIELDS, modelKey, modelLabelFromKey, ruleLimits, type PricingRules } from '../../../lib/quoteRules';

interface AgeSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');

export default function AgeSection({ rules, live, onChange }: AgeSectionProps) {
  const [newModel, setNewModel] = useState('');
  const [newFactor, setNewFactor] = useState<number | undefined>(0.75);

  const setAge = (patch: Partial<PricingRules['age']>) => onChange({ ...rules, age: { ...rules.age, ...patch } });
  const setRecent = (key: string, factor: number | undefined) => {
    const next = { ...rules.age.recentIphone };
    if (factor === undefined) delete next[key];
    else next[key] = factor;
    setAge({ recentIphone: next });
  };

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
