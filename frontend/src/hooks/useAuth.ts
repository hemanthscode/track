import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { RegisterData } from '../types/auth' // Import RegisterData

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    initialize,
  } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initialize() // Initialize on mount
  }, [initialize])

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials)
      navigate('/dashboard', { state: { message: 'Login successful!' } })
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data)
      navigate('/login', { state: { message: 'Registration successful! Please login.' } })
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { state: { message: 'Logged out successfully!' } })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  }
}