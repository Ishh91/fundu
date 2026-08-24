import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Wand2,
  Monitor,
  Smartphone,
  Tablet,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type { HeroPoster } from './adminTypes';
import { useHeroPosters, DEFAULT_HERO_POSTERS } from '../../lib/heroBanners';
import { removeImageBackground } from '../../lib/imageUtils';

const QUICK_LINKS = [
  { label: '📱 Sell Old Phone (/sell)', value: '/sell' },
  { label: '🛍️ Buy Refurbished (/buy)', value: '/buy' },
  { label: '🔧 Phone Repair (/repair)', value: '/repair' },
  { label: '🏬 Spare Parts Store (/store)', value: '/store' },
  { label: '🤝 Partner with Fundu (/partner)', value: '/partner' },
  { label: '🎉 Celebrating Festival & Deals (/festival)', value: '/festival' },
];

export default function AdminHeroPosters() {
  const { posters, savePosters, resetPosters, loading } = useHeroPosters();

  const [selectedPosterId, setSelectedPosterId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<HeroPoster | null>(null);
  const [saving, setSaving] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Custom Poster Upload (3 Device Options)
  const [form, setForm] = useState({
    title: '',
    primaryHref: '/sell',
    image: '', // Laptop / Desktop
    image_tablet: '', // Tablet / iPad
    image_mobile: '', // Mobile Phone
    originalImage: '',
    is_bg_removed: false,
    is_active: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPreviewPoster = posters.find((p) => p.id === selectedPosterId) || posters[0] || null;

  const handleOpenAdd = () => {
    setEditingPoster(null);
    setForm({
      title: '',
      primaryHref: '/sell',
      image: '',
      image_tablet: '',
      image_mobile: '',
      originalImage: '',
      is_bg_removed: false,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (poster: HeroPoster) => {
    setEditingPoster(poster);
    setForm({
      title: poster.title || '',
      primaryHref: poster.primaryHref || '/sell',
      image: poster.image || '',
      image_tablet: poster.image_tablet || '',
      image_mobile: poster.image_mobile || '',
      originalImage: poster.image || '',
      is_bg_removed: false,
      is_active: poster.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (posterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = posters.map((p) =>
      p.id === posterId ? { ...p, is_active: !p.is_active } : p
    );
    await savePosters(updated);
    showToast('Poster status updated!');
  };

  const handleDelete = async (posterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this hero poster?')) return;
    const updated = posters.filter((p) => p.id !== posterId);
    await savePosters(updated);
    if (selectedPosterId === posterId) {
      setSelectedPosterId(updated[0]?.id || null);
    }
    showToast('Poster deleted successfully');
  };

  const handleMove = async (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= posters.length) return;

    const copy = [...posters];
    const [movedItem] = copy.splice(index, 1);
    copy.splice(newIndex, 0, movedItem);

    await savePosters(copy);
    showToast('Poster order updated');
  };

  const handleDeviceFileUpload = (device: 'desktop' | 'tablet' | 'mobile') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Poster size exceeds 10MB. Please choose a compressed web graphic.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const rawData = event.target!.result as string;
        setForm((prev) => {
          if (device === 'desktop') {
            return { ...prev, image: rawData, originalImage: rawData, is_bg_removed: false };
          } else if (device === 'tablet') {
            return { ...prev, image_tablet: rawData };
          } else {
            return { ...prev, image_mobile: rawData };
          }
        });
        showToast(`Selected ${device} poster graphic! 🖼️`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Background Removal Toggle Handler
  const handleToggleRemoveBg = async () => {
    if (!form.image && !form.originalImage) {
      alert('Please upload or provide a poster graphic first.');
      return;
    }

    // If background is already removed, restore original
    if (form.is_bg_removed) {
      setForm((prev) => ({
        ...prev,
        image: prev.originalImage || prev.image,
        is_bg_removed: false,
      }));
      showToast('Restored original poster background ↺');
      return;
    }

    // Otherwise, remove background
    setIsRemovingBg(true);
    try {
      const source = form.originalImage || form.image;
      const transparentDataUrl = await removeImageBackground(source);
      setForm((prev) => ({
        ...prev,
        originalImage: prev.originalImage || prev.image,
        image: transparentDataUrl,
        is_bg_removed: true,
      }));
      showToast('Background removed! Transparent cutout ready ✨');
    } catch (err) {
      console.error('Failed to remove background:', err);
      alert('Could not remove background from this graphic. Ensure image URL is accessible.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a poster title or campaign name.');
      return;
    }
    if (!form.image.trim()) {
      alert('Please upload a poster graphic or paste an image URL.');
      return;
    }

    setSaving(true);
    try {
      const posterData: HeroPoster = {
        id: editingPoster?.id || `poster-${Date.now()}`,
        eyebrow: 'Featured',
        title: form.title.trim(),
        description: '',
        primaryLabel: 'Check Offer',
        primaryHref: form.primaryHref.trim() || '/sell',
        secondaryLabel: '',
        secondaryHref: '',
        accent: 'from-[#0a2f32] to-[#86dedd]',
        image: form.image.trim(),
        image_tablet: form.image_tablet.trim() || undefined,
        image_mobile: form.image_mobile.trim() || undefined,
        bullets: [],
        is_active: form.is_active,
        is_full_banner: true,
        sort_order: editingPoster?.sort_order || posters.length + 1,
      };

      let updatedPosters: HeroPoster[];
      if (editingPoster) {
        updatedPosters = posters.map((p) => (p.id === editingPoster.id ? posterData : p));
      } else {
        updatedPosters = [...posters, posterData];
      }

      await savePosters(updatedPosters);
      setSelectedPosterId(posterData.id);
      setModalOpen(false);
      showToast(editingPoster ? 'Poster updated successfully!' : 'New poster banner added!');
    } catch (err) {
      console.error(err);
      alert('Failed to save poster.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all hero posters to default Fundu Lucknow banners?')) return;
    await resetPosters();
    setSelectedPosterId(null);
    showToast('Reset to default poster banners');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-r-transparent" />
        <p className="mt-2 text-xs text-slate-500 font-bold">Loading Custom Posters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <Sparkles className="h-4 w-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-teal-600" />
            <span>Custom Hero Poster Banners</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Upload your custom Canva/Photoshop poster banners. Display edge-to-edge on homepage carousel with optional background removal.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSizeGuide(true)}
            className="btn text-xs px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 font-bold hover:bg-teal-100 flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 text-teal-600" />
            <span>📐 Exact Device Sizes</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload New Poster</span>
          </button>
        </div>
      </div>

      {/* DEVICE SIZES GUIDE BANNER (Quick Reference) */}
      <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-cyan-50/70 to-emerald-50/70 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-teal-950">
            <span className="text-lg">📐</span>
            <h3 className="text-xs font-black uppercase tracking-wider">
              Exact Poster Banner Sizes for Canva / Photoshop
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="text-xs font-extrabold text-teal-700 hover:underline cursor-pointer"
          >
            {showSizeGuide ? 'Hide Full Guide' : 'Expand Full Details →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Desktop */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-teal-100 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <Monitor className="h-4 w-4 text-teal-600" />
              <span>Desktop / Laptop (Full HD)</span>
            </div>
            <p className="text-base font-black text-teal-700 mt-1">1920 × 750 px</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Aspect: <b>2.5:1</b> (Safe Text Zone: Center 1200px)
            </p>
          </div>

          {/* Tablet */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-teal-100 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <Tablet className="h-4 w-4 text-teal-600" />
              <span>iPad & Tablets</span>
            </div>
            <p className="text-base font-black text-teal-700 mt-1">1440 × 600 px</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Aspect: <b>2.4:1</b> (Medium widescreen)
            </p>
          </div>

          {/* Mobile */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-teal-100 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <Smartphone className="h-4 w-4 text-teal-600" />
              <span>Mobile Devices (All Phones)</span>
            </div>
            <p className="text-base font-black text-teal-700 mt-1">1080 × 608 px</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Aspect: <b>16:9</b> (Keep text 10% away from edges)
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Uploaded Posters */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Slides ({posters.length})
            </span>
            <span className="text-[11px] text-teal-700 font-bold">
              {posters.filter((p) => p.is_active !== false).length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {posters.map((poster, index) => {
              const isSelected = (selectedPosterId || posters[0]?.id) === poster.id;
              const isActive = poster.is_active !== false;

              return (
                <div
                  key={poster.id}
                  onClick={() => setSelectedPosterId(poster.id)}
                  className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer p-3.5 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-200">
                      <img
                        src={poster.image}
                        alt={poster.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/200x120?text=Poster';
                        }}
                      />
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/60 grid place-items-center text-[10px] text-white font-bold">
                          Hidden
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                          Slide #{index + 1}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 truncate">
                          ➔ {poster.primaryHref || '/sell'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 truncate mt-1">
                        {poster.title || 'Untitled Poster'}
                      </h4>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleMove(index, 'up', e)}
                        disabled={index === 0}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleMove(index, 'down', e)}
                        disabled={index === posters.length - 1}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleToggleActive(poster.id, e)}
                        className={`p-1 rounded-lg ${
                          isActive ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={isActive ? 'Deactivate' : 'Activate'}
                      >
                        {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(poster);
                        }}
                        className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
                        title="Edit Poster"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(poster.id, e)}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                        title="Delete Poster"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Edge-to-Edge Poster Live Preview */}
        <div className="lg:col-span-7 space-y-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" /> Live Homepage Hero Poster Preview
            </h3>
            {currentPreviewPoster && (
              <button
                onClick={() => handleOpenEdit(currentPreviewPoster)}
                className="btn text-xs px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" /> Edit Poster
              </button>
            )}
          </div>

          {currentPreviewPoster ? (
            <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-xl backdrop-blur-xl">
              {/* The Edge-to-Edge Poster Graphic */}
              <div className="relative w-full overflow-hidden min-h-[260px] sm:min-h-[320px] bg-slate-900 flex items-center justify-center group">
                <img
                  src={currentPreviewPoster.image}
                  alt={currentPreviewPoster.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/1200x500?text=Custom+Poster+Preview';
                  }}
                />

                {/* Floating Preview Overlay */}
                <div className="absolute top-3 left-3 rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                  <span>{currentPreviewPoster.title || 'Fundu Custom Poster'}</span>
                </div>

                <div className="absolute bottom-3 right-3 rounded-full bg-teal-500/90 backdrop-blur-md px-3.5 py-1 text-xs font-black text-slate-950 shadow-lg flex items-center gap-1">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Click Target: {currentPreviewPoster.primaryHref || '/'}</span>
                </div>
              </div>

              {/* Meta Card */}
              <div className="p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Campaign Name</span>
                    <p className="font-bold text-slate-900 truncate mt-0.5">{currentPreviewPoster.title}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Click Link</span>
                    <p className="font-bold text-teal-700 truncate mt-0.5">{currentPreviewPoster.primaryHref}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Homepage Visibility</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {currentPreviewPoster.is_active !== false ? '🟢 Live on Homepage' : '⚪ Hidden'}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
                  <span>
                    When a visitor clicks this banner on the homepage, they are directed straight to <b>{currentPreviewPoster.primaryHref}</b>.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <ImageIcon className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700 mt-3">No poster selected</p>
              <button onClick={handleOpenAdd} className="btn-primary text-xs px-4 py-2 mt-4 inline-flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Upload your first poster
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload / Edit Poster Modal with Background Removal Option */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-base">
                    {editingPoster ? 'Edit Custom Poster' : 'Upload New Custom Poster'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Upload your graphic with background control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-5">
              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Poster Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Festive Sell Offer Banner Lucknow"
                  className="input text-xs"
                />
              </div>

              {/* 3 DEVICE POSTER GRAPHIC UPLOADS */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>📱 3 Device Poster Graphics (Responsive Upload)</span>
                  </h4>
                  <span className="text-[10px] text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Auto-Adjusts Height Per Screen
                  </span>
                </div>

                {/* 1. Laptop / Desktop Poster */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Monitor className="h-4 w-4 text-teal-600" />
                      <span>1. Laptop & Desktop Poster (Default)</span> <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-extrabold">Wide Aspect ~2.5:1 (1920×750 px)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={form.image}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          image: e.target.value,
                          originalImage: e.target.value,
                          is_bg_removed: false,
                        })
                      }
                      placeholder="Paste Desktop poster URL or upload"
                      className="input text-xs flex-1"
                    />
                    <label className="btn text-xs px-3.5 py-2 rounded-xl border border-teal-400 bg-teal-600 font-bold text-white hover:bg-teal-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Desktop</span>
                      <input type="file" accept="image/*" onChange={handleDeviceFileUpload('desktop')} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* 2. Tablet / iPad Poster */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tablet className="h-4 w-4 text-teal-600" />
                      <span>2. Tablet & iPad Poster</span> <span className="text-[10px] font-bold text-slate-400">(Optional - falls back to Desktop)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-extrabold">Aspect ~2.4:1 (1440×600 px)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image_tablet}
                      onChange={(e) => setForm({ ...form, image_tablet: e.target.value })}
                      placeholder="Paste Tablet poster URL or upload (Optional)"
                      className="input text-xs flex-1"
                    />
                    <label className="btn text-xs px-3.5 py-2 rounded-xl border border-teal-400 bg-teal-600 font-bold text-white hover:bg-teal-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Tablet</span>
                      <input type="file" accept="image/*" onChange={handleDeviceFileUpload('tablet')} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* 3. Mobile Phone Poster */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-teal-600" />
                      <span>3. Mobile Phone Poster</span> <span className="text-[10px] font-bold text-slate-400">(Optional - falls back to Desktop)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-extrabold">Aspect 16:9 / 4:3 (1080×608 px)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image_mobile}
                      onChange={(e) => setForm({ ...form, image_mobile: e.target.value })}
                      placeholder="Paste Mobile poster URL or upload (Optional)"
                      className="input text-xs flex-1"
                    />
                    <label className="btn text-xs px-3.5 py-2 rounded-xl border border-teal-400 bg-teal-600 font-bold text-white hover:bg-teal-700 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Mobile</span>
                      <input type="file" accept="image/*" onChange={handleDeviceFileUpload('mobile')} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* BACKGROUND REMOVAL OPTION & LIVE PREVIEW */}
                {form.image && (
                  <div className="mt-3 p-3.5 bg-slate-900 rounded-2xl text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold block">
                          Background Mode:
                        </span>
                        <p className="text-[11px] text-slate-300">
                          {form.is_bg_removed
                            ? '✂️ Transparent Cutout (Background removed)'
                            : '🖼️ Original Background (Full Poster)'}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isRemovingBg}
                        onClick={handleToggleRemoveBg}
                        className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer ${
                          form.is_bg_removed
                            ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500'
                            : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black'
                        }`}
                      >
                        <Wand2 className={`h-3.5 w-3.5 ${isRemovingBg ? 'animate-spin' : ''}`} />
                        <span>
                          {isRemovingBg
                            ? 'Removing...'
                            : form.is_bg_removed
                            ? '↺ Revert Original'
                            : '✂️ Remove Background'}
                        </span>
                      </button>
                    </div>

                    {/* Preview Box */}
                    <div
                      className={`overflow-hidden rounded-xl p-2 flex flex-col items-center justify-center border-2 border-dashed ${
                        form.is_bg_removed
                          ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-800 border-teal-400'
                          : 'bg-slate-950 border-slate-700'
                      }`}
                    >
                      <img
                        src={form.image}
                        alt="Preview"
                        className="max-h-48 w-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/1200x500?text=Invalid+Image+URL';
                        }}
                      />
                      <span className="mt-2 text-[10px] text-slate-400 font-bold">
                        {form.is_bg_removed
                          ? '✓ Transparent PNG Ready (Floats over website gradient)'
                          : '✓ Full Edge-to-Edge Poster Banner (Auto Height Adjust)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Target Click Link (Where user goes when clicking poster) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {QUICK_LINKS.map((quickLink) => (
                    <button
                      key={quickLink.value}
                      type="button"
                      onClick={() => setForm({ ...form, primaryHref: quickLink.value })}
                      className={`text-xs py-1.5 px-3 rounded-xl border font-bold text-left transition cursor-pointer ${
                        form.primaryHref === quickLink.value
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {quickLink.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={form.primaryHref}
                  onChange={(e) => setForm({ ...form, primaryHref: e.target.value })}
                  placeholder="e.g. /sell or /store or https://..."
                  className="input text-xs"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900">Show on Live Homepage</span>
                  <p className="text-[10px] text-slate-500">Enable this poster in the hero slider rotation</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-5 w-5 accent-teal-600 rounded cursor-pointer"
                />
              </div>

              {/* Submit / Save */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary rounded-xl px-6 py-2 text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : editingPoster ? 'Update Poster' : 'Add Poster to Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL DEVICE SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-teal-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xl">📐</span>
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-base">
                    Full Poster Sizing Guide for All Devices
                  </h3>
                  <p className="text-[11px] text-slate-500">Exact pixel dimensions & aspect ratios for Canva & Photoshop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Gold Standard */}
              <div className="p-4 rounded-2xl bg-teal-600 text-white shadow-md">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  ⭐ Master Recommended Standard
                </span>
                <h4 className="text-lg font-black mt-1">1920 × 750 Pixels (Aspect 2.5:1)</h4>
                <p className="text-xs text-teal-50 mt-1 leading-relaxed">
                  Design your Canva canvas at <b>1920 × 750 px</b>. This single master size scales smoothly across all Desktops, Laptops, Tablets, and Smartphones without distortion!
                </p>
              </div>

              {/* Device Table Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Device-by-Device Dimensions Breakdown:
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Monitor className="h-4 w-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900 block">Desktop / Large Screens</span>
                        <span className="text-[11px] text-slate-500">1920px+ width screens</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-700 text-sm">1920 × 750 px</span>
                      <span className="text-[10px] text-slate-400 block">Aspect Ratio 2.5:1</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Tablet className="h-4 w-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900 block">Laptops & iPads / Tablets</span>
                        <span className="text-[11px] text-slate-500">768px to 1440px screens</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-700 text-sm">1440 × 600 px</span>
                      <span className="text-[10px] text-slate-400 block">Aspect Ratio 2.4:1</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="h-4 w-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900 block">Mobile Phones</span>
                        <span className="text-[11px] text-slate-500">Android & iPhones (360px - 480px)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-700 text-sm">1080 × 608 px</span>
                      <span className="text-[10px] text-slate-400 block">Aspect Ratio 16:9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canva Pro Tips */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Canva / Photoshop Design Pro-Tips:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800">
                  <li><b>Safe Zone:</b> Keep your main headline text, phone graphics, and discount badges centered in the middle <b>1200 × 550 px</b> zone.</li>
                  <li><b>File Format:</b> Export as <b>JPG</b> (Quality 85%) or <b>PNG</b> for crisp rendering.</li>
                  <li><b>Background Removal:</b> If you upload a product photo, click the <b>✂️ Remove Background</b> button in the upload popup to convert it to a transparent cutout instantly.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="btn-primary rounded-xl px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
