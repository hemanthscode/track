import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ GLOBAL REFRESH QUEUE
let isRefreshing = false
let failedQueue = []

// Helper to clean empty params
const cleanParams = (params) => {
  if (!params || typeof params !== 'object') return {}
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  )
}

// Helper to get token from localStorage
const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.accessToken || null
    }
  } catch (error) {
    console.error('Failed to parse auth token:', error)
  }
  return null
}

// Process queued requests after refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url)
    
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ FIXED Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status)
    return response
  },
  async (error) => {
    console.error('❌ API Error:', error.message, error.config?.url)
    
    // Connection refused / Network errors
    if (error.code === 'ECONNREFUSED' || !error.response) {
      toast.error('Backend server not running. Please start your backend server on port 3000.')
      return Promise.reject(error)
    }

    const originalRequest = error.config

    // ✅ FIXED: Handle 401 with refresh queue
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // ✅ QUEUE ALL REQUESTS - NO RACE CONDITION
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
        
        if (isRefreshing) {
          // Wait for ongoing refresh
          return
        }
        
        isRefreshing = true
        
        // Perform refresh
        performRefresh()
          .then((tokens) => {
            isRefreshing = false
            processQueue(null, tokens)
            
            // Update original request and retry
            originalRequest._retry = true
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
            resolve(api(originalRequest))
          })
          .catch((refreshError) => {
            isRefreshing = false
            processQueue(refreshError, null)
            
            // Clear auth and redirect
            localStorage.removeItem('auth-storage')
            toast.error('Session expired. Please login again.')
            
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
            
            reject(refreshError)
          })
      })
    }

    // Handle other errors
    if (error.response?.status >= 400) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Something went wrong'
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

// ✅ NEW: Dedicated refresh function
const performRefresh = async () => {
  const authStorage = localStorage.getItem('auth-storage')
  if (!authStorage) throw new Error('No auth storage')
  
  const parsed = JSON.parse(authStorage)
  const refreshToken = parsed.state?.refreshToken
  
  if (!refreshToken) throw new Error('No refresh token')
  
  console.log('🔄 Refreshing token...')
  
  const { data } = await api.post('/auth/refresh', { refreshToken })
  const { tokens } = data.data
  
  // Update localStorage
  parsed.state.accessToken = tokens.accessToken
  parsed.state.refreshToken = tokens.refreshToken
  localStorage.setItem('auth-storage', JSON.stringify(parsed))
  
  console.log('✅ Token refreshed successfully')
  return tokens
}

export const apiClient = api

// ... rest of your API exports remain EXACTLY the same ...
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: (data) => api.post('/auth/refresh', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
}

export const transactionsAPI = {
  create: (data) => api.post('/transactions', data),
  getAll: (params) => api.get('/transactions', { params: cleanParams(params) }),
  getById: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  search: (params) => api.get('/transactions/search', { params: cleanParams(params) }),
  categorize: (data) => api.post('/ai/categorize', data),
  bulkCategorize: () => api.post('/ai/bulk-categorize'),
}

export const budgetsAPI = {
  create: (data) => api.post('/budgets', data),
  getAll: (params) => api.get('/budgets', { params: cleanParams(params) }),
  getSummary: () => api.get('/budgets/summary'),
  getById: (id) => api.get(`/budgets/${id}`),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  addProgress: (id, amount) => api.post(`/budgets/${id}/progress`, { amount }),
}

export const recurringAPI = {
  create: (data) => api.post('/recurring', data),
  getAll: (params) => api.get('/recurring', { params: cleanParams(params) }),
  getById: (id) => api.get(`/recurring/${id}`),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  cancel: (id) => api.post(`/recurring/${id}/cancel`),
  delete: (id) => api.delete(`/recurring/${id}`),
  upcoming: (id, count = 5) => api.get(`/recurring/${id}/upcoming?count=${count}`),
}

export const receiptsAPI = {
  upload: (formData) => api.post('/receipts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/receipts', { params: cleanParams(params) }),
  getById: (id) => api.get(`/receipts/${id}`),
  link: (id, transactionId) => api.post(`/receipts/${id}/link`, { transactionId }),
  unlink: (id) => api.post(`/receipts/${id}/unlink`),
  delete: (id) => api.delete(`/receipts/${id}`),
  retryOCR: (id) => api.post(`/receipts/${id}/retry-ocr`),
}

export const analyticsAPI = {
  overview: (params) => api.get('/analytics/overview', { params: cleanParams(params) }),
  categoryBreakdown: (params) => api.get('/analytics/category-breakdown', { params: cleanParams(params) }),
  trends: (params) => api.get('/analytics/trends', { params: cleanParams(params) }),
  comparisons: (period) => api.get(`/analytics/comparisons?period=${period}`),
  monthlySummary: (params) => api.get('/analytics/monthly-summary', { params: cleanParams(params) }),
  statistics: () => api.get('/analytics/statistics'),
}

export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  insights: (filters) => api.post('/ai/insights', filters),
  budgetRecommendations: (monthlyIncome) => api.post('/ai/budget-recommendations', { monthlyIncome }),
}

export const userAPI = {
  profile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  loginHistory: () => api.get('/users/login-history'),
  deactivate: () => api.delete('/users/deactivate'),
}

export const healthAPI = {
  check: () => api.get('/health'),
  detailed: () => api.get('/health/detailed'),
}

export default api
