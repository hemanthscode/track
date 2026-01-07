import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  Receipt, 
  MessageSquare, 
  BarChart3, 
  Settings 
} from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import useUIStore from '../../store/uiStore.js'
import { motion } from 'framer-motion'

const Navbar = () => {
  const setActivePage = useUIStore(state => state.setActivePage)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/budgets', label: 'Budgets', icon: PiggyBank },
    { href: '/receipts', label: 'Receipts', icon: Receipt },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/ai', label: 'AI', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: Settings },
  ]

  return (
    <motion.nav 
      className="border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0 z-30 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center">
          <div className="flex items-center gap-2">
            {navItems.map((item, idx) => (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-14 px-6 flex items-center gap-3 text-base font-semibold rounded-2xl group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => setActivePage(item.href)}
                >
                  <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export { Navbar }
