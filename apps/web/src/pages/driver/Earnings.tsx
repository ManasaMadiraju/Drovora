import { useEffect, useState } from 'react';
import { DollarSign, Route, PiggyBank, CheckCircle2, Clock } from 'lucide-react';
import api from '../../lib/api';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import { format } from 'date-fns';

interface Earning { id: string; amount: number; status: string; createdAt: string; pickupRequest: { id: string; pickupAddress: string; packageCount: number; completedAt: string | null; returnLocation: { name: string } }; }

export default function Earnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drivers/me/earnings').then(({ data }) => { setEarnings(data.earnings); setTotalEarned(data.totalEarned); setLoading(false); });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900 tracking-tight mb-6">Earnings</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card grad-emerald text-white border-0 shadow-card">
          <div className="flex items-start justify-between"><div><p className="text-sm text-emerald-100 mb-1">Total Earned</p><p className="text-3xl font-bold">${totalEarned.toFixed(2)}</p></div><PiggyBank size={22} className="text-emerald-100" /></div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between"><div><p className="text-sm text-ink-500 mb-1">Total Trips</p><p className="text-3xl font-bold text-ink-900">{earnings.length}</p></div><Route size={22} className="text-ink-300" /></div>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-ink-900 mb-4">Transaction History</h2>
      {loading ? <SkeletonList count={4} /> : earnings.length === 0 ? (
        <EmptyState icon={DollarSign} title="No earnings yet" description="Complete your first job to start earning." />
      ) : (
        <div className="space-y-3">
          {earnings.map((e) => (
            <div key={e.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">{e.pickupRequest.returnLocation.name}</p>
                <p className="text-xs text-ink-500 mt-0.5 truncate max-w-xs">{e.pickupRequest.pickupAddress}</p>
                <p className="text-xs text-ink-400 mt-1">{e.pickupRequest.completedAt ? format(new Date(e.pickupRequest.completedAt), 'MMM d, yyyy h:mm a') : format(new Date(e.createdAt), 'MMM d, yyyy')} · {e.pickupRequest.packageCount} pkg{e.pickupRequest.packageCount > 1 ? 's' : ''}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-emerald-600">+${e.amount.toFixed(2)}</p>
                <span className={`text-xs flex items-center gap-1 justify-end mt-0.5 font-medium ${e.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {e.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {e.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
