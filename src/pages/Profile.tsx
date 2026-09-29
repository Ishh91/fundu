import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Edit2, Save, X, Package, Smartphone, Shield, Camera, Upload, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSetup = searchParams.get('setup') === 'true' || (!loading && user && !profile?.full_name);

  const [isEditing, setIsEditing] = useState(isSetup);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phone || '',
    business_name: profile?.business_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  useEffect(() => {
    if (profile || user) {
      setFormData({
        full_name: profile?.full_name || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || user?.phone || '',
        business_name: profile?.business_name || '',
        avatar_url: profile?.avatar_url || '',
      });
      if (isSetup) {
        setIsEditing(true);
      }
    }
  }, [profile, user, isSetup]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Str = reader.result as string;
      setFormData((prev) => ({ ...prev, avatar_url: base64Str }));
      if (!isEditing) {
        setIsEditing(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    const trimmedName = formData.full_name.trim();
    if (!trimmedName) {
      alert('Please enter your Full Name.');
      return;
    }

    const cleanEmail = formData.email ? formData.email.trim().toLowerCase() : null;
    if (cleanEmail && !cleanEmail.includes('@')) {
      alert('Please enter a valid email address, or leave it blank.');
      return;
    }

    setSaving(true);
    setSaveSuccess(null);

    try {
      const { error } = await db
        .from('profiles')
        .update({
          full_name: trimmedName,
          email: cleanEmail,
          phone: formData.phone || profile?.phone || user?.phone || null,
          business_name: formData.business_name || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
      setSaveSuccess(isSetup ? '🎉 Profile completed successfully! Redirecting...' : '✅ Profile saved successfully!');

      if (isSetup) {
        setTimeout(() => {
          navigate(getDashboardLink());
        }, 1200);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'wholesaler' || profile?.role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (profile?.role === 'admin') return 'Admin Dashboard';
    if (profile?.role === 'wholesaler' || profile?.role === 'vendor') return 'Vendor Dashboard';
    return 'My Dashboard';
  };

  const getDashboardIcon = () => {
    if (profile?.role === 'admin') return Shield;
    if (profile?.role === 'wholesaler' || profile?.role === 'vendor') return Package;
    return Smartphone;
  };

  const DashboardIcon = getDashboardIcon();

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-ink-500 font-semibold">Loading profile...</div>;
  }

  const currentAvatar = formData.avatar_url || profile?.avatar_url;

  return (
    <div className="container-page py-10">
      <div className="max-w-3xl mx-auto">
        {/* Onboarding Welcome Banner for First-Time OTP Signups */}
        {isSetup && (
          <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white shadow-lg animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              </div>
              <div className="flex-1">
                <h2 className="font-display font-black text-xl text-white">
                  Welcome to Fundu! 🎉
                </h2>
                <p className="text-sm text-purple-100 mt-1 leading-relaxed">
                  Your mobile number <strong>+91 {formData.phone || profile?.phone || user?.phone}</strong> is verified. Complete your profile below by adding your <strong>Name</strong>, <strong>Email</strong>, and <strong>Profile Picture</strong> to finish account setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-sm">{saveSuccess}</span>
          </div>
        )}

        <div className="card p-6 md:p-10 shadow-sm border border-ink-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-ink-100">
            <div className="flex items-center gap-5">
              {/* Profile Avatar with Camera Trigger Overlay */}
              <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-ink-100 border-2 border-brand-500 overflow-hidden grid place-items-center text-brand-700 text-3xl font-extrabold shadow-md transition-transform group-hover:scale-105">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : formData.full_name || profile?.full_name ? (
                    (formData.full_name || profile?.full_name || 'U').charAt(0).toUpperCase()
                  ) : (
                    <User className="h-10 w-10 text-ink-400" />
                  )}
                </div>
                {/* Camera Overlay Badge */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6" />
                  <span className="text-[10px] font-bold mt-1">Upload</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-900">
                  {profile?.full_name || formData.full_name || 'Update Your Profile'}
                </h1>
                <p className="text-ink-500 text-sm font-semibold capitalize mt-0.5">{profile?.role || 'Customer'}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Photo
                </button>
              </div>
            </div>

            {!isSetup && (
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setFormData({
                      full_name: profile?.full_name || '',
                      email: profile?.email || user?.email || '',
                      phone: profile?.phone || user?.phone || '',
                      business_name: profile?.business_name || '',
                      avatar_url: profile?.avatar_url || '',
                    });
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors self-start sm:self-center font-bold text-xs"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-ink-800 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input font-medium"
                    placeholder="e.g. Rahul Sharma"
                  />
                ) : (
                  <p className="text-ink-900 font-semibold">{profile?.full_name || 'Not set'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-ink-800 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input font-medium"
                    placeholder="e.g. rahul@example.com (optional)"
                  />
                ) : (
                  <p className="text-ink-900 font-semibold">{profile?.email || user?.email || 'Not set'}</p>
                )}
              </div>

              {/* Phone (Verified via OTP) */}
              <div>
                <label className="block text-sm font-bold text-ink-800 mb-2">Mobile Number (Verified)</label>
                <div className="flex items-center gap-2">
                  <p className="text-ink-900 font-bold bg-ink-50 border border-ink-200 px-3.5 py-2.5 rounded-xl text-sm flex-1">
                    +91 {formData.phone || profile?.phone || user?.phone || 'Not set'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-2 rounded-xl font-bold border border-emerald-200 shrink-0">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>

              {(profile?.role === 'wholesaler' || profile?.role === 'vendor' || isEditing) && (
                <div>
                  <label className="block text-sm font-bold text-ink-800 mb-2">Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="input"
                      placeholder="e.g. Sharma Mobile Care"
                    />
                  ) : (
                    <p className="text-ink-900 font-semibold">{profile?.business_name || 'Not set'}</p>
                  )}
                </div>
              )}

              {/* Profile Picture / Avatar URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-ink-800 mb-2">Profile Picture / Avatar</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        className="input flex-1 text-xs"
                        placeholder="Paste image URL or click photo above to upload"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline text-xs flex items-center gap-1.5 px-3 py-2 shrink-0 font-bold"
                      >
                        <Camera className="h-4 w-4 text-brand-600" /> Browse Image
                      </button>
                      {formData.avatar_url && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar_url: '' })}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold shrink-0 border border-red-200"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-400">Click the camera icon on the avatar above to select a picture from your device or paste a URL.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
                        Photo Added
                      </span>
                    ) : (
                      <p className="text-ink-500 text-sm">No profile picture uploaded</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-ink-100 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                >
                  {saving ? (
                    <>Saving Profile...</>
                  ) : isSetup ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Profile & Continue <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(getDashboardLink())}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors font-bold text-xs"
          >
            <DashboardIcon className="h-4 w-4 text-brand-600" />
            Go to {getDashboardLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
