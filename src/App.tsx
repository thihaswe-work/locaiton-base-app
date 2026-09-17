import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import SimpleDashboard from './pages/SimpleDashboard'
import TeamDashboard from './pages/TeamDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleDashboard />} />
        <Route path="/team" element={<TeamDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
