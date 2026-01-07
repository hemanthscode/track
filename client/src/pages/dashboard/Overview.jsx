import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  useOverview,
  useCategoryBreakdown,
} from '../../hooks/useAnalytics.js'
import {
  useBudgets,
  useBudgetSummary
} from '../../hooks/useBudgets.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { OverviewChart } from '../../components/charts/OverviewChart.jsx'
import { CategoryPie } from '../../components/charts/CategoryPie.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Activity,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import dayjs from 'dayjs'

const Overview = () => {
  const [period, setPeriod] = useState('month')

  const overviewQuery = useOverview({ period })
  const categoryQuery = useCategoryBreakdown({ period })
  const budgetSummaryQuery = useBudgetSummary()

  if (overviewQuery.isLoading || budgetSummaryQuery.isLoading || categoryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  const data = overviewQuery.data || {}
  const budgetData = budgetSummaryQuery.data || {}
  const categoryData = categoryQuery.data || []

  const getChangeColor = (change) => {
    if (!change) return 'text-muted-foreground'
    return change > 0 ? 'text-green-600 font-bold' : 'text-destructive font-bold'
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-muted/30 p-8 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-2xl text-muted-foreground mt-4">
              {dayjs().format('MMMM DD, YYYY')} • {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly'} View
            </p>
          </div>
          <Button variant="outline" size="lg" className="shadow-xl px-10 h-14">
            <DollarSign className="mr-2 h-5 w-5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card title="Total Balance" icon={DollarSign}>
          <div className="text-2xl font-black mb-6 bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
            ₹{data.balance?.toLocaleString() || 0}
          </div>
          <p className={`text-2xl ${getChangeColor(data.balanceChange)}`}>
            {data.balanceChange > 0 ? '+' : ''}{data.balanceChange?.toLocaleString() || 0} this {period}
          </p>
        </Card>

        <Card title="Income" icon={ArrowDownRight}>
          <div className="text-6xl font-black text-emerald-600 mb-6">
            ₹{data.income?.toLocaleString() || 0}
          </div>
          <p className={`text-2xl ${getChangeColor(data.incomeChange)}`}>
            {data.incomeChange > 0 ? '+' : ''}{data.incomeChange?.toLocaleString() || 0}
          </p>
        </Card>

        <Card title="Expenses" icon={ArrowUpRight}>
          <div className="text-6xl font-black text-destructive mb-6">
            ₹{data.expenses?.toLocaleString() || 0}
          </div>
          <p className={`text-2xl ${getChangeColor(data.expensesChange)}`}>
            {data.expensesChange > 0 ? '+' : ''}{data.expensesChange?.toLocaleString() || 0}
          </p>
        </Card>

        <Card title="Budget Health" icon={Activity}>
          <div className="text-6xl font-black mb-6">
            {budgetData.onTrack || 0}/{budgetData.total || 0}
          </div>
          <Badge 
            variant={budgetData.health === 'healthy' ? 'default' : 'destructive'}
            className="text-2xl px-8 py-4 font-bold shadow-lg"
          >
            {budgetData.health || 'Unknown'}
          </Badge>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Spending Overview" icon={TrendingUp}>
          <OverviewChart data={data.chartData || []} />
        </Card>

        <Card title="Category Breakdown" icon={ShoppingBag}>
          <CategoryPie data={categoryData} />
        </Card>
      </div>

      {/* Recent Activity */}
      {data.recentTransactions && data.recentTransactions.length > 0 ? (
        <Card title="Recent Activity" subtitle="Latest 5 transactions">
          <div className="space-y-4">
            {data.recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-muted/50 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1 border border-border/50 cursor-pointer">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                  <div>
                    <p className="font-bold text-xl group-hover:text-primary transition-colors truncate max-w-[300px]">
                      {transaction.description}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      {dayjs(transaction.date).format('MMM DD, YYYY')}
                    </p>
                  </div>
                </div>
                <span className={`text-3xl font-black ${transaction.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                  {transaction.type === 'income' ? '+' : '-' }₹{transaction.amount?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No recent activity"
            description="Your transactions will appear here once you start adding them"
            icon={Activity}
          />
        </Card>
      )}
    </div>
  )
}

export { Overview }
