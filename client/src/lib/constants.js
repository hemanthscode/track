export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
}

export const BUDGET_TYPES = {
  BUDGET: 'budget',
  SAVINGS: 'savings'
}

export const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'createdAt', label: 'Created' }
]

export const PERIOD_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
]

export const CHART_COLORS = {
  income: '#10B981',
  expense: '#EF4444',
  savings: '#3B82F6',
  balance: '#F59E0B'
}
