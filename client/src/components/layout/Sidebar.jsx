import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  Receipt, 
  MessageSquare, 
  User, 
  Calendar,
  ReceiptText,
  BarChart3,
  MessageCircle,
  History
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useUIStore from '../../store/uiStore.js'
import { cn } from '../../lib/cn.js'

const navItems = [
  // 🏠 MAIN FEATURES (Top Priority)
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/recurring', label: 'Recurring', icon: Calendar },
  
  // 📊 ANALYTICS SECTION
  { 
    href: '/analytics', 
    label: 'Analytics', 
    icon: ReceiptText,
    children: [
      { href: '/dashboard/analytics', label: 'Overview', icon: BarChart3 },
      { href: '/dashboard/trends', label: 'Trends', icon: BarChart3 },
    ]
  },

  // 💰 RECEIPTS & DOCS
  { href: '/receipts', label: 'Receipts', icon: Receipt },

  // 🤖 AI FEATURES
  { 
    href: '/ai', 
    label: 'AI Assistant', 
    icon: MessageSquare,
    children: [
      { href: '/ai/chat', label: 'Chat', icon: MessageCircle },
      { href: '/ai/insights', label: 'Insights', icon: BarChart3 },
    ]
  },

  // 👤 USER SECTION (Bottom)
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: User,
    children: [
      { href: '/profile/login-history', label: 'Login History', icon: History },
    ]
  },
]

const Sidebar = () => {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen)
  const setSidebarOpen = useUIStore(state => state.setSidebarOpen)
  const activePage = useUIStore(state => state.activePage)

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden',
          isSidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Slim Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-screen w-60 border-r bg-background/95 backdrop-blur-xl shadow-lg md:static md:w-56 lg:w-64',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="h-full flex flex-col p-5 gap-1">
          {/* Logo */}
          <div className="flex items-center gap-3 pb-6 border-b border-border/40 mb-6 py-1">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-md shrink-0">
              <span className="text-xl font-black text-primary-foreground">$</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground truncate">Track</h1>
              <p className="text-xs text-muted-foreground font-medium">Expense Manager</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                {/* Main Nav Item */}
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden',
                    isActive || activePage === item.href
                      ? 'bg-gradient-to-r from-primary/90 to-accent text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.01]'
                      : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground hover:shadow-sm'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    'h-4 w-4 mr-3 flex-shrink-0 transition-all duration-200',
                    'group-hover:scale-110 group-hover:rotate-3'
                  )} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </NavLink>

                {/* Sub Items (if any) */}
                {item.children && (
                  <div className="ml-8 mt-1 space-y-0.5">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        className={({ isActive }) => cn(
                          'group flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 pl-2 border-l-2 border-transparent hover:border-accent/50',
                          isActive || activePage === child.href
                            ? 'bg-accent/20 text-accent-foreground border-accent shadow-sm hover:shadow-md'
                            : 'text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <child.icon className="h-3.5 w-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export { Sidebar }
