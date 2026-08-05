import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Save, X, Package, Smartphone, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    business_name: profile?.business_name || '',
    avatar_url: profile?.avatar_url || '',
  });

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

  return (
    <div className="container-page py-10">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6 md:p-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-100 text-accent-700 text-2xl font-bold">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">
                  {profile?.full_name || 'Update your profile'}
                </h1>
                <p className="text-ink-500 text-sm capitalize">{profile?.role}</p>
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors"
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
                  <p className="text-ink-900">{profile?.full_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Email</label>
                <p className="text-ink-900">{user.email}</p>
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
                  <p className="text-ink-900">{profile?.phone || 'Not set'}</p>
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
                    <p className="text-ink-900">{profile?.business_name || 'Not set'}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-2">Avatar URL</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="input"
                    placeholder="Enter avatar image URL"
                  />
                ) : (
                  <p className="text-ink-900">{profile?.avatar_url || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-ink-100">
              <div className="flex items-center gap-2 text-ink-500">
                <Shield className="h-4 w-4" />
                <span className="text-sm">
                  Verified: {profile?.is_verified ? 'Yes' : 'No'}
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
