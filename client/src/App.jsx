import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout/Layout.jsx'
import useAuthStore from './store/authStore.js'
import { queryClient } from './lib/queryClient.js'

// Auth Pages
import { Login } from './pages/auth/Login.jsx'
import { Register } from './pages/auth/Register.jsx'
import { ForgotPassword } from './pages/auth/ForgotPassword.jsx'

// Dashboard Pages  
import { Overview } from './pages/dashboard/Overview.jsx'
import { Analytics } from './pages/dashboard/Analytics.jsx'
import { Trends } from './pages/dashboard/Trends.jsx'

// Transaction Pages
import { Transactions } from './pages/transactions/Transactions.jsx'
import { TransactionDetail } from './pages/transactions/TransactionDetail.jsx'
import { BulkCategorize } from './pages/transactions/BulkCategorize.jsx'

// Budget Pages
import { Budgets } from './pages/budgets/Budgets.jsx'
import { BudgetDetail } from './pages/budgets/BudgetDetail.jsx'

// Recurring Pages
import { Recurring } from './pages/recurring/Recurring.jsx'
import { UpcomingInstances } from './pages/recurring/UpcomingInstances.jsx'

// Receipts Pages
import { Receipts } from './pages/receipts/Receipts.jsx'
import { ReceiptUpload } from './pages/receipts/ReceiptUpload.jsx'

// AI Pages - ALL ROUTES!
import { AIChat } from './pages/ai/AIChat.jsx'
import { Insights } from './pages/ai/Insights.jsx'
import { BudgetRecommendations } from './pages/ai/BudgetRecommendations.jsx'

// Profile Pages
import { Profile } from './pages/profile/Profile.jsx'
import { LoginHistory } from './pages/profile/LoginHistory.jsx'

function AppContent() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated())
  
  return (
    <Router>
      <div className="min-h-dvh bg-background antialiased">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes - PERFECT NESTING */}
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route index element={<Overview />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="dashboard/analytics" element={<Analytics />} />
            <Route path="dashboard/trends" element={<Trends />} />
            
            {/* Transactions */}
            <Route path="transactions" element={<Transactions />} />
            <Route path="transactions/:id" element={<TransactionDetail />} />
            <Route path="transactions/bulk-categorize" element={<BulkCategorize />} />
            
            {/* Budgets */}
            <Route path="budgets" element={<Budgets />} />
            <Route path="budgets/:id" element={<BudgetDetail />} />
            
            {/* Recurring */}
            <Route path="recurring" element={<Recurring />} />
            <Route path="recurring/upcoming" element={<UpcomingInstances />} />
            
            {/* Receipts */}
            <Route path="receipts" element={<Receipts />} />
            <Route path="receipts/upload" element={<ReceiptUpload />} />
            
            {/* AI Assistant - ALL PAGES! */}
            <Route path="ai" element={<AIChat />} />
            <Route path="ai/chat" element={<AIChat />} />
            <Route path="ai/insights" element={<Insights />} />
            <Route path="ai/budget-recommendations" element={<BudgetRecommendations />} />
            
            {/* Profile */}
            <Route path="profile" element={<Profile />} />
            <Route path="profile/login-history" element={<LoginHistory />} />
            
            {/* Catch-all */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
            },
          }}
        />
      </div>
    </Router>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
)

export default App
