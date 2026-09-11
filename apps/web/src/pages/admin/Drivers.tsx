import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useConfirm } from '../../components/ConfirmDialog';
import { SkeletonList } from '../../components/Skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Driver { id: string; name: string; email: string; phone: string; isActive: boolean; createdAt: string; }

export default function Drivers() {
  const confirm = useConfirm();
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
    if (driver.isActive) {
      const ok = await confirm({ title: `Suspend ${driver.name}?`, description: 'They will be unable to accept or continue jobs while suspended.', confirmLabel: 'Suspend', danger: true });
      if (!ok) return;
    }
    await api.patch(`/admin/users/${driver.id}`, { isActive: !driver.isActive });
    setDrivers((prev) => prev.map((d) => d.id === driver.id ? { ...d, isActive: !d.isActive } : d));
    toast.success(driver.isActive ? 'Driver suspended' : 'Driver reactivated');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-ink-900">Drivers</h1><span className="text-sm text-ink-500">{total} total</span></div>
      <div className="flex gap-3 mb-6">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(search)} />
        </div>
        <button onClick={() => load(search)} className="btn-primary">Search</button>
        {search && <button onClick={() => { setSearch(''); load(''); }} className="btn-secondary"><X size={14} /></button>}
      </div>
      {loading ? <SkeletonList count={4} /> : drivers.length === 0 ? <div className="card text-center py-16 text-ink-400">No drivers found</div> : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 shadow-soft">
          <table className="w-full bg-white">
            <thead><tr className="border-b border-ink-100 bg-ink-50/60">{['Driver', 'Email', 'Phone', 'Joined', 'Status', 'Actions'].map((h) => (<th key={h} className="text-left text-xs font-semibold text-ink-500 px-4 py-3">{h}</th>))}</tr></thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 grad-avatar rounded-full flex items-center justify-center text-sm font-semibold text-white">{d.name.charAt(0).toUpperCase()}</div><span className="text-sm font-medium text-ink-900">{d.name}</span></div></td>
                  <td className="px-4 py-3 text-sm text-ink-600">{d.email}</td>
                  <td className="px-4 py-3 text-sm text-ink-600">{d.phone || '—'}</td>
                  <td className="px-4 py-3 text-xs text-ink-400 whitespace-nowrap">{formatDistanceToNow(new Date(d.createdAt))} ago</td>
                  <td className="px-4 py-3"><span className={`badge ${d.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>{d.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => toggleActive(d)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${d.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>{d.isActive ? 'Suspend' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
