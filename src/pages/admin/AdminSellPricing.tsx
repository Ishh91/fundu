import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  Zap,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Camera,
  Upload,
  Link2,
  RotateCcw,
  Check,
  X,
  Smartphone,
  Filter,
  ArrowUpDown,
  Sparkles,
  Tag,
  Eye,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import type { SellPriceConfig, MasterPhone } from './adminTypes';
import { db, formatINR } from '../../lib/db';
import {
  getCleanPhoneImage,
  saveCustomModelImage,
  resetCustomModelImage,
  hasCustomModelImage,
  getCustomModelImages,
} from '../../lib/phoneImages';
import {
  savePriceOverride,
  getLocalPriceOverrides,
  isModelDeleted,
  markModelAsDeleted,
  restoreModel,
} from '../../lib/priceSync';
import { ALL_INDIAN_PHONES_CATALOG } from '../../data/indianPhonesCatalog';

export type UnifiedSellModel = {
  id: string;
  brand: string;
  model: string;
  storage: string;
  base_price: number;
  default_mrp?: number;
  excellent_multiplier: number;
  good_multiplier: number;
  fair_multiplier: number;
  box_bonus: number;
  charger_bonus: number;
  image_url: string;
  is_active: boolean;
  hasCustomPrice: boolean;
  hasCustomImage: boolean;
  configId?: string;
  masterPhoneId?: string;
};

type AdminSellPricingProps = {
  configs: SellPriceConfig[];
  masterPhones: MasterPhone[];
  selectedPricingId: string | null;
  onSelectPricing: (id: string) => void;
  onSavePriceConfig: (config: Partial<SellPriceConfig>) => Promise<void>;
  onUpdateImage: (phone: { brand: string; model: string; id?: string }, imageUrl: string) => Promise<void>;
  onToggleActive: (id: string, current: boolean) => void;
  onDeleteConfig: (id: string) => void;
  onAutoGenerateRules: () => void;
  generatingRules: boolean;
  onAddNewModel?: (data: { brand: string; model: string; base_price: number; default_mrp?: number; image_url?: string; storage?: string }) => Promise<void>;
};

const POPULAR_BRANDS = [
  'All',
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Realme',
  'Vivo',
  'Oppo',
  'Google',
  'Nothing',
  'Motorola',
];

export default function AdminSellPricing({
  configs,
  masterPhones,
  selectedPricingId,
  onSelectPricing,
  onSavePriceConfig,
  onUpdateImage,
  onToggleActive,
  onDeleteConfig,
  onAutoGenerateRules,
  generatingRules,
  onAddNewModel,
}: AdminSellPricingProps) {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'custom_price' | 'custom_image' | 'active' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_high' | 'price_low' | 'name_asc'>('default');

  // Change Image Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImageModel, setActiveImageModel] = useState<UnifiedSellModel | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageSaving, setImageSaving] = useState(false);

  // Edit Price Modal State
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [activePriceModel, setActivePriceModel] = useState<UnifiedSellModel | null>(null);
  const [priceForm, setPriceForm] = useState({
    brand: '',
    model: '',
    storage: '128GB',
    base_price: '15000',
    excellent_multiplier: '0.75',
    good_multiplier: '0.60',
    fair_multiplier: '0.45',
    box_bonus: '600',
    charger_bonus: '400',
    is_active: true,
  });
  const [priceSaving, setPriceSaving] = useState(false);

  // Add New Model Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    brand: 'Apple',
    model: '',
    storage: '128GB',
    default_mrp: '69999',
    base_price: '28000',
    image_url: '',
  });
  const [addSaving, setAddSaving] = useState(false);

  // Quick Inline Base Price Editing on Right Detail Panel
  const [inlinePrice, setInlinePrice] = useState<string>('');
  const [inlineSaving, setInlineSaving] = useState(false);

  // Track version updates for custom images & price overrides
  const [refreshVer, setRefreshVer] = useState(0);

  // Unified list of all sell models
  const unifiedModels = useMemo<UnifiedSellModel[]>(() => {
    const localOverrides = getLocalPriceOverrides();
    const customImages = getCustomModelImages();

    // Key lookup by brand:model
    const modelMap = new Map<string, UnifiedSellModel>();

    // 1. Process Master Phones (from DB)
    masterPhones.forEach((p) => {
      const bNorm = p.brand.trim().toLowerCase();
      const mNorm = p.model.trim().toLowerCase();
      const key = `${bNorm}:${mNorm}`;

      const customImg = customImages[key] || customImages[mNorm] || p.image_url || '';
      const customPr = localOverrides[key];

      modelMap.set(key, {
        id: `mp-${p.id || key}`,
        brand: p.brand,
        model: p.model,
        storage: p.storage_options?.[0] || '128GB',
        base_price: customPr !== undefined ? customPr : (p.base_resale_value || 12000),
        default_mrp: p.default_mrp,
        excellent_multiplier: 0.75,
        good_multiplier: 0.60,
        fair_multiplier: 0.45,
        box_bonus: 600,
        charger_bonus: 400,
        image_url: customImg,
        is_active: !isModelDeleted(p.brand, p.model),
        hasCustomPrice: customPr !== undefined,
        hasCustomImage: Boolean(customImages[key] || customImages[mNorm]),
        masterPhoneId: p.id,
      });
    });

    // 2. Process All Indian Phones Catalog (best-sellers fallback)
    ALL_INDIAN_PHONES_CATALOG.forEach((p) => {
      const bNorm = p.brand.trim().toLowerCase();
      const mNorm = p.model.trim().toLowerCase();
      const key = `${bNorm}:${mNorm}`;

      if (!modelMap.has(key)) {
        const customImg = customImages[key] || customImages[mNorm] || p.image_url || '';
        const customPr = localOverrides[key];

        modelMap.set(key, {
          id: `cat-${key}`,
          brand: p.brand,
          model: p.model,
          storage: p.storage_options?.[0] || '128GB',
          base_price: customPr !== undefined ? customPr : (p.base_resale_value || 12000),
          default_mrp: p.default_mrp,
          excellent_multiplier: 0.75,
          good_multiplier: 0.60,
          fair_multiplier: 0.45,
          box_bonus: 600,
          charger_bonus: 400,
          image_url: customImg,
          is_active: !isModelDeleted(p.brand, p.model),
          hasCustomPrice: customPr !== undefined,
          hasCustomImage: Boolean(customImages[key] || customImages[mNorm]),
        });
      }
    });

    // 3. Overlay Explicit Database Sell Price Configs
    configs.forEach((cfg) => {
      const bNorm = cfg.brand.trim().toLowerCase();
      const mNorm = cfg.model.trim().toLowerCase();
      const key = `${bNorm}:${mNorm}`;

      const existing = modelMap.get(key);
      const customImg = customImages[key] || customImages[mNorm] || existing?.image_url || '';

      if (existing) {
        existing.configId = cfg.id;
        existing.base_price = cfg.base_price;
        existing.storage = cfg.storage || existing.storage;
        existing.excellent_multiplier = cfg.excellent_multiplier;
        existing.good_multiplier = cfg.good_multiplier;
        existing.fair_multiplier = cfg.fair_multiplier;
        existing.box_bonus = cfg.box_bonus;
        existing.charger_bonus = cfg.charger_bonus;
        existing.is_active = cfg.is_active !== false && !isModelDeleted(cfg.brand, cfg.model);
        existing.hasCustomPrice = true;
      } else {
        modelMap.set(key, {
          id: `cfg-${cfg.id}`,
          brand: cfg.brand,
          model: cfg.model,
          storage: cfg.storage || '128GB',
          base_price: cfg.base_price,
          default_mrp: Math.round(cfg.base_price * 1.5),
          excellent_multiplier: cfg.excellent_multiplier,
          good_multiplier: cfg.good_multiplier,
          fair_multiplier: cfg.fair_multiplier,
          box_bonus: cfg.box_bonus,
          charger_bonus: cfg.charger_bonus,
          image_url: customImg,
          is_active: cfg.is_active !== false && !isModelDeleted(cfg.brand, cfg.model),
          hasCustomPrice: true,
          hasCustomImage: Boolean(customImages[key] || customImages[mNorm]),
          configId: cfg.id,
        });
      }
    });

    return Array.from(modelMap.values());
  }, [configs, masterPhones, refreshVer]);

  // Filtered & Sorted Models
  const filteredModels = useMemo(() => {
    let result = unifiedModels;

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter(
        (m) => m.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase()
      );
    }

    // Filter Type
    if (filterType === 'custom_price') {
      result = result.filter((m) => m.hasCustomPrice);
    } else if (filterType === 'custom_image') {
      result = result.filter((m) => m.hasCustomImage);
    } else if (filterType === 'active') {
      result = result.filter((m) => m.is_active);
    } else if (filterType === 'disabled') {
      result = result.filter((m) => !m.is_active);
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.model.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          `${m.brand} ${m.model}`.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price_high') {
      result = [...result].sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === 'price_low') {
      result = [...result].sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'name_asc') {
      result = [...result].sort((a, b) => a.model.localeCompare(b.model));
    }

    return result;
  }, [unifiedModels, selectedBrand, filterType, search, sortBy]);

  // Selected item
  const selectedModel = useMemo(() => {
    if (selectedPricingId) {
      const found = unifiedModels.find(
        (m) => m.id === selectedPricingId || m.configId === selectedPricingId
      );
      if (found) return found;
    }
    return filteredModels[0] || unifiedModels[0] || null;
  }, [selectedPricingId, unifiedModels, filteredModels]);

  // Sync inlinePrice state when selectedModel changes
  React.useEffect(() => {
    if (selectedModel) {
      setInlinePrice(String(selectedModel.base_price));
    }
  }, [selectedModel?.id, selectedModel?.base_price]);

  // Open Image Change Modal
  const handleOpenImageModal = (modelItem: UnifiedSellModel) => {
    setActiveImageModel(modelItem);
    const existing = modelItem.image_url || getCleanPhoneImage(modelItem.brand, modelItem.model);
    setNewImageUrl(existing);
    setImageTab('upload');
    setImageModalOpen(true);
  };

  // Save Changed Image
  const handleSaveImage = async () => {
    if (!activeImageModel) return;
    setImageSaving(true);
    try {
      const urlToSave = newImageUrl.trim();
      saveCustomModelImage(activeImageModel.brand, activeImageModel.model, urlToSave);

      if (onUpdateImage) {
        await onUpdateImage(
          {
            brand: activeImageModel.brand,
            model: activeImageModel.model,
            id: activeImageModel.masterPhoneId,
          },
          urlToSave
        );
      }

      setRefreshVer((v) => v + 1);
      setImageModalOpen(false);
      alert(`🎉 Photo updated for ${activeImageModel.brand} ${activeImageModel.model}! Live across sell catalog.`);
    } catch (err: any) {
      alert(err?.message || 'Failed to update model image');
    } finally {
      setImageSaving(false);
    }
  };

  // Reset Image to default official studio render
  const handleResetImage = async () => {
    if (!activeImageModel) return;
    if (!confirm(`Reset image for ${activeImageModel.brand} ${activeImageModel.model} back to default official render?`)) return;
    setImageSaving(true);
    try {
      resetCustomModelImage(activeImageModel.brand, activeImageModel.model);

      if (onUpdateImage) {
        await onUpdateImage(
          {
            brand: activeImageModel.brand,
            model: activeImageModel.model,
            id: activeImageModel.masterPhoneId,
          },
          ''
        );
      }

      setRefreshVer((v) => v + 1);
      setImageModalOpen(false);
      alert(`🔄 Image reset to official render for ${activeImageModel.brand} ${activeImageModel.model}!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to reset model image');
    } finally {
      setImageSaving(false);
    }
  };

  // Open Price Edit Modal
  const handleOpenPriceModal = (modelItem: UnifiedSellModel) => {
    setActivePriceModel(modelItem);
    setPriceForm({
      brand: modelItem.brand,
      model: modelItem.model,
      storage: modelItem.storage || '128GB',
      base_price: String(modelItem.base_price),
      excellent_multiplier: String(modelItem.excellent_multiplier),
      good_multiplier: String(modelItem.good_multiplier),
      fair_multiplier: String(modelItem.fair_multiplier),
      box_bonus: String(modelItem.box_bonus),
      charger_bonus: String(modelItem.charger_bonus),
      is_active: modelItem.is_active,
    });
    setPriceModalOpen(true);
  };

  // Save Price Rule from Modal
  const handleSavePriceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceForm.brand || !priceForm.model || !priceForm.base_price) {
      alert('Brand, Model, and Base Price are required.');
      return;
    }

    setPriceSaving(true);
    try {
      const newPriceNum = Number(priceForm.base_price);
      await onSavePriceConfig({
        id: activePriceModel?.configId,
        brand: priceForm.brand.trim(),
        model: priceForm.model.trim(),
        storage: priceForm.storage.trim() || null,
        base_price: newPriceNum,
        excellent_multiplier: Number(priceForm.excellent_multiplier),
        good_multiplier: Number(priceForm.good_multiplier),
        fair_multiplier: Number(priceForm.fair_multiplier),
        box_bonus: Number(priceForm.box_bonus) || 0,
        charger_bonus: Number(priceForm.charger_bonus) || 0,
        is_active: priceForm.is_active,
      });

      // Save price override directly to ensure immediate broadcast
      savePriceOverride(priceForm.brand, priceForm.model, newPriceNum, priceForm.storage);

      setRefreshVer((v) => v + 1);
      setPriceModalOpen(false);
      alert(`✅ Resale price updated to ₹${newPriceNum.toLocaleString('en-IN')} for ${priceForm.brand} ${priceForm.model}!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to save pricing rule');
    } finally {
      setPriceSaving(false);
    }
  };

  // Quick Save Inline Base Price from Right Detail Panel
  const handleSaveInlinePrice = async () => {
    if (!selectedModel) return;
    const priceNum = Number(inlinePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid positive price');
      return;
    }

    setInlineSaving(true);
    try {
      await onSavePriceConfig({
        id: selectedModel.configId,
        brand: selectedModel.brand,
        model: selectedModel.model,
        storage: selectedModel.storage,
        base_price: priceNum,
        excellent_multiplier: selectedModel.excellent_multiplier,
        good_multiplier: selectedModel.good_multiplier,
        fair_multiplier: selectedModel.fair_multiplier,
        box_bonus: selectedModel.box_bonus,
        charger_bonus: selectedModel.charger_bonus,
        is_active: selectedModel.is_active,
      });

      savePriceOverride(selectedModel.brand, selectedModel.model, priceNum, selectedModel.storage);
      setRefreshVer((v) => v + 1);
      alert(`✅ Updated base price to ${formatINR(priceNum)} for ${selectedModel.brand} ${selectedModel.model}!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to update base price');
    } finally {
      setInlineSaving(false);
    }
  };

  // Add New Custom Sell Model Submit
  const handleSaveNewModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.brand.trim() || !addForm.model.trim() || !addForm.base_price.trim()) {
      alert('Brand, Model Name, and Base Price are required');
      return;
    }

    setAddSaving(true);
    try {
      const basePriceNum = Number(addForm.base_price);
      const mrpNum = Number(addForm.default_mrp) || Math.round(basePriceNum * 1.5);

      if (addForm.image_url.trim()) {
        saveCustomModelImage(addForm.brand.trim(), addForm.model.trim(), addForm.image_url.trim());
      }

      await onSavePriceConfig({
        brand: addForm.brand.trim(),
        model: addForm.model.trim(),
        storage: addForm.storage.trim() || '128GB',
        base_price: basePriceNum,
        excellent_multiplier: 0.75,
        good_multiplier: 0.60,
        fair_multiplier: 0.45,
        box_bonus: 600,
        charger_bonus: 400,
        is_active: true,
      });

      savePriceOverride(addForm.brand.trim(), addForm.model.trim(), basePriceNum, addForm.storage.trim());

      if (onAddNewModel) {
        await onAddNewModel({
          brand: addForm.brand.trim(),
          model: addForm.model.trim(),
          base_price: basePriceNum,
          default_mrp: mrpNum,
          image_url: addForm.image_url.trim() || undefined,
          storage: addForm.storage.trim() || '128GB',
        });
      }

      setRefreshVer((v) => v + 1);
      setAddModalOpen(false);
      setAddForm({
        brand: 'Apple',
        model: '',
        storage: '128GB',
        default_mrp: '69999',
        base_price: '28000',
        image_url: '',
      });
      alert(`🎉 Added "${addForm.brand} ${addForm.model}" to Sell catalog!`);
    } catch (err: any) {
      alert(err?.message || 'Failed to add model');
    } finally {
      setAddSaving(false);
    }
  };

  // Analytics stats
  const totalModelsCount = unifiedModels.length;
  const customPricedCount = unifiedModels.filter((m) => m.hasCustomPrice).length;
  const customImagesCount = unifiedModels.filter((m) => m.hasCustomImage).length;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ANALYTICS BANNER */}
      <div className="card p-6 md:p-8 rounded-[28px] bg-gradient-to-r from-slate-900 via-[#1E2734] to-[#344257] text-white shadow-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
            <TrendingUp className="h-3.5 w-3.5" /> Sell Mobile Pricing & Image Controller
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-black text-white">
            Sell Phone Catalog: Custom Rates & Images
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Set exact buyback valuations and official device photos for each mobile model according to your own pricing rules. Updates broadcast instantly to customer sell pages.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
            <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 font-bold">
              📱 {totalModelsCount.toLocaleString()} Total Models
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
              💰 {customPricedCount} Custom Rates Set
            </span>
            <span className="px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold">
              📷 {customImagesCount} Custom Photos Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="btn bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Sell Model
          </button>
          <button
            type="button"
            onClick={onAutoGenerateRules}
            disabled={generatingRules}
            className="btn bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <Zap className={`h-4 w-4 ${generatingRules ? 'animate-spin' : ''}`} />
            {generatingRules ? 'Generating...' : '⚡ Bulk Sync Indian Rules'}
          </button>
        </div>
      </div>

      {/* 2. SEARCH, BRAND & FILTER CONTROLS */}
      <div className="card p-4 sm:p-5 rounded-[22px] bg-white border border-gray-200/90 shadow-xs space-y-4">
        {/* Brand Horizontal Scroll Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar pb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Brands:
          </span>
          {POPULAR_BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedBrand === brand
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Search & Filter Dropdown Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone model (e.g. iPhone 15 Pro, S24, Nord 3)..."
              className="input pl-10 pr-9 py-2.5 text-xs rounded-xl bg-gray-50 border-gray-200 focus:bg-white w-full font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input text-xs py-2 bg-gray-50 border-gray-200 font-semibold rounded-xl"
            >
              <option value="all">All Models ({unifiedModels.length})</option>
              <option value="custom_price">Custom Price Set ({customPricedCount})</option>
              <option value="custom_image">Custom Photos ({customImagesCount})</option>
              <option value="active">Active Models</option>
              <option value="disabled">Disabled Models</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input text-xs py-2 bg-gray-50 border-gray-200 font-semibold rounded-xl"
            >
              <option value="default">Default Order</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            <span className="text-xs font-bold text-gray-500 hidden md:block">
              Showing <strong className="text-gray-900">{filteredModels.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN SPLIT VIEW: MODELS LIST (LEFT) & DETAIL EDITOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCROLLABLE MODEL CARDS LIST */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {filteredModels.length === 0 ? (
            <div className="card p-12 text-center bg-white rounded-3xl border border-gray-200">
              <Smartphone className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">No models match your search</p>
              <p className="text-xs text-gray-500 mt-1">Try clearing filters or search for another model</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedBrand('All'); setFilterType('all'); }}
                className="mt-3 btn-outline text-xs py-1.5 px-3 inline-block"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredModels.map((item) => {
              const isSelected = selectedModel?.id === item.id;
              const displayImg = getCleanPhoneImage(item.brand, item.model, item.image_url);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectPricing(item.configId || item.id)}
                  className={`card p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Model Image with Quick Change Trigger */}
                    <div className="relative group shrink-0">
                      <div className="h-14 w-14 rounded-2xl bg-white border border-gray-200 p-1 flex items-center justify-center overflow-hidden shadow-xs">
                        <img
                          src={displayImg}
                          alt={item.model}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                          loading="lazy"
                        />
                      </div>
                      <button
                        type="button"
                        title="Change Photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenImageModal(item);
                        }}
                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition"
                      >
                        <Camera className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs sm:text-sm font-black text-gray-900 truncate">
                          {item.brand} {item.model}
                        </p>
                        <span
                          className={`badge text-[9px] font-extrabold px-2 py-0.5 ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {item.storage || '128GB'}
                        </span>
                        {item.hasCustomPrice && (
                          <span className="badge bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold">
                            Custom Rate
                          </span>
                        )}
                        {item.hasCustomImage && (
                          <span className="badge bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold">
                            Custom Photo
                          </span>
                        )}
                      </div>

                      {/* Buyback Price Row */}
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-gray-100 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Buyback:</span>
                          <span className="font-extrabold text-emerald-700 text-xs sm:text-sm">
                            {formatINR(item.base_price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPriceModal(item);
                            }}
                            className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: INSPECTOR & LIVE PRICE/IMAGE EDITOR */}
        <div className="lg:col-span-7 sticky top-4">
          {selectedModel ? (
            <div className="card p-6 md:p-8 rounded-[28px] bg-white border border-gray-200/90 shadow-sm space-y-6">
              {/* Header with Photo & Quick Image Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Big Image Preview with overlay */}
                  <div className="relative group shrink-0">
                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center shadow-xs">
                      <img
                        src={getCleanPhoneImage(selectedModel.brand, selectedModel.model, selectedModel.image_url)}
                        alt={selectedModel.model}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    </div>
                    {selectedModel.hasCustomImage && (
                      <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" title="Custom Photo Uploaded" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="badge bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase">
                      {selectedModel.brand} Smartphone
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                      {selectedModel.brand} {selectedModel.model}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      India Launch MRP: {selectedModel.default_mrp ? formatINR(selectedModel.default_mrp) : 'N/A'} · Variant: {selectedModel.storage}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenImageModal(selectedModel)}
                        className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-xl font-bold bg-white hover:bg-gray-50 border-gray-300"
                      >
                        <Camera className="h-3.5 w-3.5 text-blue-600" />
                        {selectedModel.hasCustomImage ? 'Change Custom Photo' : 'Upload Custom Photo'}
                      </button>

                      {selectedModel.hasCustomImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImageModel(selectedModel);
                            handleResetImage();
                          }}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 py-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Reset Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                  <button
                    type="button"
                    onClick={() => onToggleActive(selectedModel.configId || selectedModel.id, selectedModel.is_active)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      selectedModel.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {selectedModel.is_active ? '✓ Active on Website' : '✕ Disabled'}
                  </button>
                </div>
              </div>

              {/* Instant Quick Resale Price Adjustment Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-blue-50/50 border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                      ⚡ Quick Resale Price Controller
                    </span>
                    <h4 className="font-display text-base font-black text-gray-900 mt-0.5">
                      Base Valuation: {formatINR(selectedModel.base_price)}
                    </h4>
                  </div>
                  <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Instant Live Sync
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      value={inlinePrice}
                      onChange={(e) => setInlinePrice(e.target.value)}
                      placeholder="e.g. 24000"
                      className="input pl-8 pr-4 py-2.5 text-base font-black text-emerald-800 bg-white border-emerald-300 focus:ring-2 focus:ring-emerald-500 rounded-xl w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveInlinePrice}
                    disabled={inlineSaving || Number(inlinePrice) === selectedModel.base_price}
                    className="btn bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    {inlineSaving ? 'Saving...' : 'Save Price'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Customers selling their <strong className="text-gray-800">{selectedModel.brand} {selectedModel.model}</strong> will immediately see this updated rate on the sell page.
                </p>
              </div>

              {/* Dynamic Customer Price Tier Preview Calculator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-600" /> What Customers Get (Condition Breakdown)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenPriceModal(selectedModel)}
                    className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                  >
                    <Edit2 className="h-3 w-3" /> Adjust Multipliers
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Flawless */}
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700">Flawless</span>
                      <span className="text-[10px] font-black text-gray-400">
                        {Math.round(selectedModel.excellent_multiplier * 100)}%
                      </span>
                    </div>
                    <p className="text-base font-black text-gray-900">
                      {formatINR(Math.round(selectedModel.base_price * selectedModel.excellent_multiplier))}
                    </p>
                    <p className="text-[10px] text-gray-400">Zero scratches, 100% working</p>
                  </div>

                  {/* Good */}
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700">Good</span>
                      <span className="text-[10px] font-black text-gray-400">
                        {Math.round(selectedModel.good_multiplier * 100)}%
                      </span>
                    </div>
                    <p className="text-base font-black text-gray-900">
                      {formatINR(Math.round(selectedModel.base_price * selectedModel.good_multiplier))}
                    </p>
                    <p className="text-[10px] text-gray-400">Minor scratches, normal wear</p>
                  </div>

                  {/* Fair */}
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700">Fair / Heavy</span>
                      <span className="text-[10px] font-black text-gray-400">
                        {Math.round(selectedModel.fair_multiplier * 100)}%
                      </span>
                    </div>
                    <p className="text-base font-black text-gray-900">
                      {formatINR(Math.round(selectedModel.base_price * selectedModel.fair_multiplier))}
                    </p>
                    <p className="text-[10px] text-gray-400">Dents, deep scratches</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600">
                  <span>Accessories Bonus:</span>
                  <span className="font-bold text-gray-900">
                    Original Box (+{formatINR(selectedModel.box_bonus)}) · Original Charger (+{formatINR(selectedModel.charger_bonus)})
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleOpenPriceModal(selectedModel)}
                  className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Full Pricing Multiplier Settings
                </button>

                {selectedModel.configId && (
                  <button
                    type="button"
                    onClick={() => onDeleteConfig(selectedModel.configId!)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revert to Default Catalog
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-3xl border border-gray-200">
              <p className="text-sm font-bold text-gray-600">Select a model from the left list to manage prices and photos</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CHANGE MODEL IMAGE MODAL */}
      {imageModalOpen && activeImageModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="card w-full max-w-lg p-6 my-4 space-y-5 max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="badge bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                  Model Photo Manager
                </span>
                <h3 className="font-display text-lg font-black text-gray-900 mt-0.5">
                  Change Photo for {activeImageModel.brand} {activeImageModel.model}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current vs New Image Preview */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-3">
              <div className="h-36 w-36 rounded-2xl bg-white p-2 border border-gray-200 flex items-center justify-center shadow-xs">
                {newImageUrl ? (
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.currentTarget as any).src = getCleanPhoneImage(activeImageModel.brand, activeImageModel.model);
                    }}
                  />
                ) : (
                  <Smartphone className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <p className="text-[11px] font-bold text-gray-500">Live Device Preview on Customer Pages</p>
            </div>

            {/* Tabs: Upload File vs Image URL */}
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  imageTab === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📁 Upload From Device
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  imageTab === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔗 Enter Image URL
              </button>
            </div>

            {imageTab === 'upload' ? (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition text-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                  <span className="text-xs font-bold text-gray-800">
                    Click to browse or drop phone image
                  </span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image size exceeds 5MB limit');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewImageUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Direct Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://fdn2.gsmarena.com/... or https://..."
                  className="input text-xs w-full py-2.5 rounded-xl border-gray-300 font-mono"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetImage}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 py-2 flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Revert to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="btn-outline text-xs py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={imageSaving || !newImageUrl.trim()}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
                >
                  {imageSaving ? 'Updating...' : 'Save & Publish Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT FULL PRICING RULES MODAL */}
      {priceModalOpen && activePriceModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="card w-full max-w-lg p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="badge bg-emerald-50 text-emerald-800 font-extrabold text-[10px]">
                  Pricing Valuation Engine
                </span>
                <h3 className="font-display text-lg font-black text-gray-900 mt-0.5">
                  Configure Resale Rules: {priceForm.brand} {priceForm.model}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPriceModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePriceForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold">Brand</label>
                  <input
                    type="text"
                    required
                    value={priceForm.brand}
                    onChange={(e) => setPriceForm({ ...priceForm, brand: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Model</label>
                  <input
                    type="text"
                    required
                    value={priceForm.model}
                    onChange={(e) => setPriceForm({ ...priceForm, model: e.target.value })}
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold">Base Resale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={priceForm.base_price}
                    onChange={(e) => setPriceForm({ ...priceForm, base_price: e.target.value })}
                    className="input text-xs font-black text-emerald-700 bg-emerald-50/50"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Storage Variant</label>
                  <input
                    type="text"
                    value={priceForm.storage}
                    onChange={(e) => setPriceForm({ ...priceForm, storage: e.target.value })}
                    className="input text-xs font-medium"
                    placeholder="e.g. 128GB"
                  />
                </div>
              </div>

              {/* Multipliers */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <span className="text-[11px] font-black text-gray-800 uppercase block">
                  Condition Multipliers (% of Base Resale Value)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Flawless (0-1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={priceForm.excellent_multiplier}
                      onChange={(e) => setPriceForm({ ...priceForm, excellent_multiplier: e.target.value })}
                      className="input text-xs mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Good (0-1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={priceForm.good_multiplier}
                      onChange={(e) => setPriceForm({ ...priceForm, good_multiplier: e.target.value })}
                      className="input text-xs mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Fair (0-1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={priceForm.fair_multiplier}
                      onChange={(e) => setPriceForm({ ...priceForm, fair_multiplier: e.target.value })}
                      className="input text-xs mt-1 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bonus accessories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold">Original Box Bonus (₹)</label>
                  <input
                    type="number"
                    value={priceForm.box_bonus}
                    onChange={(e) => setPriceForm({ ...priceForm, box_bonus: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Original Charger Bonus (₹)</label>
                  <input
                    type="number"
                    value={priceForm.charger_bonus}
                    onChange={(e) => setPriceForm({ ...priceForm, charger_bonus: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={priceForm.is_active}
                    onChange={(e) => setPriceForm({ ...priceForm, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Active & Listed on Website
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={priceSaving}
                  className="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md cursor-pointer"
                >
                  {priceSaving ? 'Saving...' : 'Save Pricing Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW MODEL TO SELL CATALOG */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="card w-full max-w-lg p-6 my-4 space-y-4 max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-3xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="badge bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                  Catalog Expansion
                </span>
                <h3 className="font-display text-lg font-black text-gray-900 mt-0.5">
                  Add New Smartphone to Sell Catalog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewModel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold">Brand *</label>
                  <input
                    type="text"
                    required
                    value={addForm.brand}
                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                    placeholder="e.g. Apple, Samsung"
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.model}
                    onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                    placeholder="e.g. iPhone 16 Pro Max"
                    className="input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-bold">India Launch MRP (₹)</label>
                  <input
                    type="number"
                    value={addForm.default_mrp}
                    onChange={(e) => setAddForm({ ...addForm, default_mrp: e.target.value })}
                    placeholder="e.g. 139999"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold">Base Buyback Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={addForm.base_price}
                    onChange={(e) => setAddForm({ ...addForm, base_price: e.target.value })}
                    placeholder="e.g. 65000"
                    className="input text-xs font-black text-emerald-800 bg-emerald-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs font-bold">Storage Options</label>
                <input
                  type="text"
                  value={addForm.storage}
                  onChange={(e) => setAddForm({ ...addForm, storage: e.target.value })}
                  placeholder="e.g. 128GB, 256GB, 512GB"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label text-xs font-bold">Device Photo / Image URL (Optional)</label>
                <input
                  type="text"
                  value={addForm.image_url}
                  onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
                  placeholder="https://... or upload photo after saving"
                  className="input text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md cursor-pointer"
                >
                  {addSaving ? 'Adding...' : 'Add Model to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
