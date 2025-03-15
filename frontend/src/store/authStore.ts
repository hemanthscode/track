import { create } from 'zustand'
import { User, LoginCredentials, RegisterData } from '../types/auth'
import * as authService from '../services/authService'
import axios, { AxiosError } from 'axios'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to wait for initialization
  error: null,

  initialize: () => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      }
    } catch {
      set({ error: 'Failed to initialize authentication state' })
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? ((error as AxiosError).response?.data as { message?: string })?.message || 'Login failed'
        : 'An unexpected error occurred during login'
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await authService.register(data)
      set({ isLoading: false })
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? ((error as AxiosError).response?.data as { message?: string })?.message || 'Registration failed'
        : 'An unexpected error occurred during registration'
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await authService.logout()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? ((error as AxiosError).response?.data as { message?: string })?.message || 'Logout failed'
        : 'An unexpected error occurred during logout'
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },

  clearError: () => set({ error: null }),
}))