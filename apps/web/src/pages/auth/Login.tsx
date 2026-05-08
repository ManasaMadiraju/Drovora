import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  const demoLogin = async (role: 'customer' | 'driver' | 'admin') => {
    const creds = { customer: { email: 'customer@drovora.com', password: 'password123' }, driver: { email: 'driver@drovora.com', password: 'password123' }, admin: { email: 'admin@drovora.com', password: 'password123' } };
    setLoading(true);
    try { await login(creds[role].email, creds[role].password); navigate('/'); }
    catch { setError('Demo login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-white font-bold text-2xl">D</span></div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your Drovora account</p>
        </div>
        <div className="card">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-3">— Quick demo access —</p>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'driver', 'admin'] as const).map((role) => (
                <button key={role} onClick={() => demoLogin(role)} disabled={loading} className="text-xs border border-gray-200 rounded-lg py-2 px-3 hover:bg-brand-50 hover:border-brand-300 transition-colors capitalize font-medium text-gray-600">{role}</button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">Don't have an account? <Link to="/register" className="text-brand-600 font-medium hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
