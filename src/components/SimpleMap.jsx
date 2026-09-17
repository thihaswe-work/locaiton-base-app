import { useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const COLORS = {
  available: '#ef4444',
  checkedin: '#eab308',
  checkedout: '#22c55e',
}

function getPin(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

function FlyTo({ target }) {
  const map = useMap()
  if (target) {
    map.flyTo(target, 16, { duration: 1.2 })
  }
  return null
}

export default function SimpleMap({ locations, onSelect }) {
  const [focus, setFocus] = useState(null)

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
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={getPin(COLORS[loc.status])}
          eventHandlers={{ click: () => setFocus([loc.lat, loc.lng]) }}
        >
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong>{loc.name}</strong>
              <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
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
      ))}
    </MapContainer>
  )
}
