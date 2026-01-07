import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAPI } from '../lib/api.js'
import { toast } from 'react-hot-toast'

export const useTransactions = (params = {}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsAPI.getAll(params).then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTransaction = (id) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsAPI.getById(id).then(res => res.data.data),
    enabled: !!id,
  })
}

export const useSearchTransactions = (searchParams) => {
  return useQuery({
    queryKey: ['transactions', 'search', searchParams],
    queryFn: () => transactionsAPI.search(searchParams).then(res => res.data),
    enabled: !!searchParams.query,
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => transactionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      queryClient.invalidateQueries(['analytics'])
      queryClient.invalidateQueries(['budgets'])
      toast.success('Transaction created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction')
    }
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => transactionsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['transactions'])
      queryClient.invalidateQueries(['transaction', variables.id])
      queryClient.invalidateQueries(['analytics'])
      queryClient.invalidateQueries(['budgets'])
      toast.success('Transaction updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction')
    }
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => transactionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      queryClient.invalidateQueries(['analytics'])
      queryClient.invalidateQueries(['budgets'])
      toast.success('Transaction deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction')
    }
  })
}

export const useCategorizeTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => transactionsAPI.categorize(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      toast.success('Transaction categorized!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to categorize transaction')
    }
  })
}

export const useBulkCategorize = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => transactionsAPI.bulkCategorize(),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['transactions'])
      const result = response.data.data
      toast.success(`Successfully categorized ${result.categorized} transactions!`)
      return result
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to bulk categorize')
    }
  })
}
