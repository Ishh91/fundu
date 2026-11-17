import NumberField from './NumberField';
import { BODY_CONDITION_LABELS, BODY_KIND_LABELS, FAULT_LABELS, ruleLimits, type PricingRules } from '../../../lib/quoteRules';

interface SectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

const BODY_KINDS = ['standard', 'premiumApple', 'premiumAndroid'] as const;
const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');
const pct = (n: number | undefined) => (n === undefined ? '' : `${(n * 100).toFixed(2).replace(/\.?0+$/, '')}%`);

export function BodyDamageSection({ rules, live, onChange }: SectionProps) {
  const set = (kind: (typeof BODY_KINDS)[number], condition: string, value: number | undefined) => {
    if (value === undefined) return;
    onChange({ ...rules, bodyDamage: { ...rules.bodyDamage, [kind]: { ...rules.bodyDamage[kind], [condition]: value } } });
  };
  return (
    <section className="card p-5 space-y-4" aria-labelledby="body-rules">
      <div>
        <h3 id="body-rules" className="font-display text-base font-black text-ink-900">Body damage</h3>
        <p className="text-sm text-ink-600">
          What dents, scratches or a broken panel take off, as a share of the phone's value. It is not taken on top of a screen that needs repair.
          Cashify takes more off a premium iPhone than off a premium Android phone.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {BODY_KINDS.map((kind) => (
          <div key={kind} className="rounded-xl border border-ink-200 p-3">
            <h4 className="mb-2 text-sm font-bold text-ink-800">{BODY_KIND_LABELS[kind]}</h4>
            <div className="space-y-2">
              {Object.keys(rules.bodyDamage[kind]).map((condition) => (
                <div key={condition} className={`rounded-lg p-1.5 ${changedClass(live.bodyDamage[kind][condition] !== rules.bodyDamage[kind][condition])}`}>
                  <label className="text-[11px] font-semibold text-ink-600">{BODY_CONDITION_LABELS[condition] ?? condition}</label>
                  <div className="flex items-center gap-2">
                    <NumberField label={`${BODY_KIND_LABELS[kind]}: ${BODY_CONDITION_LABELS[condition] ?? condition}`} value={rules.bodyDamage[kind][condition]} onChange={(v) => set(kind, condition, v)} min={ruleLimits.bodyShare[0]} max={ruleLimits.bodyShare[1]} className="w-28" />
                    <span className="text-[11px] tabular-nums text-ink-500">{pct(rules.bodyDamage[kind][condition])}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaultsSection({ rules, live, onChange }: SectionProps) {
  const faults = rules.faults;
  const setFaults = (patch: Partial<PricingRules['faults']>) => onChange({ ...rules, faults: { ...faults, ...patch } });
  const setMap = (map: 'share' | 'min' | 'flatAndroid' | 'repairFactor', key: string, value: number | undefined) => {
    if (value === undefined) return;
    setFaults({ [map]: { ...faults[map], [key]: value } });
  };
  const rowChanged = (key: string) => (['share', 'min', 'flatAndroid'] as const).some((map) => live.faults[map][key] !== faults[map][key]);

  return (
    <section className="card p-5 space-y-5" aria-labelledby="fault-rules">
      <div>
        <h3 id="fault-rules" className="font-display text-base font-black text-ink-900">Faults</h3>
        <p className="text-sm text-ink-600">
          What each fault the seller reports takes off. A share is taken off the phone's value; the minimum is the least it takes off a cheap phone; an Android
          phone takes the flat amount instead when there is one (an iPhone's parts cost more, so it keeps its share).
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
            <tr><th scope="col" className="px-3 py-2 text-left">Fault</th><th scope="col" className="px-3 py-2 text-left">Share</th><th scope="col" className="px-3 py-2 text-left">Minimum ₹</th><th scope="col" className="px-3 py-2 text-left">Android flat ₹</th></tr>
          </thead>
          <tbody>
            {Object.keys(faults.share).map((key) => (
              <tr key={key} className={`border-t border-ink-100 ${rowChanged(key) ? 'bg-amber-50/70' : ''}`}>
                <th scope="row" className="px-3 py-1.5 text-left font-medium text-ink-700">{FAULT_LABELS[key] ?? key}</th>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <NumberField label={`${FAULT_LABELS[key] ?? key} share`} value={faults.share[key]} onChange={(v) => setMap('share', key, v)} min={ruleLimits.faultShare[0]} max={ruleLimits.faultShare[1]} className="w-24" />
                    <span className="w-10 text-[11px] tabular-nums text-ink-500">{pct(faults.share[key])}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  {faults.min[key] !== undefined
                    ? <NumberField label={`${FAULT_LABELS[key] ?? key} minimum`} value={faults.min[key]} onChange={(v) => setMap('min', key, v)} min={ruleLimits.faultRupees[0]} max={ruleLimits.faultRupees[1]} step={10} className="w-24" />
                    : <span className="text-ink-300">—</span>}
                </td>
                <td className="px-3 py-1.5">
                  {faults.flatAndroid[key] !== undefined
                    ? <NumberField label={`${FAULT_LABELS[key] ?? key} flat amount on Android`} value={faults.flatAndroid[key]} onChange={(v) => setMap('flatAndroid', key, v)} min={ruleLimits.faultRupees[0]} max={ruleLimits.faultRupees[1]} step={10} className="w-24" />
                    : <span className="text-ink-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-500">Face ID / fingerprint counts on an iPhone and on an Android phone from ₹60,000 only; a cheaper Android phone has no such sensor to repair. WiFi and Bluetooth are taken off once, not twice.</p>

      <div>
        <h4 className="text-sm font-bold text-ink-800">Faults that cost a part of the model's repair</h4>
        <p className="mb-2 text-xs text-ink-500">The back camera takes the model's camera repair cost times 1; the front camera and the camera glass a part of it; a battery fault the battery replacement.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(faults.repairFactor).map((key) => (
            <div key={key} className={`rounded-xl border border-ink-200 p-2 ${changedClass(live.faults.repairFactor[key] !== faults.repairFactor[key])}`}>
              <label className="text-[11px] font-semibold text-ink-600">{FAULT_LABELS[key] ?? key}</label>
              <NumberField label={`${FAULT_LABELS[key] ?? key} repair factor`} value={faults.repairFactor[key]} onChange={(v) => setMap('repairFactor', key, v)} min={ruleLimits.repairFactor[0]} max={ruleLimits.repairFactor[1]} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(live.faults.screenNotOriginalShare !== faults.screenNotOriginalShare)}`}>
          <label className="label text-xs">Replaced (non-original) screen</label>
          <NumberField label="Replaced screen share of a crack" value={faults.screenNotOriginalShare} onChange={(v) => v !== undefined && setFaults({ screenNotOriginalShare: v })} min={ruleLimits.screenNotOriginalShare[0]} max={ruleLimits.screenNotOriginalShare[1]} />
          <p className="mt-1 text-[11px] text-ink-500">As a share of a cracked screen. Cashify: 0.76 to 1.09.</p>
        </div>
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(live.faults.unknownShare !== faults.unknownShare)}`}>
          <label className="label text-xs">A fault with no rule of its own</label>
          <NumberField label="Share for a fault that is not listed" value={faults.unknownShare} onChange={(v) => v !== undefined && setFaults({ unknownShare: v })} min={ruleLimits.unknownShare[0]} max={ruleLimits.unknownShare[1]} />
          <p className="mt-1 text-[11px] text-ink-500">Share of the price, so a new fault is never ignored.</p>
        </div>
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(live.faults.callsSalvageApple !== faults.callsSalvageApple)}`}>
          <label className="label text-xs">Calls not working: iPhone, or phone from ₹20,000</label>
          <NumberField label="Calls not working, iPhone or phone from 20000" value={faults.callsSalvageApple} onChange={(v) => v !== undefined && setFaults({ callsSalvageApple: v })} min={ruleLimits.salvage[0]} max={ruleLimits.salvage[1]} step={10} />
          <p className="mt-1 text-[11px] text-ink-500">Sent to inspection; this is the estimate shown.</p>
        </div>
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(live.faults.callsSalvageOther !== faults.callsSalvageOther)}`}>
          <label className="label text-xs">Calls not working: cheaper Android</label>
          <NumberField label="Calls not working, cheaper Android phone" value={faults.callsSalvageOther} onChange={(v) => v !== undefined && setFaults({ callsSalvageOther: v })} min={ruleLimits.salvage[0]} max={ruleLimits.salvage[1]} step={10} />
        </div>
      </div>
    </section>
  );
}

export function AccessoriesSection({ rules, live, onChange }: SectionProps) {
  const set = (patch: Partial<PricingRules['accessories']>) => onChange({ ...rules, accessories: { ...rules.accessories, ...patch } });
  const fields: { key: 'box' | 'charger' | 'bill'; label: string }[] = [
    { key: 'box', label: 'Missing original box' },
    { key: 'charger', label: 'Missing original charger' },
    { key: 'bill', label: 'Missing valid bill' },
  ];
  return (
    <section className="card p-5 space-y-3" aria-labelledby="accessory-rules">
      <div>
        <h3 id="accessory-rules" className="font-display text-base font-black text-ink-900">Accessories</h3>
        <p className="text-sm text-ink-600">What a seller who has no box, charger or bill is offered less, in rupees. Set 0 to take nothing for it.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <div key={field.key} className={`rounded-xl border border-ink-200 p-3 ${changedClass(live.accessories[field.key] !== rules.accessories[field.key])}`}>
            <label className="label text-xs">{field.label} (₹)</label>
            <NumberField label={`${field.label}, rupees`} value={rules.accessories[field.key]} onChange={(v) => v !== undefined && set({ [field.key]: v })} min={ruleLimits.accessoryRupees[0]} max={ruleLimits.accessoryRupees[1]} step={10} />
          </div>
        ))}
        <div className={`rounded-xl border border-ink-200 p-3 ${changedClass(live.accessories.lowEndMaxShare !== rules.accessories.lowEndMaxShare)}`}>
          <label className="label text-xs">Most all of them take off a phone under ₹20,000</label>
          <NumberField label="Most accessories take off a cheap phone" value={rules.accessories.lowEndMaxShare} onChange={(v) => v !== undefined && set({ lowEndMaxShare: v })} min={ruleLimits.accessoryMaxShare[0]} max={ruleLimits.accessoryMaxShare[1]} />
          <p className="mt-1 text-[11px] text-ink-500">As a share of its value, so ₹800 never takes 17% off a ₹4,800 phone.</p>
        </div>
      </div>
    </section>
  );
}
