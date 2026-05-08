import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Stats { users: { total: number; customers: number; drivers: number }; pickups: { total: number; pending: number; completed: number; cancelled: number }; revenue: number; onlineDrivers: number; }
interface Analytics { byStatus: { status: string; _count: { status: number } }[]; revenueByDay: Record<string, number>; topLocations: { returnLocationId: string; _count: { returnLocationId: number }; location: { name: string } }[]; }
const STATUS_COLORS: Record<string, string> = { pending: '#eab308', accepted: '#3b82f6', en_route_pickup: '#8b5cf6', picked_up: '#6366f1', en_route_dropoff: '#f97316', completed: '#22c55e', cancelled: '#ef4444' };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/analytics')]).then(([s, a]) => { setStats(s.data); setAnalytics(a.data); setLoading(false); });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent" /></div>;

  const revenueData = analytics ? Object.entries(analytics.revenueByDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date: date.slice(5), amount: +amount.toFixed(2) })) : [];
  const statusData = analytics?.byStatus.map((s) => ({ name: s.status.replace(/_/g, ' '), count: s._count.status, color: STATUS_COLORS[s.status] || '#94a3b8' })) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-gray-500 text-sm mt-0.5">Drovora operations overview</p></div>
        <div className="flex gap-3"><Link to="/admin/orders" className="btn-secondary text-sm">View Orders</Link><Link to="/admin/drivers" className="btn-primary text-sm">Manage Drivers</Link></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `$${(stats?.revenue || 0).toFixed(2)}`, sub: 'All time', icon: '💰', color: 'text-green-600' },
          { label: 'Total Pickups', value: stats?.pickups.total || 0, sub: `${stats?.pickups.pending} pending`, icon: '📦', color: 'text-brand-600' },
          { label: 'Drivers Online', value: stats?.onlineDrivers || 0, sub: `${stats?.users.drivers} total`, icon: '🚗', color: 'text-purple-600' },
          { label: 'Customers', value: stats?.users.customers || 0, sub: `${stats?.users.total} total users`, icon: '👥', color: 'text-orange-500' },
        ].map((card) => (
          <div key={card.label} className="card"><div className="flex items-start justify-between"><div><p className="text-xs text-gray-500 mb-1">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p><p className="text-xs text-gray-400 mt-1">{card.sub}</p></div><span className="text-2xl">{card.icon}</span></div></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 7 Days)</h2>
          {revenueData.length === 0 ? <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div> : (
            <ResponsiveContainer width="100%" height={180}><BarChart data={revenueData}><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} /><Tooltip formatter={(v: number) => [`$${v}`, 'Revenue']} /><Bar dataKey="amount" fill="#3d63ff" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Pickups by Status</h2>
          {statusData.length === 0 ? <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data yet</div> : (
            <ResponsiveContainer width="100%" height={180}><BarChart data={statusData} layout="vertical"><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} /><Tooltip /><Bar dataKey="count" radius={[0, 4, 4, 0]}>{statusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer>
          )}
        </div>
      </div>

      {analytics?.topLocations && analytics.topLocations.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Top Return Locations</h2>
          <div className="space-y-3">
            {analytics.topLocations.map((loc, i) => (
              <div key={loc.returnLocationId} className="flex items-center gap-3"><span className="text-lg font-bold text-gray-300">#{i + 1}</span><div className="flex-1"><p className="text-sm font-medium text-gray-900">{loc.location?.name}</p></div><span className="text-sm font-semibold text-brand-600">{loc._count.returnLocationId} pickups</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
