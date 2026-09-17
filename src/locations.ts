export type LocationStatus = 'available' | 'checkedin' | 'checkedout'

export interface Location {
  id: number
  name: string
  lat: number
  lng: number
  status: LocationStatus
  assignedTo?: string | null
  sessions?: number
  lastCheckIn?: number | null
  lastCheckOut?: number | null
}

export interface User {
  id: string
  name: string
  color: string
}

export interface ActivityEntry {
  id: string
  name: string
  user?: string
  type: 'Check In' | 'Check Out'
  time: string
  lat: string
  lng: string
}

export const statusColors: Record<LocationStatus, string> = {
  available: '#ef4444',
  checkedin: '#eab308',
  checkedout: '#22c55e',
}

export const statusLabels: Record<LocationStatus, string> = {
  available: 'Available',
  checkedin: 'Checked In',
  checkedout: 'Checked Out',
}

export const USER_COLORS: string[] = [
  '#2563eb',
  '#db2777',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
]

export const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Aung Aung', color: '#2563eb' },
  { id: 'u2', name: 'Su Su', color: '#db2777' },
  { id: 'u3', name: 'Kyaw Kyaw', color: '#059669' },
]

export const YANGON_LOCATIONS: Location[] = [
  { id: 1, name: 'Shwedagon Pagoda', lat: 16.7983, lng: 96.1499, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 2, name: 'Sule Pagoda', lat: 16.7746, lng: 96.1587, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 3, name: 'Bogyoke Aung San Market', lat: 16.7847, lng: 96.1569, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 4, name: 'Yangon City Hall', lat: 16.7747, lng: 96.1587, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 5, name: 'Kandawgyi Lake', lat: 16.7973, lng: 96.1633, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 6, name: 'Inya Lake', lat: 16.8353, lng: 96.1334, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 7, name: 'Chaukhtatgyi Paya', lat: 16.813, lng: 96.1682, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 8, name: 'Yangon University', lat: 16.8236, lng: 96.1377, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 9, name: 'Maha Bandula Park', lat: 16.7725, lng: 96.1623, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 10, name: 'St. Mary’s Cathedral', lat: 16.7786, lng: 96.1781, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 11, name: 'National Museum', lat: 16.7809, lng: 96.1515, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 12, name: 'Thingangyun Township', lat: 16.7913, lng: 96.1883, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 13, name: 'Hledan Centre', lat: 16.8142, lng: 96.1515, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 14, name: 'Nyaungdon', lat: 16.7667, lng: 96.7833, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 15, name: 'Dala Township', lat: 16.7079, lng: 96.1323, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 16, name: 'Kyaikasan Race Course', lat: 16.7939, lng: 96.1842, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 17, name: 'People’s Park', lat: 16.7942, lng: 96.1492, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 18, name: 'Tatmadaw Market', lat: 16.7714, lng: 96.1464, status: 'available', assignedTo: null, sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 19, name: 'Sanchaung Township', lat: 16.797, lng: 96.143, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 20, name: 'Botataung Pagoda', lat: 16.7663, lng: 96.1771, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 21, name: 'Yangon River', lat: 16.7718, lng: 96.1536, status: 'available', assignedTo: null, sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 22, name: 'Seikkantha (Yangon)', lat: 16.7806, lng: 96.1748, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 23, name: 'Kabar Aye Pagoda', lat: 16.8244, lng: 96.1669, status: 'available', assignedTo: 'u2', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 24, name: 'Mingalardon', lat: 16.9026, lng: 96.1261, status: 'available', assignedTo: 'u3', sessions: 0, lastCheckIn: null, lastCheckOut: null },
  { id: 25, name: 'Thuwanna Stadium', lat: 16.8019, lng: 96.1767, status: 'available', assignedTo: 'u1', sessions: 0, lastCheckIn: null, lastCheckOut: null },
]
