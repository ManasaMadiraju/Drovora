import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface Pickup { id: string; status: string; pickupAddress: string; packageCount: number; totalAmount: number; paymentStatus: string; createdAt: string; returnLocation: { name: string }; rating: { rating: number } | null; }

export default function History() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}&limit=50` : '?limit=50';
    api.get(`/pickups${params}`).then(({ data }) => { setPickups(data.pickups); setLoading(false); });
  }, [filter]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Pickup History</h1><Link to="/customer/new" className="btn-primary text-sm">+ New Pickup</Link></div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{f.label}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent" /></div>
      ) : pickups.length === 0 ? (
        <div className="card text-center py-16"><div className="text-5xl mb-3">📭</div><p className="text-gray-500">No pickups found</p><Link to="/customer/new" className="btn-primary mt-4 inline-block">Schedule your first pickup</Link></div>
      ) : (
        <div className="space-y-3">
          {pickups.map((p) => (
            <Link key={p.id} to={`/customer/track/${p.id}`}>
              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5"><StatusBadge status={p.status} />{p.rating && <span className="text-xs text-yellow-500">{'⭐'.repeat(p.rating.rating)}</span>}</div>
                    <p className="text-sm font-medium text-gray-900 truncate">{p.pickupAddress}</p>
                    <p className="text-xs text-gray-500 mt-0.5">→ {p.returnLocation.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{p.packageCount} pkg{p.packageCount > 1 ? 's' : ''} · {formatDistanceToNow(new Date(p.createdAt))} ago</p>
                  </div>
                  <div className="text-right ml-4"><p className="text-sm font-bold text-gray-900">${p.totalAmount.toFixed(2)}</p><p className={`text-xs mt-1 ${p.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{p.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
