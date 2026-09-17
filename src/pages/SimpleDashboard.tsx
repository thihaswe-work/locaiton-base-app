import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import SimpleMap from '../components/SimpleMap'
import {
  statusLabels,
  statusColors,
  YANGON_LOCATIONS,
} from '../locations'
import type { ActivityEntry, Location, LocationStatus } from '../locations'

export default function SimpleDashboard() {
  const [locations, setLocations] = useState<Location[]>(YANGON_LOCATIONS)
  const [selected, setSelected] = useState<Location | null>(null)
  const [log, setLog] = useState<ActivityEntry[]>([])
  const [newName, setNewName] = useState('')
  const [newLat, setNewLat] = useState('')
  const [newLng, setNewLng] = useState('')
  const [formError, setFormError] = useState('')

  const updateStatus = (id: number, status: LocationStatus) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, status } : loc)),
    )
  }

  const handleAddLocation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = newName.trim()
    const lat = Number(newLat)
    const lng = Number(newLng)

    if (!name) {
      setFormError('Please enter a location name.')
      return
    }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be a number between -90 and 90.')
      return
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setFormError('Longitude must be a number between -180 and 180.')
      return
    }

    const newLoc: Location = { id: Date.now(), name, lat, lng, status: 'available' }
    setLocations((prev) => [...prev, newLoc])
    setSelected(newLoc)
    setNewName('')
    setNewLat('')
    setNewLng('')
    setFormError('')
  }

  const handleCheckIn = (loc: Location) => {
    if (loc.status === 'checkedin') return
    updateStatus(loc.id, 'checkedin')
    setLog((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: loc.name,
        type: 'Check In',
        time: new Date().toLocaleTimeString(),
        lat: loc.lat.toFixed(4),
        lng: loc.lng.toFixed(4),
      },
      ...prev,
    ])
  }

  const handleCheckOut = (loc: Location) => {
    if (loc.status !== 'checkedin') return
    updateStatus(loc.id, 'checkedout')
    setLog((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: loc.name,
        type: 'Check Out',
        time: new Date().toLocaleTimeString(),
        lat: loc.lat.toFixed(4),
        lng: loc.lng.toFixed(4),
      },
      ...prev,
    ])
  }

  const selectedLoc =
    locations.find((l) => selected && l.id === selected.id) ?? null

  return (
    <div className="app-shell">
      <div className="container">
        <div className="dashboard">
          <aside className="sidebar">
            <div className="sidebar-header">
              <h1>Yangon Locations</h1>
              <p className="subtitle">
                {locations.length} locations · simple dashboard
              </p>
              <Link className="nav-link" to="/team">
                Team view →
              </Link>
            </div>

            <div className="legend">
              <div className="legend-item">
                <span className="dot" style={{ background: statusColors.available }} />
                Available
              </div>
              <div className="legend-item">
                <span className="dot" style={{ background: statusColors.checkedin }} />
                Checked In
              </div>
              <div className="legend-item">
                <span className="dot" style={{ background: statusColors.checkedout }} />
                Checked Out
              </div>
            </div>

            <div className="stats">
              <div className="stat-card">
                <span className="stat-value">
                  {locations.filter((l) => l.status === 'available').length}
                </span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {locations.filter((l) => l.status === 'checkedin').length}
                </span>
                <span className="stat-label">Checked In</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {locations.filter((l) => l.status === 'checkedout').length}
                </span>
                <span className="stat-label">Checked Out</span>
              </div>
            </div>

            <div className="add-location">
              <h2>Add Location</h2>
              <form onSubmit={handleAddLocation}>
                <input
                  type="text"
                  placeholder="Location name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <div className="form-row">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                  />
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <button type="submit" className="btn btn-add">
                  Add Location
                </button>
              </form>
            </div>

            <div className="location-list">
              <h2>Location Dots</h2>
              <ul>
                {locations.map((loc) => (
                  <li key={loc.id}>
                    <button
                      className={`loc-row ${
                        selectedLoc && selectedLoc.id === loc.id ? 'active' : ''
                      }`}
                      onClick={() => setSelected(loc)}
                    >
                      <span
                        className="dot"
                        style={{ background: statusColors[loc.status] }}
                      />
                      <span className="loc-name">{loc.name}</span>
                      <span className="loc-coord">
                        {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="main">
            <div className="map-wrap">
              <SimpleMap locations={locations} onSelect={setSelected} />
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Location Controls</h2>
                {selectedLoc && (
                  <span
                    className="status-badge"
                    style={{ background: statusColors[selectedLoc.status] }}
                  >
                    {statusLabels[selectedLoc.status]}
                  </span>
                )}
              </div>

              {selectedLoc ? (
                <div className="controls">
                  <div className="loc-card">
                    <div className="loc-title">
                      <span
                        className="dot large"
                        style={{ background: statusColors[selectedLoc.status] }}
                      />
                      <div>
                        <strong>{selectedLoc.name}</strong>
                        <div className="loc-coord">
                          Lat: {selectedLoc.lat.toFixed(4)}, Lng:{' '}
                          {selectedLoc.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div className="button-row">
                      <button
                        className="btn btn-checkin"
                        disabled={selectedLoc.status === 'checkedin'}
                        onClick={() => handleCheckIn(selectedLoc)}
                      >
                        Check In
                      </button>
                      <button
                        className="btn btn-checkout"
                        disabled={selectedLoc.status !== 'checkedin'}
                        onClick={() => handleCheckOut(selectedLoc)}
                      >
                        Check Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="hint">
                  Click a location in the sidebar or on the map to manage
                  check-in / check-out.
                </p>
              )}

              <div className="log">
                <h3>Activity Log</h3>
                {log.length === 0 ? (
                  <p className="hint">No activity yet.</p>
                ) : (
                  <ul>
                    {log.map((entry) => (
                      <li key={entry.id}>
                        <span
                          className={`log-tag ${
                            entry.type === 'Check In' ? 'in' : 'out'
                          }`}
                        >
                          {entry.type}
                        </span>
                        <span>{entry.name}</span>
                        <span className="log-coord">
                          {entry.lat}, {entry.lng}
                        </span>
                        <span className="log-time">{entry.time}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
