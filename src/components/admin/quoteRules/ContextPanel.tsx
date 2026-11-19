import { useDeferredValue, useMemo } from 'react';
import { ArrowDown, ArrowUp, Minus, MousePointerClick } from 'lucide-react';
import type { PricingRules } from '../../../lib/quoteRules';
import { IMPACT_SCENARIOS, quoteImpactOffer, type ImpactScenario } from '../../../lib/quoteImpact';

export type FieldKind = 'crack' | 'touch' | 'back_glass';

export interface FocusedField {
  phone: { brand: string; model: string; storage: string; price: number };
  modelKey: string;
  fieldKind: FieldKind;
}

interface ContextPanelProps {
  rules: PricingRules;
  live: PricingRules;
  focused: FocusedField | null;
}

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const FIELD_LABEL: Record<FieldKind, string> = {
  crack: 'Cracked screen ₹',
  touch: 'Touch not working ₹',
  back_glass: 'Back panel broken ₹',
};

/** The scenario whose offer isolates the impact of this field. */
const SCENARIO_FOR_FIELD: Record<FieldKind, string> = {
  crack: 'cracked',
  touch: 'touch',
  back_glass: 'panel',
};

/** The rupee the editor is changing, read from the right rule map. */
function readRuleValue(rules: PricingRules, focused: FocusedField): number | undefined {
  const { modelKey, fieldKind } = focused;
  if (fieldKind === 'crack') return rules.androidScreen.crackRupees[modelKey];
  if (fieldKind === 'touch') return rules.androidScreen.touchRupees[modelKey];
  return rules.backGlass.rupees[modelKey];
}

function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-xs text-ink-400">no change</span>;
  if (delta === 0) return <span className="inline-flex items-center gap-0.5 rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-semibold text-ink-600"><Minus className="h-3 w-3" /> ₹0</span>;
  if (delta > 0) return <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700"><ArrowUp className="h-3 w-3" /> +{rupees(delta)}</span>;
  return <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-700"><ArrowDown className="h-3 w-3" /> {rupees(delta)}</span>;
}

/**
 * The right-side panel. It stays empty until the admin clicks into a per-model amount field (crack ₹ / touch ₹ / back glass ₹);
 * then it shows the live value of that rule, the draft value next to it, and the offer this phone would get live vs with the
 * draft under the scenario that matches the field (cracked screen, touch fault or panel broken). Everything is computed in the
 * browser so it updates on every keystroke without a network call.
 */
export default function ContextPanel({ rules, live, focused }: ContextPanelProps) {
  const deferredRules = useDeferredValue(rules);
  const deferredLive = useDeferredValue(live);

  const summary = useMemo(() => {
    if (!focused) return null;
    const liveValue = readRuleValue(deferredLive, focused);
    const draftValue = readRuleValue(deferredRules, focused);
    const valueDelta = liveValue !== undefined && draftValue !== undefined ? draftValue - liveValue : null;

    // Always show the four scenarios that matter for screen / back-glass edits: baseline, cracked, touch and panel broken.
    // The field being edited only changes which value panel sits on top; the offer rows stay the same so the admin sees crack
    // and touch impact at once (and can tell whether a change leaks into another scenario they did not mean to touch).
    const focusKey = SCENARIO_FOR_FIELD[focused.fieldKind];
    const scenarioKeys = ['flawless', 'cracked', 'touch', 'panel'];
    const rows = scenarioKeys
      .map((key) => IMPACT_SCENARIOS.find((s) => s.key === key))
      .filter((s): s is ImpactScenario => Boolean(s))
      .map((scenario) => {
        const liveOffer = quoteImpactOffer(focused.phone, scenario, deferredLive);
        const draftOffer = quoteImpactOffer(focused.phone, scenario, deferredRules);
        const delta = liveOffer !== null && draftOffer !== null ? draftOffer - liveOffer : null;
        return { scenario, liveOffer, draftOffer, delta, isFocusRow: scenario.key === focusKey };
      });

    return { liveValue, draftValue, valueDelta, rows };
  }, [focused, deferredRules, deferredLive]);

  return (
    <aside className="card lg:sticky lg:top-24 lg:self-start space-y-3 border border-brand-200 bg-brand-50/40 p-4" aria-labelledby="context-panel-heading">
      <h3 id="context-panel-heading" className="font-display text-sm font-black text-ink-900">Live vs draft</h3>
      {!focused || !summary ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-white p-3 text-xs text-ink-600">
          <MousePointerClick className="h-4 w-4 flex-shrink-0 text-brand-600" />
          <p>Click a phone&rsquo;s <strong>Crack ₹</strong>, <strong>Touch ₹</strong> or <strong>Back glass ₹</strong> box on the left to see its live amount and the offer this phone would get under the live and draft rules.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl bg-white p-3 ring-1 ring-brand-100">
            <div className="text-sm font-bold text-ink-900">{focused.phone.brand} {focused.phone.model}</div>
            <div className="text-[11px] text-ink-500">{focused.phone.storage}{focused.phone.price > 0 ? ` · admin ${rupees(focused.phone.price)}` : ' · no admin price'}</div>
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{FIELD_LABEL[focused.fieldKind]}</div>
            <div className="mt-1 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-0.5 text-sm">
              <span className="text-[11px] uppercase text-ink-400">Live</span>
              <span className="tabular-nums font-medium text-ink-700">{summary.liveValue === undefined ? 'not set' : rupees(summary.liveValue)}</span>
              <span className="text-[11px] uppercase text-ink-400">Draft</span>
              <span className="tabular-nums font-bold text-ink-900">{summary.draftValue === undefined ? 'not set' : rupees(summary.draftValue)}</span>
              <span className="text-[11px] uppercase text-ink-400">Change</span>
              <span><DeltaChip delta={summary.valueDelta} /></span>
            </div>
          </div>

          <div className="rounded-xl bg-white ring-1 ring-brand-100">
            <div className="border-b border-brand-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Offer impact</div>
            <ul className="divide-y divide-brand-50 text-sm">
              {summary.rows.map(({ scenario, liveOffer, draftOffer, delta, isFocusRow }) => (
                <li key={scenario.key} className={`grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 ${isFocusRow ? 'bg-brand-50/70' : ''}`}>
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-ink-800">
                      {scenario.label}
                      {isFocusRow && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">this field</span>}
                    </div>
                    <div className="text-[11px] tabular-nums text-ink-500">Live {liveOffer === null ? '—' : rupees(liveOffer)} → Draft {draftOffer === null ? '—' : rupees(draftOffer)}</div>
                  </div>
                  <DeltaChip delta={delta} />
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-ink-500">
            Offers are simulated as a phone older than 11 months with every accessory present. Nothing changes live until you save the
            draft and publish it from the top bar.
          </p>
        </div>
      )}
    </aside>
  );
}
