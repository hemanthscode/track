import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

const Select = ({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = "Select an option...", 
  label, 
  error,
  className 
}) => (
  <div className="space-y-3">
    {label && (
      <label className="block text-sm font-semibold text-foreground tracking-tight">
        {label}
      </label>
    )}
    <Listbox value={value} onChange={onValueChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <motion.div
              className={cn(
                'relative w-full cursor-pointer rounded-2xl py-4 pl-12 pr-12 border bg-background shadow-sm ring-offset-background text-left',
                'focus:outline-none focus:ring-4 focus:ring-ring/20 focus:ring-offset-2 transition-all duration-200',
                error 
                  ? 'border-destructive/50 bg-destructive/5 focus:ring-destructive/30' 
                  : 'border-input/50 hover:border-input focus:border-ring',
                className
              )}
              initial={{ scaleX: 1 }}
              whileHover={{ scaleX: 1.01 }}
            >
              <Listbox.Button className="w-full">
                <span className="block truncate font-semibold text-base">
                  {value ? options.find(opt => opt.value === value)?.label || value : placeholder}
                </span>
                <motion.div
                  className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4"
                  animate={{ rotate: open ? -180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </motion.div>
              </Listbox.Button>
            </motion.div>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-2xl bg-popover/95 backdrop-blur-xl py-3 shadow-2xl ring-1 ring-black/10">
                {options.map((option, idx) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      cn(
                        'relative cursor-pointer select-none py-4 pl-12 pr-6 text-base font-semibold mx-2 rounded-xl transition-all duration-200',
                        active ? 'bg-accent/30 text-accent-foreground' : 'text-popover-foreground',
                        value === option.value && 'bg-primary/20 text-primary font-bold shadow-md'
                      )
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <motion.div
                        className="flex items-center"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {selected && (
                          <motion.span
                            className="absolute inset-y-0 left-4 flex items-center text-primary"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="h-6 w-6" />
                          </motion.span>
                        )}
                        <span className="block truncate ml-2">{option.label}</span>
                      </motion.div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
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
        </>
      )}
    </Listbox>
  </div>
)

export { Select }
