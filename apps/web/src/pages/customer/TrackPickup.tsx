import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import socket from '../../lib/socket';
import StatusBadge from '../../components/StatusBadge';
import DrovoraMap from '../../components/Map';
import type { MapPoint } from '../../components/Map';
import { formatDistanceToNow } from 'date-fns';

interface Pickup { id: string; status: string; pickupAddress: string; pickupLat: number | null; pickupLng: number | null; packageCount: number; packageDetails: string | null; totalAmount: number; paymentStatus: string; createdAt: string; pickedUpAt: string | null; deliveredAt: string | null; customer: { name: string; phone: string }; driver: { id: string; name: string; phone: string } | null; returnLocation: { name: string; address: string; lat: number; lng: number }; rating: { rating: number; comment: string } | null; }

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'accepted', label: 'Driver Assigned', icon: '🙋' },
  { key: 'en_route_pickup', label: 'Driver En Route', icon: '🚗' },
  { key: 'picked_up', label: 'Picked Up', icon: '📦' },
  { key: 'en_route_dropoff', label: 'Heading to Drop-off', icon: '🚀' },
  { key: 'completed', label: 'Delivered', icon: '✅' },
];
const STATUS_ORDER = STEPS.map((s) => s.key);

export default function TrackPickup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<Pickup | null>(null);
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/pickups/${id}`).then(({ data }) => { setPickup(data.pickup); if (data.pickup.rating) setRated(true); setLoading(false); });
    socket.emit('pickup:track', id);
    socket.on(`pickup_updated_${id}`, (u: Pickup) => { setPickup(u); if (u.rating) setRated(true); });
    return () => { socket.off(`pickup_updated_${id}`); };
  }, [id]);

  useEffect(() => {
    if (!pickup?.driver) return;
    socket.on(`driver_location_${pickup.driver.id}`, (loc: { lat: number; lng: number }) => setDriverLoc(loc));
    return () => { if (pickup?.driver) socket.off(`driver_location_${pickup.driver.id}`); };
  }, [pickup?.driver]);

  const handleCancel = async () => { if (!confirm('Cancel this pickup?')) return; await api.patch(`/pickups/${id}/cancel`, { reason: 'Cancelled by customer' }); };
  const handleRate = async () => { if (rating === 0) return; await api.post(`/pickups/${id}/rate`, { rating, comment }); setRated(true); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent" /></div>;
  if (!pickup) return <div className="text-center py-20 text-gray-500">Pickup not found</div>;

  const currentIdx = STATUS_ORDER.indexOf(pickup.status);
  const mapPoints: MapPoint[] = [];
  if (pickup.pickupLat && pickup.pickupLng) mapPoints.push({ lat: pickup.pickupLat, lng: pickup.pickupLng, label: 'Pickup', type: 'customer' });
  mapPoints.push({ lat: pickup.returnLocation.lat, lng: pickup.returnLocation.lng, label: pickup.returnLocation.name, type: 'return' });
  if (driverLoc) mapPoints.push({ lat: driverLoc.lat, lng: driverLoc.lng, label: `Driver: ${pickup.driver?.name}`, type: 'driver' });
  const packages = pickup.packageDetails ? JSON.parse(pickup.packageDetails) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">← Back</button>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-gray-900">Track Pickup</h1><p className="text-xs text-gray-400 mt-0.5">#{pickup.id.slice(-8).toUpperCase()}</p></div>
        <StatusBadge status={pickup.status} />
      </div>
      <div className="card p-0 overflow-hidden mb-6"><DrovoraMap points={mapPoints} height="260px" center={mapPoints.length > 0 ? [mapPoints[0].lat, mapPoints[0].lng] : undefined} /></div>

      {pickup.status !== 'cancelled' && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pickup Progress</h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx; const active = i === currentIdx;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${done ? 'bg-green-100' : 'bg-gray-100'} ${active ? 'ring-2 ring-brand-400' : ''}`}>{step.icon}</div>
                  <div><p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>{active && <p className="text-xs text-brand-600">In progress</p>}</div>
                  {done && i < currentIdx && <span className="ml-auto text-green-500 text-sm">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pickup.driver && (
        <div className="card mb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-xl">🙋</div>
          <div><p className="font-semibold text-gray-900">{pickup.driver.name}</p><p className="text-sm text-gray-500">{pickup.driver.phone}</p></div>
          <a href={`tel:${pickup.driver.phone}`} className="ml-auto btn-secondary text-sm">Call</a>
        </div>
      )}

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Pickup address</span><span className="text-gray-900 text-right max-w-xs">{pickup.pickupAddress}</span></div>
          <div className="flex justify-between text-gray-600"><span>Drop-off</span><span className="text-gray-900">{pickup.returnLocation.name}</span></div>
          <div className="flex justify-between text-gray-600"><span>Packages</span><span className="text-gray-900">{pickup.packageCount}</span></div>
          <div className="flex justify-between text-gray-600"><span>Total</span><span className="text-gray-900 font-semibold">${pickup.totalAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Placed</span><span className="text-gray-900">{formatDistanceToNow(new Date(pickup.createdAt))} ago</span></div>
        </div>
        {packages.length > 0 && <div className="mt-4 pt-4 border-t border-gray-100"><p className="text-sm font-medium text-gray-700 mb-2">Packages</p>{packages.map((pkg: { orderId: string; description: string }, i: number) => (<div key={i} className="text-xs text-gray-500 mb-1"><span className="font-mono">{pkg.orderId}</span> — {pkg.description}</div>))}</div>}
      </div>

      {pickup.status === 'completed' && pickup.driver && !rated && (
        <div className="card mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Rate your driver</h2>
          <div className="flex gap-2 mb-3">{[1,2,3,4,5].map((star) => (<button key={star} onClick={() => setRating(star)} className={`text-2xl transition-transform hover:scale-110 ${rating >= star ? 'opacity-100' : 'opacity-30'}`}>⭐</button>))}</div>
          <textarea className="input mb-3" rows={2} placeholder="Leave a comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button onClick={handleRate} className="btn-primary w-full" disabled={rating === 0}>Submit Rating</button>
        </div>
      )}
      {rated && pickup.rating && <div className="card mb-4 bg-green-50 border-green-200"><p className="text-sm font-medium text-green-800">You rated this pickup {'⭐'.repeat(pickup.rating.rating)}</p>{pickup.rating.comment && <p className="text-xs text-green-700 mt-1">"{pickup.rating.comment}"</p>}</div>}
      {pickup.status === 'pending' && <button onClick={handleCancel} className="btn-danger w-full">Cancel Pickup</button>}
    </div>
  );
}
