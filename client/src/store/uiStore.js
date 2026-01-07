import { create } from 'zustand'
import useThemeStore from './themeStore.js'

export const useUIStore = create((set, get) => ({
  isSidebarOpen: false,
  activePage: '/dashboard',
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  setActivePage: (page) => set({ activePage: page }),
  
  // Modal states
  modals: {
    transaction: false,
    budget: false,
    receipt: false,
  },
  
  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),
  
  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),
  
  // Theme proxy
  toggleTheme: () => useThemeStore.getState().toggleTheme(),
  isDark: () => useThemeStore.getState().isDark,
}))

export default useUIStore
