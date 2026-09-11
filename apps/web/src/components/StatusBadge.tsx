import { Clock, UserCheck, Car, Package, Truck, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react';

const CONFIG: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  pending:          { label: 'Pending',           cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',   icon: Clock },
  accepted:         { label: 'Accepted',          cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',      icon: UserCheck },
  en_route_pickup:  { label: 'En Route (Pickup)', cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', icon: Car },
  picked_up:        { label: 'Picked Up',         cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200', icon: Package },
  en_route_dropoff: { label: 'En Route (Dropoff)',cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200', icon: Truck },
  completed:        { label: 'Completed',         cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',         cls: 'bg-red-50 text-red-700 ring-1 ring-red-200',         icon: XCircle },
};

export default function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const c = CONFIG[status] || { label: status, cls: 'bg-ink-100 text-ink-600 ring-1 ring-ink-200', icon: Clock };
  const Icon = c.icon;
  return (
    <span className={`badge ${c.cls} ${size === 'md' ? 'px-3 py-1.5 text-sm' : ''}`}>
      <Icon size={size === 'md' ? 14 : 12} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}
