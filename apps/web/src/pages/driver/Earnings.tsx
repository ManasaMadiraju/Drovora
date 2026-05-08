import { useEffect, useState } from 'react';
import api from '../../lib/api';
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card bg-green-50 border-green-100"><p className="text-sm text-green-700 mb-1">Total Earned</p><p className="text-3xl font-bold text-green-800">${totalEarned.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-gray-500 mb-1">Total Trips</p><p className="text-3xl font-bold text-gray-900">{earnings.length}</p></div>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent" /></div>
      ) : earnings.length === 0 ? (
        <div className="card text-center py-16"><div className="text-5xl mb-3">💸</div><p className="text-gray-500">No earnings yet</p></div>
      ) : (
        <div className="space-y-3">
          {earnings.map((e) => (
            <div key={e.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.pickupRequest.returnLocation.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{e.pickupRequest.pickupAddress}</p>
                  <p className="text-xs text-gray-400 mt-1">{e.pickupRequest.completedAt ? format(new Date(e.pickupRequest.completedAt), 'MMM d, yyyy h:mm a') : format(new Date(e.createdAt), 'MMM d, yyyy')} · {e.pickupRequest.packageCount} pkg{e.pickupRequest.packageCount > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right ml-4"><p className="text-base font-bold text-green-600">+${e.amount.toFixed(2)}</p><span className={`text-xs ${e.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{e.status === 'paid' ? '✓ Paid' : 'Pending'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
