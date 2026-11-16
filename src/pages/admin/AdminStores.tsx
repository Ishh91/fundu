import { useState } from 'react';
import { Clock, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { saveStoreLocations, useStoreLocations } from '../../lib/useStoreLocations';
import { addStore, removeStore, validateStoreInput, type StoreInput } from '../../lib/storeLocations';

const EMPTY_FORM: StoreInput = { name: '', locality: '', address: '', timing: '10:00 AM – 9:00 PM', phone: '', type: '' };

const FIELDS: { key: keyof StoreInput; label: string; placeholder: string; wide?: boolean }[] = [
  { key: 'name', label: 'Store name *', placeholder: 'Kanpur Mall Road Store' },
  { key: 'locality', label: 'Area / locality', placeholder: 'Mall Road' },
  { key: 'address', label: 'Address *', placeholder: 'Shop 5, Mall Road, Near Clock Tower', wide: true },
  { key: 'timing', label: 'Timing', placeholder: '10:00 AM – 9:00 PM' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
  { key: 'type', label: 'Store type', placeholder: 'Retail & Pickup Hub', wide: true },
];

const newStoreId = (): string => `store-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export default function AdminStores() {
  const { stores, loading } = useStoreLocations();
  const [form, setForm] = useState<StoreInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const persist = async (next: typeof stores, successText: string) => {
    setSaving(true);
    const error = await saveStoreLocations(next);
    setSaving(false);
    setMessage(error ? { kind: 'error', text: error } : { kind: 'ok', text: successText });
    return !error;
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateStoreInput(form);
    if (problem) {
      setMessage({ kind: 'error', text: problem });
      return;
    }
    const saved = await persist(addStore(stores, form, newStoreId), `${form.name.trim()} added. It is live on the website now.`);
    if (saved) setForm(EMPTY_FORM);
  };

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from the website?`)) return;
    await persist(removeStore(stores, id), `${name} removed.`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <Plus className="h-4 w-4 text-[#344257]" /> Add a store
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className={`block text-xs font-bold text-gray-700 ${field.wide ? 'sm:col-span-2' : ''}`}>
              {field.label}
              <input
                value={form[field.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#344257] focus:outline-none"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#344257] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#47576E] disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Add store'}
        </button>
        {message && (
          <p role="status" className={`mt-3 text-xs font-bold ${message.kind === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black text-gray-900">Stores on the website ({stores.length})</h2>
        {loading && stores.length === 0 ? (
          <p className="mt-3 text-xs text-gray-500">Loading…</p>
        ) : stores.length === 0 ? (
          <p className="mt-3 text-xs text-gray-500">No stores yet. Add one above.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {stores.map((store) => (
              <li key={store.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#47576E]" /> {store.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">{store.address}</p>
                  <p className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-gray-500">
                    {store.timing && (
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {store.timing}</span>
                    )}
                    {store.phone && (
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {store.phone}</span>
                    )}
                    {store.type && <span>{store.type}</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(store.id, store.name)}
                  disabled={saving}
                  aria-label={`Remove ${store.name}`}
                  className="shrink-0 rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
