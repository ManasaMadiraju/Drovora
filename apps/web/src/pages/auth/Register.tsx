import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    try { await register(form); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-white font-bold text-2xl">D</span></div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Drovora — hassle-free Amazon returns</p>
        </div>
        <div className="card">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-5">
            {(['customer', 'driver'] as const).map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${form.role === r ? 'bg-brand-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                {r === 'customer' ? 'I need pickups' : 'I want to drive'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name</label><input className="input" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" className="input" placeholder="415-555-0100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
