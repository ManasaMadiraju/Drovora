import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makeIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const icons = { customer: makeIcon('blue'), driver: makeIcon('green'), return: makeIcon('red') };

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

export interface MapPoint { lat: number; lng: number; label: string; type: 'customer' | 'driver' | 'return'; }

export default function DrovoraMap({ points, center, zoom = 13, height = '300px' }: { points: MapPoint[]; center?: [number, number]; zoom?: number; height?: string }) {
  const defaultCenter: [number, number] = center || (points.length > 0 ? [points[0].lat, points[0].lng] : [37.7749, -122.4194]);
  return (
    <MapContainer center={defaultCenter} zoom={zoom} style={{ height, width: '100%' }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {center && <Recenter lat={center[0]} lng={center[1]} />}
      {points.map((p, i) => <Marker key={i} position={[p.lat, p.lng]} icon={icons[p.type]}><Popup>{p.label}</Popup></Marker>)}
    </MapContainer>
  );
}
