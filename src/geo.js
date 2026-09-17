export const GEOFENCE_RADIUS_M = 10

const EARTH_RADIUS_M = 6371000

const toRad = (deg) => (deg * Math.PI) / 180

export function distanceMeters(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function offsetMeters(base, northM, eastM) {
  const dLat = northM / 111320
  const dLng = eastM / (111320 * Math.cos(toRad(base.lat)))
  return { lat: base.lat + dLat, lng: base.lng + dLng }
}

export function randomNearby(base, minM, maxM) {
  const angle = Math.random() * Math.PI * 2
  const dist = minM + Math.random() * (maxM - minM)
  return offsetMeters(base, Math.cos(angle) * dist, Math.sin(angle) * dist)
}
