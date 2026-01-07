import { Bell, User, Search } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import useUIStore from '../../store/uiStore.js'
import useThemeStore from '../../store/themeStore.js'
import { useState } from 'react'
import { motion } from 'framer-motion'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const toggleSidebar = useUIStore(state => state.toggleSidebar)
  const toggleTheme = useThemeStore(state => state.toggleTheme)
  const isDark = useThemeStore(state => state.isDark)

  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto h-20 flex items-center px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 md:hidden h-12 w-12 p-0"
            onClick={toggleSidebar}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </motion.div>

        <div className="flex flex-1 items-center justify-between space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button variant="ghost" size="sm" className="h-12 w-12 p-0">
                <Bell className="h-6 w-6" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 p-0"
                onClick={toggleTheme}
              >
                {isDark ? '☀️' : '🌙'}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button variant="ghost" size="sm" className="h-12 w-12 p-0">
                <User className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export { Header }
