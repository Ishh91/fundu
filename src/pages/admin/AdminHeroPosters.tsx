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
  Check,
  ExternalLink,
  Upload,
  Layers,
  Palette,
  Link as LinkIcon,
  Tag,
} from 'lucide-react';
import type { HeroPoster } from './adminTypes';
import { useHeroPosters } from '../../lib/heroBanners';

const GRADIENT_PRESETS = [
  { label: 'Teal Brand (Default)', value: 'from-[#4cd2c4] to-[#18bdb0]', preview: 'bg-gradient-to-r from-[#4cd2c4] to-[#18bdb0]' },
  { label: 'Fresh Mint', value: 'from-[#58dbcf] to-[#1db8aa]', preview: 'bg-gradient-to-r from-[#58dbcf] to-[#1db8aa]' },
  { label: 'Deep Emerald', value: 'from-[#10b981] to-[#047857]', preview: 'bg-gradient-to-r from-[#10b981] to-[#047857]' },
  { label: 'Ocean Blue', value: 'from-[#0ea5e9] to-[#2563eb]', preview: 'bg-gradient-to-r from-[#0ea5e9] to-[#2563eb]' },
  { label: 'Royal Violet', value: 'from-[#8b5cf6] to-[#6366f1]', preview: 'bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]' },
  { label: 'Sunset Amber', value: 'from-[#f59e0b] to-[#ea580c]', preview: 'bg-gradient-to-r from-[#f59e0b] to-[#ea580c]' },
  { label: 'Midnight Dark', value: 'from-[#0f172a] to-[#1e293b]', preview: 'bg-gradient-to-r from-[#0f172a] to-[#1e293b]' },
];

const PRESET_POSTER_IMAGES = [
  {
    label: 'Sell Phone Ad (Man with Cash & Phone)',
    url: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent('photorealistic Indian man holding smartphone and cash wallet, premium teal ecommerce banner, realistic advertising, clean studio lighting, full body, modern Indian tech ad') +
      '&image_size=portrait_4_3',
  },
  {
    label: 'Refurbished Phones (Smartphones Showcase)',
    url: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent('photorealistic premium smartphones arranged for ecommerce banner, teal gradient backdrop, glossy lighting, realistic ad photography, clean modern composition') +
      '&image_size=portrait_4_3',
  },
  {
    label: 'Repair Technician (Mobile Repair Ad)',
    url: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent('photorealistic mobile repair technician with smartphone, premium teal service banner, realistic Indian ecommerce ad, clean lighting and sharp modern composition') +
      '&image_size=portrait_4_3',
  },
  {
    label: 'iPhone Festive Deal',
    url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tech Lifestyle (Modern Gadgets)',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  },
];

export default function AdminHeroPosters() {
  const { posters, savePosters, resetPosters, loading } = useHeroPosters();

  const [selectedPosterId, setSelectedPosterId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<HeroPoster | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [form, setForm] = useState({
    eyebrow: '',
    title: '',
    description: '',
    primaryLabel: 'Check Value',
    primaryHref: '/sell',
    secondaryLabel: 'How it Works',
    secondaryHref: '#sell-flow',
    accent: 'from-[#4cd2c4] to-[#18bdb0]',
    image: '',
    bulletInput: '',
    bullets: ['Doorstep pickup', 'Fast payment'] as string[],
    is_active: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  const activePosterList = posters;
  const currentPreviewPoster = posters.find((p) => p.id === selectedPosterId) || posters[0] || null;

  const handleOpenAdd = () => {
    setEditingPoster(null);
    setForm({
      eyebrow: 'New Offer',
      title: 'Get the best deal for your smartphone in Lucknow',
      description: 'Instant cash payment and doorstep service with 100% data safety guaranteed.',
      primaryLabel: 'Sell Now',
      primaryHref: '/sell',
      secondaryLabel: 'Explore Store',
      secondaryHref: '/buy',
      accent: 'from-[#4cd2c4] to-[#18bdb0]',
      image: PRESET_POSTER_IMAGES[0].url,
      bulletInput: '',
      bullets: ['Doorstep pickup', 'Best price in Lucknow', 'Instant UPI/Cash'],
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (poster: HeroPoster) => {
    setEditingPoster(poster);
    setForm({
      eyebrow: poster.eyebrow,
      title: poster.title,
      description: poster.description,
      primaryLabel: poster.primaryLabel,
      primaryHref: poster.primaryHref,
      secondaryLabel: poster.secondaryLabel || '',
      secondaryHref: poster.secondaryHref || '',
      accent: poster.accent || 'from-[#4cd2c4] to-[#18bdb0]',
      image: poster.image,
      bulletInput: '',
      bullets: poster.bullets || [],
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
    showToast('Poster reordered');
  };

  const handleAddBullet = () => {
    if (!form.bulletInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      bullets: [...prev.bullets, prev.bulletInput.trim()],
      bulletInput: '',
    }));
  };

  const handleRemoveBullet = (index: number) => {
    setForm((prev) => ({
      ...prev,
      bullets: prev.bullets.filter((_, i) => i !== index),
    }));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB. Please choose a smaller file or paste a web URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setForm((prev) => ({ ...prev, image: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a poster title.');
      return;
    }
    if (!form.image.trim()) {
      alert('Please provide a poster image URL or upload an image.');
      return;
    }

    setSaving(true);
    try {
      const posterData: HeroPoster = {
        id: editingPoster?.id || `poster-${Date.now()}`,
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        primaryLabel: form.primaryLabel.trim(),
        primaryHref: form.primaryHref.trim() || '/',
        secondaryLabel: form.secondaryLabel.trim(),
        secondaryHref: form.secondaryHref.trim() || '#',
        accent: form.accent,
        image: form.image.trim(),
        bullets: form.bullets,
        is_active: form.is_active,
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
      showToast(editingPoster ? 'Poster updated successfully!' : 'New poster added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save poster.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all hero posters back to default factory banners? Any custom changes will be overwritten.')) return;
    await resetPosters();
    setSelectedPosterId(null);
    showToast('Hero posters reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in border border-ink-700">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card p-6 rounded-[28px] bg-gradient-to-r from-brand-600/15 via-teal-500/10 to-emerald-500/15 border border-brand-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-800">
            <ImageIcon className="h-3.5 w-3.5" /> Homepage Hero Management
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink-900">Hero Section Posters & Banners</h2>
          <p className="mt-1 text-xs text-ink-600">
            Update slide images, promotional titles, CTA buttons, background gradients, and perks shown on the main homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="btn rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50 shadow-xs flex items-center gap-1.5"
            title="Reset to initial default posters"
          >
            <RotateCcw className="h-3.5 w-3.5 text-ink-500" /> Reset Defaults
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 font-bold shadow-sm shadow-brand-500/30"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Poster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Posters */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink-500">
              Active Slides ({posters.filter((p) => p.is_active !== false).length} / {posters.length})
            </h3>
            <span className="text-[11px] font-semibold text-ink-400">Drag/order or toggle</span>
          </div>

          <div className="space-y-2.5">
            {posters.map((poster, index) => {
              const isSelected = (selectedPosterId || posters[0]?.id) === poster.id;
              return (
                <div
                  key={poster.id}
                  onClick={() => setSelectedPosterId(poster.id)}
                  className={`card p-4 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 shadow-md ring-2 ring-brand-500/20'
                      : 'bg-white hover:border-brand-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="h-14 w-14 rounded-xl bg-ink-100 overflow-hidden shrink-0 border border-ink-200/60 relative group">
                      <img
                        src={poster.image}
                        alt=""
                        className="h-full w-full object-contain bg-white p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/100x100?text=No+Image';
                        }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink-100 text-ink-700">
                          {poster.eyebrow || `Slide #${index + 1}`}
                        </span>
                        {poster.is_active === false ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <EyeOff className="h-2.5 w-2.5" /> Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Eye className="h-2.5 w-2.5" /> Live
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-ink-900 truncate mt-1">{poster.title}</h4>
                      <p className="text-[11px] text-ink-500 truncate mt-0.5">
                        CTA: <span className="font-semibold text-ink-700">{poster.primaryLabel}</span> ({poster.primaryHref})
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleMove(index, 'up', e)}
                        disabled={index === 0}
                        className="p-1 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-100 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleMove(index, 'down', e)}
                        disabled={index === posters.length - 1}
                        className="p-1 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-100 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleToggleActive(poster.id, e)}
                        className={`p-1.5 rounded-lg transition ${
                          poster.is_active !== false
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-ink-400 hover:bg-ink-100'
                        }`}
                        title={poster.is_active !== false ? 'Hide from homepage' : 'Show on homepage'}
                      >
                        {poster.is_active !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(poster);
                        }}
                        className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50"
                        title="Edit poster"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(poster.id, e)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        title="Delete poster"
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

        {/* Right Column: Live Interactive Preview */}
        <div className="lg:col-span-7 space-y-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Live Homepage Hero Preview
            </h3>
            {currentPreviewPoster && (
              <button
                onClick={() => handleOpenEdit(currentPreviewPoster)}
                className="btn text-xs px-3 py-1.5 rounded-xl border border-brand-300 bg-brand-50 text-brand-700 font-bold hover:bg-brand-100 flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" /> Edit This Poster
              </button>
            )}
          </div>

          {currentPreviewPoster ? (
            <div className="card overflow-hidden rounded-[28px] border border-[#dce5e8] bg-white shadow-soft">
              {/* The Hero Banner Preview */}
              <div
                className={`grid min-h-[300px] gap-6 bg-gradient-to-r ${currentPreviewPoster.accent || 'from-[#4cd2c4] to-[#18bdb0]'} px-6 py-8 text-white md:grid-cols-[1.1fr_0.9fr]`}
              >
                <div className="flex flex-col justify-center">
                  {currentPreviewPoster.eyebrow && (
                    <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
                      {currentPreviewPoster.eyebrow}
                    </span>
                  )}
                  <h1 className="mt-4 font-display text-2xl md:text-3xl font-extrabold leading-tight">
                    {currentPreviewPoster.title}
                  </h1>
                  {currentPreviewPoster.description && (
                    <p className="mt-3 text-xs leading-6 text-white/90 md:text-sm">
                      {currentPreviewPoster.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <span className="inline-block rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-ink-900 shadow-md">
                      {currentPreviewPoster.primaryLabel || 'Primary Button'}
                    </span>
                    {currentPreviewPoster.secondaryLabel && (
                      <span className="inline-block rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white">
                        {currentPreviewPoster.secondaryLabel}
                      </span>
                    )}
                  </div>

                  {currentPreviewPoster.bullets && currentPreviewPoster.bullets.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {currentPreviewPoster.bullets.map((b, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex items-end justify-center">
                  <img
                    src={currentPreviewPoster.image}
                    alt={currentPreviewPoster.title}
                    className="h-[200px] w-auto max-w-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.25)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/400x300?text=Poster+Preview+Image';
                    }}
                  />
                </div>
              </div>

              {/* Banner Details & Meta Card */}
              <div className="p-5 bg-[#fafcfc] border-t border-ink-100 flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-ink-100">
                    <span className="text-[10px] text-ink-400 font-bold uppercase">Target Link</span>
                    <p className="font-semibold text-ink-800 truncate mt-0.5">{currentPreviewPoster.primaryHref}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-ink-100">
                    <span className="text-[10px] text-ink-400 font-bold uppercase">Secondary Link</span>
                    <p className="font-semibold text-ink-800 truncate mt-0.5">{currentPreviewPoster.secondaryHref || 'None'}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-ink-100">
                    <span className="text-[10px] text-ink-400 font-bold uppercase">Visibility</span>
                    <p className="font-semibold text-ink-800 mt-0.5">
                      {currentPreviewPoster.is_active !== false ? '🟢 Active' : '⚪ Inactive'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-ink-100">
                    <span className="text-[10px] text-ink-400 font-bold uppercase">Perks Count</span>
                    <p className="font-semibold text-ink-800 mt-0.5">{currentPreviewPoster.bullets?.length || 0} badges</p>
                  </div>
                </div>

                <div className="text-[11px] text-ink-500 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-brand-600" />
                  <span>
                    Any changes saved here immediately update the live homepage carousel.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-white rounded-3xl">
              <ImageIcon className="h-10 w-10 text-ink-300 mx-auto" />
              <p className="font-bold text-sm text-ink-700 mt-3">No poster selected</p>
              <button onClick={handleOpenAdd} className="btn-primary text-xs px-4 py-2 mt-4 inline-flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add your first poster
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Poster Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ink-100 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-ink-50/50">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-ink-900 text-base">
                    {editingPoster ? 'Edit Hero Poster' : 'Create New Hero Poster'}
                  </h3>
                  <p className="text-[11px] text-ink-500">Configure visual asset, copy, CTA buttons, and styling</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Poster Image Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink-800">
                  Poster Image (URL or Upload) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://... image url or paste link"
                    className="input text-xs flex-1"
                  />
                  <label className="btn text-xs px-3 py-2 rounded-xl border border-ink-200 bg-white font-semibold text-ink-700 hover:bg-ink-50 cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="h-3.5 w-3.5 text-ink-500" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Preset Quick Images */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-ink-400 uppercase">Or select from curated ad presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_POSTER_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, image: preset.url })}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                          form.image === preset.url
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                            : 'bg-white border-ink-200 text-ink-600 hover:border-brand-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Image Preview in form */}
                {form.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-ink-50 rounded-xl border border-ink-100">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-14 w-20 object-contain rounded-lg bg-white p-1 border border-ink-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/100x100?text=Invalid+Image';
                      }}
                    />
                    <div className="text-[11px] text-ink-600">
                      <span className="font-bold text-ink-800">Poster Image Selected</span>
                      <p className="text-[10px] text-ink-400 truncate max-w-sm">{form.image}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-ink-800 mb-1">Badge / Eyebrow</label>
                  <input
                    type="text"
                    value={form.eyebrow}
                    onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                    placeholder="e.g. Sell old phone"
                    className="input text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-ink-800 mb-1">
                    Headline Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Best place to sell your old phone"
                    className="input text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-ink-800 mb-1">Description / Subtext</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Get instant resale value, free doorstep pickup, and quick payment..."
                  className="input text-xs"
                />
              </div>

              {/* Primary & Secondary CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-ink-50/60 rounded-2xl border border-ink-100">
                <div>
                  <label className="block text-xs font-bold text-ink-800 mb-1">Primary Button Label</label>
                  <input
                    type="text"
                    value={form.primaryLabel}
                    onChange={(e) => setForm({ ...form, primaryLabel: e.target.value })}
                    placeholder="e.g. Sell Now"
                    className="input text-xs"
                  />
                  <input
                    type="text"
                    value={form.primaryHref}
                    onChange={(e) => setForm({ ...form, primaryHref: e.target.value })}
                    placeholder="e.g. /sell"
                    className="input text-xs mt-1.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-800 mb-1">Secondary Button Label</label>
                  <input
                    type="text"
                    value={form.secondaryLabel}
                    onChange={(e) => setForm({ ...form, secondaryLabel: e.target.value })}
                    placeholder="e.g. How it Works"
                    className="input text-xs"
                  />
                  <input
                    type="text"
                    value={form.secondaryHref}
                    onChange={(e) => setForm({ ...form, secondaryHref: e.target.value })}
                    placeholder="e.g. #sell-flow"
                    className="input text-xs mt-1.5"
                  />
                </div>
              </div>

              {/* Accent Gradient Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink-800">
                  Background Theme / Gradient
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setForm({ ...form, accent: preset.value })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                        form.accent === preset.value
                          ? 'border-brand-600 ring-2 ring-brand-500/20 bg-brand-50/50'
                          : 'border-ink-200 hover:border-brand-300 bg-white'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full ${preset.preview} shrink-0`} />
                      <span className="text-[10px] font-bold text-ink-800 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.accent}
                  onChange={(e) => setForm({ ...form, accent: e.target.value })}
                  placeholder="Custom gradient classes, e.g. from-[#4cd2c4] to-[#18bdb0]"
                  className="input text-xs mt-1"
                />
              </div>

              {/* Bullets / Highlights */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink-800">
                  Perks / Tag Badges (e.g. Doorstep pickup, Warranty-backed)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.bulletInput}
                    onChange={(e) => setForm({ ...form, bulletInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBullet();
                      }
                    }}
                    placeholder="Add a badge item and click Add..."
                    className="input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="btn text-xs px-3 py-2 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-800 font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.bullets.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 text-[11px] font-bold border border-brand-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="text-brand-500 hover:text-brand-900 ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div>
                  <span className="text-xs font-bold text-ink-900">Show on Live Homepage</span>
                  <p className="text-[10px] text-ink-500">If enabled, this slide will rotate in the hero carousel</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-5 w-5 accent-brand-600 rounded cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn rounded-xl px-4 py-2 text-xs font-bold text-ink-600 hover:bg-ink-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-5 py-2 font-bold bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/30 flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : editingPoster ? 'Update Poster' : 'Add Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
