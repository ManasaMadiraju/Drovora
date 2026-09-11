import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export default function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center mb-4">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <p className="font-semibold text-ink-800">{title}</p>
      {description && <p className="text-sm text-ink-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
