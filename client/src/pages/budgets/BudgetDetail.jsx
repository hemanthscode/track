import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { budgetsAPI, transactionsAPI } from '../../lib/api.js'     
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Progress } from '../../components/ui/Progress.jsx'        
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ArrowLeft, Edit, Trash2, PiggyBank, Calendar, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

const BudgetDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: budgetResponse, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsAPI.getById(id).then(res => res.data),   
    enabled: !!id
  })

  const budget = budgetResponse?.data?.budget

  const { data: transactionsResponse } = useQuery({
    queryKey: ['transactions', 'budget', budget?.category],        
    queryFn: () => transactionsAPI.getAll({
      category: budget?.category,
      type: 'expense',
      limit: 10
    }).then(res => res.data),
    enabled: !!budget?.category
  })

  const relatedTransactions = transactionsResponse?.data?.transactions || []

  const deleteMutation = useMutation({
    mutationFn: () => budgetsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      toast.success('Budget deleted!')
      navigate('/budgets')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete budget')
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-bold mb-4">Budget Not Found</h2>
        <Button onClick={() => navigate('/budgets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Budgets
        </Button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded': return 'destructive'
      case 'warning': return 'secondary'
      case 'active': return 'default'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-muted/50 p-8 rounded-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/budgets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent tracking-tight capitalize">
            {budget.category || budget.type} Budget
          </h1>
          <p className="text-xl text-muted-foreground mt-2">{budget.period} budget tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/budgets/${id}/edit`)} className="shadow-lg">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="shadow-lg"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Budget Amount" icon={DollarSign}>
          <div className="text-4xl font-black text-primary mb-2">
            ₹{budget.amount?.toLocaleString() || 0}
          </div>
          <Badge variant="outline" className="font-mono text-sm px-3 py-1">
            {budget.period}
          </Badge>
        </Card>

        <Card title="Total Spent" icon={TrendingDown}>
          <div className="text-4xl font-black text-destructive mb-2">
            ₹{budget.progress?.toLocaleString() || 0}
          </div>
          <p className="text-2xl text-muted-foreground/80">
            {budget.percentage?.toFixed(1) || 0}% of budget
          </p>
        </Card>

        <Card title="Remaining" icon={PiggyBank}>
          <div className={`text-4xl font-black mb-2 ${budget.remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            ₹{Math.abs(budget.remaining || 0)?.toLocaleString()}
          </div>
          <Badge variant={getStatusColor(budget.status)} className="font-bold px-4 py-2">
            {budget.status}
          </Badge>
        </Card>
      </div>

      {/* Budget Info */}
      <Card title="Budget Information" icon={Calendar}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Start Date</p>
            <p className="text-2xl font-bold">{dayjs(budget.startDate).format('MMM DD, YYYY')}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">End Date</p>
            <p className="text-2xl font-bold">{dayjs(budget.endDate).format('MMM DD, YYYY')}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Category</p>
            <p className="text-2xl font-bold capitalize">{budget.category}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Alert Threshold</p>
            <p className="text-2xl font-bold">{budget.alertThreshold}%</p>
          </div>
        </div>
        {budget.description && (
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className="text-sm font-semibold text-muted-foreground mb-4">Description</p>
            <p className="text-lg leading-relaxed">{budget.description}</p>
          </div>
        )}
      </Card>

      {/* Progress */}
      <Card title="Budget Progress" icon={TrendingDown}>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-muted-foreground">Spent</span>
              <span className="text-2xl font-bold">
                ₹{budget.progress?.toLocaleString() || 0} / ₹{budget.amount?.toLocaleString() || 0}
              </span>
            </div>
            <Progress value={budget.percentage || 0} className="h-6 [&>div]:!bg-gradient-to-r [&>div]:!from-primary/80 [&>div]:!to-primary" />
            <div className="flex items-center justify-between text-lg text-muted-foreground">
              <span>{budget.percentage?.toFixed(1) || 0}% used</span>
              <span>Alert at {budget.alertThreshold}%</span>
            </div>
          </div>

          {budget.status === 'exceeded' && (
            <div className="flex items-center gap-4 p-6 bg-destructive/10 border border-destructive/30 rounded-3xl">
              <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-destructive mb-2">Budget Exceeded</h3>
                <p className="text-lg text-destructive-foreground leading-relaxed">
                  You've overspent by ₹{Math.abs(budget.remaining || 0)?.toLocaleString()}. Consider reviewing your expenses.
                </p>
              </div>
            </div>
          )}

          {budget.status === 'warning' && (
            <div className="flex items-center gap-4 p-6 bg-orange-50 border border-orange-200/50 rounded-3xl">
              <AlertTriangle className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-orange-900 mb-2">Approaching Limit</h3>
                <p className="text-lg text-orange-700 leading-relaxed">
                  You have ₹{budget.remaining?.toLocaleString() || 0} remaining ({(100 - (budget.percentage || 0)).toFixed(1)}%).
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions */}
      {relatedTransactions.length > 0 ? (
        <Card title="Recent Transactions" subtitle="Latest expenses in this category">
          <div className="space-y-4">
            {relatedTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction._id}
                className="group flex items-center justify-between p-6 bg-gradient-to-r from-muted/50 to-transparent rounded-3xl hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 border border-border/50"
                onClick={() => navigate(`/transactions/${transaction._id}`)}
              >
                <div className="flex-1">
                  <p className="font-bold text-xl group-hover:text-primary transition-colors">{transaction.description || 'Unnamed transaction'}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dayjs(transaction.date).format('MMM DD, YYYY')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-destructive">
                    -₹{transaction.amount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-6 shadow-xl"
              onClick={() => navigate(`/transactions?category=${budget.category}`)}
            >
              View All Transactions
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-16 space-y-6">
            <PiggyBank className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
            <h3 className="text-2xl font-bold text-muted-foreground mb-2">No transactions yet</h3>
            <p className="text-muted-foreground/75 max-w-md mx-auto mb-8">
              No transactions found for this category. Add some to see your spending progress.
            </p>
            <Button variant="outline" onClick={() => navigate('/transactions')}>
              Add First Transaction
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export { BudgetDetail }
