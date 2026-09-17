import { statusColors, statusLabels } from '../locations'
import { distanceMeters } from '../geo'
import type { Location, User } from '../locations'
import type { Position } from '../geo'

function relTime(ts: number | null | undefined, now: number): string {
  if (!ts) return '—'
  const seconds = Math.max(0, Math.floor((now - ts) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface LiveTrackerProps {
  user: User | null
  locations: Location[]
  now: number
  position: Position | null
  geofenceRadius: number
  onSelect: (loc: Location) => void
  onCheckIn: (loc: Location) => void
  onCheckOut: (loc: Location) => void
  onTravel: (userId: string, loc: Location) => void
  onMoveAway: (userId: string) => void
}

export default function LiveTracker({
  user,
  locations,
  now,
  position,
  geofenceRadius,
  onSelect,
  onCheckIn,
  onCheckOut,
  onTravel,
  onMoveAway,
}: LiveTrackerProps) {
  if (!user) {
    return (
      <div className="tracker">
        <div className="tracker-head">
          <h3>Live Tracker</h3>
        </div>
        <p className="hint">
          Select a team member to see their assigned places, live position and
          check-in status.
        </p>
      </div>
    )
  }

  const assigned = locations.filter((l) => l.assignedTo === user.id)
  const onSite = assigned.filter((l) => l.status === 'checkedin').length

  return (
    <div className="tracker">
      <div className="tracker-head">
        <h3>Live Tracker</h3>
        <span className="live-badge">
          <span className="live-dot" />
          LIVE
        </span>
      </div>

      <div className="tracker-user">
        <span className="avatar" style={{ background: user.color }}>
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="tracker-user-info">
          <strong>{user.name}</strong>
          <div className="tracker-meta">
            {assigned.length} assigned · {onSite} on site
            {position
              ? ` · ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
              : ''}
          </div>
        </div>
        <button
          className="mini wander"
          title="Simulate the member walking away"
          onClick={() => onMoveAway(user.id)}
        >
          Wander
        </button>
      </div>

      {assigned.length === 0 ? (
        <p className="hint">
          No places assigned yet. Assign places from the map or location list.
        </p>
      ) : (
        <ul className="tracker-list">
          {assigned.map((loc) => {
            const dist = position ? distanceMeters(position, loc) : null
            const inRange = dist == null || dist <= geofenceRadius
            return (
              <li key={loc.id}>
                <div className="tracker-line">
                  <span
                    className="dot"
                    style={{ background: statusColors[loc.status] }}
                  />
                  <button
                    className="tracker-name"
                    onClick={() => onSelect(loc)}
                  >
                    {loc.name}
                  </button>
                  <span className={`tracker-status s-${loc.status}`}>
                    {statusLabels[loc.status]}
                  </span>
                  <span className="tracker-time">
                    {loc.status === 'checkedin'
                      ? relTime(loc.lastCheckIn, now)
                      : loc.status === 'checkedout'
                        ? relTime(loc.lastCheckOut, now)
                        : '—'}
                  </span>
                </div>
                <div className="tracker-line">
                  {dist != null ? (
                    <span className={`geo-badge ${inRange ? 'ok' : 'far'}`}>
                      {inRange
                        ? `In range · ${Math.round(dist)} m`
                        : `${Math.round(dist)} m away`}
                    </span>
                  ) : (
                    <span className="geo-badge">No position</span>
                  )}
                  <span className="tracker-actions">
                    <button
                      className="mini in"
                      disabled={loc.status === 'checkedin' || !inRange}
                      onClick={() => onCheckIn(loc)}
                    >
                      In
                    </button>
                    <button
                      className="mini out"
                      disabled={loc.status !== 'checkedin'}
                      onClick={() => onCheckOut(loc)}
                    >
                      Out
                    </button>
                    {!inRange && (
                      <button
                        className="mini go"
                        onClick={() => onTravel(user.id, loc)}
                      >
                        Go
                      </button>
                    )}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
