import { useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Location, LocationStatus, User } from '../locations'
import type { Position } from '../geo'

const COLORS: Record<LocationStatus, string> = {
  available: '#ef4444',
  checkedin: '#eab308',
  checkedout: '#22c55e',
}

function getPin(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  if (target) {
    map.flyTo(target, 18, { duration: 1.2 })
  }
  return null
}

interface LocationMapProps {
  locations: Location[]
  users?: User[]
  onSelect: (loc: Location) => void
  activeLocation?: Location | null
  userPosition?: Position | null
  userColor?: string
  geofenceRadius?: number
}

export default function LocationMap({
  locations,
  users = [],
  onSelect,
  activeLocation = null,
  userPosition = null,
  userColor = '#2563eb',
  geofenceRadius = 10,
}: LocationMapProps) {
  const [focus, setFocus] = useState<[number, number] | null>(null)

  return (
    <MapContainer
      center={[16.8409, 96.1735]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo target={focus} />

      {activeLocation && (
        <Circle
          center={[activeLocation.lat, activeLocation.lng]}
          radius={geofenceRadius}
          pathOptions={{
            color: '#2563eb',
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.15,
          }}
        />
      )}

      {userPosition && (
        <CircleMarker
          center={[userPosition.lat, userPosition.lng]}
          radius={8}
          pathOptions={{
            color: '#fff',
            weight: 3,
            fillColor: userColor,
            fillOpacity: 1,
          }}
        >
          <Popup>Simulated team position</Popup>
        </CircleMarker>
      )}

      {locations.map((loc) => {
        const assignee = users.find((u) => u.id === loc.assignedTo)
        return (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={getPin(COLORS[loc.status])}
            eventHandlers={{ click: () => setFocus([loc.lat, loc.lng]) }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{loc.name}</strong>
                <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Assigned:{' '}
                  {assignee ? (
                    <b style={{ color: assignee.color }}>{assignee.name}</b>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>Unassigned</span>
                  )}
                </div>
                <button
                  onClick={() => onSelect(loc)}
                  style={{
                    marginTop: 8,
                    padding: '4px 10px',
                    border: '1px solid #2563eb',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Manage
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
