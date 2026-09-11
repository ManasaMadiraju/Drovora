import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import socket from '../lib/socket';
import { useAuth } from './AuthContext';

export interface AppNotification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string; }
interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = async () => {
    if (!user) return;
    const { data } = await api.get('/notifications');
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  };

  useEffect(() => { if (user) refresh(); else { setNotifications([]); setUnreadCount(0); } }, [user]);

  useEffect(() => {
    if (!user) return;
    const onNotification = (n: AppNotification) => {
      setNotifications((prev) => [n, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
      toast(n.title, { icon: n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : '🔔' });
    };
    socket.on('notification', onNotification);
    return () => { socket.off('notification', onNotification); };
  }, [user]);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
