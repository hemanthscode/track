import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  title, 
  subtitle, 
  className, 
  hoverEffect = true,
  ...props 
}) => (
  <motion.div
    className={cn(
      'group rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl text-card-foreground shadow-lg overflow-hidden',
      'hover:shadow-2xl hover:border-primary/60 transition-all duration-500',
      className
    )}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
    transition={{ duration: 0.4, ease: "easeOut" }}
    {...props}
  >
    {(title || subtitle) && (
      <div className="p-8 pb-6 border-b border-border/30 bg-gradient-to-r from-background/70">
        <motion.h3 
          className="text-2xl font-bold tracking-tight group-hover:text-primary transition-all duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {title}
        </motion.h3>
        {subtitle && (
          <motion.p 
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    )}
    <div className="p-8">{children}</div>
  </motion.div>
)

export { Card }
