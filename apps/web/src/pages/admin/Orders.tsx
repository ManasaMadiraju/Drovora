import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonList } from '../../components/Skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Order { id: string; status: string; pickupAddress: string; packageCount: number; totalAmount: number; paymentStatus: string; createdAt: string; customer: { name: string; email: string; phone: string }; driver: { name: string; phone: string } | null; returnLocation: { name: string }; }

const FILTERS = [{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'accepted', label: 'Accepted' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 20;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (filter) params.set('status', filter);
    api.get(`/admin/pickups?${params}`).then(({ data }) => { setOrders(data.pickups); setTotal(data.total); setLoading(false); });
  }, [filter, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6"><h1 className="font-display text-2xl font-extrabold text-ink-900 tracking-tight">Orders</h1><span className="text-sm text-ink-500">{total} total</span></div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }} className={`chip ${filter === f.key ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 border-2 border-ink-100 hover:bg-ink-50'}`}>{f.label}</button>
        ))}
      </div>
      {loading ? <SkeletonList count={5} /> : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-ink-100 shadow-soft">
            <table className="w-full bg-white">
              <thead><tr className="border-b border-ink-100 bg-ink-50/60">{['ID', 'Status', 'Customer', 'Driver', 'Drop-off', 'Pkgs', 'Total', 'Created'].map((h) => (<th key={h} className="text-left text-xs font-semibold text-ink-500 px-4 py-3">{h}</th>))}</tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs text-ink-400">#{o.id.slice(-8).toUpperCase()}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3"><p className="text-sm font-medium text-ink-900">{o.customer.name}</p><p className="text-xs text-ink-400">{o.customer.phone}</p></td>
                    <td className="px-4 py-3">{o.driver ? <p className="text-sm text-ink-700">{o.driver.name}</p> : <span className="text-xs text-ink-400 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3 text-sm text-ink-600 max-w-xs truncate">{o.returnLocation.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-ink-700">{o.packageCount}</td>
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-ink-900">${o.totalAmount.toFixed(2)}</p><p className={`text-xs font-medium ${o.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{o.paymentStatus}</p></td>
                    <td className="px-4 py-3 text-xs text-ink-400 whitespace-nowrap">{formatDistanceToNow(new Date(o.createdAt))} ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > LIMIT && (
            <div className="flex items-center justify-between mt-4"><p className="text-sm text-ink-500">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p><div className="flex gap-2"><button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40"><ChevronLeft size={14} /> Prev</button><button onClick={() => setPage((p) => p + 1)} disabled={page * LIMIT >= total} className="btn-secondary text-sm disabled:opacity-40">Next <ChevronRight size={14} /></button></div></div>
          )}
        </>
      )}
    </div>
  );
}
