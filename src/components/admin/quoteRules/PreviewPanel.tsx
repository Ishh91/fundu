import { useState } from 'react';
import { Loader2, Scale } from 'lucide-react';
import { previewRulesQuote, SCREEN_STATE_LABELS, screenStateKeys, QuoteRulesError, type PreviewQuote, type PricingRules } from '../../../lib/quoteRules';

interface PreviewPanelProps {
  /** The rules being edited, saved or not. */
  rules: PricingRules;
  /** Rules that fail the bounds cannot be previewed. */
  rulesValid: boolean;
}

const AGE_OPTIONS = [
  { value: 'above_11_months', label: 'Older than 11 months' },
  { value: '6_to_9_months', label: '6 to 11 months' },
  { value: '3_to_6_months', label: '3 to 6 months' },
  { value: '0_to_3_months', label: 'Below 3 months' },
];
const BODY_OPTIONS = [
  { value: 'flawless', label: 'No damage' },
  { value: 'minor_scratches', label: 'Minor scratches' },
  { value: 'dents_bent', label: 'Dents' },
  { value: 'panel_broken', label: 'Panel broken' },
];
const money = (n: number | null) => (n === null ? '—' : `₹${n.toLocaleString('en-IN')}`);

function Result({ title, quote, tone }: { title: string; quote: PreviewQuote; tone: string }) {
  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{title}</div>
      <div className="font-display text-2xl font-black tabular-nums text-ink-900">
        {quote.status === 'quoted' ? money(quote.offerAmount) : <span className="text-base">{quote.status === 'requires_manual_review' ? 'Needs inspection' : quote.status}</span>}
      </div>
      {quote.status !== 'quoted' && quote.offerAmount !== null && <div className="text-xs text-ink-600">Estimate {money(quote.offerAmount)}</div>}
    </div>
  );
}

export default function PreviewPanel({ rules, rulesValid }: PreviewPanelProps) {
  const [form, setForm] = useState({
    brand: 'Apple', model: 'iPhone 14 Plus', storage: '128 GB', age_period: 'above_11_months',
    screen_condition: 'cracked', body_condition: 'flawless', box: false,
  });
  const [result, setResult] = useState<{ live: PreviewQuote; draft: PreviewQuote } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (patch: Partial<typeof form>) => { setForm({ ...form, ...patch }); setResult(null); };

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await previewRulesQuote({
        brand: form.brand, model: form.model, storage: form.storage, age_period: form.age_period,
        powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
        cosmetic_condition: 'flawless', screen_condition: form.screen_condition, body_condition: form.body_condition,
        battery_health: 'healthy', defects: [], accessories: form.box ? ['Original Box', 'Original Charger', 'Valid Bill'] : [],
      }, rules));
    } catch (err) {
      setResult(null);
      setError(err instanceof QuoteRulesError ? [err.message, ...err.errors.slice(1)].join(' ') : 'The preview could not be calculated.');
    } finally {
      setLoading(false);
    }
  };

  const difference = result && result.live.offerAmount !== null && result.draft.offerAmount !== null ? result.draft.offerAmount - result.live.offerAmount : null;
  const ready = form.brand.trim() && form.model.trim() && form.storage.trim();

  return (
    <section className="card p-5 space-y-4" aria-labelledby="preview-rules">
      <div>
        <h3 id="preview-rules" className="font-display text-base font-black text-ink-900 flex items-center gap-2"><Scale className="h-4 w-4" /> Try a phone</h3>
        <p className="text-sm text-ink-600">Prices one phone under the rules that are live and under the rules on this page, side by side. Nothing is recorded.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-ink-600">Brand
          <input className="input mt-1 py-2 text-sm" value={form.brand} onChange={(e) => set({ brand: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-ink-600">Model
          <input className="input mt-1 py-2 text-sm" value={form.model} onChange={(e) => set({ model: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-ink-600">Storage
          <input className="input mt-1 py-2 text-sm" value={form.storage} onChange={(e) => set({ storage: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-ink-600">Age
          <select className="input mt-1 py-2 text-sm" value={form.age_period} onChange={(e) => set({ age_period: e.target.value })}>
            {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-600">Screen
          <select className="input mt-1 py-2 text-sm" value={form.screen_condition} onChange={(e) => set({ screen_condition: e.target.value })}>
            <option value="flawless">Flawless</option>
            {screenStateKeys.filter((s) => s !== 'display_lines').map((s) => <option key={s} value={s}>{SCREEN_STATE_LABELS[s] ?? s}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-600">Body
          <select className="input mt-1 py-2 text-sm" value={form.body_condition} onChange={(e) => set({ body_condition: e.target.value })}>
            {BODY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-ink-700">
          <input type="checkbox" checked={form.box} onChange={(e) => set({ box: e.target.checked })} className="h-4 w-4" /> Box, charger and bill
        </label>
        <div className="flex items-end">
          <button type="button" onClick={run} disabled={loading || !rulesValid || !ready} className="btn-primary w-full py-2.5 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />} Compare
          </button>
        </div>
      </div>
      {!rulesValid && <p className="text-xs font-semibold text-red-600">Fix the red fields first: rules outside their bounds cannot be previewed.</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      {result && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Result title="Live now" quote={result.live} tone="border-ink-200 bg-white" />
          <Result title="With these rules" quote={result.draft} tone="border-amber-300 bg-amber-50" />
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">Difference</div>
            <div className={`font-display text-2xl font-black tabular-nums ${difference === null || difference === 0 ? 'text-ink-700' : difference > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {difference === null ? '—' : `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${money(Math.abs(difference))}`}
            </div>
            <div className="text-xs text-ink-600">{difference === null || difference === 0 ? 'The same offer' : difference > 0 ? 'The customer is offered more' : 'The customer is offered less'}</div>
          </div>
        </div>
      )}
    </section>
  );
}
