import { Clock, UserCheck, Car, Package, Truck, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react';

const CONFIG: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  pending:          { label: 'Pending',           cls: 'bg-amber-500 text-white',   icon: Clock },
  accepted:         { label: 'Accepted',          cls: 'bg-blue-500 text-white',    icon: UserCheck },
  en_route_pickup:  { label: 'En Route (Pickup)', cls: 'bg-violet-500 text-white',  icon: Car },
  picked_up:        { label: 'Picked Up',         cls: 'bg-indigo-500 text-white',  icon: Package },
  en_route_dropoff: { label: 'En Route (Dropoff)',cls: 'bg-brand-600 text-white',   icon: Truck },
  completed:        { label: 'Completed',         cls: 'bg-emerald-500 text-white', icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',         cls: 'bg-red-500 text-white',     icon: XCircle },
};

export default function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const c = CONFIG[status] || { label: status, cls: 'bg-ink-400 text-white', icon: Clock };
  const Icon = c.icon;
  return (
    <span className={`badge shadow-sm ${c.cls} ${size === 'md' ? 'px-3 py-1.5 text-sm' : ''}`}>
      <Icon size={size === 'md' ? 14 : 12} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}
