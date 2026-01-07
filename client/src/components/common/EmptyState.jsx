import { Card } from '../ui/Card.jsx'
import { Button } from '../ui/Button.jsx'
import { cn } from '../../lib/cn.js'

const EmptyState = ({ 
  title = "No data yet", 
  description = "Get started by adding your first item",
  icon: Icon,
  action,
  className
}) => (
  <Card className={cn("text-center max-w-md mx-auto shadow-xl", className)}>
    <div className="flex flex-col items-center p-12 space-y-6">
      <div className="p-6 bg-gradient-to-br from-muted/30 to-accent/10 rounded-3xl">
        {Icon && <Icon className="h-16 w-16 text-muted-foreground/70" />}
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">{title}</h3>
        <p className="text-lg text-muted-foreground max-w-md leading-relaxed">{description}</p>
      </div>
      
      {action}
    </div>
  </Card>
)

export { EmptyState }
