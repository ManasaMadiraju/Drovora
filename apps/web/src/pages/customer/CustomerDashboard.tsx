import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface Pickup { id: string; status: string; pickupAddress: string; packageCount: number; totalAmount: number; createdAt: string; returnLocation: { name: string }; driver: { name: string; phone: string } | null; }

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/pickups?limit=10').then(({ data }) => { setPickups(data.pickups); setLoading(false); }); }, []);

  const active = pickups.filter((p) => !['completed', 'cancelled'].includes(p.status));
  const recent = pickups.filter((p) => ['completed', 'cancelled'].includes(p.status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hey, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Ready to drop off your Amazon returns? We'll handle it.</p>
      </div>

      <Link to="/customer/new" className="block bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-6 mb-8 transition-colors group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-100 text-sm font-medium mb-1">Get started</p>
            <h2 className="text-xl font-bold">Schedule a pickup</h2>
            <p className="text-brand-200 text-sm mt-1">We'll pick up your packages and drop them off</p>
          </div>
          <div className="text-4xl group-hover:scale-110 transition-transform">📦</div>
        </div>
      </Link>

      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Pickups</h2>
          <div className="space-y-3">
            {active.map((p) => (
              <Link key={p.id} to={`/customer/track/${p.id}`}>
                <div className="card hover:shadow-md transition-shadow border-l-4 border-l-brand-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><StatusBadge status={p.status} /><span className="text-xs text-gray-500">{formatDistanceToNow(new Date(p.createdAt))} ago</span></div>
                      <p className="text-sm font-medium text-gray-900">{p.pickupAddress}</p>
                      <p className="text-xs text-gray-500 mt-0.5">→ {p.returnLocation.name} · {p.packageCount} pkg{p.packageCount > 1 ? 's' : ''}</p>
                      {p.driver && <p className="text-xs text-brand-600 mt-1 font-medium">Driver: {p.driver.name}</p>}
                    </div>
                    <div className="text-right"><p className="text-sm font-semibold">${p.totalAmount.toFixed(2)}</p><p className="text-xs text-brand-600 mt-1">Track →</p></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent History</h2>
          <Link to="/customer/history" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="card flex items-center justify-center h-24"><div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" /></div>
        ) : recent.length === 0 ? (
          <div className="card text-center py-10 text-gray-400"><div className="text-4xl mb-2">📭</div><p className="text-sm">No completed pickups yet</p></div>
        ) : (
          <div className="space-y-3">
            {recent.map((p) => (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><StatusBadge status={p.status} /><span className="text-xs text-gray-500">{formatDistanceToNow(new Date(p.createdAt))} ago</span></div>
                    <p className="text-sm text-gray-700">{p.pickupAddress}</p>
                    <p className="text-xs text-gray-500 mt-0.5">→ {p.returnLocation.name}</p>
                  </div>
                  <p className="text-sm font-semibold">${p.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
