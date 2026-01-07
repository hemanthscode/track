import { forwardRef } from 'react'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'

const Button = forwardRef(({
  variant = 'default',
  size = 'default',
  icon: Icon,
  loading = false,
  className,
  children,
  ...props
}, ref) => (
  <motion.button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-xl font-semibold shadow-md ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-primary/25': variant === 'default',
        'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-secondary/25': variant === 'secondary',
        'bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:shadow-destructive/25': variant === 'destructive',
        'border-2 border-input bg-gradient-to-r from-background/80 to-accent/30 hover:border-ring hover:shadow-md': variant === 'outline',
        'text-primary hover:text-primary/80 hover:bg-accent/20 backdrop-blur-sm': variant === 'ghost',
        'bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:shadow-accent/25': variant === 'accent',
      },
      {
        'h-12 px-8 text-base': size === 'lg',
        'h-10 px-6 text-sm': size === 'default',
        'h-9 px-4 text-xs': size === 'sm',
      },
      className
    )}
    initial={{ scale: 1 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={loading}
    {...props}
  >
    {loading ? (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ) : Icon ? <Icon className="mr-2 h-4 w-4 flex-shrink-0" /> : null}
    {children}
  </motion.button>
))

Button.displayName = 'Button'

export { Button }
