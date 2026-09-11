import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, PackageCheck, Store, Paperclip, Box, MapPin, Check, Plus, X, CreditCard, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import DrovoraMap from '../../components/Map';
import type { MapPoint } from '../../components/Map';

interface Location { id: string; name: string; type: string; address: string; city: string; hours: string; lat: number; lng: number; }
interface Package { orderId: string; description: string; }
const ICONS: Record<string, typeof ShoppingBasket> = { whole_foods: ShoppingBasket, ups: PackageCheck, kohls: Store, staples: Paperclip, amazon_hub: Box };

const STEP_LABELS = ['Packages', 'Return Location', 'Review & Pay'];

export default function NewPickup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [packages, setPackages] = useState<Package[]>([{ orderId: '', description: '' }]);
  const [notes, setNotes] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/locations').then(({ data }) => setLocations(data.locations)); }, []);

  const fees = { base: +(5.99 + (packages.length - 1) * 1.5).toFixed(2), service: 1.99 };
  const total = fees.base + fees.service;

  const handleSubmit = async () => {
    setError('');
    if (!pickupAddress) { setError('Please enter your pickup address'); return; }
    if (!selectedLocation) { setError('Please select a return location'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/pickups', { returnLocationId: selectedLocation.id, pickupAddress, packageCount: packages.length, packageDetails: packages, notes, scheduledTime: isScheduled ? scheduledTime : null, paymentMethod });
      navigate(`/customer/track/${data.pickup.id}`);
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to create pickup'); }
    finally { setLoading(false); }
  };

  const mapPoints: MapPoint[] = selectedLocation ? [{ lat: selectedLocation.lat, lng: selectedLocation.lng, label: selectedLocation.name, type: 'return' }] : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 animate-slide-up"><h1 className="font-display text-2xl font-extrabold text-ink-900 tracking-tight">Schedule a Pickup</h1><p className="text-ink-500 text-sm mt-1.5">We'll pick up your Amazon returns and drop them off</p></div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all duration-300 ${s < step ? 'bg-emerald-500 text-white' : s === step ? 'bg-brand-600 text-white shadow-glow' : 'bg-ink-200 text-ink-500'}`}>{s < step ? <Check size={14} /> : s}</div>
            {s < 3 && <div className={`h-0.5 flex-1 rounded transition-colors duration-300 ${s < step ? 'bg-emerald-500' : 'bg-ink-200'}`} />}
          </div>
        ))}
        <span className="text-sm text-ink-500 ml-1 hidden sm:inline">{STEP_LABELS[step - 1]}</span>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-slide-up">{error}</div>}

      {step === 1 && (
        <div className="space-y-5 animate-slide-up">
          <div className="card">
            <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> Pickup Address</h2>
            <input className="input" placeholder="Your home address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2"><Box size={16} className="text-brand-600" /> Packages</h2>
            <div className="space-y-3">
              {packages.map((pkg, i) => (
                <div key={i} className="border border-ink-100 rounded-2xl p-3.5 bg-ink-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink-700">Package {i + 1}</span>
                    {packages.length > 1 && <button onClick={() => setPackages(packages.filter((_, idx) => idx !== i))} className="text-red-500 text-xs hover:text-red-700 flex items-center gap-0.5"><X size={12} /> Remove</button>}
                  </div>
                  <input className="input mb-2" placeholder="Amazon Order ID" value={pkg.orderId} onChange={(e) => { const u = [...packages]; u[i].orderId = e.target.value; setPackages(u); }} />
                  <input className="input" placeholder="Item description" value={pkg.description} onChange={(e) => { const u = [...packages]; u[i].description = e.target.value; setPackages(u); }} />
                </div>
              ))}
            </div>
            <button onClick={() => setPackages([...packages, { orderId: '', description: '' }])} className="mt-3 text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"><Plus size={14} /> Add another package</button>
          </div>
          <div className="card">
            <h2 className="font-semibold text-ink-900 mb-4">Scheduling</h2>
            <div className="flex gap-2 mb-3">
              {[false, true].map((sched) => (
                <button key={String(sched)} onClick={() => setIsScheduled(sched)} className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-colors ${isScheduled === sched ? 'bg-brand-600 text-white border-brand-600' : 'text-ink-600 border-ink-100 hover:bg-ink-50'}`}>{sched ? 'Schedule' : 'ASAP'}</button>
              ))}
            </div>
            {isScheduled && <input type="datetime-local" className="input" value={scheduledTime} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setScheduledTime(e.target.value)} />}
          </div>
          <button onClick={() => setStep(2)} className="btn-primary w-full py-3" disabled={!pickupAddress}>Continue <ArrowRight size={15} /></button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h2 className="font-semibold text-ink-900 mb-4">Select Return Location</h2>
            <div className="space-y-2">
              {locations.map((loc) => {
                const Icon = ICONS[loc.type] || MapPin;
                const selected = selectedLocation?.id === loc.id;
                return (
                  <button key={loc.id} onClick={() => setSelectedLocation(loc)} className={`w-full text-left p-3.5 rounded-2xl border-2 transition-colors ${selected ? 'border-brand-500 bg-brand-50' : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'}`}><Icon size={18} /></div>
                      <div className="min-w-0"><p className="text-sm font-medium text-ink-900">{loc.name}</p><p className="text-xs text-ink-500">{loc.address}, {loc.city}</p><p className="text-xs text-ink-400">{loc.hours}</p></div>
                      {selected && <Check size={16} className="ml-auto text-brand-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {selectedLocation && <div className="card p-0 overflow-hidden"><DrovoraMap points={mapPoints} height="200px" center={[selectedLocation.lat, selectedLocation.lng]} /></div>}
          <div className="flex gap-3"><button onClick={() => setStep(1)} className="btn-secondary flex-1"><ArrowLeft size={15} /> Back</button><button onClick={() => setStep(3)} className="btn-primary flex-1" disabled={!selectedLocation}>Continue <ArrowRight size={15} /></button></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h2 className="font-semibold text-ink-900 mb-3">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-ink-500"><span>Pickup from</span><span className="font-medium text-ink-900 text-right max-w-xs">{pickupAddress}</span></div>
              <div className="flex justify-between text-ink-500"><span>Drop off at</span><span className="font-medium text-ink-900">{selectedLocation?.name}</span></div>
              <div className="flex justify-between text-ink-500"><span>Packages</span><span className="font-medium text-ink-900">{packages.length}</span></div>
              {isScheduled && <div className="flex justify-between text-ink-500"><span>Scheduled</span><span className="font-medium text-ink-900">{new Date(scheduledTime).toLocaleString()}</span></div>}
              <div className="border-t border-ink-100 pt-3 space-y-2">
                <div className="flex justify-between text-ink-500"><span>Base fee</span><span>${fees.base.toFixed(2)}</span></div>
                <div className="flex justify-between text-ink-500"><span>Service fee</span><span>${fees.service.toFixed(2)}</span></div>
                <div className="flex justify-between text-ink-900 font-bold text-base pt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold text-ink-900 mb-3">Payment</h2>
            <div className="flex gap-2">
              {([{ m: 'card', icon: CreditCard, label: 'Card' }, { m: 'wallet', icon: Wallet, label: 'Wallet' }] as const).map(({ m, icon: Icon, label }) => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 flex items-center justify-center gap-2 transition-colors ${paymentMethod === m ? 'bg-brand-600 text-white border-brand-600' : 'text-ink-600 border-ink-100'}`}><Icon size={15} /> {label}</button>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-2 text-center">Payment is simulated — no real charges</p>
          </div>
          <textarea className="input" rows={2} placeholder="Special instructions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex gap-3"><button onClick={() => setStep(2)} className="btn-secondary flex-1"><ArrowLeft size={15} /> Back</button><button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>{loading ? 'Placing order...' : `Place Order · $${total.toFixed(2)}`}</button></div>
        </div>
      )}
    </div>
  );
}
