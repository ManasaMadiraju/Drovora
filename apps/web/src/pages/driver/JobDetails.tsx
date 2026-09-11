import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Car, Package, Store, CheckCircle2, Phone, DollarSign, MapPin } from 'lucide-react';
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
  en_route_dropoff: { next: 'delivered',          label: 'Confirm Delivery' },
};

const HINTS: Record<string, { icon: typeof Car; text: string }> = {
  accepted: { icon: Car, text: 'Head to the customer for pickup' },
  en_route_pickup: { icon: Package, text: 'Arriving at pickup location' },
  picked_up: { icon: Store, text: 'Head to the return location' },
  en_route_dropoff: { icon: CheckCircle2, text: 'At the drop-off? Confirm delivery below' },
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
    try {
      await api.patch(`/pickups/${id}/status`, { status: action.next });
      if (action.next === 'delivered') { toast.success('Delivery confirmed — nice work!'); navigate('/driver'); }
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed to update status'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-9 w-9 border-[3px] border-brand-600 border-t-transparent" /></div>;
  if (!pickup) return <div className="text-center py-20 text-ink-500">Job not found</div>;

  const packages = pickup.packageDetails ? JSON.parse(pickup.packageDetails) : [];
  const action = ACTIONS[pickup.status];
  const hint = HINTS[pickup.status];
  const mapPoints: MapPoint[] = [];
  if (pickup.pickupLat) mapPoints.push({ lat: pickup.pickupLat, lng: pickup.pickupLng!, label: pickup.pickupAddress, type: 'customer' });
  mapPoints.push({ lat: pickup.returnLocation.lat, lng: pickup.returnLocation.lng, label: pickup.returnLocation.name, type: 'return' });

  const focusIsPickup = ['accepted', 'en_route_pickup'].includes(pickup.status) && pickup.pickupLat;
  const focusCenter: [number, number] = focusIsPickup ? [pickup.pickupLat!, pickup.pickupLng!] : [pickup.returnLocation.lat, pickup.returnLocation.lng];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/driver')} className="text-sm text-ink-500 hover:text-ink-700 mb-6 flex items-center gap-1.5"><ArrowLeft size={15} /> Dashboard</button>
      <div className="flex items-center justify-between mb-6"><div><h1 className="font-display text-xl font-extrabold text-ink-900 tracking-tight">Job Details</h1><p className="text-xs text-ink-400 font-mono mt-0.5">#{pickup.id.slice(-8).toUpperCase()}</p></div><StatusBadge status={pickup.status} size="md" /></div>

      <div className="card p-0 overflow-hidden mb-6"><DrovoraMap points={mapPoints} height="250px" center={focusCenter} /></div>

      {action && hint && (
        <div className={`card mb-6 ${pickup.status === 'en_route_dropoff' ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-50 border-brand-200'}`}>
          <p className="text-sm font-medium text-ink-700 mb-3 flex items-center gap-2"><hint.icon size={16} className={pickup.status === 'en_route_dropoff' ? 'text-emerald-600' : 'text-brand-600'} /> {hint.text}</p>
          <button onClick={updateStatus} disabled={updating} className={`w-full py-3 rounded-full font-bold text-sm transition-colors ${pickup.status === 'en_route_dropoff' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'} disabled:opacity-50`}>{updating ? 'Updating...' : action.label}</button>
        </div>
      )}

      <div className="card mb-4">
        <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><MapPin size={15} className="text-brand-600" /> Pickup Location</h2>
        <p className="text-sm text-ink-700 mb-1">{pickup.pickupAddress}</p>
        <p className="text-sm font-medium text-ink-900">{pickup.customer.name}</p>
        <a href={`tel:${pickup.customer.phone}`} className="text-sm text-brand-600 hover:underline flex items-center gap-1 mt-0.5"><Phone size={13} /> {pickup.customer.phone}</a>
      </div>
      <div className="card mb-4">
        <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><Store size={15} className="text-brand-600" /> Drop-off Location</h2>
        <p className="text-sm font-medium text-ink-900">{pickup.returnLocation.name}</p>
        <p className="text-sm text-ink-500">{pickup.returnLocation.address}</p>
        <p className="text-xs text-ink-400 mt-1">{pickup.returnLocation.hours}</p>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-ink-900 mb-3">Packages ({pickup.packageCount})</h2>
        {packages.length > 0 ? packages.map((pkg: { orderId: string; description: string }, i: number) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-ink-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-ink-100 text-ink-500 flex items-center justify-center flex-shrink-0"><Package size={14} /></div>
            <div className="min-w-0"><p className="text-sm font-medium text-ink-900 truncate">{pkg.description || 'Amazon Return'}</p><p className="text-xs font-mono text-ink-400">{pkg.orderId}</p></div>
          </div>
        )) : <p className="text-sm text-ink-500">{pickup.packageCount} package(s)</p>}
        {pickup.notes && <div className="mt-3 pt-3 border-t border-ink-100"><p className="text-xs text-ink-500 italic">Note: {pickup.notes}</p></div>}
      </div>

      <div className="card bg-emerald-50 border-emerald-100 flex justify-between items-center">
        <div><p className="text-sm text-ink-600">Your earnings</p><p className="text-2xl font-bold text-emerald-700">${(pickup.totalAmount * 0.7).toFixed(2)}</p></div>
        <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><DollarSign size={22} /></div>
      </div>
    </div>
  );
}
