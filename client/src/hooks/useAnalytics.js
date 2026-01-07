import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../lib/api.js'
import dayjs from 'dayjs'

export const useOverview = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => analyticsAPI.overview(params).then(res => {
      const data = res.data.data
      
      return {
        income: data.income.total,
        incomeCount: data.income.count,
        incomeAverage: data.income.average,
        expenses: data.expenses.total,
        expensesCount: data.expenses.count,
        expensesAverage: data.expenses.average,
        balance: data.balance,
        savingsRate: data.savingsRate,
        topCategories: data.topCategories || [],
        chartData: data.topCategories?.map(cat => ({
          name: cat.category,
          value: parseFloat(cat.amount),
          percentage: cat.percentage
        })) || [],
        recentTransactions: [],
        balanceChange: 0,
        incomeChange: 0,
        expensesChange: 0
      }
    }),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCategoryBreakdown = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', 'categories', params],
    queryFn: () => analyticsAPI.categoryBreakdown(params).then(res => {
      const data = res.data.data
      // RETURN ALL CATEGORIES - NO FILTERING!
      return data.categories || []
    }),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTrends = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', 'trends', params],
    queryFn: () => analyticsAPI.trends(params).then(res => res.data.data.trends || []),
    staleTime: 5 * 60 * 1000,
  })
}

export const useComparisons = (period = 'month') => {
  return useQuery({
    queryKey: ['analytics', 'comparisons', period],
    queryFn: () => analyticsAPI.comparisons(period).then(res => res.data.data),
    staleTime: 10 * 60 * 1000,
  })
}

export const useMonthlySummary = (params = {}) => {
  return useQuery({
    queryKey: ['analytics', 'monthly-summary', params],
    queryFn: () => analyticsAPI.monthlySummary(params).then(res => res.data.data),
    staleTime: 10 * 60 * 1000,
  })
}

export const useStatistics = () => {
  return useQuery({
    queryKey: ['analytics', 'statistics'],
    queryFn: () => analyticsAPI.statistics().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export const useBudgetSummary = () => {
  return useQuery({
    queryKey: ['budgets', 'summary'],
    queryFn: async () => {
      // Use overview as fallback for budget data
      const res = await analyticsAPI.overview({ limit: 1 })
      const data = res.data.data
      return {
        total: data.budgets?.total || 0,
        totalBudgeted: data.budgets?.totalBudgeted || 0,
        totalSpent: data.budgets?.totalSpent || 0,
        remaining: data.budgets?.remaining || 0,
        onTrack: data.budgets?.byStatus?.active || 0,
        health: data.budgets?.totalSpent === 0 ? 'healthy' : 'active'
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}
