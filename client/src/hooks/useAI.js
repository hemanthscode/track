import { useMutation, useQuery } from '@tanstack/react-query'
import { aiAPI } from '../lib/api.js'
import { toast } from 'react-hot-toast'

export const useAIChat = () => {
  return useMutation({
    mutationFn: (text) => {
      console.log('🔄 INPUT:', text)
      
      // ✅ BACKEND EXPECTS RAW STRING - NOT OBJECT!
      return aiAPI.chat(text)
    },
    onSuccess: (response) => {
      console.log('✅ RAW RESPONSE:', response)
      console.log('✅ data.data:', response.data.data)
      
      // ✅ PERFECT PATH
      const answer = response.data.data.answer
      console.log('✅ ANSWER:', answer)
      
      return answer
    },
    onError: (error) => {
      console.error('❌ ERROR:', error)
      toast.error('Chat failed')
    }
  })
}

export const useAIInsights = (filters = {}) => {
  return useQuery({
    queryKey: ['ai', 'insights', filters],
    queryFn: () => aiAPI.insights(filters).then(res => res.data.data),
    staleTime: 10 * 60 * 1000,
    enabled: Object.keys(filters).length > 0,
  })
}

export const useGenerateInsights = () => {
  return useMutation({
    mutationFn: (filters) => aiAPI.insights(filters),
    onSuccess: () => {
      toast.success('Insights generated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate insights')
    }
  })
}

export const useBudgetRecommendations = () => {
  return useMutation({
    mutationFn: ({ monthlyIncome }) => {
      // ✅ FIXED: Ensure number
      const income = parseFloat(monthlyIncome)
      if (isNaN(income) || income <= 0) {
        throw new Error('Invalid income amount')
      }
      return aiAPI.budgetRecommendations(income)
    },
    onSuccess: () => {
      toast.success('Budget recommendations generated!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to generate recommendations')
    }
  })
}

export const useCategorizeWithAI = () => {
  return useMutation({
    mutationFn: ({ description, type = 'expense' }) => {
      const prompt = `Categorize this: "${description}" as ${type}`
      return aiAPI.categorize({ description, type })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to categorize with AI')
    }
  })
}

export const useAIFeatures = () => {
  const chat = useAIChat()
  const generateInsights = useGenerateInsights()
  const budgetRecommendations = useBudgetRecommendations()

  return {
    chat,
    generateInsights,
    budgetRecommendations,
    isLoading: chat.isPending || generateInsights.isPending || budgetRecommendations.isPending,
  }
}
