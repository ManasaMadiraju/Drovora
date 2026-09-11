import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Star, Plus } from 'lucide-react';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Pickup { id: string; status: string; pickupAddress: string; packageCount: number; totalAmount: number; paymentStatus: string; createdAt: string; returnLocation: { name: string }; rating: { rating: number } | null; }

const FILTERS = [{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }];

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
      <div className="flex items-center justify-between mb-6"><h1 className="font-display text-2xl font-extrabold text-ink-900 tracking-tight">Pickup History</h1><Link to="/customer/new" className="btn-primary text-sm"><Plus size={15} /> New Pickup</Link></div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`chip ${filter === f.key ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 border-2 border-ink-100 hover:bg-ink-50'}`}>{f.label}</button>
        ))}
      </div>
      {loading ? <SkeletonList count={4} /> : pickups.length === 0 ? (
        <EmptyState icon={Inbox} title="No pickups found" description="Once you schedule a pickup it'll show up here." action={<Link to="/customer/new" className="btn-primary">Schedule your first pickup</Link>} />
      ) : (
        <div className="space-y-3">
          {pickups.map((p) => (
            <Link key={p.id} to={`/customer/track/${p.id}`}>
              <div className="card card-hover flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap"><StatusBadge status={p.status} />{p.rating && <span className="text-xs text-amber-500 flex items-center gap-0.5"><Star size={11} className="fill-amber-400" /> {p.rating.rating}</span>}</div>
                  <p className="text-sm font-medium text-ink-900 truncate">{p.pickupAddress}</p>
                  <p className="text-xs text-ink-500 mt-0.5">→ {p.returnLocation.name}</p>
                  <p className="text-xs text-ink-400 mt-1">{p.packageCount} pkg{p.packageCount > 1 ? 's' : ''} · {formatDistanceToNow(new Date(p.createdAt))} ago</p>
                </div>
                <div className="text-right flex-shrink-0"><p className="text-sm font-bold text-ink-900">${p.totalAmount.toFixed(2)}</p><p className={`text-xs mt-1 font-medium ${p.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{p.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
