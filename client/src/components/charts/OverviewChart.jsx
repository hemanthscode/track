import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, ReferenceLine } from 'recharts'
import { Card } from '../ui/Card.jsx'
import { Badge } from '../ui/Badge.jsx'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import dayjs from 'dayjs'

const OverviewChart = ({ data = [] }) => {
  const chartData = data.length > 0 
    ? data.map(item => ({
        date: dayjs(item.date || Date.now()).format('MMM DD'),
        income: parseFloat(item.income) || 0,
        expenses: parseFloat(item.expenses) || 0,
        balance: parseFloat(item.balance) || 0
      }))
    : []

  const totalIncome = chartData.reduce((sum, d) => sum + d.income, 0)
  const totalExpenses = chartData.reduce((sum, d) => sum + d.expenses, 0)
  const netBalance = totalIncome - totalExpenses

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const net = data.income - data.expenses
      return (
        <div className="bg-background/95 backdrop-blur-md border p-6 rounded-3xl shadow-2xl min-w-[260px]">
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-muted/60 rounded-2xl">
            <p className="font-bold text-xl">{data.date}</p>
            <Badge variant={net >= 0 ? "default" : "destructive"} className="gap-1">
              {net >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              ₹{net.toLocaleString()}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-200/50">
              <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                <TrendingUp className="h-4 w-4" />
                Income
              </span>
              <span className="font-mono font-bold text-emerald-700 text-xl">₹{data.income.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-2xl border border-destructive/30">
              <span className="flex items-center gap-2 text-destructive-foreground font-semibold">
                <TrendingDown className="h-4 w-4" />
                Expenses
              </span>
              <span className="font-mono font-bold text-destructive-foreground text-xl">₹{data.expenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="overflow-hidden">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8 bg-gradient-to-br from-muted/20 rounded-t-3xl">
        <div className="space-y-4 p-8 bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 rounded-3xl border border-emerald-200/40 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <Badge className="text-emerald-600 bg-emerald-100/90 shadow-lg px-4 py-2 font-bold">Income</Badge>
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <p className="text-4xl lg:text-5xl font-black text-emerald-600 leading-none">
              ₹{totalIncome.toLocaleString()}
            </p>
            <p className="text-lg text-emerald-700 font-semibold">{chartData.length} days</p>
          </div>
        </div>
        
        <div className="space-y-4 p-8 bg-gradient-to-r from-destructive/15 to-destructive/10 rounded-3xl border border-destructive/30 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <Badge className="text-destructive-foreground bg-destructive/10 shadow-lg px-4 py-2 font-bold">Expenses</Badge>
            <TrendingDown className="h-6 w-6 text-destructive-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-4xl lg:text-5xl font-black text-destructive-foreground leading-none">
              ₹{totalExpenses.toLocaleString()}
            </p>
            <p className="text-lg font-semibold">
              Net: <span className={netBalance >= 0 ? 'text-emerald-600 font-bold' : 'text-destructive-foreground font-bold'}>
                ₹{netBalance.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-8">
        {chartData.length === 0 ? (
          <div className="relative h-[380px] flex items-center justify-center rounded-3xl bg-gradient-to-br from-muted to-background border-2 border-dashed border-muted">
            <div className="text-center space-y-6 p-16">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-primary/30 to-secondary/20 rounded-3xl flex items-center justify-center shadow-2xl">
                <TrendingUp className="h-14 w-14 text-primary/70" />
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-muted-foreground">No financial data</p>
                <p className="text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
                  Your income and expense trends will appear here once you add transactions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.5}/>
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expensesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5}/>
                  <stop offset="50%" stopColor="#EF4444" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="incomeLine" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#047857"/>
                </linearGradient>
                <linearGradient id="expensesLine" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#DC2626"/>
                  <stop offset="100%" stopColor="#B91C1C"/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="5 5" 
                stroke="hsl(var(--muted) / 0.2)"
              />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tickMargin={20}
                tick={{ 
                  fontSize: 14, 
                  fontWeight: 600,
                  fill: 'hsl(var(--muted-foreground))'
                }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickMargin={20}
                tick={{ 
                  fontSize: 13, 
                  fontWeight: 600 
                }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `₹${(value/1000000).toFixed(1)}M`
                  if (value >= 1000) return `₹${(value/1000).toFixed(0)}k`
                  return `₹${value.toLocaleString()}`
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine 
                y={0} 
                stroke="hsl(var(--primary) / 0.3)" 
                strokeWidth={3}
                strokeDasharray="8 4"
              />
              
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1" 
                stroke="none"
                fill="url(#incomeArea)"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="1" 
                stroke="none"
                fill="url(#expensesArea)"
              />
              
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="url(#incomeLine)"
                strokeWidth={5}
                dot={{
                  fill: '#10B981',
                  stroke: '#059669',
                  strokeWidth: 4, 
                  r: 8
                }}
                activeDot={{
                  r: 12,
                  strokeWidth: 5,
                  stroke: '#059669'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="url(#expensesLine)"
                strokeWidth={5}
                dot={{
                  fill: '#EF4444',
                  stroke: '#DC2626',
                  strokeWidth: 4, 
                  r: 8
                }}
                activeDot={{
                  r: 12,
                  strokeWidth: 5,
                  stroke: '#DC2626'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

export { OverviewChart }
