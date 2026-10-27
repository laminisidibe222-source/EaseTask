import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, demoMode } = useAuth()

  // Show loading message while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <p className="text-green-700 text-lg font-medium">Checking session...</p>
      </div>
    )
  }

  // Demo mode = allow access without real login
  if (demoMode) return children

  // Real auth: redirect to login if not signed in
  if (!user) return <Navigate to="/login" replace />

  // Signed in → show dashboard
  return children
}