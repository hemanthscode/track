import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { ArrowLeft, Monitor, Smartphone, MapPin, Calendar, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const LoginHistory = () => {
  const navigate = useNavigate()

  const { data: loginResponse, isLoading } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: () => userAPI.loginHistory().then(res => res.data),   
  })

  const loginHistory = loginResponse?.data?.loginHistory || []     

  const getDeviceIcon = (device) => {
    if (!device) return Monitor
    const ua = device.toLowerCase()
    if (ua.includes('postman') || ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone
    }
    return Monitor
  }

  const getDeviceName = (device) => {
    if (!device) return 'Unknown Device'
    const ua = device.toLowerCase()
    if (ua.includes('postman')) return 'Postman'
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    return 'Web Browser'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6 bg-gradient-to-r from-muted/50 p-8 rounded-3xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="h-12 w-12 p-0 shadow-lg"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
            Login History
          </h1>
          <p className="text-xl text-muted-foreground mt-3 leading-relaxed">
            Track your account security and recent activity
          </p>
        </div>
      </div>

      {/* Security Alert */}
      <Card title="Security Reminder" icon={Shield} className="border-accent bg-accent/10">
        <div className="flex items-start gap-4 p-6">
          <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center border-2 border-accent/40">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="text-2xl font-bold text-foreground mb-3">Stay Secure</h4>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Review your recent logins. If you see unfamiliar devices or locations,
              change your password immediately.
            </p>
          </div>
        </div>
      </Card>

      {/* Login History */}
      {loginHistory.length === 0 ? (
        <EmptyState
          title="No Login History"
          description="Your login activity will appear here once you start using the app"
          icon={Shield}
          actionText="Go to Profile"
          onAction={() => navigate('/profile')}
        />
      ) : (
        <Card title={`Recent Sessions (${loginHistory.length})`} icon={Shield}>
          <div className="space-y-6">
            {loginHistory.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.device)   
              const isRecent = index < 3

              return (
                <div
                  key={session.loginAt || index}
                  className={`group p-8 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
                    isRecent
                      ? 'border-primary/30 bg-gradient-to-r from-primary/5 shadow-xl'
                      : 'border-border/50 hover:border-primary/30 bg-muted/20'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Device Icon */}
                    <div className={`flex-shrink-0 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all ${
                      isRecent
                        ? 'bg-gradient-to-br from-primary to-primary/60 border-4 border-primary/40'
                        : 'bg-gradient-to-br from-muted to-muted/50 border-2 border-border/50'
                    }`}>
                      <DeviceIcon className="h-9 w-9 text-background font-bold" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black group-hover:text-primary transition-colors truncate">
                            {getDeviceName(session.device)}      
                          </h3>
                          <p className="text-2xl text-muted-foreground font-mono">
                            {session.ipAddress}
                          </p>
                        </div>

                        {isRecent && (
                          <Badge variant="default" className="text-2xl px-6 py-3 font-bold shadow-lg whitespace-nowrap">
                            Recent
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xl mb-6">
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                          <Calendar className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-foreground">
                            {dayjs(session.loginAt).format('MMM DD, YYYY hh:mm A')}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                          <MapPin className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium capitalize">{session.location}</span>        
                        </div>
                      </div>

                      {/* User Agent */}
                      {session.device && (
                        <details className="group/details mt-6">
                          <summary className="text-lg text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-2 p-4 bg-muted/50 rounded-2xl transition-all group-hover/details:bg-muted/70">
                            Device Details → <span className="text-xs font-mono">({session.device.length} chars)</span>
                          </summary>
                          <div className="mt-4 p-6 bg-muted/60 rounded-2xl font-mono text-lg break-words border border-border/50 max-h-40 overflow-y-auto">
                            {session.device}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export { LoginHistory }
