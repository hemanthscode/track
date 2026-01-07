import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'

const Badge = ({ 
  variant = 'default', 
  size = 'default', 
  className, 
  children, 
  ...props 
}) => (
  <motion.div
    className={cn(
      'inline-flex items-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      {
        'bg-primary text-primary-foreground hover:bg-primary/90 border': variant === 'default',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border': variant === 'secondary',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 border': variant === 'destructive',
        'border-2 bg-muted/50 text-muted-foreground hover:bg-muted border-border': variant === 'outline',
        'text-primary bg-primary/10 hover:bg-primary/20': variant === 'ghost',
        'bg-accent text-accent-foreground hover:bg-accent/80 border': variant === 'accent',
      },
      {
        'px-3 py-1 text-xs': size === 'sm',
        'px-2.5 py-0.5 text-xs': size === 'default',
        'px-4 py-1.5 text-sm': size === 'lg',
      },
      className
    )}
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.div>
)

export { Badge }
