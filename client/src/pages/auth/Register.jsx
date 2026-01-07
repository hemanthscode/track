import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
// ✅ Label import REMOVED
import { Card } from '../../components/ui/Card.jsx'
import { Mail, User, Lock, Check, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { useState } from 'react'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
}).refine(data => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)     
}, {
  message: 'Password must contain uppercase, lowercase, and number',
  path: ['password']
})

const Register = () => {
  const navigate = useNavigate()
  const register = useAuthStore(state => state.register)
  const [showPassword, setShowPassword] = useState(false)

  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    const result = await register(data)
    if (result.success) {
      toast.success('Account created! Welcome aboard!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/70 p-8">
      <Card 
        title="Create Account"
        subtitle="Enter your details to get started"
        icon={User}
        className="max-w-2xl w-full mx-auto shadow-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-semibold text-muted-foreground">
                <User className="h-4 w-4" />
                First Name
              </div>
              <Input className="h-14 text-lg" {...formRegister('firstName')} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 font-semibold text-muted-foreground">
                <User className="h-4 w-4" />
                Last Name
              </div>
              <Input className="h-14 text-lg" {...formRegister('lastName')} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 font-semibold text-muted-foreground">
              <User className="h-4 w-4" />
              Username
            </div>
            <Input
              className="h-14 text-lg"
              {...formRegister('username')}
              error={errors.username?.message}
            />
            {errors.username && <p className="text-sm text-destructive mt-2 font-medium">{errors.username.message}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 font-semibold text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email
            </div>
            <Input
              type="email"
              className="h-14 text-lg"
              {...formRegister('email')}
              error={errors.email?.message}
            />
            {errors.email && <p className="text-sm text-destructive mt-2 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 font-semibold text-muted-foreground">
              <Lock className="h-4 w-4" />
              Password
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                className="h-14 text-lg pr-14"
                {...formRegister('password')}
                error={errors.password?.message}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive mt-2 font-medium">{errors.password.message}</p>}

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                /^(?=.*[a-z])/.test(password) 
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 shadow-md' 
                  : 'bg-destructive/5 text-destructive border border-destructive/20'
              }`}>
                <Check className={`h-4 w-4 flex-shrink-0 ${/^(?=.*[a-z])/.test(password) ? 'fill-current text-emerald-600' : ''}`} />
                1 lowercase letter
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                /^(?=.*[A-Z])/.test(password) 
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 shadow-md' 
                  : 'bg-destructive/5 text-destructive border border-destructive/20'
              }`}>
                <Check className={`h-4 w-4 flex-shrink-0 ${/^(?=.*[A-Z])/.test(password) ? 'fill-current text-emerald-600' : ''}`} />
                1 uppercase letter
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                /^(?=.*\d)/.test(password) 
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 shadow-md' 
                  : 'bg-destructive/5 text-destructive border border-destructive/20'
              }`}>
                <Check className={`h-4 w-4 flex-shrink-0 ${/^(?=.*\d)/.test(password) ? 'fill-current text-emerald-600' : ''}`} />
                1 number
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                password?.length >= 8 
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 shadow-md' 
                  : 'bg-destructive/5 text-destructive border border-destructive/20'
              }`}>
                <Check className={`h-4 w-4 flex-shrink-0 ${password?.length >= 8 ? 'fill-current text-emerald-600' : ''}`} />
                Minimum 8 characters
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-16 shadow-2xl bg-gradient-to-r from-primary to-primary/90 text-xl font-bold" size="xl" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center pt-6">
            <p className="text-lg text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-xl font-bold text-primary hover:text-primary/90 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}

export { Register }
