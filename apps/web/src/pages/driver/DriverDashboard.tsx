import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import socket from '../../lib/socket';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import DrovoraMap from '../../components/Map';
import type { MapPoint } from '../../components/Map';
import { formatDistanceToNow } from 'date-fns';

interface Pickup { id: string; status: string; pickupAddress: string; pickupLat: number | null; pickupLng: number | null; packageCount: number; totalAmount: number; notes: string | null; scheduledTime: string | null; createdAt: string; customer: { name: string; phone: string }; returnLocation: { name: string; address: string; lat: number; lng: number }; }
interface Stats { completedPickups: number; averageRating: number; totalRatings: number; }

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [available, setAvailable] = useState<Pickup[]>([]);
  const [active, setActive] = useState<Pickup | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([api.get('/pickups/available'), api.get('/pickups?limit=20'), api.get('/drivers/me/stats')]).then(([avail, mine, s]) => {
      setAvailable(avail.data.pickups);
      const inProgress = mine.data.pickups.find((p: Pickup) => !['completed', 'cancelled', 'pending'].includes(p.status));
      setActive(inProgress || null);
      setStats(s.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    socket.on('new_pickup_request', loadData);
    socket.on('pickup_list_updated', loadData);
    return () => { socket.off('new_pickup_request', loadData); socket.off('pickup_list_updated', loadData); };
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const send = () => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => api.put('/drivers/me/location', { lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => api.put('/drivers/me/location', { lat: 37.7749 + (Math.random() - 0.5) * 0.01, lng: -122.4194 + (Math.random() - 0.5) * 0.01 })
      );
    };
    send();
    const interval = setInterval(send, 15000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const toggleOnline = async () => { const next = !isOnline; setIsOnline(next); await api.patch('/drivers/me/online', { isOnline: next }); };
  const acceptJob = async (pickupId: string) => { await api.patch(`/pickups/${pickupId}/accept`); navigate(`/driver/job/${pickupId}`); };

  const mapPoints: MapPoint[] = active ? [
    ...(active.pickupLat ? [{ lat: active.pickupLat, lng: active.pickupLng!, label: 'Pickup', type: 'customer' as const }] : []),
    { lat: active.returnLocation.lat, lng: active.returnLocation.lng, label: active.returnLocation.name, type: 'return' as const },
  ] : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Hey, {user?.name.split(' ')[0]}</h1><p className="text-gray-500 text-sm mt-0.5">{isOnline ? '🟢 You are online' : '⭕ You are offline'}</p></div>
        <button onClick={toggleOnline} className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${isOnline ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600'}`}>{isOnline ? 'Go Offline' : 'Go Online'}</button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center py-4"><p className="text-2xl font-bold text-brand-600">{stats.completedPickups}</p><p className="text-xs text-gray-500 mt-0.5">Completed</p></div>
          <div className="card text-center py-4"><p className="text-2xl font-bold text-yellow-500">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}</p><p className="text-xs text-gray-500 mt-0.5">Avg Rating</p></div>
          <div className="card text-center py-4"><p className="text-2xl font-bold text-green-600">{stats.totalRatings}</p><p className="text-xs text-gray-500 mt-0.5">Reviews</p></div>
        </div>
      )}

      {active && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Job</h2>
          <div className="card border-2 border-brand-400">
            <div className="flex items-start justify-between mb-3"><StatusBadge status={active.status} /><span className="text-sm font-bold text-brand-700">${active.totalAmount.toFixed(2)}</span></div>
            <p className="text-sm font-medium text-gray-900">{active.pickupAddress}</p>
            <p className="text-xs text-gray-500 mt-0.5">→ {active.returnLocation.name}</p>
            <p className="text-xs text-gray-400 mt-1">Customer: {active.customer.name} · {active.customer.phone}</p>
            {mapPoints.length > 0 && <div className="mt-3 rounded-lg overflow-hidden"><DrovoraMap points={mapPoints} height="180px" /></div>}
            <button onClick={() => navigate(`/driver/job/${active.id}`)} className="btn-primary w-full mt-3">Continue Job →</button>
          </div>
        </div>
      )}

      {!active && (
        <div>
          <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold text-gray-900">Available Pickups</h2><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{available.length} nearby</span></div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent" /></div>
          ) : available.length === 0 ? (
            <div className="card text-center py-16"><div className="text-5xl mb-3">🔍</div><p className="text-gray-500 font-medium">No pickups available right now</p><p className="text-gray-400 text-sm mt-1">New requests will appear here automatically</p></div>
          ) : (
            <div className="space-y-3">
              {available.map((p) => (
                <div key={p.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="text-sm font-semibold text-gray-900">{p.pickupAddress}</p><p className="text-xs text-gray-500 mt-0.5">→ {p.returnLocation.name}</p></div>
                    <div className="text-right ml-3"><p className="text-base font-bold text-green-600">${(p.totalAmount * 0.7).toFixed(2)}</p><p className="text-xs text-gray-400">you earn</p></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>📦 {p.packageCount} pkg{p.packageCount > 1 ? 's' : ''}</span>
                    {p.scheduledTime && <span>📅 {new Date(p.scheduledTime).toLocaleString()}</span>}
                    <span>🕐 {formatDistanceToNow(new Date(p.createdAt))} ago</span>
                  </div>
                  <button onClick={() => acceptJob(p.id)} className="btn-primary w-full text-sm">Accept Job</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
