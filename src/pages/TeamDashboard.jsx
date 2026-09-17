import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LocationMap from '../components/LocationMap'
import UserList from '../components/UserList'
import LiveTracker from '../components/LiveTracker'
import {
  statusLabels,
  statusColors,
  YANGON_LOCATIONS,
  DEFAULT_USERS,
  USER_COLORS,
} from '../locations'
import { load, save } from '../storage'
import {
  GEOFENCE_RADIUS_M,
  distanceMeters,
  offsetMeters,
  randomNearby,
} from '../geo'

const LOCATIONS_KEY = 'yangon-dashboard-v2-locations'
const USERS_KEY = 'yangon-dashboard-v2-users'
const POSITIONS_KEY = 'yangon-dashboard-v2-positions'

export default function TeamDashboard() {
  const [locations, setLocations] = useState(() =>
    load(LOCATIONS_KEY, YANGON_LOCATIONS),
  )
  const [users, setUsers] = useState(() => load(USERS_KEY, DEFAULT_USERS))
  const [selectedUserId, setSelectedUserId] = useState('all')
  const [selected, setSelected] = useState(null)
  const [log, setLog] = useState([])
  const [now, setNow] = useState(() => Date.now())
  const [actionError, setActionError] = useState('')
  const [userPositions, setUserPositions] = useState(() => {
    const stored = load(POSITIONS_KEY, null)
    if (stored && Object.keys(stored).length) return stored
    const init = {}
    users.forEach((user) => {
      const first = locations.find((l) => l.assignedTo === user.id)
      if (first) init[user.id] = randomNearby(first, 120, 400)
    })
    return init
  })

  const [newName, setNewName] = useState('')
  const [newLat, setNewLat] = useState('')
  const [newLng, setNewLng] = useState('')
  const [formError, setFormError] = useState('')
  const [newUserName, setNewUserName] = useState('')

  useEffect(() => save(LOCATIONS_KEY, locations), [locations])
  useEffect(() => save(USERS_KEY, users), [users])
  useEffect(() => save(POSITIONS_KEY, userPositions), [userPositions])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const selectedUser = users.find((u) => u.id === selectedUserId) || null

  const visibleLocations = useMemo(
    () =>
      selectedUserId === 'all'
        ? locations
        : locations.filter((l) => l.assignedTo === selectedUserId),
    [locations, selectedUserId],
  )

  const selectedLoc = locations.find((l) => selected && l.id === selected.id)

  const selectedAssigner = selectedLoc
    ? users.find((u) => u.id === selectedLoc.assignedTo) || null
    : null
  const selectedAssignerPos = selectedAssigner
    ? userPositions[selectedAssigner.id]
    : null
  const selectedDist =
    selectedAssignerPos && selectedLoc
      ? distanceMeters(selectedAssignerPos, selectedLoc)
      : null
  const selectedInRange =
    selectedDist == null || selectedDist <= GEOFENCE_RADIUS_M

  const countBy = (list, status) =>
    list.filter((l) => l.status === status).length

  const updateLocation = (id, patch) =>
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    )

  const pushLog = (loc, type) => {
    const assignee = users.find((u) => u.id === loc.assignedTo)
    setLog((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: loc.name,
        user: assignee ? assignee.name : 'Unassigned',
        type,
        time: new Date().toLocaleTimeString(),
        lat: loc.lat.toFixed(4),
        lng: loc.lng.toFixed(4),
      },
      ...prev,
    ])
  }

  const handleCheckIn = (loc) => {
    if (loc.status === 'checkedin') return
    const assignee = users.find((u) => u.id === loc.assignedTo)
    if (assignee) {
      const pos = userPositions[assignee.id]
      const dist = pos ? distanceMeters(pos, loc) : null
      if (dist != null && dist > GEOFENCE_RADIUS_M) {
        setActionError(
          `${assignee.name} is ${Math.round(dist)} m away. Move within ${GEOFENCE_RADIUS_M} m to check in.`,
        )
        return
      }
    }
    setActionError('')
    updateLocation(loc.id, {
      status: 'checkedin',
      sessions: (loc.sessions || 0) + 1,
      lastCheckIn: Date.now(),
    })
    pushLog(loc, 'Check In')
  }

  const handleCheckOut = (loc) => {
    if (loc.status !== 'checkedin') return
    updateLocation(loc.id, { status: 'checkedout', lastCheckOut: Date.now() })
    pushLog(loc, 'Check Out')
  }

  const handleAssign = (id, userId) => {
    updateLocation(id, {
      assignedTo: userId || null,
      status: 'available',
      lastCheckIn: null,
      lastCheckOut: null,
    })
  }

  const travelTo = (userId, loc) => {
    if (!userId || !loc) return
    setUserPositions((prev) => ({
      ...prev,
      [userId]: offsetMeters({ lat: loc.lat, lng: loc.lng }, 5, 0),
    }))
    setActionError('')
  }

  const moveAway = (userId) => {
    setUserPositions((prev) => {
      const base = prev[userId]
      if (!base) return prev
      return { ...prev, [userId]: randomNearby(base, 150, 600) }
    })
    setActionError('')
  }

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId)
    setSelected(null)
  }

  const handleAddUser = (e) => {
    e.preventDefault()
    const name = newUserName.trim()
    if (!name) return
    const user = {
      id: `u-${Date.now()}`,
      name,
      color: USER_COLORS[users.length % USER_COLORS.length],
    }
    setUsers((prev) => [...prev, user])
    setUserPositions((prev) => ({
      ...prev,
      [user.id]: randomNearby({ lat: 16.8409, lng: 96.1735 }, 800, 3000),
    }))
    setNewUserName('')
    handleSelectUser(user.id)
  }

  const handleRemoveUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setUserPositions((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
    setLocations((prev) =>
      prev.map((l) =>
        l.assignedTo === userId
          ? { ...l, assignedTo: null, status: 'available' }
          : l,
      ),
    )
    if (selectedUserId === userId) handleSelectUser('all')
  }

  const handleAddLocation = (e) => {
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

    const newLoc = {
      id: Date.now(),
      name,
      lat,
      lng,
      status: 'available',
      assignedTo: selectedUserId === 'all' ? null : selectedUserId,
      sessions: 0,
      lastCheckIn: null,
      lastCheckOut: null,
    }
    setLocations((prev) => [...prev, newLoc])
    setSelected(newLoc)
    setNewName('')
    setNewLat('')
    setNewLng('')
    setFormError('')
  }

  const listTitle =
    selectedUserId === 'all'
      ? 'All Locations'
      : `${selectedUser ? selectedUser.name : ''}’s Places`

  return (
    <div className="app-shell">
      <div className="container">
        <div className="dashboard">
          <aside className="sidebar sidebar-team">
            <div className="sidebar-header">
              <h1>Yangon Locations</h1>
              <p className="subtitle">
                {locations.length} locations · team dashboard
              </p>
              <Link className="nav-link" to="/">
                ← Original view
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
                  {countBy(visibleLocations, 'available')}
                </span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {countBy(visibleLocations, 'checkedin')}
                </span>
                <span className="stat-label">Checked In</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {countBy(visibleLocations, 'checkedout')}
                </span>
                <span className="stat-label">Checked Out</span>
              </div>
            </div>

            <UserList
              users={users}
              locations={locations}
              selectedUserId={selectedUserId}
              onSelect={handleSelectUser}
              onRemove={handleRemoveUser}
              onAddUser={handleAddUser}
              newUserName={newUserName}
              setNewUserName={setNewUserName}
            />

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
              <h2>{listTitle}</h2>
              {visibleLocations.length === 0 ? (
                <p className="hint">No places assigned to this user yet.</p>
              ) : (
                <ul>
                  {visibleLocations.map((loc) => {
                    const assignee = users.find((u) => u.id === loc.assignedTo)
                    return (
                      <li key={loc.id}>
                        <button
                          className={`loc-row ${
                            selectedLoc && selectedLoc.id === loc.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => setSelected(loc)}
                        >
                          <span
                            className="dot"
                            style={{ background: statusColors[loc.status] }}
                          />
                          <span className="loc-name">{loc.name}</span>
                          {assignee && (
                            <span
                              className="row-avatar"
                              style={{ background: assignee.color }}
                              title={assignee.name}
                            >
                              {assignee.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="loc-coord">
                            {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>

          <main className="main">
            <div className="map-wrap">
              <LocationMap
                locations={visibleLocations}
                users={users}
                onSelect={setSelected}
                activeLocation={selectedLoc}
                userPosition={
                  selectedUser ? userPositions[selectedUser.id] : null
                }
                userColor={selectedUser ? selectedUser.color : '#2563eb'}
                geofenceRadius={GEOFENCE_RADIUS_M}
              />
            </div>

            <div className="panel">
              <div className="panel-grid">
                <section>
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

                        <label className="assign">
                          Assign to
                          <select
                            value={selectedLoc.assignedTo || ''}
                            onChange={(e) =>
                              handleAssign(selectedLoc.id, e.target.value)
                            }
                          >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div
                          className={`geo-line ${selectedInRange ? 'ok' : 'far'}`}
                        >
                          <span className="geo-dot" />
                          {selectedAssigner ? (
                            selectedInRange ? (
                              <span>
                                {selectedAssigner.name} is in range (
                                {Math.round(selectedDist)} m)
                              </span>
                            ) : (
                              <span>
                                {selectedAssigner.name} is{' '}
                                {Math.round(selectedDist)} m away — needs to be
                                within {GEOFENCE_RADIUS_M} m
                              </span>
                            )
                          ) : (
                            <span>Unassigned — no geofence required</span>
                          )}
                          {selectedAssigner && !selectedInRange && (
                            <button
                              className="mini go"
                              onClick={() =>
                                travelTo(selectedAssigner.id, selectedLoc)
                              }
                            >
                              Move here
                            </button>
                          )}
                        </div>

                        <div className="button-row">
                          <button
                            className="btn btn-checkin"
                            disabled={
                              selectedLoc.status === 'checkedin' ||
                              (selectedAssigner && !selectedInRange)
                            }
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

                        {actionError && (
                          <p className="action-error">{actionError}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="hint">
                      Click a location in the sidebar or on the map to manage
                      check-in / check-out and assignment.
                    </p>
                  )}
                </section>

                <section className="tracker-col">
                  <LiveTracker
                    user={selectedUser}
                    locations={locations}
                    now={now}
                    position={
                      selectedUser ? userPositions[selectedUser.id] : null
                    }
                    geofenceRadius={GEOFENCE_RADIUS_M}
                    onSelect={setSelected}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    onTravel={travelTo}
                    onMoveAway={moveAway}
                  />
                </section>
              </div>

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
                        <span className="log-user">{entry.user}</span>
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
