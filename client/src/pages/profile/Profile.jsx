import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { userAPI } from '../../lib/api.js'
import useAuthStore from '../../store/authStore.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
// ✅ Label import REMOVED - using native placeholders
import { Badge } from '../../components/ui/Badge.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { ConfirmationModal } from '../../components/common/ConfirmationModal.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { User, Mail, Calendar, Shield, Key, Trash2, History, Edit, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'

const profileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm password'), 
}).refine(data => data.newPassword === data.confirmPassword, {     
  message: "Passwords don't match",
  path: ['confirmPassword']
})

const Profile = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)    
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userAPI.profile().then(res => res.data),        
  })

  const profile = profileResponse?.data?.user

  // ALL MUTATIONS 100% PRESERVED
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile'])
      toast.success('Profile updated successfully!')
      setIsEditModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setIsPasswordModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  })

  const deactivateMutation = useMutation({
    mutationFn: () => userAPI.deactivate(),
    onSuccess: () => {
      toast.success('Account deactivated')
      logout()
      navigate('/login')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate account')
    }
  })

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || ''
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  }

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || ''
      })
    }
  }, [profile, reset])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 p-16 rounded-3xl shadow-2xl border-4 border-primary/20">
        <h1 className="text-7xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight mb-8">
          Profile Settings
        </h1>
        <p className="text-4xl text-muted-foreground font-bold leading-relaxed max-w-4xl">
          Complete control over your account information, security, and privacy settings
        </p>
      </div>

      {/* MEGA Profile Overview */}
      <Card title="Account Information" icon={User} className="shadow-3xl lg:col-span-2">
        <div className="p-16">
          {/* Avatar & Name - ENHANCED */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 mb-16">
            <div className="flex-shrink-0 w-48 h-48 lg:w-64 lg:h-64 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-3xl border-8 border-primary/30 mx-auto lg:mx-0 group hover:scale-105 transition-all duration-500">
              <span className="text-7xl lg:text-9xl font-black text-background drop-shadow-2xl">
                {profile?.firstName?.[0]}{profile?.lastName?.[0] || ''}
              </span>
            </div>

            <div className="flex-1 lg:pt-8">
              <div className="space-y-8 mb-12">
                <div>
                  <h2 className="text-7xl lg:text-8xl font-black text-foreground mb-6 leading-tight">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}` 
                      : profile?.username || 'User'
                    }
                  </h2>
                  <div className="bg-gradient-to-r from-secondary/20 p-4 rounded-2xl inline-block">
                    <p className="text-4xl text-muted-foreground font-mono font-bold">@<span>{profile?.username || 'username'}</span></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center text-3xl">
                  <div className="flex items-center gap-6 p-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl shadow-xl min-w-[400px]">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
                      <Mail className="h-10 w-10 text-background" />
                    </div>
                    <span className="font-black text-foreground truncate">{profile?.email}</span>
                  </div>
                  <Badge 
                    variant={profile?.role === 'admin' ? 'default' : 'secondary'} 
                    className="text-4xl px-16 py-8 font-black shadow-2xl h-24 flex items-center px-8 min-w-[200px] justify-center"
                  >
                    {profile?.role?.toUpperCase() || 'USER'}
                  </Badge>
                </div>
              </div>

              <Button
                size="xl"
                onClick={() => setIsEditModalOpen(true)}
                className="h-24 px-16 text-3xl font-black shadow-2xl w-full lg:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90"
              >
                <Edit className="h-10 w-10 mr-6" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Account Stats Grid - ENHANCED */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t-4 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group p-16 rounded-3xl bg-gradient-to-br from-muted/50 border-4 border-muted/30 shadow-2xl h-[320px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="flex items-center gap-8 mb-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent to-accent/60 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                    <Calendar className="h-12 w-12 text-background font-bold" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-muted-foreground mb-4">Member Since</p>
                    <p className="text-6xl font-black text-primary">{dayjs(profile?.createdAt).format('MMM DD, YYYY')}</p>
                  </div>
                </div>
                <div className="text-2xl text-muted-foreground text-center mt-12">
                  {dayjs(profile?.createdAt).fromNow()} ago
                </div>
              </div>

              <div className="group p-16 rounded-3xl bg-gradient-to-br from-emerald-500/10 border-4 border-emerald-500/30 shadow-2xl h-[320px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="flex items-center gap-8 mb-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                    <Shield className="h-12 w-12 text-background font-bold" />
                  </div>
                  <Badge 
                    variant={profile?.isActive ? 'default' : 'secondary'} 
                    className="text-5xl px-20 py-10 font-black shadow-3xl h-28"
                  >
                    {profile?.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <p className="text-3xl text-muted-foreground text-center mt-12 font-bold">
                  Account Status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group p-16 rounded-3xl bg-gradient-to-br from-blue-500/10 border-4 border-blue-500/30 shadow-2xl h-[320px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="flex items-center gap-8 mb-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                    <Mail className="h-12 w-12 text-background font-bold" />
                  </div>
                  <Badge 
                    variant={profile?.isEmailVerified ? 'default' : 'secondary'} 
                    className="text-5xl px-20 py-10 font-black shadow-3xl h-28"
                  >
                    {profile?.isEmailVerified ? 'VERIFIED' : 'PENDING'}
                  </Badge>
                </div>
                <p className="text-3xl text-muted-foreground text-center mt-12 font-bold">
                  Email Verification
                </p>
              </div>

              <div className="group p-16 rounded-3xl bg-gradient-to-br from-purple-500/10 border-4 border-purple-500/30 shadow-2xl h-[320px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="flex items-center gap-8 mb-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                    <Calendar className="h-12 w-12 text-background font-bold" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-muted-foreground mb-4">Last Login</p>
                    <p className="text-6xl font-black text-purple-600">{dayjs(profile?.lastLogin).format('MMM DD, YYYY')}</p>
                    <p className="text-3xl font-mono text-muted-foreground mt-4">
                      {dayjs(profile?.lastLogin).format('h:mm A')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security & Danger Zone - ENHANCED */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="Security Center" icon={Key} className="shadow-2xl">
          <div className="space-y-6 p-12">
            {/* Password Change */}
            <div 
              className="group flex items-center justify-between p-12 rounded-3xl bg-gradient-to-r from-primary/10 hover:from-primary/20 border-4 border-primary/20 shadow-2xl hover:shadow-3xl transition-all h-32 cursor-pointer"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                  <Key className="h-12 w-12 text-background font-bold" />
                </div>
                <div>
                  <h4 className="text-5xl font-black mb-4 group-hover:text-primary transition-all">Change Password</h4>
                  <p className="text-3xl text-muted-foreground font-bold leading-relaxed">Secure your account with a new password</p>
                </div>
              </div>
              <div className="text-4xl font-black text-primary/80 group-hover:text-primary transition-all">→</div>
            </div>

            {/* Login History */}
            <div 
              className="group flex items-center justify-between p-12 rounded-3xl bg-gradient-to-r from-secondary/10 hover:from-secondary/20 border-4 border-secondary/20 shadow-2xl hover:shadow-3xl transition-all h-32 cursor-pointer"
              onClick={() => navigate('/profile/login-history')}
            >
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary/60 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                  <History className="h-12 w-12 text-background font-bold" />
                </div>
                <div>
                  <h4 className="text-5xl font-black mb-4 group-hover:text-primary transition-all">Login History</h4>
                  <p className="text-3xl text-muted-foreground font-bold leading-relaxed">Monitor your recent login activity</p>
                </div>
              </div>
              <div className="text-4xl font-black text-primary/80 group-hover:text-primary transition-all">→</div>
            </div>
          </div>
        </Card>

        {/* Danger Zone - ENHANCED */}
        <Card title="Danger Zone" icon={Trash2} className="shadow-3xl border-destructive/40 bg-gradient-to-br from-destructive/5 to-red-500/5">
          <div className="p-16 rounded-3xl border-4 border-destructive/40 bg-gradient-to-r from-destructive/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
              <div className="space-y-8 flex-1">
                <div className="flex items-center gap-8 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-destructive to-red-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                    <Trash2 className="h-12 w-12 text-background font-bold" />
                  </div>
                  <h4 className="text-7xl font-black bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent mb-4">
                    Deactivate Account
                  </h4>
                </div>
                <div className="bg-destructive/10 p-8 rounded-3xl border-2 border-destructive/30">
                  <p className="text-3xl text-muted-foreground leading-relaxed max-w-2xl">
                    ⚠️ Permanently delete your account and all associated data including transactions, budgets, and receipts. 
                    This action is irreversible.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="xl"
                onClick={() => setIsDeactivateModalOpen(true)}
                className="h-24 px-20 text-4xl font-black shadow-3xl bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 border-4 border-destructive/50"
              >
                🗑️ Deactivate Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal - LABELS REMOVED */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile" size="xl">
        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">  
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-2xl font-bold text-muted-foreground mb-4">
                <span>First Name</span>
              </div>
              <Input 
                {...registerProfile('firstName')} 
                className="h-20 text-3xl shadow-inner focus-visible:ring-4 focus-visible:ring-primary/50" 
                placeholder="Enter first name"
              />
              {profileErrors.firstName && (
                <p className="text-xl text-destructive font-bold flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  {profileErrors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-2xl font-bold text-muted-foreground mb-4">
                <span>Last Name</span>
              </div>
              <Input 
                {...registerProfile('lastName')} 
                className="h-20 text-3xl shadow-inner focus-visible:ring-4 focus-visible:ring-primary/50" 
                placeholder="Enter last name"
              />
              {profileErrors.lastName && (
                <p className="text-xl text-destructive font-bold flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  {profileErrors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-2xl font-bold text-muted-foreground mb-4">
              <span>Email Address</span>
            </div>
            <Input 
              type="email" 
              {...registerProfile('email')} 
              className="h-20 text-3xl shadow-inner focus-visible:ring-4 focus-visible:ring-primary/50" 
              placeholder="your.email@example.com"
            />
            {profileErrors.email && (
              <p className="text-xl text-destructive font-bold flex items-center gap-2">
                <Check className="h-5 w-5" />
                {profileErrors.email.message}
              </p>
            )}
          </div>
          <div className="flex gap-6 pt-12 border-t-4 border-primary/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)} 
              className="flex-1 h-24 text-3xl font-bold shadow-2xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending} 
              className="flex-1 h-24 text-3xl font-black shadow-3xl bg-gradient-to-r from-primary to-accent"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-6 h-12 w-12" />
                  Saving Changes...
                </>
              ) : (
                '💾 Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Modal - LABELS REMOVED */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password" size="xl">
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-2xl font-bold text-muted-foreground mb-4">
              <span>Current Password</span>
            </div>
            <Input 
              id="currentPassword" 
              type="password" 
              {...registerPassword('currentPassword')} 
              className="h-20 text-3xl shadow-inner focus-visible:ring-4 focus-visible:ring-primary/50" 
              placeholder="Enter current password"
            />
            {passwordErrors.currentPassword && (
              <p className="text-xl text-destructive font-bold flex items-center gap-2">
                <Check className="h-5 w-5" />
                {passwordErrors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-2xl font-bold text-muted-foreground mb-4">
              <span>New Password</span>
            </div>
            <Input 
              id="newPassword" 
              type="password" 
              {...registerPassword('newPassword')} 
              className="h-20 text-3xl shadow-inner focus-visible:ring-4 focus-visible:ring-primary/50" 
              placeholder="New password (min 8 chars)"
            />
            {passwordErrors.newPassword && (
              <p className="text-xl text-destructive font-bold flex items-center gap-2">
                <Check className="h-5 w-5" />
                {passwordErrors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-2xl font-bold text-muted-foreground mb-4">
              <span>Confirm Password</span>
            </div>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...registerPassword('confirmPassword')} 
              className="h-20 text-3xl shadow-inner focus-visible:ring-4 focus-visible:ring-primary/50" 
              placeholder="Confirm new password"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-xl text-destructive font-bold flex items-center gap-2">
                <Check className="h-5 w-5" />
                {passwordErrors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="flex gap-6 pt-12 border-t-4 border-primary/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="flex-1 h-24 text-3xl font-bold shadow-2xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending} 
              className="flex-1 h-24 text-3xl font-black shadow-3xl bg-gradient-to-r from-primary to-accent"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-6 h-12 w-12" />
                  Changing...
                </>
              ) : (
                '🔒 Update Password'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirmation - UNCHANGED */}
      <ConfirmationModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={() => deactivateMutation.mutate()}
        title="Deactivate Account"
        message="This action cannot be undone. All transactions, budgets, and data will be permanently deleted."
        confirmText="Deactivate Account"
        loading={deactivateMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}

export { Profile }
