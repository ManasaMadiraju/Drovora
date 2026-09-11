import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

interface DriverLocationContextType { isOnline: boolean; toggleOnline: () => Promise<void>; }
const DriverLocationContext = createContext<DriverLocationContextType | null>(null);

// Mounted once at the app root so location broadcasting survives navigation between driver pages,
// instead of stopping whenever DriverDashboard unmounts.
export function DriverLocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'driver') { setIsOnline(false); return; }
    api.get('/drivers/me/location').then(({ data }) => setIsOnline(!!data.location?.isOnline)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'driver' || !isOnline) return;
    const sendPosition = (lat: number, lng: number, heading?: number | null) =>
      api.put('/drivers/me/location', { lat, lng, heading: heading ?? undefined }).catch(() => {});
    const simulate = () => sendPosition(37.7749 + (Math.random() - 0.5) * 0.01, -122.4194 + (Math.random() - 0.5) * 0.01);

    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => sendPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.heading),
        simulate,
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      simulate();
    }
    const interval = setInterval(() => { if (!navigator.geolocation) simulate(); }, 15000);
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      clearInterval(interval);
    };
  }, [user, isOnline]);

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    await api.patch('/drivers/me/online', { isOnline: next });
  };

  return <DriverLocationContext.Provider value={{ isOnline, toggleOnline }}>{children}</DriverLocationContext.Provider>;
}

export function useDriverLocation() {
  const ctx = useContext(DriverLocationContext);
  if (!ctx) throw new Error('useDriverLocation must be used within DriverLocationProvider');
  return ctx;
}
