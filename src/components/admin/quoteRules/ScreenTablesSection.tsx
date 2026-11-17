import NumberField from './NumberField';
import { SCREEN_STATE_LABELS, TIER_LABELS, ruleLimits, screenStateKeys, type PricingRules } from '../../../lib/quoteRules';

interface ScreenTablesSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

const TIERS = ['low', 'mid', 'high'] as const;
const pct = (n: number | undefined) => (n === undefined ? '' : `${(n * 100).toFixed(1).replace(/\.0$/, '')}%`);

export default function ScreenTablesSection({ rules, live, onChange }: ScreenTablesSectionProps) {
  const set = (tier: (typeof TIERS)[number], state: string, value: number | undefined) => {
    if (value === undefined) return;
    onChange({ ...rules, screenTables: { ...rules.screenTables, [tier]: { ...rules.screenTables[tier], [state]: value } } });
  };

  return (
    <section className="card p-5 space-y-4" aria-labelledby="screen-tables">
      <div>
        <h3 id="screen-tables" className="font-display text-base font-black text-ink-900">Screen share by price range</h3>
        <p className="text-sm text-ink-600">
          What each screen state takes off a phone as a share of its value, for every phone that has no amount of its own above (all Android phones, and an
          iPhone that is not listed). A phone priced ₹20,000–₹25,000 moves gradually from the first table to the second. A Samsung from ₹20,000 to ₹60,000
          takes the Samsung factor below of the middle table.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-ink-200">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="bg-ink-50 text-[11px] font-bold uppercase tracking-wide text-ink-500">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Screen</th>
              {TIERS.map((tier) => <th key={tier} scope="col" className="px-3 py-2 text-left">{TIER_LABELS[tier]}</th>)}
            </tr>
          </thead>
          <tbody>
            {screenStateKeys.map((state) => (
              <tr key={state} className="border-t border-ink-100">
                <th scope="row" className="px-3 py-1.5 text-left font-medium text-ink-700">{SCREEN_STATE_LABELS[state] ?? state}</th>
                {TIERS.map((tier) => {
                  const value = rules.screenTables[tier][state];
                  const changed = live.screenTables[tier][state] !== value;
                  return (
                    <td key={tier} className={`px-3 py-1.5 ${changed ? 'bg-amber-50/70' : ''}`}>
                      <div className="flex items-center gap-2">
                        <NumberField label={`${SCREEN_STATE_LABELS[state] ?? state}, ${TIER_LABELS[tier]}`} value={value} onChange={(v) => set(tier, state, v)} min={ruleLimits.screenShare[0]} max={ruleLimits.screenShare[1]} className="w-24" />
                        <span className="w-12 text-[11px] tabular-nums text-ink-500">{pct(value)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-500">Each table must take more off for a worse screen: light scratches, then many scratches, then a crack, then touch not working.</p>
    </section>
  );
}
