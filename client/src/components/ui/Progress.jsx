import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'

const Progress = ({ 
  value = 0, 
  max = 100, 
  color = 'primary',
  label,
  className, 
  ...props 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex justify-between text-sm font-semibold text-foreground">
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <motion.div
        className={cn(
          'relative h-6 w-full overflow-hidden rounded-2xl bg-muted/40 shadow-inner',
          className
        )}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: percentage / 100 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.div
          className={cn(
            'absolute inset-0 h-full rounded-2xl shadow-lg',
            {
              'bg-gradient-to-r from-primary to-primary/80': color === 'primary',
              'bg-gradient-to-r from-accent to-accent/80': color === 'accent',
              'bg-gradient-to-r from-success to-success/80': color === 'success',
              'bg-gradient-to-r from-destructive to-destructive/80': color === 'destructive',
            }
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-5 w-5 shadow-md border-2 border-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        />
      </motion.div>
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>0%</span>
        <span>{percentage.toFixed(0)}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export { Progress }
