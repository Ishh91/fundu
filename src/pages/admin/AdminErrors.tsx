import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, RefreshCw, Trash2 } from 'lucide-react';
import { API_BASE } from '../../config/apiConfig';
import { authHeaders } from '../../lib/db';

interface ErrorSample {
  stack?: string;
  component_stack?: string;
  url?: string;
  user_agent?: string;
  user_email?: string | null;
}

interface ErrorGroup {
  key: string;
  type: string;
  message: string;
  path: string;
  count: number;
  users: number;
  firstSeen: string;
  lastSeen: string;
  sample: ErrorSample;
}

const TYPE_LABELS: Record<string, string> = {
  client_error: 'Browser error',
  unhandled_rejection: 'Failed request / promise',
  react_crash: 'Page crashed',
  server_error: 'Server error',
};

const TYPE_STYLES: Record<string, string> = {
  react_crash: 'bg-rose-50 text-rose-700 border-rose-200',
  server_error: 'bg-amber-50 text-amber-700 border-amber-200',
};
const DEFAULT_TYPE_STYLE = 'bg-slate-100 text-slate-700 border-slate-200';

const formatWhen = (iso: string): string => {
  if (!iso) return 'unknown time';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'unknown time'
    : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function AdminErrors() {
  const [groups, setGroups] = useState<ErrorGroup[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const loadErrors = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch(`${API_BASE}/errors?limit=500`, { headers: authHeaders() });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not load the error log.');
      setGroups(Array.isArray(body.groups) ? body.groups : []);
      setTotalRows(Number(body.count) || 0);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load the error log.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadErrors();
  }, [loadErrors]);

  const clearErrors = async () => {
    if (!window.confirm('Clear the whole error log? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE}/errors/clear`, { method: 'DELETE', headers: authHeaders() });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not clear the error log.');
      await loadErrors();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not clear the error log.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-black text-[#344257]">
            {groups.length} distinct {groups.length === 1 ? 'problem' : 'problems'}
            <span className="ml-2 text-xs font-semibold text-slate-500">from the latest {totalRows} reports</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Crashes and failed requests from customers&apos; browsers and from the server. Reports are kept for 30 days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadErrors()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#344257] hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {groups.length > 0 && (
            <button
              type="button"
              onClick={() => void clearErrors()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear log
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {loadError}
        </div>
      )}

      {!loading && !loadError && groups.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-2 text-sm font-black text-emerald-800">No errors reported</p>
          <p className="mt-1 text-xs text-emerald-700">Nothing has crashed for customers or on the server recently.</p>
        </div>
      )}

      <ul className="space-y-3">
        {groups.map((group) => {
          const isOpen = openKey === group.key;
          return (
            <li key={group.key} className="rounded-2xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : group.key)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                        TYPE_STYLES[group.type] || DEFAULT_TYPE_STYLE
                      }`}
                    >
                      {TYPE_LABELS[group.type] || group.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{group.path || 'unknown page'}</span>
                  </div>
                  <p className="break-words text-sm font-bold text-[#344257]">{group.message}</p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {group.count} {group.count === 1 ? 'time' : 'times'} · {group.users}{' '}
                    {group.users === 1 ? 'visitor' : 'visitors'} · last seen {formatWhen(group.lastSeen)}
                  </p>
                </div>
                <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-slate-100 p-4 text-[11px] text-slate-600">
                  <p>
                    <span className="font-black text-slate-700">First seen:</span> {formatWhen(group.firstSeen)}
                  </p>
                  {group.sample.url && (
                    <p className="break-all">
                      <span className="font-black text-slate-700">Address:</span> {group.sample.url}
                    </p>
                  )}
                  {group.sample.user_email && (
                    <p>
                      <span className="font-black text-slate-700">Signed-in user:</span> {group.sample.user_email}
                    </p>
                  )}
                  {group.sample.user_agent && (
                    <p className="break-words">
                      <span className="font-black text-slate-700">Browser:</span> {group.sample.user_agent}
                    </p>
                  )}
                  {(group.sample.stack || group.sample.component_stack) && (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-3 font-mono text-[10px] leading-relaxed text-slate-100">
                      {group.sample.stack}
                      {group.sample.component_stack}
                    </pre>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
