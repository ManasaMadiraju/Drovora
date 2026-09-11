import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

const PIN_COLORS = { customer: '#2a3bf5', driver: '#059669', return: '#ff5a36' };

function pinSvg(color: string, pulse: boolean) {
  return `
    <div style="position:relative;width:32px;height:40px;">
      ${pulse ? `<div style="position:absolute;left:50%;top:14px;width:14px;height:14px;margin-left:-7px;margin-top:-7px;border-radius:9999px;background:${color}66;animation:pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite;"></div>` : ''}
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.28));">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="16" r="6.5" fill="white"/>
      </svg>
    </div>`;
}

const makeIcon = (type: keyof typeof PIN_COLORS) => L.divIcon({
  html: pinSvg(PIN_COLORS[type], type === 'driver'),
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -38],
});

const icons = { customer: makeIcon('customer'), driver: makeIcon('driver'), return: makeIcon('return') };

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

export interface MapPoint { lat: number; lng: number; label: string; type: 'customer' | 'driver' | 'return'; }

export default function DrovoraMap({ points, center, zoom = 13, height = '300px' }: { points: MapPoint[]; center?: [number, number]; zoom?: number; height?: string }) {
  const defaultCenter: [number, number] = center || (points.length > 0 ? [points[0].lat, points[0].lng] : [37.7749, -122.4194]);
  return (
    <MapContainer center={defaultCenter} zoom={zoom} style={{ height, width: '100%' }} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {center && <Recenter lat={center[0]} lng={center[1]} />}
      {points.map((p, i) => <Marker key={i} position={[p.lat, p.lng]} icon={icons[p.type]}><Popup>{p.label}</Popup></Marker>)}
    </MapContainer>
  );
}
