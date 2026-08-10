import { useEffect, useMemo, useState, useRef } from 'react';
import { Cpu, Search, ShieldCheck, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { getPopularLookupEntries, LOOKUP_BRANDS } from '../data/phoneLookup';
import { fetchPhoneBrands, fetchPhoneModels, fetchDeviceAutocomplete, type MobileApiAutocompleteItem } from '../lib/mobileApi';

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
  description = 'Choose brand, model, and storage to continue faster with live specs.',
  actionLabel = 'Continue',
  onAction,
  compact = false,
}: PhoneLookupProps) {
  const [brands, setBrands] = useState<string[]>(LOOKUP_BRANDS);
  const [models, setModels] = useState<Array<{ name: string; storages: string[] }>>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Live Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MobileApiAutocompleteItem[]>([]);
  const [searchingLive, setSearchingLive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoadingBrands(true);

    fetchPhoneBrands()
      .then((items) => {
        if (!active || items.length === 0) return;
        setBrands(items);
      })
      .catch(() => {
        // Keep the local fallback brand list
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
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [brand, model]);

  // Live Search Suggestions from mobileapi.dev
  useEffect(() => {
    let active = true;
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setSearchingLive(false);
      return;
    }

    setSearchingLive(true);
    const timer = window.setTimeout(async () => {
      try {
        const results = await fetchDeviceAutocomplete(searchQuery.trim(), 8);
        if (active) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setSearchingLive(false);
      }
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const storages = useMemo(
    () => models.find((item) => item.name.toLowerCase() === model.toLowerCase())?.storages ?? ['128GB', '256GB', '512GB'],
    [models, model],
  );

  const handleSelectSuggestion = (item: MobileApiAutocompleteItem) => {
    onBrandChange(item.brand);
    onModelChange(item.name);
    setSearchQuery(`${item.brand} ${item.name}`);
    setShowSuggestions(false);
    onStorageChange('128GB');
  };

  return (
    <div className={`surface-panel ${compact ? 'p-4' : 'p-6 md:p-7'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Cpu className="h-3.5 w-3.5" /> MobileAPI.dev & Fundu Engine
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold text-ink-900">{title}</h3>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-nature-200 bg-nature-50 px-3 py-1 text-xs font-semibold text-nature-700">
            <span className="h-2 w-2 rounded-full bg-nature-500 animate-pulse"></span> 31,500+ Devices API Live
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-200/80 px-3 py-1 text-xs font-semibold text-ink-600">
            <ShieldCheck className="h-3.5 w-3.5 text-nature-600" /> Lucknow Verified
          </div>
        </div>
      </div>

      {/* Live Search Bar with Instant Autocomplete */}
      <div ref={searchContainerRef} className="relative mt-5">
        <label className="label text-xs font-bold uppercase tracking-wider text-ink-500">
          Instant Device Search (MobileAPI.dev)
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="Type any model (e.g., iPhone 16 Pro, Galaxy S24, OnePlus 12)..."
            className="input pl-10 pr-10"
          />
          {searchingLive && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-600" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-xl">
            <div className="px-3 py-1.5 text-xs font-bold text-ink-400">Live Suggestions from MobileAPI.dev</div>
            {suggestions.map((item) => (
              <button
                key={`${item.id}-${item.full_name}`}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-800 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  <span>{item.full_name || `${item.brand} ${item.name}`}</span>
                </div>
                <span className="rounded bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{item.brand}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? 'md:grid-cols-[1fr_1fr_1fr_auto]' : 'md:grid-cols-3'}`}>
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
                ? 'Fetching live device models...'
                : models.length > 0
                  ? `${models.length} models verified for ${brand}`
                  : 'No models found.'}
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

      {model && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-brand-50/70 p-3 text-xs text-brand-900 border border-brand-200/60">
          <CheckCircle2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
          <span className="font-semibold">{brand} {model}</span>
          {storage && <span className="rounded bg-white px-2 py-0.5 font-bold shadow-sm">{storage}</span>}
          <span className="text-brand-600">• Real-time valuation ready</span>
        </div>
      )}

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

      {/* Popular Trending Models Fast Pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {getPopularLookupEntries().map((item) => (
          <button
            key={`${item.brand}-${item.model}`}
            type="button"
            onClick={() => {
              onBrandChange(item.brand);
              onModelChange(item.model);
              onStorageChange(item.storages[0] ?? '128GB');
              setSearchQuery(`${item.brand} ${item.model}`);
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

