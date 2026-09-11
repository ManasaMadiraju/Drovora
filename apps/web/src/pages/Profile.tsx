import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../lib/api';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/profile', form);
      await refreshUser();
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (await confirm({ title: 'Sign out?', description: "You'll need to sign back in to access your account.", confirmLabel: 'Sign out' })) {
      logout(); navigate('/login');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-ink-500 hover:text-ink-700 mb-6 flex items-center gap-1.5"><ArrowLeft size={15} /> Back</button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl grad-logo flex items-center justify-center text-white text-2xl font-bold shadow-card">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{user?.name}</h1>
          <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-200 capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wide">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wide">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9 bg-ink-50 text-ink-500" value={user?.email} disabled />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wide">Phone</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="415-555-0100" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wide">Address</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, San Francisco, CA" />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
      </form>

      <button onClick={handleLogout} className="btn-secondary w-full mt-4 text-red-600 border-red-200 hover:bg-red-50">
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}
