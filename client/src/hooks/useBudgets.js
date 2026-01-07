import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsAPI } from '../lib/api.js'
import { toast } from 'react-hot-toast'

export const useBudgets = (params = {}) => {
  return useQuery({
    queryKey: ['budgets', params],
    queryFn: () => budgetsAPI.getAll(params).then(res => res.data),
    staleTime: 3 * 60 * 1000,
  })
}

export const useBudget = (id) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsAPI.getById(id).then(res => res.data.data.budget),
    enabled: !!id,
  })
}

export const useBudgetSummary = () => {
  return useQuery({
    queryKey: ['budgets', 'summary'],
    queryFn: async () => {
      const res = await budgetsAPI.getSummary()
      const data = res.data.data
      
      return {
        total: data.budgets.total,
        totalBudgeted: data.budgets.totalBudgeted,
        totalSpent: data.budgets.totalSpent,
        remaining: data.budgets.remaining,
        onTrack: data.budgets.byStatus?.active || 0,
        health: data.budgets.totalSpent === 0 ? 'healthy' : 'active',
        savingsTotal: data.savings.total,
        savingsGoal: data.savings.totalGoal,
        savingsProgress: data.savings.totalProgress,
        savingsRemaining: data.savings.remaining
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => budgetsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      toast.success('Budget created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create budget')
    }
  })
}

export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => budgetsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget', variables.id])
      toast.success('Budget updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update budget')
    }
  })
}

export const useDeleteBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => budgetsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      toast.success('Budget deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete budget')
    }
  })
}

export const useAddBudgetProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }) => budgetsAPI.addProgress(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget', variables.id])
      toast.success('Budget progress updated!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update progress')
    }
  })
}
