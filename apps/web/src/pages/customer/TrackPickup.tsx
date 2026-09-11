import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ClipboardList, UserCheck, Car, Package, Truck, CheckCircle2, Phone, Star, XCircle } from 'lucide-react';
import api from '../../lib/api';
import socket from '../../lib/socket';
import StatusBadge from '../../components/StatusBadge';
import DrovoraMap from '../../components/Map';
import type { MapPoint } from '../../components/Map';
import { useConfirm } from '../../components/ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';

interface Pickup { id: string; status: string; pickupAddress: string; pickupLat: number | null; pickupLng: number | null; packageCount: number; packageDetails: string | null; totalAmount: number; paymentStatus: string; createdAt: string; pickedUpAt: string | null; deliveredAt: string | null; customer: { name: string; phone: string }; driver: { id: string; name: string; phone: string } | null; returnLocation: { name: string; address: string; lat: number; lng: number }; rating: { rating: number; comment: string } | null; }

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: ClipboardList },
  { key: 'accepted', label: 'Driver Assigned', icon: UserCheck },
  { key: 'en_route_pickup', label: 'Driver En Route', icon: Car },
  { key: 'picked_up', label: 'Picked Up', icon: Package },
  { key: 'en_route_dropoff', label: 'Heading to Drop-off', icon: Truck },
  { key: 'completed', label: 'Delivered', icon: CheckCircle2 },
];
const STATUS_ORDER = STEPS.map((s) => s.key);

export default function TrackPickup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
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

  const handleCancel = async () => {
    const ok = await confirm({ title: 'Cancel this pickup?', description: 'This cannot be undone. Your driver (if assigned) will be notified.', confirmLabel: 'Cancel pickup', danger: true });
    if (!ok) return;
    try { await api.patch(`/pickups/${id}/cancel`, { reason: 'Cancelled by customer' }); toast.success('Pickup cancelled'); }
    catch { toast.error('Could not cancel pickup'); }
  };

  const handleRate = async () => {
    if (rating === 0) return;
    try { await api.post(`/pickups/${id}/rate`, { rating, comment }); setRated(true); toast.success('Thanks for your feedback!'); }
    catch { toast.error('Could not submit rating'); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-[3px] border-brand-600 border-t-transparent" /></div>;
  if (!pickup) return <div className="text-center py-20 text-ink-500">Pickup not found</div>;

  const currentIdx = STATUS_ORDER.indexOf(pickup.status);
  const mapPoints: MapPoint[] = [];
  if (pickup.pickupLat && pickup.pickupLng) mapPoints.push({ lat: pickup.pickupLat, lng: pickup.pickupLng, label: 'Pickup', type: 'customer' });
  mapPoints.push({ lat: pickup.returnLocation.lat, lng: pickup.returnLocation.lng, label: pickup.returnLocation.name, type: 'return' });
  if (driverLoc) mapPoints.push({ lat: driverLoc.lat, lng: driverLoc.lng, label: `Driver: ${pickup.driver?.name}`, type: 'driver' });
  const packages = pickup.packageDetails ? JSON.parse(pickup.packageDetails) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-ink-500 hover:text-ink-700 mb-6 flex items-center gap-1.5"><ArrowLeft size={15} /> Back</button>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-ink-900">Track Pickup</h1><p className="text-xs text-ink-400 mt-0.5 font-mono">#{pickup.id.slice(-8).toUpperCase()}</p></div>
        <StatusBadge status={pickup.status} size="md" />
      </div>
      <div className="card p-0 overflow-hidden mb-6"><DrovoraMap points={mapPoints} height="260px" center={mapPoints.length > 0 ? [mapPoints[0].lat, mapPoints[0].lng] : undefined} /></div>

      {pickup.status === 'cancelled' ? (
        <div className="card mb-6 bg-red-50 border-red-100 flex items-center gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">This pickup was cancelled.</p>
        </div>
      ) : (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-ink-700 mb-4">Pickup Progress</h2>
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx; const active = i === currentIdx; const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-3 py-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-ink-100 text-ink-400'} ${active ? 'ring-2 ring-brand-400 ring-offset-2' : ''}`}>
                    <Icon size={15} />
                  </div>
                  <div><p className={`text-sm font-medium ${done ? 'text-ink-900' : 'text-ink-400'}`}>{step.label}</p>{active && <p className="text-xs text-brand-600">In progress</p>}</div>
                  {done && i < currentIdx && <CheckCircle2 size={15} className="ml-auto text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pickup.driver && (
        <div className="card mb-4 flex items-center gap-4">
          <div className="w-12 h-12 grad-avatar rounded-full flex items-center justify-center text-white font-semibold">{pickup.driver.name.charAt(0)}</div>
          <div className="min-w-0"><p className="font-semibold text-ink-900 truncate">{pickup.driver.name}</p><p className="text-sm text-ink-500">{pickup.driver.phone}</p></div>
          <a href={`tel:${pickup.driver.phone}`} className="ml-auto btn-secondary text-sm flex-shrink-0"><Phone size={14} /> Call</a>
        </div>
      )}

      <div className="card mb-4">
        <h2 className="font-semibold text-ink-900 mb-3">Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-500"><span>Pickup address</span><span className="text-ink-900 text-right max-w-xs">{pickup.pickupAddress}</span></div>
          <div className="flex justify-between text-ink-500"><span>Drop-off</span><span className="text-ink-900">{pickup.returnLocation.name}</span></div>
          <div className="flex justify-between text-ink-500"><span>Packages</span><span className="text-ink-900">{pickup.packageCount}</span></div>
          <div className="flex justify-between text-ink-500"><span>Total</span><span className="text-ink-900 font-semibold">${pickup.totalAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-ink-500"><span>Placed</span><span className="text-ink-900">{formatDistanceToNow(new Date(pickup.createdAt))} ago</span></div>
        </div>
        {packages.length > 0 && <div className="mt-4 pt-4 border-t border-ink-100"><p className="text-sm font-medium text-ink-700 mb-2">Packages</p>{packages.map((pkg: { orderId: string; description: string }, i: number) => (<div key={i} className="text-xs text-ink-500 mb-1"><span className="font-mono">{pkg.orderId}</span> — {pkg.description}</div>))}</div>}
      </div>

      {pickup.status === 'completed' && pickup.driver && !rated && (
        <div className="card mb-4">
          <h2 className="font-semibold text-ink-900 mb-3">Rate your driver</h2>
          <div className="flex gap-1.5 mb-3">{[1,2,3,4,5].map((star) => (<button key={star} onClick={() => setRating(star)}><Star size={26} className={`transition-transform hover:scale-110 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`} /></button>))}</div>
          <textarea className="input mb-3" rows={2} placeholder="Leave a comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button onClick={handleRate} className="btn-primary w-full" disabled={rating === 0}>Submit Rating</button>
        </div>
      )}
      {rated && pickup.rating && (
        <div className="card mb-4 bg-emerald-50 border-emerald-100">
          <p className="text-sm font-medium text-emerald-800 flex items-center gap-1">You rated this pickup {Array.from({ length: pickup.rating.rating }).map((_, i) => <Star key={i} size={13} className="fill-emerald-600 text-emerald-600" />)}</p>
          {pickup.rating.comment && <p className="text-xs text-emerald-700 mt-1">"{pickup.rating.comment}"</p>}
        </div>
      )}
      {pickup.status === 'pending' && <button onClick={handleCancel} className="btn-danger w-full">Cancel Pickup</button>}
    </div>
  );
}
