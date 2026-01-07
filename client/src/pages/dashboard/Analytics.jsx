import { useState } from 'react'
import { useStatistics, useCategoryBreakdown, useTrends, useComparisons } from '../../hooks/useAnalytics.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Select } from '../../components/ui/Select.jsx'  // ✅ NEW HEADLESSUI
import { CategoryPie } from '../../components/charts/CategoryPie.jsx'
import { TrendLine } from '../../components/charts/TrendLine.jsx'  
import { ComparisonBar } from '../../components/charts/ComparisonBar.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { BarChart3, Calendar, TrendingUp, DollarSign } from 'lucide-react'
import dayjs from 'dayjs'

const Analytics = () => {
  const [period, setPeriod] = useState('month')

  const { data: statistics, isLoading: loadingStats } = useStatistics()
  const { data: categoryData, isLoading: loadingCategories } = useCategoryBreakdown({ type: 'expense' })
  const { data: trendsData, isLoading: loadingTrends } = useTrends({ period: 'monthly' })
  const { data: comparisonData, isLoading: loadingComparison } = useComparisons(period)

  const isLoading = loadingStats || loadingCategories || loadingTrends || loadingComparison

  // ✅ NEW OPTIONS FOR HEADLESSUI SELECT
  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-muted/50 p-8 rounded-3xl">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mt-3 leading-relaxed max-w-2xl">
            Deep insights into your spending patterns and financial trends
          </p>
        </div>

        <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-border/50">
          {/* ✅ NEW HEADLESSUI SELECT */}
          <Select 
            value={period} 
            onValueChange={setPeriod}
            options={periodOptions}
            placeholder="Select period"
            className="w-[200px]"
          />
          <Button variant="outline" className="shadow-lg px-8 h-12">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card title="Avg Daily Spending" icon={TrendingUp}>
          <div className="text-5xl font-black text-primary mb-4">
            ₹{statistics?.averageDailySpending?.toLocaleString() || 0}
          </div>
          <p className="text-2xl text-muted-foreground">Last 30 days</p>
        </Card>

        <Card title="Largest Expense" icon={DollarSign}>
          <div className="text-5xl font-black text-destructive mb-4">
            ₹{statistics?.largestExpense?.amount?.toLocaleString() || 0}
          </div>
          <p className="text-xl text-muted-foreground truncate max-w-[200px]">
            {statistics?.largestExpense?.description || 'N/A'}
          </p>
        </Card>

        <Card title="Most Frequent Category" icon={BarChart3}>
          <div className="text-5xl font-black capitalize mb-4">
            {statistics?.mostFrequentCategory || 'N/A'}
          </div>
          <p className="text-2xl text-muted-foreground">
            {statistics?.transactionCount || 0} transactions
          </p>
        </Card>

        <Card title="Largest Income" icon={TrendingUp}>
          <div className="text-5xl font-black text-emerald-600 mb-4">
            ₹{statistics?.largestIncome?.amount?.toLocaleString() || 0}
          </div>
          <p className="text-xl text-muted-foreground truncate max-w-[200px]">
            {statistics?.largestIncome?.description || 'N/A'}
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Category Breakdown" icon={BarChart3}>
          <CategoryPie data={categoryData || []} />
        </Card>

        <Card title="Spending Trends" icon={TrendingUp}>
          <TrendLine data={trendsData || []} />
        </Card>
      </div>

      {/* Comparison Chart */}
      {comparisonData && (
        <Card title="Period Comparison" icon={TrendingUp} className="lg:col-span-2">
          <ComparisonBar
            current={comparisonData.current}
            previous={comparisonData.previous}
            changes={comparisonData.changes}
          />
        </Card>
      )}

      {/* Top Categories */}
      <Card title="Top Spending Categories" subtitle="Your biggest expense areas">
        {categoryData && categoryData.length > 0 ? (
          <div className="space-y-6">
            {categoryData.slice(0, 5).map((category, index) => (
              <div key={category.category} className="group flex items-center gap-6 p-6 bg-gradient-to-r from-muted/30 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-2 border border-border/50">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center font-black text-2xl text-background shadow-xl group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black capitalize group-hover:text-primary transition-colors">{category.category}</span>
                    <span className="text-3xl font-black text-primary">₹{category.amount?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-2xl h-3 overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-primary to-primary/60 rounded-2xl shadow-lg transition-all duration-700"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-muted-foreground min-w-[60px] text-right">
                  {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="h-20 w-20 mx-auto text-muted-foreground/50 mb-8" />
            <h3 className="text-3xl font-bold text-muted-foreground mb-4">No data available</h3>
            <p className="text-xl text-muted-foreground/70 max-w-md mx-auto mb-8">
              Add transactions to unlock detailed analytics and insights
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export { Analytics }
