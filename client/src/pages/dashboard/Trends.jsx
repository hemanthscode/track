import { useState } from 'react'
import { useTrends, useComparisons } from '../../hooks/useAnalytics.js'
import { Card } from '../../components/ui/Card.jsx'
import { Select } from '../../components/ui/Select.jsx'  // ✅ NEW HEADLESSUI
import { TrendLine } from '../../components/charts/TrendLine.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import dayjs from 'dayjs'

const Trends = () => {
  const [period, setPeriod] = useState('monthly')
  const [category, setCategory] = useState('all')

  const { data: trendsData, isLoading: loadingTrends } = useTrends({ 
    period,
    ...(category !== 'all' && { category })
  })

  const { data: comparisonData, isLoading: loadingComparison } = useComparisons('month')

  if (loadingTrends || loadingComparison) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  const changes = comparisonData?.changes || {}
  const currentMonth = dayjs().format('MMMM YYYY')

  // ✅ NEW HEADLESSUI SELECT OPTIONS
  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'housing', label: 'Housing' },
    { value: 'transport', label: 'Transport' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' }
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-muted/50 p-8 rounded-3xl">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
            Spending Trends
          </h1>
          <p className="text-xl text-muted-foreground mt-3 leading-relaxed max-w-2xl">
            Track your spending patterns over time and discover actionable insights
          </p>
        </div>

        <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-border/50">
          {/* ✅ NEW HEADLESSUI SELECT - PERIOD */}
          <Select 
            value={period} 
            onValueChange={setPeriod}
            options={periodOptions}
            placeholder="Select period"
            className="w-[180px]"
          >
            <Calendar className="mr-2 h-4 w-4" />
          </Select>

          {/* ✅ NEW HEADLESSUI SELECT - CATEGORY */}
          <Select 
            value={category} 
            onValueChange={setCategory}
            options={categoryOptions}
            placeholder="Select category"
            className="w-[200px]"
          />
        </div>
      </div>

      {/* Change Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Income Change" icon={ArrowDownRight}>
          <div className="flex items-center gap-4">
            {changes.income >= 0 ? (
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border-4 border-emerald-500/30">
                <ArrowUpRight className="h-8 w-8 text-emerald-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center border-4 border-destructive/30">
                <ArrowDownRight className="h-8 w-8 text-destructive" />
              </div>
            )}
            <div>
              <div className={`text-5xl font-black ${changes.income >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {Math.abs(changes.income || 0).toFixed(1)}%
              </div>
              <p className="text-xl text-muted-foreground mt-2">vs last month</p>
            </div>
          </div>
        </Card>

        <Card title="Expense Change" icon={ArrowUpRight}>
          <div className="flex items-center gap-4">
            {changes.expenses <= 0 ? (
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border-4 border-emerald-500/30">
                <ArrowDownRight className="h-8 w-8 text-emerald-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center border-4 border-destructive/30">
                <ArrowUpRight className="h-8 w-8 text-destructive" />
              </div>
            )}
            <div>
              <div className={`text-5xl font-black ${changes.expenses <= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {Math.abs(changes.expenses || 0).toFixed(1)}%
              </div>
              <p className="text-xl text-muted-foreground mt-2">vs last month</p>
            </div>
          </div>
        </Card>

        <Card title="Savings Rate Change" icon={TrendingUp}>
          <div className="flex items-center gap-4">
            {changes.savingsRate >= 0 ? (
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border-4 border-emerald-500/30">
                <ArrowUpRight className="h-8 w-8 text-emerald-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center border-4 border-destructive/30">
                <ArrowDownRight className="h-8 w-8 text-destructive" />
              </div>
            )}
            <div>
              <div className={`text-5xl font-black ${changes.savingsRate >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {Math.abs(changes.savingsRate || 0).toFixed(1)}%
              </div>
              <p className="text-xl text-muted-foreground mt-2">vs last month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Trend Chart */}
      <Card title={`${period.charAt(0).toUpperCase() + period.slice(1)} Trends`} icon={TrendingUp} className="lg:col-span-full">
        <TrendLine data={trendsData || []} />
      </Card>

      {/* Key Insights */}
      <Card title={`Key Insights for ${currentMonth}`} icon={TrendingUp}>
        <div className="space-y-6">
          {changes.income > 10 && (
            <div className="group flex items-start gap-4 p-8 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex-shrink-0 w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border-2 border-emerald-500/40 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mb-3 group-hover:text-emerald-800 transition-colors">
                  Income Growth
                </h3>
                <p className="text-xl text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  Your income increased by <span className="font-black text-2xl">{changes.income.toFixed(1)}%</span> compared to last month. Great job!
                </p>
              </div>
            </div>
          )}

          {changes.expenses > 15 && (
            <div className="group flex items-start gap-4 p-8 bg-orange-50/50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex-shrink-0 w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center border-2 border-orange-500/40 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-orange-900 dark:text-orange-100 mb-3 group-hover:text-orange-800 transition-colors">
                  Spending Alert
                </h3>
                <p className="text-xl text-orange-800 dark:text-orange-200 leading-relaxed">
                  Your expenses increased by <span className="font-black text-2xl">{changes.expenses.toFixed(1)}%</span>. Consider reviewing your budgets.
                </p>
              </div>
            </div>
          )}

          {changes.savingsRate > 5 && (
            <div className="group flex items-start gap-4 p-8 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border-2 border-blue-500/40 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-3 group-hover:text-blue-800 transition-colors">
                  Savings Improvement
                </h3>
                <p className="text-xl text-blue-800 dark:text-blue-200 leading-relaxed">
                  Your savings rate improved by <span className="font-black text-2xl">{changes.savingsRate.toFixed(1)}%</span>. You're on the right track!
                </p>
              </div>
            </div>
          )}

          {changes.income <= 10 && changes.expenses <= 15 && changes.savingsRate <= 5 && (
            <div className="text-center py-20 space-y-6">
              <TrendingUp className="h-24 w-24 mx-auto text-muted-foreground/40 mb-8" />
              <div>
                <h3 className="text-3xl font-bold text-muted-foreground mb-4">Stable Month</h3>
                <p className="text-xl text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                  No significant changes detected this month. Your finances are maintaining a steady pattern.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export { Trends }
