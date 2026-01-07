import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../lib/api.js'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { useState } from 'react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data) => {
    try {
      await authAPI.forgotPassword(data.email)
      setEmailSent(true)
      toast.success('Password reset link sent to your email!')
    } catch (error) {
      toast.error('Failed to send reset email')
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 p-8">
        <Card 
          title="Check your email"
          subtitle="We've sent a password reset link to your email address"
          icon={CheckCircle}
          className="max-w-md w-full mx-auto shadow-2xl text-center"
        >
          <Link to="/login">
            <Button variant="outline" className="w-full h-14 shadow-xl mt-6" size="lg">
              <ArrowLeft className="mr-3 h-5 w-5" />
              Back to Login
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 p-8">
      <Card 
        title="Forgot Password?"
        subtitle="Enter your email and we'll send you a reset link"
        icon={Mail}
        className="max-w-md w-full mx-auto shadow-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
            <Input
              placeholder="your@email.com"
              className="pl-14 h-16 text-lg bg-muted/50 shadow-inner backdrop-blur-sm"
              {...register('email')}
              error={errors.email?.message}
            />
            {errors.email && <p className="text-sm text-destructive mt-2 font-medium">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full h-16 shadow-2xl bg-gradient-to-r from-primary to-primary/90 text-xl" size="xl" disabled={isSubmitting}>
            {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
          </Button>

          <div className="text-center pt-4">
            <Link to="/login" className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export { ForgotPassword }
