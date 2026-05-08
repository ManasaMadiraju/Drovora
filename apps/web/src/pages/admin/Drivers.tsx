import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Driver { id: string; name: string; email: string; phone: string; isActive: boolean; createdAt: string; }

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (q = '') => {
    setLoading(true);
    const params = new URLSearchParams({ role: 'driver', limit: '50' });
    if (q) params.set('search', q);
    api.get(`/admin/users?${params}`).then(({ data }) => { setDrivers(data.users); setTotal(data.total); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (driver: Driver) => {
    await api.patch(`/admin/users/${driver.id}`, { isActive: !driver.isActive });
    setDrivers((prev) => prev.map((d) => d.id === driver.id ? { ...d, isActive: !d.isActive } : d));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Drivers</h1><span className="text-sm text-gray-500">{total} total</span></div>
      <div className="flex gap-3 mb-6">
        <input className="input max-w-sm" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(search)} />
        <button onClick={() => load(search)} className="btn-primary">Search</button>
        {search && <button onClick={() => { setSearch(''); load(''); }} className="btn-secondary">Clear</button>}
      </div>
      {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent" /></div> : drivers.length === 0 ? <div className="card text-center py-16 text-gray-400">No drivers found</div> : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border border-gray-100 shadow-sm">
            <thead><tr className="border-b border-gray-100">{['Driver', 'Email', 'Phone', 'Joined', 'Status', 'Actions'].map((h) => (<th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>))}</tr></thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-sm font-semibold text-brand-700">{d.name.charAt(0).toUpperCase()}</div><span className="text-sm font-medium text-gray-900">{d.name}</span></div></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.phone || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDistanceToNow(new Date(d.createdAt))} ago</td>
                  <td className="px-4 py-3"><span className={`badge ${d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{d.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => toggleActive(d)} className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${d.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>{d.isActive ? 'Suspend' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
