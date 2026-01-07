import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Card } from '../ui/Card.jsx'
import { Badge } from '../ui/Badge.jsx'
import { ShoppingBag } from 'lucide-react'

const COLORS = [
  { primary: '#EF4444', light: '#FEE2E2' },
  { primary: '#F59E0B', light: '#FEF3C7' },
  { primary: '#10B981', light: '#D1FAE5' },
  { primary: '#3B82F6', light: '#DBEAFE' },
  { primary: '#8B5CF6', light: '#EDE9FE' },
  { primary: '#EC4899', light: '#FCE7F3' },
  { primary: '#F97316', light: '#FED7AA' },
  { primary: '#06B6D4', light: '#CFFAFE' },
  { primary: '#14B8A6', light: '#CCFBF1' },
  { primary: '#A78BFA', light: '#F3E8FF' },
  { primary: '#F472B6', light: '#FCE7F3' },
  { primary: '#FBBF24', light: '#FEF3C7' }
]

const CategoryPie = ({ data = [] }) => {
  const pieData = data
    .map((item, index) => ({
      name: (item.category || 'Uncategorized')
        .replace(/\b\w/g, l => l.toUpperCase())
        .slice(0, 16),
      value: parseFloat(item.amount) || 0,
      percentage: parseFloat(item.percentage) || 0,
      count: item.count || 0,
      color: COLORS[index % COLORS.length]
    }))
    .filter(item => item.value > 0)

  const totalAmount = pieData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 backdrop-blur-sm border p-4 rounded-2xl shadow-2xl min-w-[220px]">
          <div className="flex items-center gap-3 mb-3 p-2.5 bg-gradient-to-r from-muted/30 rounded-xl">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: data.color.primary }}
            />
            <p className="font-bold text-sm capitalize whitespace-nowrap">{data.name}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-mono font-bold">
              <span>₹ Amount</span>
              <span>{data.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>% total</span>
              <span>{data.percentage.toFixed(1)}%</span>
            </div>
            {data.count > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Txns</span>
                <span>{data.count}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card title="Expense Categories" subtitle={`${pieData.length} active`} badge={`₹${totalAmount.toLocaleString()}`}>
      {pieData.length === 0 ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4 p-12">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-muted/40 rounded-3xl flex items-center justify-center shadow-xl">
              <ShoppingBag className="h-12 w-12 opacity-30" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-muted-foreground">No spending yet</h4>
              <p className="text-muted-foreground/75 max-w-sm mx-auto leading-relaxed">
                Track your first expense to see beautiful category breakdown.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="w-full max-w-md h-[300px] flex items-center justify-center p-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={450}
                    cornerRadius={12}
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.color.primary}
                        stroke={entry.color.primary}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/90">
                Spending Breakdown
              </h5>
              <Badge variant="outline" size="sm" className="text-xs">
                {pieData.length} categories
              </Badge>
            </div>
            
            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent pr-2">
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/70 transition-all duration-200 border border-transparent hover:border-accent/50 h-12"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ring-1 ring-border/60"
                        style={{ backgroundColor: entry.color.light }}
                      >
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: entry.color.primary }}
                        />
                      </div>
                      <p className="font-semibold text-sm capitalize leading-tight group-hover:text-foreground truncate">
                        {entry.name}
                      </p>
                    </div>

                    <div className="text-right min-w-[80px] flex flex-col items-end space-y-0.5">
                      <div className="font-mono text-sm font-bold">
                        ₹{entry.value.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold text-primary leading-none tracking-tight">
                        {entry.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export { CategoryPie }
