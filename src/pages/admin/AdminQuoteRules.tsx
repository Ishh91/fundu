import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, Loader2, RefreshCw, RotateCcw, Save, Send, Undo2 } from 'lucide-react';
import {
  QuoteRulesError,
  copyRules,
  describeRuleChange,
  diffRules,
  discardRulesDraft,
  fetchRulesAdminState,
  publishRulesDraft,
  rollbackRules,
  saveRulesDraft,
  validateRules,
  type PricingRules,
  type RulesAdminState,
} from '../../lib/quoteRules';
import AgeSection from '../../components/admin/quoteRules/AgeSection';
import ScreenSection from '../../components/admin/quoteRules/ScreenSection';
import OtherSection from '../../components/admin/quoteRules/OtherSection';
import PreviewPanel from '../../components/admin/quoteRules/PreviewPanel';

const formatWhen = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
const formatValue = (value: number | undefined) => (value === undefined ? 'none' : String(value));

export default function AdminQuoteRules() {
  const [state, setState] = useState<RulesAdminState | null>(null);
  const [edited, setEdited] = useState<PricingRules | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string; details?: string[] } | null>(null);

  const load = useCallback(async (keepEdits = false) => {
    setLoading(true);
    setLoadError('');
    try {
      const next = await fetchRulesAdminState();
      setState(next);
      if (!keepEdits) {
        setEdited(copyRules(next.draft?.rules ?? next.published.rules));
        setNote(next.draft?.note ?? '');
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'The quote rules could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saved = state ? (state.draft?.rules ?? state.published.rules) : null;
  const live = state?.published.rules ?? null;
  const unsaved = useMemo(() => (saved && edited ? diffRules(saved, edited).length > 0 : false), [saved, edited]);
  const changesVsLive = useMemo(() => (live && edited ? diffRules(live, edited) : []), [live, edited]);
  const validation = useMemo(() => (edited ? validateRules(edited) : { valid: true, errors: [] }), [edited]);
  const draftDiffersFromLive = useMemo(() => (live && state?.draft ? diffRules(live, state.draft.rules).length > 0 : false), [live, state]);

  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      const text = await action();
      setMessage({ kind: 'ok', text });
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'That did not work.', details: err instanceof QuoteRulesError ? err.errors.slice(1) : undefined });
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = () => run(async () => {
    if (!edited) return '';
    await saveRulesDraft(edited, note);
    await load(true);
    return 'Draft saved. No quote has changed yet: publish it to make it live.';
  });

  const publish = () => {
    if (!edited || !state?.draft) return;
    const ok = window.confirm(`Make these rules live as version ${state.published.version + 1}?\n\n${changesVsLive.length} value${changesVsLive.length === 1 ? '' : 's'} change. Every quote from now on is priced with them. You can roll back from the history.`);
    if (!ok) return;
    void run(async () => {
      const { version } = await publishRulesDraft(note);
      await load();
      return `Version ${version} is live. New quotes use it now (the sell page may take up to a minute).`;
    });
  };

  const discard = () => {
    if (!state) return;
    if (!window.confirm(state.draft ? 'Throw away the draft and go back to the live rules?' : 'Throw away your unsaved changes?')) return;
    void run(async () => {
      if (state.draft) await discardRulesDraft();
      await load();
      return 'Back to the live rules.';
    });
  };

  const rollback = (version: number) => {
    if (!window.confirm(`Make version ${version} live again?\n\nIt is published as a new version, so the history is kept.`)) return;
    void run(async () => {
      const { version: newVersion } = await rollbackRules(version);
      await load();
      return `Version ${version} is live again, as version ${newVersion}.`;
    });
  };

  if (loading && !state) {
    return <div className="card flex items-center gap-2 p-6 text-sm text-ink-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading the quote rules…</div>;
  }
  if (loadError || !state || !edited || !live) {
    return (
      <div className="card space-y-3 p-6" role="alert">
        <p className="flex items-center gap-2 text-sm font-semibold text-red-700"><AlertTriangle className="h-4 w-4" /> {loadError || 'The quote rules could not be loaded.'}</p>
        <button type="button" onClick={() => void load()} className="btn-outline px-4 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Try again</button>
      </div>
    );
  }

  const canPublish = !!state.draft && !unsaved && draftDiffersFromLive && validation.valid && !busy;

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="flex-1 min-w-[14rem]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">Live: version {state.published.version || 'built-in'}</span>
            {state.published.source === 'defaults' && <span className="badge bg-ink-100 text-ink-600">the built-in rules</span>}
            {state.draft && <span className="badge bg-amber-50 text-amber-800 border border-amber-200">Draft saved</span>}
            {unsaved && <span className="badge bg-red-50 text-red-700 border border-red-200">Unsaved changes</span>}
          </div>
          <p className="mt-1 text-xs text-ink-500">
            Changes here do not touch any quote until you publish. {state.draft ? `Draft by ${state.draft.updated_by || 'an admin'}${state.draft.updated_at ? `, ${formatWhen(state.draft.updated_at)}` : ''}.` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={discard} disabled={busy || (!unsaved && !state.draft)} className="btn-outline px-3 py-2 text-sm"><Undo2 className="h-4 w-4" /> Discard</button>
          <button type="button" onClick={saveDraft} disabled={busy || !unsaved || !validation.valid} className="btn-outline px-3 py-2 text-sm"><Save className="h-4 w-4" /> Save draft</button>
          <button type="button" onClick={publish} disabled={!canPublish} title={unsaved ? 'Save the draft first' : !state.draft ? 'Nothing saved to publish' : !draftDiffersFromLive ? 'The draft is the same as the live rules' : ''} className="btn-primary px-4 py-2 text-sm"><Send className="h-4 w-4" /> Publish</button>
        </div>
      </div>

      {message && (
        <div role={message.kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 text-sm ${message.kind === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <p className="flex items-center gap-2 font-semibold">{message.kind === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{message.text}</p>
          {message.details && message.details.length > 0 && <ul className="mt-1 list-disc pl-6">{message.details.map((d) => <li key={d}>{d}</li>)}</ul>}
        </div>
      )}

      {!validation.valid && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">These rules cannot be saved yet:</p>
          <ul className="mt-1 list-disc pl-6">{validation.errors.slice(0, 8).map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <AgeSection rules={edited} live={live} onChange={setEdited} />
      <ScreenSection rules={edited} live={live} onChange={setEdited} />
      <OtherSection rules={edited} live={live} onChange={setEdited} />

      <section className="card p-5 space-y-3" aria-labelledby="changes-vs-live">
        <h3 id="changes-vs-live" className="font-display text-base font-black text-ink-900">What differs from the live rules ({changesVsLive.length})</h3>
        {changesVsLive.length === 0
          ? <p className="text-sm text-ink-500">Nothing: these are the live rules.</p>
          : (
            <ul className="divide-y divide-ink-100 rounded-xl border border-ink-200 text-sm">
              {changesVsLive.map((change) => (
                <li key={change.path} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <span className="flex-1 text-ink-800">{describeRuleChange(change.path)}</span>
                  <span className="font-mono tabular-nums text-ink-500">{formatValue(change.from)}</span>
                  <span className="text-ink-400">→</span>
                  <span className="font-mono font-bold tabular-nums text-ink-900">{formatValue(change.to)}</span>
                </li>
              ))}
            </ul>
          )}
        <label className="block text-xs font-semibold text-ink-600">Note for the history (why this change)
          <input value={note} onChange={(event) => setNote(event.target.value.slice(0, 300))} placeholder="e.g. matched Cashify on iPhone 17" className="input mt-1 py-2 text-sm" />
        </label>
      </section>

      <PreviewPanel rules={edited} rulesValid={validation.valid} />

      <section className="card p-5 space-y-3" aria-labelledby="rules-history">
        <h3 id="rules-history" className="font-display text-base font-black text-ink-900 flex items-center gap-2"><History className="h-4 w-4" /> History</h3>
        {state.versions.length === 0
          ? <p className="text-sm text-ink-500">Nothing has been published yet, so every quote uses the built-in rules.</p>
          : (
            <ul className="divide-y divide-ink-100 rounded-xl border border-ink-200">
              {state.versions.map((version) => {
                const isLive = version.version === state.published.version;
                return (
                  <li key={version.version} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                    <span className="badge border border-ink-200 bg-white text-ink-800">Version {version.version}</span>
                    {isLive && <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">Live</span>}
                    <span className="flex-1 min-w-[10rem] text-sm text-ink-700">{version.note || 'No note'}<span className="block text-[11px] text-ink-400">{version.published_by || 'an admin'} · {formatWhen(version.published_at)}</span></span>
                    {!isLive && <button type="button" onClick={() => rollback(version.version)} disabled={busy} className="btn-outline px-3 py-1.5 text-xs"><RotateCcw className="h-3.5 w-3.5" /> Make live again</button>}
                  </li>
                );
              })}
            </ul>
          )}
      </section>
    </div>
  );
}
