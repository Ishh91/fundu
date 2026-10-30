import React, { useState, useEffect, useMemo } from 'react';
import {
  Radar,
  Search,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Save,
  Check,
  Building2,
  Smartphone,
  Eye,
  Info,
  ChevronDown,
} from 'lucide-react';
import { formatINR } from '../../lib/db';
import { API_BASE } from '../../config/apiConfig';
import { getCleanPhoneImage, BRAND_FRONT_FALLBACKS, getGenericDevicePlaceholder } from '../../lib/phoneImages';
import { savePriceOverride } from '../../lib/priceSync';
import { broadcastSync } from '../../lib/realtimeSync';
import {
  normalizeStorageString,
  calculateHardwareVariantMultiplier,
  getModelHardwareSpecs,
  calculateRamPriceOffset,
  isStorageAllowedForModel,
} from '../../lib/deviceSpecs';
import { ALL_INDIAN_PHONES_CATALOG } from '../../data/indianPhonesCatalog';
import { MASTER_MODEL_CATALOG } from '../../data/masterModelCatalog';
import { BRAND_SERIES_DEFINITIONS, getDeviceRecencyScore } from '../../data/brandSeriesCatalog';

interface CompetitorData {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  baseOffer: number;
  isLive?: boolean;
  flawlessOffer: number;
  goodOffer: number;
  payoutSpeed: string;
  verificationUrl: string;
  directModelUrl: string;
  difference: number;
  marketShare: string;
}

interface RadarResponse {
  device: {
    brand: string;
    model: string;
    storage: string;
    ram?: string;
    image: string;
    configId: string | null;
  };
  fundu: {
    basePrice: number;
    flawlessOffer: number;
    goodOffer: number;
    fairOffer: number;
    payoutSpeed: string;
    freeDoorstepPickup: boolean;
    guaranteeText: string;
  };
  competitors: CompetitorData[];
  marketAnalytics: {
    marketHighest: number;
    marketLowest: number;
    marketAverage: number;
    isWinning: boolean;
    diffFromHighest: number;
    diffFromCashify?: number;
    isLiveCashify?: boolean;
    targetFunduMin?: number;
    status: 'WINNING' | 'COMPETITIVE' | 'BELOW_MARKET';
    suggestedOptimumPrice: number;
    b2bLiquidationEst: number;
    grossMargin: number;
    grossMarginPercent: number;
  };
}

const TOP_WATCHLIST = [
  { brand: 'Apple', model: 'iPhone 16 Pro', storage: '128 GB' },
  { brand: 'Apple', model: 'iPhone 15', storage: '128 GB' },
  { brand: 'Apple', model: 'iPhone 13', storage: '128 GB' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '256 GB' },
  { brand: 'Samsung', model: 'Galaxy S23', storage: '128 GB' },
  { brand: 'OnePlus', model: 'OnePlus 12', storage: '256 GB' },
  { brand: 'OnePlus', model: 'OnePlus 11', storage: '128 GB' },
  { brand: 'Vivo', model: 'Vivo V40', storage: '128 GB' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', storage: '128 GB' },
  { brand: 'Motorola', model: 'Moto Edge 50 Pro', storage: '256 GB' },
];

const BRANDS = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Vivo',
  'Oppo',
  'Xiaomi',
  'Realme',
  'Motorola',
  'Google',
  'Nothing',
  'iQOO',
  'Poco',
];

const DEFAULT_BRAND_MODELS: Record<string, { model: string; storage: string }> = {
  Apple: { model: 'iPhone 16 Pro', storage: '128 GB' },
  Samsung: { model: 'Galaxy S24 Ultra', storage: '256 GB' },
  OnePlus: { model: 'OnePlus 12', storage: '256 GB' },
  Vivo: { model: 'Vivo V40', storage: '128 GB' },
  Oppo: { model: 'Reno 12 Pro', storage: '256 GB' },
  Xiaomi: { model: 'Redmi Note 13 Pro', storage: '128 GB' },
  Realme: { model: 'Realme GT 6', storage: '256 GB' },
  Motorola: { model: 'Moto Edge 50 Pro', storage: '256 GB' },
  Google: { model: 'Pixel 9 Pro', storage: '128 GB' },
  Nothing: { model: 'Nothing Phone (2)', storage: '128 GB' },
  iQOO: { model: 'iQOO 12', storage: '256 GB' },
  Poco: { model: 'Poco X6 Pro', storage: '256 GB' },
};

function normalizeModelDisplayName(brand: string, rawModel: string): string {
  let m = (rawModel || '').trim();
  const b = (brand || '').trim();
  const bLower = b.toLowerCase();

  if (bLower === 'apple') {
    m = m.replace(/^apple\s+/i, '').trim();
  } else if (bLower === 'motorola') {
    m = m.replace(/^motorola\s+/i, '').trim();
    if (!m.toLowerCase().startsWith('moto') && !m.toLowerCase().startsWith('razr')) {
      m = `Moto ${m}`;
    }
  } else if (bLower === 'samsung') {
    m = m.replace(/^samsung\s+/i, '').trim();
  } else if (bLower === 'google') {
    m = m.replace(/^google\s+/i, '').trim();
  } else if (bLower === 'xiaomi') {
    m = m.replace(/^xiaomi\s+/i, '').trim();
  } else if (bLower === 'poco') {
    if (!m.toLowerCase().startsWith('poco')) {
      m = `Poco ${m}`;
    }
  } else if (m.toLowerCase().startsWith(bLower)) {
    m = m.slice(b.length).trim();
  }

  return m;
}

export default function AdminCompetitorRadar() {
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [searchModel, setSearchModel] = useState('iPhone 16 Pro');
  const [selectedStorage, setSelectedStorage] = useState('128 GB');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [radarData, setRadarData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);

  // 1. Hardware Specs (Authentic Storages & RAMs for THIS exact model)
  const currentDeviceSpecs = useMemo(() => {
    return getModelHardwareSpecs(selectedBrand, searchModel, MASTER_MODEL_CATALOG);
  }, [selectedBrand, searchModel]);

  // Authentic Storages that realistically exist for this phone (e.g. S24 Ultra -> 256GB, 512GB, 1TB)
  const availableStorages = useMemo(() => {
    const list = currentDeviceSpecs.storages.length > 0 ? currentDeviceSpecs.storages : ['128 GB', '256 GB'];
    const filtered = list.filter((s) => isStorageAllowedForModel(selectedBrand, searchModel, s));
    return filtered.length > 0 ? filtered : list;
  }, [currentDeviceSpecs, selectedBrand, searchModel]);

  // Authentic RAM options for the currently selected storage
  const availableRams = useMemo(() => {
    return currentDeviceSpecs.getRamsForStorage(selectedStorage);
  }, [currentDeviceSpecs, selectedStorage]);

  // Synchronize storage if current selection does not exist for this model
  useEffect(() => {
    if (!availableStorages.includes(selectedStorage)) {
      const nextStorage = currentDeviceSpecs.defaultStorage || availableStorages[0];
      setSelectedStorage(nextStorage);
    }
  }, [availableStorages, selectedStorage, currentDeviceSpecs]);

  // Synchronize RAM when storage or model changes
  useEffect(() => {
    if (availableRams.length > 1) {
      if (!availableRams.includes(selectedRam)) {
        setSelectedRam(availableRams[0]);
      }
    } else {
      setSelectedRam('');
    }
  }, [availableRams, selectedRam]);

  // Dynamic available models for the selected brand
  const availableModels = useMemo(() => {
    const brand = selectedBrand;
    const bLower = brand.toLowerCase().trim();
    const rawList: string[] = [];

    // 1. Default model for brand
    if (DEFAULT_BRAND_MODELS[brand]) {
      rawList.push(DEFAULT_BRAND_MODELS[brand].model);
    }

    // 2. Watchlist anchor models for brand
    TOP_WATCHLIST.filter((w) => w.brand.toLowerCase() === bLower).forEach((w) => {
      rawList.push(w.model);
    });

    // 3. Brand series definitions
    const seriesDefs = BRAND_SERIES_DEFINITIONS[bLower] || [];
    seriesDefs.forEach((s) => {
      (s.defaultModels || []).forEach((dm) => {
        rawList.push(dm.model);
      });
    });

    // 4. All Indian phones catalog
    ALL_INDIAN_PHONES_CATALOG.forEach((p) => {
      if (p.brand.toLowerCase().trim() === bLower) {
        rawList.push(p.model);
      }
    });

    // 5. Master model catalog
    MASTER_MODEL_CATALOG.forEach((m) => {
      if (m.brand.toLowerCase().trim() === bLower) {
        rawList.push(m.model);
      }
    });

    // Deduplicate and normalize display names
    const seen = new Set<string>();
    const cleaned: string[] = [];

    for (const raw of rawList) {
      if (!raw) continue;
      const clean = normalizeModelDisplayName(brand, raw);
      const key = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        cleaned.push(clean);
      }
    }

    // Sort using getDeviceRecencyScore so modern / flagship phones are listed first
    cleaned.sort((a, b) => {
      const scoreB = getDeviceRecencyScore(brand, b);
      const scoreA = getDeviceRecencyScore(brand, a);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.localeCompare(b);
    });

    return cleaned;
  }, [selectedBrand]);

  // Matching option value for <select>
  const selectedModelOption = useMemo(() => {
    const match = availableModels.find((m) => m.toLowerCase() === searchModel.toLowerCase());
    return match || searchModel;
  }, [availableModels, searchModel]);

  // Quick In-Place Price Override State
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchRadar = async (brand: string, model: string, storage: string, ram = selectedRam) => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const params: Record<string, string> = { brand, model, storage };
      if (ram) params.ram = ram;
      const q = new URLSearchParams(params);
      const res = await fetch(`${API_BASE}/sell-pricing/competitor-radar?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch competitor radar data');
      const json = await res.json();
      if (json.data) {
        setRadarData(json.data);
        setCustomPriceInput(String(json.data.fundu.basePrice));
        if (json.data.device.brand && !selectedBrand) {
          setSelectedBrand(json.data.device.brand);
        }
        if (json.data.device.model && !searchModel) {
          setSearchModel(json.data.device.model);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading live market prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar(selectedBrand, searchModel, selectedStorage, selectedRam);
  }, []);

  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    const def = DEFAULT_BRAND_MODELS[newBrand] || { model: `${newBrand} Phone`, storage: '128 GB' };
    setSearchModel(def.model);
    const specs = getModelHardwareSpecs(newBrand, def.model, MASTER_MODEL_CATALOG);
    const targetStorage = specs.storages.length > 0
      ? (specs.storages.includes(def.storage) ? def.storage : specs.defaultStorage || specs.storages[0])
      : def.storage;
    const rams = specs.getRamsForStorage(targetStorage);
    const targetRam = rams.length > 1 ? rams[0] : '';
    setSelectedStorage(targetStorage);
    setSelectedRam(targetRam);
    fetchRadar(newBrand, def.model, targetStorage, targetRam);
  };

  const handleModelSelect = (newModel: string) => {
    if (!newModel) return;
    setSearchModel(newModel);
    const specs = getModelHardwareSpecs(selectedBrand, newModel, MASTER_MODEL_CATALOG);
    const targetStorage = specs.storages.length > 0
      ? (specs.storages.includes(selectedStorage) ? selectedStorage : specs.defaultStorage || specs.storages[0])
      : selectedStorage;
    const rams = specs.getRamsForStorage(targetStorage);
    const targetRam = rams.length > 1 ? rams[0] : '';
    setSelectedStorage(targetStorage);
    setSelectedRam(targetRam);
    fetchRadar(selectedBrand, newModel, targetStorage, targetRam);
  };

  const handleStorageChange = (newStorage: string) => {
    setSelectedStorage(newStorage);
    const rams = currentDeviceSpecs.getRamsForStorage(newStorage);
    const nextRam = rams.length > 1 ? (rams.includes(selectedRam) ? selectedRam : rams[0]) : '';
    setSelectedRam(nextRam);
    if (searchModel.trim()) {
      fetchRadar(selectedBrand, searchModel.trim(), newStorage, nextRam);
    }
  };

  const handleRamChange = (newRam: string) => {
    setSelectedRam(newRam);
    if (searchModel.trim()) {
      fetchRadar(selectedBrand, searchModel.trim(), selectedStorage, newRam);
    }
  };

  const handleModelInputChange = (val: string) => {
    setSearchModel(val);
    const low = val.toLowerCase();
    let detectedBrand = selectedBrand;
    if (low.includes('iphone') || low.includes('apple') || low.includes('ipad')) {
      detectedBrand = 'Apple';
    } else if (low.includes('galaxy') || low.includes('s24') || low.includes('s23') || low.includes('z fold') || low.includes('z flip')) {
      detectedBrand = 'Samsung';
    } else if (low.includes('oneplus') || low.includes('nord')) {
      detectedBrand = 'OnePlus';
    } else if (low.includes('pixel')) {
      detectedBrand = 'Google';
    } else if (low.includes('poco')) {
      detectedBrand = 'Poco';
    } else if (low.includes('redmi') || low.includes('xiaomi')) {
      detectedBrand = 'Xiaomi';
    } else if (low.includes('iqoo')) {
      detectedBrand = 'iQOO';
    } else if (low.includes('realme')) {
      detectedBrand = 'Realme';
    } else if (low.includes('moto') || low.includes('edge 50')) {
      detectedBrand = 'Motorola';
    }

    if (detectedBrand !== selectedBrand) {
      setSelectedBrand(detectedBrand);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchModel.trim()) {
      fetchRadar(selectedBrand, searchModel.trim(), selectedStorage, selectedRam);
    }
  };

  const handleApplyWatchlistItem = (item: typeof TOP_WATCHLIST[0]) => {
    setSelectedBrand(item.brand);
    setSearchModel(item.model);
    const specs = getModelHardwareSpecs(item.brand, item.model, MASTER_MODEL_CATALOG);
    const targetStorage = specs.storages.length > 0
      ? (specs.storages.includes(item.storage) ? item.storage : specs.defaultStorage || specs.storages[0])
      : item.storage;
    const rams = specs.getRamsForStorage(targetStorage);
    const targetRam = rams.length > 1 ? rams[0] : '';
    setSelectedStorage(targetStorage);
    setSelectedRam(targetRam);
    fetchRadar(item.brand, item.model, targetStorage, targetRam);
  };

  const handleSavePriceToDatabase = async (newPrice: number) => {
    if (!newPrice || newPrice <= 0) return;

    // 1. INSTANT ZERO-LATENCY OPTIMISTIC UPDATE (0ms)
    const normStorage = normalizeStorageString(selectedStorage);
    savePriceOverride(selectedBrand, searchModel, newPrice, normStorage);

    // Also update all REAL sibling storage variants proportionally in real-time
    const currentMult = calculateHardwareVariantMultiplier(normStorage, '', selectedBrand) || 1.0;
    availableStorages.forEach((stg) => {
      if (stg !== normStorage) {
        const sMult = calculateHardwareVariantMultiplier(stg, '', selectedBrand) || 1.0;
        const sRatio = sMult / currentMult;
        const sPrice = Math.max(500, Math.round((newPrice * sRatio) / 50) * 50);
        savePriceOverride(selectedBrand, searchModel, sPrice, stg);
      }
    });

    setSaveSuccess(true);
    setRadarData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fundu: {
          ...prev.fundu,
          basePrice: newPrice,
          flawlessOffer: newPrice,
          goodOffer: Math.round(newPrice * 0.85),
          fairOffer: Math.round(newPrice * 0.70),
        },
      };
    });

    // 2. Persist to Backend in Background
    setSavingPrice(true);
    try {
      const payload = {
        brand: selectedBrand,
        model: searchModel,
        storage: normStorage,
        base_price: newPrice,
        excellent_multiplier: 1.0,
        good_multiplier: 0.85,
        fair_multiplier: 0.70,
        box_bonus: 600,
        charger_bonus: 400,
        is_active: true,
        is_locked: true,
        manual_override: true,
      };

      const res = await fetch(`${API_BASE}/sell-pricing/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update price in database');
      const json = await res.json();
      if (json.data) {
        broadcastSync('PRICE_UPDATE', 'sell_price_configs', 'upsert', json.data);
      }
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Background price sync failed:', err);
      alert(err?.message || 'Failed to update database');
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1A222D] via-[#2A374A] to-[#344257] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="badge bg-emerald-950/70 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5">
              Live Buyback Intelligence Engine
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2.5">
            <Radar className="h-7 w-7 text-emerald-400 animate-spin-slow" /> Competitor Price Radar
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Real-time buyback market prices across <strong>Cashify, Flipkart Recommerce, Amazon Trade-In, InstaCash & QuickMobile</strong>.
            Ensure Fundu always offers the highest guaranteed cash while locking in 10%–15% B2B refurbishment margins.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchRadar(selectedBrand, searchModel, selectedStorage)}
          disabled={loading}
          className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer transition shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Scanning Market...' : 'Refresh Live Rates'}
        </button>
      </div>

      {/* Top 10 High-Volume Indian Watchlist Shortcuts */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" /> Top Indian Anchor Models (1-Click Quick Radar)
          </span>
          <span className="text-[11px] text-gray-400 font-semibold">Instant Market Audit</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {TOP_WATCHLIST.map((item) => (
            <button
              key={`${item.brand}-${item.model}-${item.storage}`}
              type="button"
              onClick={() => handleApplyWatchlistItem(item)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer border ${
                searchModel.toLowerCase() === item.model.toLowerCase() && selectedStorage === item.storage
                  ? 'bg-[#344257] text-white border-[#344257] shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {item.model} <span className="opacity-70 text-[10px]">({item.storage})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Brand Selector */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-gray-700">Select Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#344257] focus:border-transparent outline-none cursor-pointer"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div className={`${availableRams.length > 1 ? 'md:col-span-3' : 'md:col-span-5'} space-y-1`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Phone Model</label>
              <button
                type="button"
                onClick={() => setIsManualMode(!isManualMode)}
                className="text-[10px] text-[#344257] hover:text-[#1A222D] font-bold hover:underline cursor-pointer"
              >
                {isManualMode ? '📋 Select from list' : '✏️ Type manually'}
              </button>
            </div>

            {isManualMode ? (
              <div className="relative">
                <input
                  type="text"
                  value={searchModel}
                  onChange={(e) => handleModelInputChange(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro, Moto Edge 50, Vivo V40..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#344257] focus:border-transparent outline-none"
                />
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedModelOption}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsManualMode(true);
                    } else {
                      handleModelSelect(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#344257] focus:border-transparent outline-none cursor-pointer"
                >
                  {!availableModels.some((m) => m.toLowerCase() === selectedModelOption.toLowerCase()) && selectedModelOption && (
                    <option value={selectedModelOption}>{selectedModelOption}</option>
                  )}
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="__custom__">✏️ Type Custom Model...</option>
                </select>
              </div>
            )}
          </div>

          {/* Storage Variant Selector (Shows ONLY storages that realistically exist for this phone) */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-gray-700">Storage Variant</label>
            <select
              value={selectedStorage}
              onChange={(e) => handleStorageChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#344257] focus:border-transparent outline-none cursor-pointer"
            >
              {availableStorages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Authentic RAM Variant Selector (e.g. 6 GB vs 8 GB -> +₹1,000) */}
          {availableRams.length > 1 && (
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-700">RAM Variant</label>
              <select
                value={selectedRam}
                onChange={(e) => handleRamChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#344257] focus:border-transparent outline-none cursor-pointer"
              >
                {availableRams.map((r, idx) => (
                  <option key={r} value={r}>
                    {r} {idx > 0 ? `(+₹${idx * 1000})` : '(Base)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-[#344257] hover:bg-[#2A374A] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4" /> {loading ? 'Scanning...' : 'Compare Live'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Radar Output */}
      {radarData && (
        <div className="space-y-6">
          {/* EXECUTIVE OVERVIEW CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Selected Device & Fundu Status (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="h-28 w-28 shrink-0 rounded-2xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center shadow-inner overflow-hidden">
                  <img
                    src={radarData.device.image || getCleanPhoneImage(radarData.device.brand, radarData.device.model)}
                    alt={radarData.device.model}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const b = (radarData.device.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = 'true';
                        target.src = BRAND_FRONT_FALLBACKS[b] || BRAND_FRONT_FALLBACKS.apple || getGenericDevicePlaceholder(radarData.device.brand, radarData.device.model);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="badge bg-[#344257] text-white font-black text-[10px] px-2.5 py-0.5">
                      {radarData.device.brand}
                    </span>
                    <span className="badge bg-gray-100 text-gray-700 font-bold text-[10px] px-2 py-0.5">
                      {radarData.device.storage}
                    </span>
                    {(radarData.device.ram || selectedRam) && (
                      <span className="badge bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-[10px] px-2 py-0.5">
                        {radarData.device.ram || selectedRam} RAM
                      </span>
                    )}
                    {radarData.marketAnalytics.isWinning ? (
                      <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1">
                        👑 Fundu Wins Deal
                      </span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-800 border border-amber-300 font-black text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1">
                        ⚠️ Below Market Highest
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-black text-gray-900">
                    {radarData.device.brand} {radarData.device.model}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Database Config ID: <code>{radarData.device.configId || 'masterphone-fallback'}</code>
                  </p>
                </div>
              </div>

              {/* Fundu Price Display & Condition Matrix */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-[#1E2734] to-[#344257] p-5 text-white shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Fundu Official Buyback Rate (Active Database)
                  </span>
                  <span className="text-[11px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                    Free Doorstep Pickup Included
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs text-gray-300 font-bold block">Fundu Base Valuation (100% Rate)</span>
                    <span className="font-display text-3xl sm:text-4xl font-black text-emerald-400">
                      {formatINR(radarData.fundu.basePrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-300 font-bold block">Advantage vs Cashify</span>
                    <span className="font-display text-xl font-black text-white">
                      +{formatINR(radarData.fundu.basePrice - (radarData.competitors[0]?.baseOffer || 0))} Cash
                    </span>
                  </div>
                </div>

                {/* Grade breakdown */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Customer Payouts by Condition:</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-300 block">Flawless (82%)</span>
                      <span className="text-sm font-black text-white">{formatINR(radarData.fundu.flawlessOffer)}</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-300 block">Good (70%)</span>
                      <span className="text-sm font-black text-white">{formatINR(radarData.fundu.goodOffer)}</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-gray-300 block">Fair (55%)</span>
                      <span className="text-sm font-black text-white">{formatINR(radarData.fundu.fairOffer)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Intelligence & Profit Margin Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              {/* Market Aggregates */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" /> Indian Recommerce Benchmark
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">Market Highest</span>
                    <span className="text-base font-black text-blue-950">
                      {formatINR(radarData.marketAnalytics.marketHighest)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-600 block">Market Average</span>
                    <span className="text-base font-black text-gray-900">
                      {formatINR(radarData.marketAnalytics.marketAverage)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Market Lowest</span>
                    <span className="text-base font-black text-amber-950">
                      {formatINR(radarData.marketAnalytics.marketLowest)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span>Est. B2B Wholesale Liquidation Price:</span>
                    <span className="font-extrabold">{formatINR(radarData.marketAnalytics.b2bLiquidationEst)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Target Gross Profit Margin:</span>
                    <span className="font-black text-emerald-700">
                      +{formatINR(radarData.marketAnalytics.grossMargin)} ({radarData.marketAnalytics.grossMarginPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant 1-Click Price Adjustment Tool */}
              <div className="bg-gradient-to-br from-gray-900 to-[#1E2734] p-5 rounded-3xl text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#9ac0dd] flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" /> Fast Price Adjustment
                  </span>
                  {saveSuccess && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Check className="h-3 w-3" /> Saved to MongoDB!
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={customPriceInput}
                      onChange={(e) => setCustomPriceInput(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePriceToDatabase(Number(customPriceInput))}
                    disabled={savingPrice}
                    className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0"
                  >
                    <Save className="h-3.5 w-3.5" /> {savingPrice ? 'Saving...' : 'Set Price'}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const opt = radarData.marketAnalytics.suggestedOptimumPrice;
                      setCustomPriceInput(String(opt));
                    }}
                    className="text-[11px] font-bold text-emerald-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
                  >
                    Fill Market + ₹1,000 ({formatINR(radarData.marketAnalytics.suggestedOptimumPrice)})
                  </button>
                  {radarData.marketAnalytics.diffFromCashify !== undefined && radarData.marketAnalytics.diffFromCashify < 800 && (
                    <span className="text-[10px] font-bold text-amber-300">
                      ⚠️ Current price is below the ₹1,000 lead over Cashify! Click above to auto-beat.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MULTI-PLATFORM SIDE-BY-SIDE COMPETITOR TABLE */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h4 className="font-display text-lg font-black text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#344257]" /> Multi-Platform Live Buyback Matrix
                </h4>
                <p className="text-xs text-gray-500">
                  Direct price comparison across India's top 5 used-device trade-in and recommerce platforms.
                </p>
              </div>
              <span className="badge bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1">
                5 Platforms Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarData.competitors.map((comp) => {
                const diff = radarData.fundu.basePrice - comp.baseOffer;
                const isFunduBetter = diff >= 0;

                return (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/60 to-white hover:border-[#6A859F] transition-all space-y-4 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={comp.logo}
                            alt={comp.name}
                            className="h-6 w-6 rounded-md object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-extrabold text-sm text-gray-900">{comp.name}</h5>
                              {comp.isLive && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold">{comp.tagline}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-full">
                          {comp.marketShare}
                        </span>
                      </div>

                      {/* Price Offer Card */}
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Estimated Buyback Rate
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-display text-2xl font-black text-gray-900">
                            {formatINR(comp.baseOffer)}
                          </span>
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                              isFunduBetter
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isFunduBetter ? `Fundu +${formatINR(diff)}` : `Fundu -${formatINR(Math.abs(diff))}`}
                          </span>
                        </div>
                      </div>

                      {/* Condition breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-gray-100/70 p-2 rounded-lg">
                          <span className="text-[10px] text-gray-500 block">Flawless</span>
                          <span className="font-bold text-gray-900">{formatINR(comp.flawlessOffer)}</span>
                        </div>
                        <div className="bg-gray-100/70 p-2 rounded-lg">
                          <span className="text-[10px] text-gray-500 block">Good</span>
                          <span className="font-bold text-gray-900">{formatINR(comp.goodOffer)}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-600 space-y-0.5">
                        <p>
                          <strong>Payout:</strong> {comp.payoutSpeed}
                        </p>
                      </div>
                    </div>

                    {/* Verification Button */}
                    <div className="pt-2 border-t border-gray-100">
                      <a
                        href={comp.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline text-xs w-full py-2 flex items-center justify-center gap-1.5 text-gray-700 hover:text-[#344257] hover:border-[#344257] font-bold transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Check Live on {comp.name.split(' ')[0]}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
