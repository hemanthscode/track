import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setTokens: (tokens) => {
        console.log('Setting tokens:', tokens) // Debug log
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        })
      },
      
      setUser: (user) => {
        console.log('Setting user:', user) // Debug log
        set({ user })
      },
      
      login: async (credentials) => {
        try {
          // Import here to avoid circular dependency
          const { authAPI } = await import('../lib/api.js')
          const response = await authAPI.login(credentials)
          
          console.log('Login response:', response.data) // Debug log
          
          const { user, tokens } = response.data.data
          
          // Set both tokens and user
          set({ 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: user
          })
          
          return { success: true }
        } catch (error) {
          console.error('Login error:', error)
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          }
        }
      },
      
      register: async (userData) => {
        try {
          const { authAPI } = await import('../lib/api.js')
          const response = await authAPI.register(userData)
          
          const { user, tokens } = response.data.data
          
          set({ 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: user
          })
          
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          }
        }
      },
      
      logout: async () => {
        try {
          const { authAPI } = await import('../lib/api.js')
          await authAPI.logout()
        } catch (error) {
          console.error('Logout error:', error)
        }
        
        // Clear everything
        set({ user: null, accessToken: null, refreshToken: null })
      },
      
      refresh: async () => {
        try {
          const { authAPI } = await import('../lib/api.js')
          const refreshToken = get().refreshToken
          
          if (!refreshToken) {
            throw new Error('No refresh token')
          }
          
          const response = await authAPI.refresh({ refreshToken })
          const { tokens } = response.data.data
          
          set({ 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          })
          
          return true
        } catch (error) {
          console.error('Refresh error:', error)
          get().logout()
          return false
        }
      },
      
      isAuthenticated: () => {
        const state = get()
        return !!(state.accessToken && state.user)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken,
        user: state.user 
      }),
    }
  )
)

export { useAuthStore }
export default useAuthStore
