import { Outlet } from 'react-router-dom'
import { Header } from './Header.jsx'
import { Sidebar } from './Sidebar.jsx'
import useUIStore from '../../store/uiStore.js'
import useAuthStore from '../../store/authStore.js'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'

const Layout = () => {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated())

  if (!isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <motion.div 
        className={cn(
          'flex flex-col flex-1 transition-all duration-500 overflow-hidden',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>
    </div>
  )
}

export { Layout }
