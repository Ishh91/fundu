import { useEffect, useMemo, useState } from 'react';
import { Cpu, Search, ShieldCheck } from 'lucide-react';
import { getPopularLookupEntries, LOOKUP_BRANDS } from '../data/phoneLookup';
import { fetchPhoneBrands, fetchPhoneModels } from '../lib/mobileApi';

type PhoneLookupProps = {
  brand: string;
  model: string;
  storage: string;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onStorageChange: (value: string) => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export default function PhoneLookup({
  brand,
  model,
  storage,
  onBrandChange,
  onModelChange,
  onStorageChange,
  title = 'Find your phone',
  description = 'Choose brand, model, and storage to continue faster.',
  actionLabel = 'Continue',
  onAction,
  compact = false,
}: PhoneLookupProps) {
  const [brands, setBrands] = useState<string[]>(LOOKUP_BRANDS);
  const [models, setModels] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingBrands(true);

    fetchPhoneBrands()
      .then((items) => {
        if (!active || items.length === 0) return;
        setBrands(items);
      })
      .catch(() => {
        // Keep the local fallback brand list when the remote lookup is unavailable.
      })
      .finally(() => {
        if (active) setLoadingBrands(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!brand) {
      setModels([]);
      setLoadingModels(false);
      return () => {
        active = false;
      };
    }

    setLoadingModels(true);
    const timer = window.setTimeout(() => {
      fetchPhoneModels(brand, model)
        .then((items) => {
          if (!active) return;
          setModels(items);
        })
        .catch(() => {
          if (active) setModels([]);
        })
        .finally(() => {
          if (active) setLoadingModels(false);
        });
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [brand, model]);

  const storages = useMemo(
    () => models.find((item) => item.name === model)?.storages ?? [],
    [models, model],
  );

  return (
    <div className={`surface-panel ${compact ? 'p-4' : 'p-6 md:p-7'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Cpu className="h-3.5 w-3.5" /> Shared lookup
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold text-ink-900">{title}</h3>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-200/80 px-3 py-1 text-xs font-semibold text-ink-600">
          <ShieldCheck className="h-3.5 w-3.5 text-nature-600" /> AI-assisted verification layer
        </div>
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? 'md:grid-cols-[1fr_1fr_1fr_auto]' : 'md:grid-cols-3'}`}>
        <div>
          <label className="label">Brand</label>
          <select
            value={brand}
            onChange={(event) => {
              onBrandChange(event.target.value);
              onModelChange('');
              onStorageChange('');
            }}
            className="input"
          >
            <option value="">{loadingBrands ? 'Loading brands...' : 'Select brand'}</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Model</label>
          <select
            value={model}
            onChange={(event) => {
              onModelChange(event.target.value);
              onStorageChange('');
            }}
            className="input"
            disabled={!brand}
          >
            <option value="">
              {!brand
                ? 'Choose brand first'
                : loadingModels
                  ? 'Fetching models from API...'
                  : 'Select phone model'}
            </option>
            {models.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          {brand && (
            <p className="mt-1 text-xs text-ink-500">
              {loadingModels
                ? 'Fetching models from API...'
                : models.length > 0
                  ? `${models.length} models available for ${brand}. Select from dropdown.`
                  : 'No models found for this brand.'}
            </p>
          )}
        </div>

        <div>
          <label className="label">Storage</label>
          <select
            value={storage}
            onChange={(event) => onStorageChange(event.target.value)}
            className="input"
            disabled={!model}
          >
            <option value="">{model ? 'Select storage' : 'Choose model first'}</option>
            {storages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {compact && onAction && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={onAction}
              className="btn-primary w-full md:w-auto"
              disabled={!brand || !model}
            >
              <Search className="h-4 w-4" /> {actionLabel}
            </button>
          </div>
        )}
      </div>

      {!compact && onAction && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="btn-primary"
            disabled={!brand || !model}
          >
            <Search className="h-4 w-4" /> {actionLabel}
          </button>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {getPopularLookupEntries().map((item) => (
          <button
            key={`${item.brand}-${item.model}`}
            type="button"
            onClick={() => {
              onBrandChange(item.brand);
              onModelChange(item.model);
              onStorageChange(item.storages[0] ?? '');
            }}
            className="rounded-full border border-ink-200 bg-ink-200/80 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:bg-ink-100 hover:text-brand-700"
          >
            {item.brand} {item.model}
          </button>
        ))}
      </div>
    </div>
  );
}
