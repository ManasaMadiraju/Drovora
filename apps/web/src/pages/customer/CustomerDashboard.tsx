import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Inbox, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
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
      <div className="mb-8 animate-slide-up">
        <h1 className="font-display text-2xl font-extrabold text-ink-900 tracking-tight">Hey, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-ink-500 mt-1">Ready to drop off your Amazon returns? We'll handle it.</p>
      </div>

      <Link to="/customer/new" className="block grad-hero-card text-white rounded-[28px] p-6 mb-8 shadow-coral-lift hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden animate-slide-up">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-white/70 text-sm font-semibold mb-1">Get started</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Schedule a pickup</h2>
            <p className="text-white/80 text-sm mt-1.5 flex items-center gap-1">We'll pick up your packages and drop them off <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></p>
          </div>
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Package size={26} />
          </div>
        </div>
      </Link>

      {loading ? <SkeletonList count={2} /> : (
        <>
          {active.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-ink-900 mb-4">Active Pickups</h2>
              <div className="space-y-3">
                {active.map((p) => (
                  <Link key={p.id} to={`/customer/track/${p.id}`}>
                    <div className="card card-hover border-l-4 border-l-brand-500 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5"><StatusBadge status={p.status} /><span className="text-xs text-ink-400">{formatDistanceToNow(new Date(p.createdAt))} ago</span></div>
                        <p className="text-sm font-medium text-ink-900 truncate">{p.pickupAddress}</p>
                        <p className="text-xs text-ink-500 mt-0.5">→ {p.returnLocation.name} · {p.packageCount} pkg{p.packageCount > 1 ? 's' : ''}</p>
                        {p.driver && <p className="text-xs text-brand-600 mt-1 font-medium">Driver: {p.driver.name}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-ink-900">${p.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-brand-600 mt-1 flex items-center gap-0.5 justify-end">Track <ChevronRight size={12} /></p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900">Recent History</h2>
              <Link to="/customer/history" className="text-sm text-brand-600 hover:underline font-medium">View all</Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState icon={Inbox} title="No completed pickups yet" description="Your finished pickups will show up here." />
            ) : (
              <div className="space-y-3">
                {recent.map((p) => (
                  <div key={p.id} className="card flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5"><StatusBadge status={p.status} /><span className="text-xs text-ink-400">{formatDistanceToNow(new Date(p.createdAt))} ago</span></div>
                      <p className="text-sm text-ink-700 truncate">{p.pickupAddress}</p>
                      <p className="text-xs text-ink-500 mt-0.5">→ {p.returnLocation.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-ink-900 flex-shrink-0">${p.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
