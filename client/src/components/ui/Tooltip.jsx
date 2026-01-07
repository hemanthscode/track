import { forwardRef } from 'react'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'
import { Info, AlertCircle } from 'lucide-react'

const Tooltip = forwardRef(({ 
  children, 
  content, 
  side = 'top',
  className,
  ...props 
}, ref) => (
  <div className="group relative inline-block" ref={ref}>
    {children}
    <motion.div
      className={cn(
        'absolute z-50 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl border backdrop-blur-xl bg-popover/95 border-border/50 pointer-events-none',
        {
          'top-12 left-1/2 -translate-x-1/2': side === 'top',
          'bottom-12 left-1/2 -translate-x-1/2': side === 'bottom',
          'left-12 top-1/2 -translate-y-1/2': side === 'left',
          'right-12 top-1/2 -translate-y-1/2': side === 'right',
        },
        className
      )}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { duration: 0.2 }
      }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {content}
    </motion.div>
  </div>
))

Tooltip.Icon = ({ variant = 'info', children, className }) => (
  <motion.div 
    className={cn("p-2 rounded-2xl bg-accent/20 border-2 border-accent/30 cursor-help group-hover:bg-accent/40 transition-all duration-200", className)}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    {variant === 'info' && <Info className="h-5 w-5 text-accent-foreground" />}
    {variant === 'warning' && <AlertCircle className="h-5 w-5 text-destructive" />}
    {children}
  </motion.div>
)

Tooltip.displayName = 'Tooltip'

export { Tooltip }
