import { forwardRef, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(({ 
  type = 'text', 
  icon: Icon, 
  label, 
  error, 
  className, 
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-3 w-full">
      {label && (
        <label className="block text-sm font-semibold text-foreground tracking-tight">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        )}
        <motion.input
          ref={ref}
          type={isPassword && !showPassword ? 'password' : type}
          className={cn(
            'flex h-14 w-full rounded-2xl border bg-background px-4 py-3 text-base ring-offset-background',
            'file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            Icon && 'pl-12',
            error 
              ? 'border-destructive/50 bg-destructive/5 focus-visible:ring-destructive/30 text-destructive-foreground' 
              : 'border-input/50 hover:border-input focus-visible:border-ring',
            className
          )}
          initial={{ scaleX: 1 }}
          whileFocus={{ scaleX: 1.02 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </motion.button>
        )}
      </div>
      {error && (
        <motion.p 
          className="flex items-center gap-2 text-sm text-destructive font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1 0z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
