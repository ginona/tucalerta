import type { Alert } from '@tucalerta/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { SEVERITY_COLORS, TUCUMAN_BOUNDS, TUCUMAN_CENTER } from '@/config/constants';
import AlertCard from './AlertCard';

// Fix para íconos de Leaflet en Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface MapProps {
  alerts: Alert[];
  onMapClick?: (lat: number, lng: number) => void;
  onVote?: (alertId: string, voteType: 'confirm' | 'reject') => void;
  selectedPosition?: [number, number] | null;
}

function createAlertIcon(alert: Alert): L.DivIcon {
  let bgColor = SEVERITY_COLORS[alert.severity];
  let borderColor = bgColor;

  if (alert.isVerified) {
    borderColor = '#22c55e'; // green
  }

  const iconType = alert.type === 'flood' ? '🌊' : '⚡';

  return L.divIcon({
    className: 'custom-alert-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${alert.isVerified ? 'box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.4), 0 2px 8px rgba(0,0,0,0.3);' : ''}
      ">
        ${iconType}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map({ alerts, onMapClick, onVote, selectedPosition }: MapProps) {
  // Filtrar alertas ocultas
  const visibleAlerts = alerts.filter((alert) => !alert.autoHidden);

  return (
    <MapContainer
      center={TUCUMAN_CENTER}
      zoom={11}
      minZoom={10}
      maxZoom={18}
      maxBounds={TUCUMAN_BOUNDS}
      maxBoundsViscosity={1.0}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onMapClick} />

      {visibleAlerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[alert.coordinates[0], alert.coordinates[1]]}
          icon={createAlertIcon(alert)}
        >
          <Popup className="alert-popup" maxWidth={320} minWidth={280}>
            <AlertCard alert={alert} onVote={onVote} />
          </Popup>
        </Marker>
      ))}

      {selectedPosition && (
        <Marker
          position={selectedPosition}
          icon={L.divIcon({
            className: 'selected-position-marker',
            html: `
              <div style="
                background-color: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                animation: pulse 1.5s infinite;
              "></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        />
      )}
    </MapContainer>
  );
}
