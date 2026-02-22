import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Archive } from './pages/Archive'
import { Auth } from './pages/Auth'
import { ErrorBoundary } from './components/common/ErrorBoundary'
// Supabase инициализируется автоматически при первом использовании через getSupabaseInstance()

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('is_authenticated') === 'true'
    if (!isAuthenticated) {
      navigate('/auth')
    }
  }, [navigate])

  const isAuthenticated = localStorage.getItem('is_authenticated') === 'true'
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive"
            element={
              <ProtectedRoute>
                <Archive />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
