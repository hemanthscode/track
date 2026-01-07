import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import { Card } from '../ui/Card.jsx'
import { TrendingUp } from 'lucide-react'

const TrendLine = ({ data = [], className }) => {
  const chartData = data.map(item => ({
    period: item.period?.slice(0, 7) || 'N/A',
    income: parseFloat(item.income) || 0,
    expenses: parseFloat(item.expenses) || 0,
    balance: parseFloat(item.balance) || 0,
    count: parseInt(item.count) || 0
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border p-6 rounded-3xl shadow-2xl">
          <p className="font-bold text-xl mb-6 text-center pb-3 border-b border-border/50">{label}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {payload.map((entry, index) => (
              <div key={index} className="space-y-2 text-center">
                <div className="w-4 h-4 mx-auto rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-semibold capitalize block text-sm">{entry.name}:</span>
                <div className="font-mono font-bold text-2xl text-primary">
                  ₹{entry.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card title="Spending Trends" className={className}>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
          <div className="text-center space-y-6 p-20">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/25 rounded-3xl flex items-center justify-center shadow-2xl">
              <TrendingUp className="h-16 w-16 text-primary/70" />
            </div>
            <div className="space-y-3 max-w-lg mx-auto">
              <p className="text-3xl font-bold">No trend data available</p>
              <p className="text-lg text-muted-foreground/70 leading-relaxed">
                Select a longer time period or add more transactions to see spending trends.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="6 6" 
              vertical={false} 
              stroke="hsl(var(--muted) / 0.2)"
            />
            
            <XAxis 
              dataKey="period" 
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
                if (value >= 1000) return `₹${(value/1000).toFixed(0)}K`
                return `₹${value}`
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={50}
              wrapperStyle={{ paddingTop: '16px' }}
            />
            
            <ReferenceLine 
              y={0} 
              strokeWidth={3}
              stroke="hsl(var(--primary) / 0.4)" 
              strokeDasharray="10 5"
            />
            
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={5}
              strokeLinecap="round"
              name="Income"
              dot={{
                fill: '#F0FDF4',
                stroke: '#10B981',
                strokeWidth: 4,
                r: 8
              }}
              activeDot={{
                r: 14,
                strokeWidth: 5,
                stroke: '#059669'
              }}
            />
            
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={5}
              strokeLinecap="round"
              name="Expenses"
              dot={{
                fill: '#FEF2F2',
                stroke: '#EF4444',
                strokeWidth: 4,
                r: 8
              }}
              activeDot={{
                r: 14,
                strokeWidth: 5,
                stroke: '#DC2626'
              }}
            />
            
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={4}
              strokeLinecap="round"
              name="Balance"
              dot={{
                fill: '#EFF6FF',
                stroke: '#3B82F6',
                strokeWidth: 3,
                r: 6
              }}
              activeDot={{
                r: 11,
                strokeWidth: 4
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export { TrendLine }
