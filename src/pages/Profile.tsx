import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Save, X, Package, Smartphone, Shield, Camera, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    business_name: profile?.business_name || '',
    avatar_url: profile?.avatar_url || '',
  });

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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await db
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          business_name: formData.business_name || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'wholesaler') return '/wholesaler';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (profile?.role === 'admin') return 'Admin Dashboard';
    if (profile?.role === 'wholesaler') return 'Wholesaler Dashboard';
    return 'My Dashboard';
  };

  const getDashboardIcon = () => {
    if (profile?.role === 'admin') return Shield;
    if (profile?.role === 'wholesaler') return Package;
    return Smartphone;
  };

  const DashboardIcon = getDashboardIcon();

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-ink-500">Loading...</div>;
  }

  const currentAvatar = formData.avatar_url || profile?.avatar_url;

  return (
    <div className="container-page py-10">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-ink-100">
            <div className="flex items-center gap-5">
              {/* Profile Avatar with Camera Trigger Overlay */}
              <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-teal-50 border-2 border-[#00a896] overflow-hidden grid place-items-center text-teal-700 text-3xl font-extrabold shadow-md transition-transform group-hover:scale-105">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : profile?.full_name ? (
                    profile.full_name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-10 w-10 text-teal-600" />
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
                  {profile?.full_name || 'Update your profile'}
                </h1>
                <p className="text-ink-500 text-sm font-semibold capitalize mt-0.5">{profile?.role || 'Customer'}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#00a896] hover:underline"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Photo
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    business_name: profile?.business_name || '',
                    avatar_url: profile?.avatar_url || '',
                  });
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors self-start sm:self-center"
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-ink-900 font-medium">{profile?.full_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Email</label>
                <p className="text-ink-900 font-medium">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-ink-900 font-medium">{profile?.phone || 'Not set'}</p>
                )}
              </div>

              {(profile?.role === 'wholesaler' || isEditing) && (
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="input"
                      placeholder="Enter your business name (for wholesalers)"
                    />
                  ) : (
                    <p className="text-ink-900 font-medium">{profile?.business_name || 'Not set'}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-2">Profile Picture / Avatar</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        className="input flex-1"
                        placeholder="Paste image URL or click photo above to upload"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline text-xs flex items-center gap-1.5 px-3 py-2 shrink-0"
                      >
                        <Camera className="h-4 w-4" /> Browse
                      </button>
                      {formData.avatar_url && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar_url: '' })}
                          className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-400">You can upload a photo directly or paste a web image link.</p>
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

            <div className="flex items-center gap-4 pt-4 border-t border-ink-100">
              <div className="flex items-center gap-2 text-ink-500">
                <Shield className="h-4 w-4 text-[#00a896]" />
                <span className="text-sm">
                  Verified Account: {profile?.is_verified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(getDashboardLink())}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <DashboardIcon className="h-4 w-4" />
            {getDashboardLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}
