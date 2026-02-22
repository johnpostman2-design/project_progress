import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PasswordAuth } from '../components/auth/PasswordAuth'
import './Auth.css'

// Simple password storage in localStorage (for MVP)
// In production, this should be handled server-side
const APP_PASSWORD_KEY = 'app_password'
const DEFAULT_PASSWORD = 'admin' // Should be changed in production

export const Auth: React.FC = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const stored = localStorage.getItem('is_authenticated')
    if (stored === 'true') {
      setIsAuthenticated(true)
      navigate('/dashboard')
    }
  }, [navigate])

  const handleAuthenticate = (password: string): boolean => {
    // Get stored password or use default
    const storedPassword = localStorage.getItem(APP_PASSWORD_KEY) || DEFAULT_PASSWORD

    if (password === storedPassword) {
      localStorage.setItem('is_authenticated', 'true')
      setIsAuthenticated(true)
      navigate('/dashboard')
      return true
    }
    return false
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="auth-page" data-name="enter-password" data-node-id="284:3691">
      <p className="auth-page-title" data-node-id="284:3779">
        Прогресс проектов
      </p>
      <PasswordAuth onAuthenticate={handleAuthenticate} />
    </div>
  )
}
