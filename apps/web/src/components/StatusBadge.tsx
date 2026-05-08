const CONFIG: Record<string, { label: string; cls: string }> = {
  pending:          { label: 'Pending',           cls: 'bg-yellow-100 text-yellow-800' },
  accepted:         { label: 'Accepted',           cls: 'bg-blue-100 text-blue-800' },
  en_route_pickup:  { label: 'En Route (Pickup)',  cls: 'bg-purple-100 text-purple-800' },
  picked_up:        { label: 'Picked Up',          cls: 'bg-indigo-100 text-indigo-800' },
  en_route_dropoff: { label: 'En Route (Dropoff)', cls: 'bg-orange-100 text-orange-800' },
  completed:        { label: 'Completed',          cls: 'bg-green-100 text-green-800' },
  cancelled:        { label: 'Cancelled',          cls: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
}
