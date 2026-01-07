import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'
import { MoreHorizontal, Eye, Edit3, Trash2 } from 'lucide-react'

const Dropdown = ({ 
  items = [], 
  trigger: Trigger = MoreHorizontal,
  className 
}) => (
  <Menu as="div" className={cn("relative inline-block text-left", className)}>
    <motion.div whileTap={{ scale: 0.95 }}>
      <Menu.Button className="p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200">
        <Trigger className="h-6 w-6" />
      </Menu.Button>
    </motion.div>
    
    <Transition
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95 translate-y-1"
      enterTo="transform opacity-100 scale-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="transform opacity-100 scale-100 translate-y-0"
      leaveTo="transform opacity-0 scale-95 translate-y-1"
    >
      <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl py-3 z-50 overflow-hidden">
        {items.map((item, idx) => (
          <motion.div
            key={item.key || idx}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={item.onClick}
                  className={cn(
                    'w-full flex items-center gap-4 px-6 py-4 text-left text-lg font-semibold transition-all duration-200 rounded-xl mx-1',
                    active && 'bg-accent/30 text-accent-foreground',
                    item.danger && 'text-destructive hover:bg-destructive/10'
                  )}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )}
            </Menu.Item>
          </motion.div>
        ))}
      </Menu.Items>
    </Transition>
  </Menu>
)

Dropdown.ActionItems = ({ row, onEdit, onDelete, onView }) => (
  <Dropdown
    items={[
      ...(onView ? [{
        key: 'view',
        label: 'View Details',
        icon: Eye,
        onClick: () => onView?.(row)
      }] : []),
      ...(onEdit ? [{
        key: 'edit',
        label: 'Edit Record',
        icon: Edit3,
        onClick: () => onEdit?.(row)
      }] : []),
      ...(onDelete ? [{
        key: 'delete',
        label: 'Delete',
        icon: Trash2,
        danger: true,
        onClick: () => onDelete?.(row)
      }] : [])
    ]}
  />
)

export { Dropdown }
