import NumberField from './NumberField';
import { ruleLimits, type PricingRules } from '../../../lib/quoteRules';

interface OtherSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

export default function OtherSection({ rules, live, onChange }: OtherSectionProps) {
  const changed = rules.samsungMidFactor !== live.samsungMidFactor;
  return (
    <section className="card p-5 space-y-3" aria-labelledby="other-rules">
      <div>
        <h3 id="other-rules" className="font-display text-base font-black text-ink-900">Samsung screen factor</h3>
        <p className="text-sm text-ink-600">
          A Samsung phone priced from ₹20,000 up to ₹60,000 takes this much of the middle screen table. Cashify takes about 0.8 of what it takes off an iPhone
          or a OnePlus there (a crack is 26-30% of the offer on a Galaxy S23, S23 Ultra, S24 and S24+, against 36-38% on an iPhone).
        </p>
      </div>
      <div className={`rounded-xl border border-ink-200 p-3 sm:max-w-md ${changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : ''}`}>
        <label className="label text-xs">Samsung factor</label>
        <NumberField label="Samsung screen factor" value={rules.samsungMidFactor} onChange={(v) => v !== undefined && onChange({ ...rules, samsungMidFactor: v })} min={ruleLimits.samsungMidFactor[0]} max={ruleLimits.samsungMidFactor[1]} />
        <p className="mt-1.5 text-[11px] text-ink-500">Live: {live.samsungMidFactor}. Cheap phones and phones from ₹60,000 up are not affected.</p>
      </div>
    </section>
  );
}
