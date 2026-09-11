import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, ArrowRight, Package, Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' as 'customer' | 'driver' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await register(form); toast.success('Account created — welcome to Drovora!'); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center grad-register-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Logo size="lg" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900 tracking-tight">Create your account</h1>
          <p className="text-ink-500 text-sm mt-1.5">Join Drovora — hassle-free Amazon returns</p>
        </div>

        <div className="card">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {([{ r: 'customer', icon: Package, label: 'I need pickups' }, { r: 'driver', icon: Car, label: 'I want to drive' }] as const).map(({ r, icon: Icon, label }) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 transition-all ${form.role === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-100 text-ink-500 hover:border-ink-200'}`}>
                <Icon size={18} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Full name</label>
              <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input className="input pl-10" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
              <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Phone</label>
              <div className="relative"><Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type="tel" className="input pl-10" placeholder="415-555-0100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type="password" className="input pl-10" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Creating account...' : <>Create account <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-ink-600 mt-5">Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
