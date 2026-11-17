import { useMemo, useState } from 'react';
import { Loader2, Plus, Search, Trash2, Wand2 } from 'lucide-react';
import NumberField from './NumberField';
import PhonePicker from './PhonePicker';
import { useModelNames } from './useModelNames';
import { phoneKey, previewRulesQuote, ruleLimits, type PricingRules } from '../../../lib/quoteRules';
import type { PhoneChoice } from '../../../lib/phoneChoice';

interface AndroidScreenSectionProps {
  rules: PricingRules;
  live: PricingRules;
  onChange: (next: PricingRules) => void;
}

const changedClass = (changed: boolean) => (changed ? 'ring-2 ring-amber-300 bg-amber-50/60' : '');
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const byName = (label: (key: string) => string) => (a: string, b: string) => label(a).localeCompare(label(b), undefined, { numeric: true });
const STEP = 10;

/**
 * What a cracked screen costs on one Android phone today, from the screen tables: the offer for a flawless phone older than 11 months
 * less the offer with a cracked screen, with the phone's own amount left out. Rounded to ₹10.
 */
async function amountFromTables(choice: PhoneChoice, rules: PricingRules): Promise<number> {
  const withoutOwn = { ...rules, androidScreen: { crackRupees: { ...rules.androidScreen.crackRupees } } };
  delete withoutOwn.androidScreen.crackRupees[phoneKey(choice.brand, choice.model)];
  const input = {
    brand: choice.brand, model: choice.model, storage: choice.storage, age_period: 'above_11_months',
    powers_on: true, activation_lock_cleared: true, ownership_verified: true, liquid_damage: false,
    cosmetic_condition: 'flawless', body_condition: 'flawless', battery_health: 'healthy', defects: [], accessories: [],
  };
  const flawless = (await previewRulesQuote({ ...input, screen_condition: 'flawless' }, withoutOwn)).draft.offerAmount;
  const cracked = (await previewRulesQuote({ ...input, screen_condition: 'cracked' }, withoutOwn)).draft.offerAmount;
  if (flawless === null || cracked === null) throw new Error('This phone cannot be priced.');
  return Math.round((flawless - cracked) / STEP) * STEP;
}

export default function AndroidScreenSection({ rules, live, onChange }: AndroidScreenSectionProps) {
  const label = useModelNames();
  const [search, setSearch] = useState('');
  const [choice, setChoice] = useState<PhoneChoice>({ brand: 'Samsung', model: '', storage: '' });
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [estimating, setEstimating] = useState(false);
  const [problem, setProblem] = useState('');
  const crackRupees = rules.androidScreen.crackRupees;

  const keys = useMemo(() => Object.keys(crackRupees).sort(byName(label)), [crackRupees, label]);
  const shown = keys.filter((key) => label(key).toLowerCase().includes(search.trim().toLowerCase()));
  // An iPhone has its own amounts in the section above, so this list takes no Apple phone.
  const newKey = choice.brand && choice.model && choice.brand.toLowerCase() !== 'apple' ? phoneKey(choice.brand, choice.model) : '';
  const exists = newKey !== '' && crackRupees[newKey] !== undefined;

  const setCrack = (key: string, value: number | undefined) => {
    const next = { ...crackRupees };
    if (value === undefined) delete next[key];
    else next[key] = value;
    onChange({ ...rules, androidScreen: { crackRupees: next } });
  };

  const estimate = async () => {
    setEstimating(true);
    setProblem('');
    try {
      setAmount(await amountFromTables(choice, rules));
    } catch {
      setProblem('The amount could not be worked out. Type it in.');
    } finally {
      setEstimating(false);
    }
  };

  const add = () => {
    if (!newKey || amount === undefined || exists) return;
    setCrack(newKey, amount);
    setAmount(undefined);
  };

  return (
    <section className="card p-5 space-y-4" aria-labelledby="android-screen-rules">
      <div>
        <h3 id="android-screen-rules" className="font-display text-base font-black text-ink-900">Android screen amounts</h3>
        <p className="text-sm text-ink-600">
          What is taken off an Android phone for a cracked screen, in rupees, the same on every storage, like the iPhone amounts above. It is the model's own
          amount as Cashify sets it, not a share of the price: an iQOO 15 on ₹40,950 is ₹5,950 and a Galaxy S21 on ₹14,280 is ₹5,350. Every other
          screen state is the multiple of it set in the iPhone section. A phone that is not listed is priced from the screen tables below, which on the
          phones measured was off by about 20% on average, so add a phone here once you know Cashify's amount for it.
        </p>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an Android phone" aria-label="Find an Android phone" className="input py-2 pl-9 text-sm" />
          </div>
          <span className="text-xs text-ink-500">{shown.length} of {keys.length} phones</span>
        </div>
        <div className="max-h-[26rem] overflow-y-auto rounded-xl border border-ink-200">
          <div className="sticky top-0 z-10 grid grid-cols-[1fr_6.5rem_2.25rem] items-center gap-2 border-b border-ink-200 bg-ink-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-500">
            <span>Phone</span><span>Crack ₹</span><span />
          </div>
          {shown.length === 0 && <p className="p-3 text-sm text-ink-500">No phone matches.</p>}
          {shown.map((key) => {
            const crack = crackRupees[key];
            const liveCrack = live.androidScreen.crackRupees[key];
            const changed = liveCrack !== crack;
            return (
              <div key={key} className={`grid grid-cols-[1fr_6.5rem_2.25rem] items-center gap-2 border-b border-ink-100 px-3 py-1.5 last:border-b-0 ${changedClass(changed)}`}>
                <div>
                  <div className="text-sm font-semibold text-ink-800">{label(key)}</div>
                  {liveCrack === undefined ? <div className="text-[11px] text-emerald-700">new</div> : changed && <div className="text-[11px] text-ink-500">live {rupees(liveCrack)}</div>}
                </div>
                <NumberField label={`${label(key)} crack amount`} value={crack} onChange={(v) => setCrack(key, v === undefined ? crack : v)} min={ruleLimits.crackRupees[0]} max={ruleLimits.crackRupees[1]} step={STEP} />
                <button type="button" onClick={() => setCrack(key, undefined)} aria-label={`Remove ${label(key)}`} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid items-end gap-2 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <PhonePicker value={choice} onChange={(next) => { setChoice(next); setProblem(''); }} />
          <NumberField label="New phone crack amount" value={amount} optional placeholder="Crack ₹" onChange={setAmount} min={ruleLimits.crackRupees[0]} max={ruleLimits.crackRupees[1]} step={STEP} />
          <button type="button" onClick={estimate} disabled={!newKey || estimating} className="btn-outline px-3 py-2 text-sm" title="Fill in what the screen tables take off this phone today, then correct it to Cashify's amount">
            {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Today&apos;s amount
          </button>
          <button type="button" onClick={add} disabled={!newKey || amount === undefined || exists} className="btn-outline px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Add phone
          </button>
        </div>
        {exists && <p className="mt-1.5 text-xs text-amber-700">This phone is already in the list; change its amount above.</p>}
        {problem && <p role="alert" className="mt-1.5 text-xs text-red-600">{problem}</p>}
        <p className="mt-1.5 text-[11px] text-ink-500">Cashify&apos;s amount is the offer for a flawless phone less the offer with a cracked screen, older than 11 months.</p>
      </div>
    </section>
  );
}
