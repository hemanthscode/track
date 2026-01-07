import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { transactionsAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'  // ✅ CUSTOM Select
import { Badge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { TransactionForm } from '../../components/forms/TransactionForm.jsx'
import { ConfirmationModal } from '../../components/common/ConfirmationModal.jsx'
import { Plus, Search, Filter, CreditCard, ArrowUpRight, ArrowDownRight, Edit3, Trash2, Tag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const Transactions = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)    
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // 100% PRESERVED QUERY & MUTATIONS
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, filters],
    queryFn: () => transactionsAPI.getAll({
      page,
      limit: 12,
      ...filters
    }).then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      queryClient.invalidateQueries(['analytics'])
      toast.success('Transaction deleted!')
      setIsDeleteModalOpen(false)
    },
    onError: () => {
      toast.error('Failed to delete transaction')
    }
  })

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteModalOpen(true)
  }

  const handleView = (transaction) => {
    navigate(`/transactions/${transaction._id}`)
  }

  const handleFormSuccess = () => {
    queryClient.invalidateQueries(['transactions'])
    queryClient.invalidateQueries(['analytics'])
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  const transactions = data?.data?.transactions || []
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-muted/50 p-12 rounded-3xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight mb-6">
              Transactions
            </h1>
            <p className="text-3xl text-muted-foreground font-bold">
              {pagination.total || 0} total transactions tracked
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/transactions/bulk-categorize')}
              className="h-20 px-12 text-2xl font-bold shadow-xl order-2 sm:order-1"
            >
              <Filter className="mr-4 h-8 w-8" />
              AI Categorize
            </Button>
            <Button 
              size="lg" 
              onClick={() => setIsCreateModalOpen(true)}
              className="h-20 px-12 text-2xl font-bold shadow-2xl order-1 sm:order-2"
            >
              <Plus className="mr-4 h-8 w-8" />
              Add Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* Filters - CUSTOM SELECT ✅ */}
      <Card title="Advanced Filters" className="shadow-xl">
        <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground z-10" />
            <Input
              placeholder="🔍 Search all transactions..."
              className="h-20 pl-20 pr-12 text-2xl shadow-inner group-hover:shadow-md transition-all"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* TYPE SELECT */}
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'income', label: '💰 Income' },
              { value: 'expense', label: '💸 Expense' }
            ]}
            placeholder="All Types"
            className="h-20 text-2xl"
          />

          {/* CATEGORY SELECT */}
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'food', label: '🍽️ Food' },
              { value: 'transport', label: '🚗 Transport' },
              { value: 'entertainment', label: '🎬 Entertainment' },
              { value: 'shopping', label: '🛒 Shopping' },
              { value: 'utilities', label: '⚡ Utilities' },
              { value: 'healthcare', label: '🏥 Healthcare' },
              { value: 'salary', label: '💼 Salary' },
              { value: 'investment', label: '📈 Investment' }
            ]}
            placeholder="All Categories"
            className="h-20 text-2xl"
          />

          {/* SORT SELECT */}
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}
            options={[
              { value: 'desc', label: '📅 Newest First' },
              { value: 'asc', label: '📜 Oldest First' }
            ]}
            placeholder="Sort Order"
            className="h-20 text-2xl"
          />
        </div>
      </Card>

      {/* Transactions Grid */}
      {transactions.length === 0 ? (
        <Card title="No Transactions" className="shadow-xl">
          <EmptyState
            title="No transactions found"
            description="Add your first transaction to start tracking your finances"
            icon={CreditCard}
            action={
              <Button size="lg" onClick={() => setIsCreateModalOpen(true)} className="h-20 px-16 text-2xl">
                <Plus className="mr-4 h-8 w-8" />
                Add First Transaction
              </Button>
            }
          />
        </Card>
      ) : (
        <Card title={`All Transactions (${transactions.length})`} icon={CreditCard} className="shadow-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 p-12">
            {transactions.map((transaction) => (
              <div key={transaction._id} className={`group relative overflow-hidden rounded-3xl p-8 h-[580px] transition-all hover:shadow-3xl hover:-translate-y-4 cursor-pointer ${
                transaction.type === 'income' 
                  ? 'bg-gradient-to-br from-green-500/10 border-green-500/30 shadow-xl' 
                  : 'bg-gradient-to-br from-destructive/10 border-destructive/30 shadow-xl'
              }`}>
                {/* Status Badge */}
                <div className="absolute top-8 right-8 z-20">
                  <Badge 
                    variant={transaction.type === 'income' ? 'default' : 'destructive'}
                    className={`text-2xl px-8 py-4 font-black shadow-2xl h-20 flex items-center ${
                      transaction.type === 'income' ? 'bg-green-500 text-white' : 'bg-destructive text-white'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowDownRight className="h-6 w-6 mr-2" />
                    ) : (
                      <ArrowUpRight className="h-6 w-6 mr-2" />
                    )}
                    {transaction.type.toUpperCase()}
                  </Badge>
                </div>

                {/* Icon & Date */}
                <div className="flex items-start justify-between mb-12 pt-28">
                  <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all ${
                    transaction.type === 'income'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-4 border-green-400'
                      : 'bg-gradient-to-br from-destructive to-red-500 border-4 border-destructive/50'
                  }`}>
                    <CreditCard className="h-14 w-14 text-white font-bold" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black mb-2">{dayjs(transaction.date).format('MMM DD')}</p>
                    <p className="text-xl font-mono text-muted-foreground">{dayjs(transaction.date).format('HH:mm')}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-16">
                  <p className="text-3xl text-muted-foreground font-bold mb-8 text-center">Amount</p>
                  <div className={`text-8xl font-black drop-shadow-4xl text-center ${
                    transaction.type === 'income'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>

                {/* Category & Description */}
                <div className="space-y-8 mb-16">
                  <div className="group flex items-center gap-8 p-8 rounded-3xl bg-muted/50 border border-border/50 shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
                      <Tag className="h-10 w-10 text-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl text-muted-foreground font-bold mb-2">Category</p>
                      <Badge className="text-3xl px-12 py-6 capitalize font-black shadow-lg w-full justify-center">
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>

                  {transaction.description && (
                    <div className="p-8 bg-muted/30 rounded-2xl backdrop-blur-sm border">
                      <p className="text-2xl font-bold text-muted-foreground mb-4">Description</p>
                      <p className="text-3xl font-bold leading-relaxed">{transaction.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-12 border-t-4 border-border/50">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-20 text-2xl font-bold group-hover:shadow-2xl transition-all"
                    onClick={() => handleView(transaction)}
                  >
                    <CreditCard className="mr-4 h-8 w-8" />
                    View Details
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-20 px-8 text-2xl font-bold"
                    onClick={() => handleEdit(transaction)}
                  >
                    <Edit3 className="h-8 w-8 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="h-20 w-20 p-0 shadow-2xl"
                    onClick={() => handleDelete(transaction)}
                  >
                    <Trash2 className="h-10 w-10" />
                  </Button>
                </div>

                {transaction.tags && transaction.tags.length > 0 && (
                  <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-3">
                    {transaction.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xl px-6 py-4 font-bold">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-12 pt-8 border-t-4 border-primary/20 bg-gradient-to-r from-muted/50 rounded-b-3xl">
              <p className="text-2xl text-muted-foreground font-bold">
                Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 text-xl"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                >
                  ← Previous
                </Button>
                <Button
                  size="lg"
                  className="h-16 px-12 text-xl font-bold"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ALL MODALS 100% PRESERVED */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Transaction" size="lg">
        <TransactionForm onSuccess={handleFormSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Transaction" size="lg">
        <TransactionForm
          defaultValues={selectedTransaction}
          isEdit
          onSuccess={handleFormSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedTransaction?._id)}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${selectedTransaction?.description}"? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export { Transactions }
