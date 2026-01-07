import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Card } from '../ui/Card.jsx'
import { Mail, Lock, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const LoginForm = () => {
  const navigate = useNavigate()
  const login = useAuthStore(state => state.login)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.error || 'Login failed')
    }
  }

  const testLogin = async () => {
    const testCreds = {
      email: 'hemanths7.dev@gmail.com',
      password: 'Hemanth@78'
    }
    
    const result = await login(testCreds)
    if (result.success) {
      toast.success('Test login successful! 🚀')
      navigate('/dashboard')
    } else {
      toast.error('Test login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background to-muted/30">
      <Card 
        title="Welcome back" 
        subtitle="Sign in to your account"
        className="w-full max-w-md shadow-2xl border-0"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <Input.Label icon={Mail}>Email</Input.Label>
            <Input 
              type="email"
              placeholder="your.email@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Password */}
          <div>
            <Input.Label icon={Lock}>Password</Input.Label>
            <Input 
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full h-16 text-lg font-bold shadow-xl">
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="px-3 bg-background text-muted-foreground font-medium">or</span>
          </div>
        </div>

        {/* Test Button */}
        {import.meta.env.DEV && (
          <div className="p-4 bg-gradient-to-r from-muted/50 to-accent/10 rounded-2xl border-2 border-dashed border-muted/50">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={testLogin}
              className="w-full font-mono tracking-wider text-sm uppercase border-2"
            >
              🔑 Quick Test Login
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2 opacity-75 font-mono">
              Development only - auto login
            </p>
          </div>
        )}

        {/* Register Link */}
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold transition-colors flex items-center justify-center gap-1 mx-auto">
              <UserPlus className="h-4 w-4" />
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export { LoginForm }
