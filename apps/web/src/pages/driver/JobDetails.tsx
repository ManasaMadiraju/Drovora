import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import socket from '../../lib/socket';
import StatusBadge from '../../components/StatusBadge';
import DrovoraMap from '../../components/Map';
import type { MapPoint } from '../../components/Map';

interface Pickup { id: string; status: string; pickupAddress: string; pickupLat: number | null; pickupLng: number | null; packageCount: number; packageDetails: string | null; totalAmount: number; notes: string | null; customer: { name: string; phone: string }; driver: { id: string; name: string } | null; returnLocation: { name: string; address: string; lat: number; lng: number; hours: string }; }

const ACTIONS: Record<string, { next: string; label: string }> = {
  accepted:         { next: 'en_route_pickup',  label: 'Start Driving to Pickup' },
  en_route_pickup:  { next: 'picked_up',         label: 'Mark as Picked Up' },
  picked_up:        { next: 'en_route_dropoff',  label: 'Head to Drop-off' },
  en_route_dropoff: { next: 'delivered',          label: 'Confirm Delivery ✓' },
};

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<Pickup | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/pickups/${id}`).then(({ data }) => { setPickup(data.pickup); setLoading(false); });
    socket.on(`pickup_updated_${id}`, (u: Pickup) => setPickup(u));
    return () => { socket.off(`pickup_updated_${id}`); };
  }, [id]);

  const updateStatus = async () => {
    if (!pickup) return;
    const action = ACTIONS[pickup.status];
    if (!action) return;
    setUpdating(true);
    try { await api.patch(`/pickups/${id}/status`, { status: action.next }); if (action.next === 'delivered') navigate('/driver'); }
    catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent" /></div>;
  if (!pickup) return <div className="text-center py-20 text-gray-500">Job not found</div>;

  const packages = pickup.packageDetails ? JSON.parse(pickup.packageDetails) : [];
  const action = ACTIONS[pickup.status];
  const mapPoints: MapPoint[] = [];
  if (pickup.pickupLat) mapPoints.push({ lat: pickup.pickupLat, lng: pickup.pickupLng!, label: pickup.pickupAddress, type: 'customer' });
  mapPoints.push({ lat: pickup.returnLocation.lat, lng: pickup.returnLocation.lng, label: pickup.returnLocation.name, type: 'return' });

  const focusIsPickup = ['accepted', 'en_route_pickup'].includes(pickup.status) && pickup.pickupLat;
  const focusCenter: [number, number] = focusIsPickup ? [pickup.pickupLat!, pickup.pickupLng!] : [pickup.returnLocation.lat, pickup.returnLocation.lng];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/driver')} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">← Dashboard</button>
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-xl font-bold text-gray-900">Job Details</h1><p className="text-xs text-gray-400">#{pickup.id.slice(-8).toUpperCase()}</p></div><StatusBadge status={pickup.status} /></div>

      <div className="card p-0 overflow-hidden mb-6"><DrovoraMap points={mapPoints} height="250px" center={focusCenter} /></div>

      {action && (
        <div className={`card mb-6 ${pickup.status === 'en_route_dropoff' ? 'bg-green-50 border-green-200' : 'bg-brand-50 border-brand-200'}`}>
          <p className="text-sm font-medium text-gray-700 mb-3">
            {pickup.status === 'accepted' && '🚗 Head to the customer for pickup'}
            {pickup.status === 'en_route_pickup' && '📦 Arriving at pickup location'}
            {pickup.status === 'picked_up' && '🏪 Head to the return location'}
            {pickup.status === 'en_route_dropoff' && '✅ At the drop-off? Confirm delivery below'}
          </p>
          <button onClick={updateStatus} disabled={updating} className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${pickup.status === 'en_route_dropoff' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'} disabled:opacity-50`}>{updating ? 'Updating...' : action.label}</button>
        </div>
      )}

      <div className="card mb-4"><h2 className="font-semibold text-gray-900 mb-3">Pickup Location</h2><p className="text-sm text-gray-700 mb-1">{pickup.pickupAddress}</p><p className="text-sm font-medium text-gray-900">{pickup.customer.name}</p><a href={`tel:${pickup.customer.phone}`} className="text-sm text-brand-600 hover:underline">{pickup.customer.phone}</a></div>
      <div className="card mb-4"><h2 className="font-semibold text-gray-900 mb-3">Drop-off Location</h2><p className="text-sm font-medium text-gray-900">{pickup.returnLocation.name}</p><p className="text-sm text-gray-500">{pickup.returnLocation.address}</p><p className="text-xs text-gray-400 mt-1">{pickup.returnLocation.hours}</p></div>

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Packages ({pickup.packageCount})</h2>
        {packages.length > 0 ? packages.map((pkg: { orderId: string; description: string }, i: number) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"><span className="text-lg">📦</span><div><p className="text-sm font-medium text-gray-900">{pkg.description || 'Amazon Return'}</p><p className="text-xs font-mono text-gray-400">{pkg.orderId}</p></div></div>
        )) : <p className="text-sm text-gray-500">{pickup.packageCount} package(s)</p>}
        {pickup.notes && <div className="mt-3 pt-3 border-t border-gray-100"><p className="text-xs text-gray-500 italic">Note: {pickup.notes}</p></div>}
      </div>

      <div className="card bg-green-50 border-green-100"><div className="flex justify-between items-center"><div><p className="text-sm text-gray-600">Your earnings</p><p className="text-2xl font-bold text-green-700">${(pickup.totalAmount * 0.7).toFixed(2)}</p></div><div className="text-3xl">💰</div></div></div>
    </div>
  );
}
