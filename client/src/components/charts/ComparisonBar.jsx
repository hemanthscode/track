import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { Card } from '../ui/Card.jsx'
import { Badge } from '../ui/Badge.jsx'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const ComparisonBar = ({ current, previous, changes, className }) => {
  const comparisonData = [
    { 
      category: 'Income', 
      current: parseFloat(current?.income?.total) || 0, 
      previous: parseFloat(previous?.income?.total) || 0,
      change: changes?.income || 0
    },
    { 
      category: 'Expenses', 
      current: parseFloat(current?.expenses?.total) || 0, 
      previous: parseFloat(previous?.expenses?.total) || 0,
      change: changes?.expenses || 0
    },
    { 
      category: 'Balance', 
      current: parseFloat(current?.balance) || 0, 
      previous: parseFloat(previous?.balance) || 0,
      change: changes?.balance || 0
    }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const changeColor = data.change >= 0 ? '#10B981' : '#EF4444'
      return (
        <div className="bg-background/95 backdrop-blur-sm border p-5 rounded-2xl shadow-2xl">
          <p className="font-bold text-xl mb-4 pb-2 border-b border-border/50">{label}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
              <span className="text-muted-foreground font-mono">Current:</span>
              <span className="font-mono font-bold text-primary text-lg">₹{data.current.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
              <span className="text-muted-foreground font-mono">Previous:</span>
              <span className="font-mono font-bold text-secondary-foreground">₹{data.previous.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/20 rounded-2xl border">
              <span className="font-semibold">Change:</span>
              <div className="flex items-center gap-1 font-bold text-xl" style={{ color: changeColor }}>
                {data.change >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                {Math.abs(data.change).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card 
      title="Period Comparison" 
      subtitle="Current vs Previous Period"
      badges={[
        <Badge key="current" variant="secondary" className="text-sm px-3 py-1.5 shadow-sm">
          {current?.period || 'Current'}
        </Badge>,
        <Badge key="previous" variant="outline" className="text-sm px-3 py-1.5 shadow-sm">
          {previous?.period || 'Previous'}
        </Badge>
      ]}
      className={className}
    >
      {/* Live Change Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {comparisonData.map((item, index) => (
          <div key={index} className="group p-6 rounded-2xl border border-border hover:border-accent hover:shadow-xl transition-all bg-gradient-to-br from-background">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-base capitalize">{item.category}</p>
              <div className={`p-2 rounded-xl shadow-sm ${item.change >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                {item.change >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black">₹{item.current.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground font-mono">now</span>
              </div>
              <div className="flex items-baseline justify-between text-base">
                <span className="text-muted-foreground font-mono">₹{item.previous.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground font-mono">prev</span>
              </div>
              <div className={`flex items-center gap-2 text-lg font-bold ${item.change >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {item.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(item.change).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={comparisonData} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--muted) / 0.2)" />
          <XAxis 
            dataKey="category" 
            axisLine={false}
            tickLine={false}
            tickMargin={16}
            tick={{ fontSize: 14, fontWeight: 600 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickMargin={16}
            tick={{ fontSize: 13 }}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground) / 0.2)" strokeDasharray="6 6" />
          
          <Bar 
            dataKey="previous" 
            fill="#E5E7EB" 
            name="Previous Period"
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
          />
          <Bar 
            dataKey="current" 
            fill="url(#currentGradient)"
            name="Current Period"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
          <defs>
            <linearGradient id="currentGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#1E40AF" stopOpacity={1}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export { ComparisonBar }
