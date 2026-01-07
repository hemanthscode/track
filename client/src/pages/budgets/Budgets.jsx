import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useBudgets, useBudgetSummary, useDeleteBudget } from '../../hooks/useBudgets.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Progress } from '../../components/ui/Progress.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { BudgetForm } from '../../components/forms/BudgetForm.jsx' 
import { ConfirmationModal } from '../../components/common/ConfirmationModal.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { Plus, TrendingUp, Target, AlertTriangle, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const Budgets = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    type: 'budget',
    period: '',
    status: ''
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)    
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState(null)       

  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets(filters)
  const { data: summaryData, isLoading: summaryLoading } = useBudgetSummary()
  const deleteMutation = useDeleteBudget()

  const handleEdit = (budget) => {
    setSelectedBudget(budget)
    setIsEditModalOpen(true)
  }

  const handleDelete = (budget) => {
    setSelectedBudget(budget)
    setIsDeleteModalOpen(true)
  }

  const handleView = (budget) => {
    navigate(`/budgets/${budget._id}`)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries(['budgets'])
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
  }

  if (budgetsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    )
  }

  const budgets = budgetsData?.data?.budgets || []
  const summary = summaryData || {}

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-muted/50 p-8 rounded-3xl">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
            Budgets & Goals
          </h1>
          <p className="text-xl text-muted-foreground mt-3 leading-relaxed max-w-2xl">
            Track your spending limits and savings targets with precision
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-xl h-14 px-10 text-lg font-bold"
          size="lg"
        >
          <Plus className="mr-3 h-5 w-5" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card title="Total Budgeted" icon={Wallet}>
          <div className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mb-4">
            ₹{summary.totalBudgeted?.toLocaleString() || 0}
          </div>
          <p className="text-2xl text-muted-foreground">{summary.total || 0} active budgets</p>
        </Card>

        <Card title="Total Spent" icon={TrendingUp}>
          <div className="text-5xl font-black text-orange-600 mb-4">
            ₹{summary.totalSpent?.toLocaleString() || 0}
          </div>
          <p className="text-2xl text-muted-foreground">
            ₹{summary.remaining?.toLocaleString() || 0} remaining
          </p>
        </Card>

        <Card title="Savings Goals" icon={Target}>
          <div className="text-5xl font-black text-green-600 mb-4">
            ₹{summary.savingsProgress?.toLocaleString() || 0}
          </div>
          <p className="text-2xl text-muted-foreground">
            of ₹{summary.savingsGoal?.toLocaleString() || 0}
          </p>
        </Card>

        <Card title="On Track" icon={AlertTriangle}>
          <div className="text-5xl font-black text-emerald-600 mb-4">
            {summary.onTrack || 0}
          </div>
          <Badge variant="secondary" className="text-xl px-6 py-3 font-bold">
            On Track
          </Badge>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Filter Budgets">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filters.type === 'budget' ? 'default' : 'outline'}
            onClick={() => setFilters({ ...filters, type: 'budget' })}
            className="px-8 py-3"
          >
            Budgets
          </Button>
          <Button
            variant={filters.type === 'savings' ? 'default' : 'outline'}
            onClick={() => setFilters({ ...filters, type: 'savings' })}
            className="px-8 py-3"
          >
            Savings Goals
          </Button>
          <Button
            variant={filters.status === 'active' ? 'default' : 'outline'}
            onClick={() => setFilters({ ...filters, status: filters.status === 'active' ? '' : 'active' })}
            className="px-8 py-3"
          >
            Active Only
          </Button>
        </div>
      </Card>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Card>
          <EmptyState
            title="No budgets created"
            description="Set spending limits for your categories to stay on track"
            icon={Wallet}
            action={
              <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="shadow-xl px-12">
                <Plus className="mr-2 h-4 w-4" />
                Create First Budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {budgets.map((budget) => {
            const Icon = budget.type === 'budget' ? Wallet : Target
            return (
              <Card
                key={budget._id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden h-[380px]"
                onClick={() => handleView(budget)}
              >
                <div className="p-8 space-y-6 h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge 
                      variant={budget.status === 'active' ? 'default' : 'destructive'}
                      className="font-bold px-4 py-2 shadow-lg"
                    >
                      {budget.status}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="font-black text-2xl capitalize leading-tight group-hover:text-primary transition-colors">
                      {budget.category}
                    </h3>
                    <p className="text-muted-foreground/80 leading-relaxed line-clamp-2">
                      {budget.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-muted-foreground">Progress</span>
                        <span className="text-lg font-bold">{budget.percentage || 0}%</span>
                      </div>
                      <Progress 
                        value={budget.percentage || 0} 
                        className="h-3 [&>div]:!bg-gradient-to-r [&>div]:!from-primary/80 [&>div]:!to-primary" 
                      />
                    </div>

                    <div className="space-y-2 text-lg">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-bold">₹{budget.progress?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-bold text-primary">₹{budget.amount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Remaining</span>
                        <span className={`font-black text-2xl ${budget.remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          ₹{budget.remaining?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-mono">
                      {dayjs(budget.startDate).format('MMM DD')} - {dayjs(budget.endDate).format('MMM DD, YYYY')}
                    </p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-bold"
                        onClick={() => handleEdit(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 font-bold"
                        onClick={() => handleDelete(budget)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals - UNCHANGED */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Budget" size="lg">
        <BudgetForm onSuccess={handleFormSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Budget" size="lg">
        <BudgetForm
          defaultValues={selectedBudget}
          isEdit
          onSuccess={handleFormSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedBudget?._id)}
        title="Delete Budget?"
        message={`Are you sure you want to delete the "${selectedBudget?.category}" budget? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export { Budgets }
