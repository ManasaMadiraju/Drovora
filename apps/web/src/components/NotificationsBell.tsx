import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../contexts/NotificationsContext';

const DOT_COLOR: Record<string, string> = { success: 'bg-emerald-500', warning: 'bg-amber-500', info: 'bg-brand-500' };

export default function NotificationsBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-ink-100 rounded-2xl shadow-lift overflow-hidden z-50 animate-slide-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <p className="font-semibold text-sm text-ink-900">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-ink-400">
                <Inbox size={26} strokeWidth={1.5} className="mb-2" />
                <p className="text-sm">You're all caught up</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-ink-50 last:border-0 hover:bg-ink-50 transition-colors flex gap-3 ${!n.read ? 'bg-brand-50/40' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-transparent' : DOT_COLOR[n.type] || 'bg-brand-500'}`} />
                  <div className="min-w-0">
                    <p className={`text-sm ${n.read ? 'font-medium text-ink-600' : 'font-semibold text-ink-900'}`}>{n.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-ink-400 mt-1">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
