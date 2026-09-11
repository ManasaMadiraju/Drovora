import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Package, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  const demoLogin = async (role: 'customer' | 'driver' | 'admin') => {
    const creds = { customer: { email: 'customer@drovora.com', password: 'password123' }, driver: { email: 'driver@drovora.com', password: 'password123' }, admin: { email: 'admin@drovora.com', password: 'password123' } };
    setLoading(true); setError('');
    try { await login(creds[role].email, creds[role].password); navigate('/'); }
    catch { setError('Demo login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between grad-login-hero text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="mb-16">
            <Logo variant="light" size="md" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Returns,<br />picked up.</h1>
          <p className="text-brand-100 text-lg max-w-sm leading-relaxed">Skip the trip. We pick up your Amazon returns and drop them off wherever they need to go.</p>
        </div>
        <div className="relative space-y-4">
          {[
            { icon: Package, text: 'Schedule a pickup in under a minute' },
            { icon: Truck, text: 'A driver picks up straight from your door' },
            { icon: MapPin, text: 'Dropped off at Whole Foods, UPS & more' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <item.icon size={18} className="text-white/90 flex-shrink-0" />
              <span className="text-sm text-white/90">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
            <p className="text-ink-500 text-sm mt-1">Sign in to your Drovora account</p>
          </div>

          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-slide-up">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="password" className="input pl-10" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in...' : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px bg-ink-200 flex-1" />
              <span className="text-xs text-ink-400 font-medium">Quick demo access</span>
              <div className="h-px bg-ink-200 flex-1" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'driver', 'admin'] as const).map((role) => (
                <button key={role} onClick={() => demoLogin(role)} disabled={loading} className="text-xs border border-ink-200 rounded-xl py-2.5 px-2 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors capitalize font-medium text-ink-600">{role}</button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-ink-600 mt-7">Don't have an account? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
