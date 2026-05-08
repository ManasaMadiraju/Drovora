import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Analytics { byStatus: { status: string; _count: { status: number } }[]; revenueByDay: Record<string, number>; topLocations: { returnLocationId: string; _count: { returnLocationId: number }; location?: { name: string; type: string } }[]; }
const STATUS_COLORS: Record<string, string> = { pending: '#eab308', accepted: '#3b82f6', en_route_pickup: '#8b5cf6', picked_up: '#6366f1', en_route_dropoff: '#f97316', completed: '#22c55e', cancelled: '#ef4444' };
const LOC_ICONS: Record<string, string> = { whole_foods: '🛒', ups: '📮', kohls: '🏪', staples: '📎', amazon_hub: '📦' };

export default function Analytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/analytics').then(({ data }) => { setData(data); setLoading(false); }); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent" /></div>;

  const revenueData = data ? Object.entries(data.revenueByDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date: date.slice(5), amount: +amount.toFixed(2) })) : [];
  const pieData = data?.byStatus.map((s) => ({ name: s.status.replace(/_/g, ' '), value: s._count.status, color: STATUS_COLORS[s.status] || '#94a3b8' })) || [];
  const totalPickups = pieData.reduce((s, d) => s + d.value, 0);
  const completionRate = totalPickups > 0 ? ((pieData.find((d) => d.name === 'completed')?.value || 0) / totalPickups * 100).toFixed(1) : '0';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center"><p className="text-3xl font-bold text-brand-600">{totalPickups}</p><p className="text-sm text-gray-500 mt-1">Total Pickups</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-green-600">{completionRate}%</p><p className="text-sm text-gray-500 mt-1">Completion Rate</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-yellow-500">${revenueData.reduce((s, d) => s + d.amount, 0).toFixed(2)}</p><p className="text-sm text-gray-500 mt-1">Revenue (7 days)</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue (Last 7 Days)</h2>
          {revenueData.length === 0 ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div> : (
            <ResponsiveContainer width="100%" height={200}><BarChart data={revenueData}><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} /><Tooltip formatter={(v: number) => [`$${v}`, 'Revenue']} /><Bar dataKey="amount" fill="#3d63ff" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Pickup Status Breakdown</h2>
          {pieData.length === 0 ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div> : (
            <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Top Return Locations</h2>
        {!data?.topLocations.length ? <p className="text-sm text-gray-400">No data yet</p> : (
          <div className="space-y-3">
            {data.topLocations.map((loc, i) => {
              const max = data.topLocations[0]._count.returnLocationId;
              return (
                <div key={loc.returnLocationId}>
                  <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span>{LOC_ICONS[loc.location?.type || ''] || '📍'}</span><span className="text-sm font-medium text-gray-900">{loc.location?.name}</span></div><span className="text-sm font-semibold text-brand-600">{loc._count.returnLocationId}</span></div>
                  <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-brand-500 rounded-full" style={{ width: `${(loc._count.returnLocationId / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
