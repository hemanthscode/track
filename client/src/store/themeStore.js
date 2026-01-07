import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      
      toggleTheme: () => {
        const newTheme = !get().isDark
        set({ isDark: newTheme })
        
        // Apply to document
        if (newTheme) {
          document.documentElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        } else {
          document.documentElement.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        }
      },
      
      setTheme: (theme) => {
        set({ isDark: theme === 'dark' })
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
      },
      
      initTheme: () => {
        const saved = localStorage.getItem('theme')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        const theme = saved || (systemPrefersDark ? 'dark' : 'light')
        get().setTheme(theme)
      }
    }),
    {
      name: 'theme-storage',
    }
  )
)

// Initialize theme on app load
useThemeStore.getState().initTheme()

export default useThemeStore
