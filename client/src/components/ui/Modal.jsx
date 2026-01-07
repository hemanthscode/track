import { Dialog } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import { cn } from '../../lib/cn.js'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  className
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ scale: 0.85, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              'w-full max-w-3xl mx-auto transform overflow-hidden rounded-3xl bg-background/95 backdrop-blur-2xl shadow-2xl border border-border/50 relative',
              {
                'max-w-md': size === 'sm',
                'max-w-lg': size === 'md',
                'max-w-2xl': size === 'lg',
                'max-w-4xl': size === 'xl',
              },
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-8 pb-6 border-b border-border/30">
              <Dialog.Title className="text-3xl font-bold text-foreground tracking-tight">
                {title}
              </Dialog.Title>
              <motion.button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-2xl transition-all duration-200 ml-4 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-7 w-7" />
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Modal }
