import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { aiAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Select } from '../../components/ui/Select.jsx'  
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { TrendingUp, DollarSign, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react'

const Insights = () => {
  const [period, setPeriod] = useState('month')

  const { data: insightsData, isLoading, refetch } = useQuery({    
    queryKey: ['ai', 'insights', period],
    queryFn: () => aiAPI.insights({ period }).then(res => res.data.data),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-6">
          <LoadingSpinner className="h-16 w-16 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-muted-foreground mb-2">Analyzing your finances...</h2>
            <p className="text-muted-foreground/75">AI is generating personalized insights</p>
          </div>
        </div>
      </div>
    )
  }

  const insightsText = insightsData?.insights || ''
  const financialData = insightsData?.data || {}

  const insightsList = insightsText
    .split('\n\n')
    .filter(line => line.trim())
    .map((insight, index) => {
      const numberMatch = insight.match(/^(\d+\.\s*\*\*)(.+?)\*\*:\s*(.+)$/)
      return {
        number: numberMatch ? numberMatch[1] : `${index + 1}.`,    
        title: numberMatch ? numberMatch[2].trim() : insight.split('\n')[0]?.trim() || '',
        content: numberMatch ? numberMatch[3].trim() : insight.replace(/^.*?\*\*:\s*/, '').trim(),
        id: index
      }
    })


  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-muted/50 p-8 rounded-3xl">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
            AI Financial Insights
          </h1>
          <p className="text-xl text-muted-foreground mt-3 leading-relaxed max-w-2xl">
            Actionable advice based on your <strong>{period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'yearly'} spending</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-border/50">

          <Select 
            value={period} 
            onValueChange={setPeriod}
            options={periodOptions}
            placeholder="Select period"
            className="w-[180px]"
          />
          
          <Button 
            variant="secondary" 
            onClick={() => refetch()}
            className="shadow-lg hover:shadow-xl px-8"
            size="lg"
          >
            Refresh Analysis
          </Button>
        </div>
      </div>

      <Card title="Financial Snapshot" icon={DollarSign}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group text-center p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 border border-emerald-200/50 hover:shadow-2xl transition-all">
            <div className="text-3xl font-black text-emerald-600 mb-2">₹{financialData.income?.toLocaleString() || 0}</div>
            <p className="text-sm text-emerald-700 font-semibold uppercase tracking-wide">Total Income</p>
          </div>
          <div className="group text-center p-6 rounded-3xl bg-gradient-to-br from-destructive/10 border border-destructive/30 hover:shadow-2xl transition-all">
            <div className="text-3xl font-black text-destructive mb-2">₹{financialData.expenses?.toLocaleString() || 0}</div>
            <p className="text-sm text-destructive-foreground font-semibold uppercase tracking-wide">Total Expenses</p>
          </div>
          <div className="group text-center p-6 rounded-3xl bg-gradient-to-br from-green-500/10 border border-green-200/50 hover:shadow-2xl transition-all">
            <div className="text-3xl font-black text-green-600 mb-2">₹{financialData.savings?.toLocaleString() || 0}</div>
            <p className="text-sm text-green-700 font-semibold uppercase tracking-wide">Net Savings</p>
          </div>
          <div className="group text-center p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 border border-blue-200/50 hover:shadow-2xl transition-all">
            <div className="text-3xl font-black text-blue-600 mb-2">{financialData.savingsRate?.toFixed(1) || 0}%</div>
            <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide">Savings Rate</p>
          </div>
        </div>
      </Card>

      
      {financialData.topCategories?.length > 0 && (
        <Card title="Top Spending Categories" icon={TrendingUp}>
          <div className="divide-y divide-border/50">
            {financialData.topCategories.map((cat, index) => (
              <div key={index} className="flex items-center justify-between py-6 group hover:bg-accent/50 rounded-2xl px-4 -mx-4 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-gradient-to-br from-destructive to-orange-500 rounded-full shadow-lg group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg capitalize text-foreground">{cat.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">₹{cat.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-mono">{cat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card 
        title={`AI Recommendations (${insightsList.length})`}
        subtitle="Actionable steps to improve your financial health"
        icon={Lightbulb}
      >
        <div className="space-y-8">
          {insightsList.map((insight) => (
            <div key={insight.id} className="group border-l-4 border-l-primary/30 pl-8 hover:border-l-primary bg-gradient-to-r from-muted/20 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all backdrop-blur-sm border border-border/50">
              <div className="flex items-start justify-between mb-4 gap-4">
                <h3 className="font-black text-xl bg-gradient-to-r from-foreground to-primary/70 bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform">
                  {insight.title}
                </h3>
                <Badge variant="secondary" className="text-sm px-4 py-2 font-bold shadow-md uppercase tracking-wide">
                  Priority
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground/90 leading-relaxed mb-6 max-w-4xl">
                {insight.content}
              </p>
              <div className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-200/50">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-emerald-700 text-lg">Implement this for immediate impact</span> 
              </div>
            </div>
          ))}
        </div>
      </Card>

      {!insightsList.length && !isLoading && (
        <Card>
          <div className="text-center py-24">
            <Lightbulb className="h-24 w-24 mx-auto bg-gradient-to-br from-primary/20 p-6 rounded-3xl shadow-2xl mb-8" />
            <h3 className="text-3xl font-black text-muted-foreground mb-4">No insights yet</h3>
            <p className="text-xl text-muted-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Add more transactions to unlock personalized AI financial advice
            </p>
            <Button variant="outline" onClick={() => refetch()} size="lg" className="shadow-xl px-12">
              Refresh Data
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export { Insights }
