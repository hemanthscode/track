import { forwardRef } from 'react'
import { cn } from '../../lib/cn.js'
import { motion } from 'framer-motion'
import { Search, ChevronDown } from 'lucide-react'
import { Button } from './Button.jsx'

const Table = forwardRef(({
  columns,
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  searchable = false,
  searchValue,
  onSearchChange,
  className
}, ref) => {
  if (loading) {
    return (
      <motion.div 
        ref={ref}
        className="flex items-center justify-center p-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div 
      ref={ref}
      className={cn("w-full bg-background/80 backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden", className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Header */}
      {searchable && (
        <div className="border-b border-border/30 p-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Search records..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl border border-input/50 bg-background/50 backdrop-blur-sm focus:ring-4 focus:ring-ring/20 focus:border-transparent text-lg"
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-gradient-to-r from-background/50">
              {columns.map((column, idx) => (
                <th key={idx} className="px-8 py-6 text-left">
                  <div className="flex items-center gap-2 font-semibold text-lg text-foreground/80">
                    {column.header}
                    <ChevronDown className="h-5 w-5 opacity-50" />
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-8 py-6 text-right">
                  <span className="font-semibold text-lg text-foreground/80">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <motion.tr
                key={row.id || row._id || idx}
                className="border-b border-border/10 hover:bg-accent/20 transition-all duration-200"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                {columns.map((column, cIdx) => (
                  <td key={cIdx} className="px-8 py-6 align-middle">
                    <div className="font-medium text-lg">
                      {column.render ? column.render(row) : row[column.accessor] || '-'}
                    </div>
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-8 py-6 text-right">
                    <div className="flex gap-2 justify-end">
                      {onView && (
                        <Button size="sm" variant="ghost" onClick={() => onView(row)}>
                          View
                        </Button>
                      )}
                      {onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <motion.div 
          className="text-center py-20 px-8 text-muted-foreground"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-32 h-32 mx-auto mb-8 bg-muted/30 rounded-3xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Search className="h-16 w-16 opacity-40" />
          </motion.div>
          <motion.h3 
            className="text-2xl font-bold mb-3 text-foreground/70"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
          >
            No records found
          </motion.h3>
          <motion.p 
            className="text-lg max-w-md mx-auto"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Try adjusting your search or filter criteria to find what you're looking for.
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  )
})

Table.displayName = 'Table'

export { Table }
