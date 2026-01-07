import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authAPI, userAPI } from '../lib/api.js'
import useAuthStore from '../store/authStore.js'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const navigate = useNavigate()
  const setTokens = useAuthStore(state => state.setTokens)
  const setUser = useAuthStore(state => state.setUser)

  return useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (response) => {
      const { tokens, user } = response.data.data
      setTokens(tokens)
      setUser(user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  const setTokens = useAuthStore(state => state.setTokens)
  const setUser = useAuthStore(state => state.setUser)

  return useMutation({
    mutationFn: (userData) => authAPI.register(userData),
    onSuccess: (response) => {
      const { tokens, user } = response.data.data
      setTokens(tokens)
      setUser(user)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast.success('Logged out successfully')
      navigate('/login')
    },
    onError: () => {
      // Still logout on error
      logout()
      queryClient.clear()
      navigate('/login')
    }
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => authAPI.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset link sent to your email!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    }
  })
}

export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => authAPI.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successful!')
      navigate('/login')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }
  })
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token) => authAPI.verifyEmail(token),
    onSuccess: () => {
      toast.success('Email verified successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify email')
    }
  })
}

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated())

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userAPI.profile().then(res => res.data.data),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)

  return useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.data.data)
      queryClient.invalidateQueries(['user', 'me'])
      queryClient.invalidateQueries(['profile'])
      toast.success('Profile updated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  })
}

export const useLoginHistory = () => {
  return useQuery({
    queryKey: ['loginHistory'],
    queryFn: () => userAPI.loginHistory().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export const useDeactivateAccount = () => {
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => userAPI.deactivate(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast.success('Account deactivated successfully')
      navigate('/login')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate account')
    }
  })
}
