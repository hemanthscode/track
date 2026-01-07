import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { recurringAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ArrowLeft, Calendar, Repeat } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const UpcomingInstances = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: recurringResponse, isLoading: loadingRecurring } = useQuery({
    queryKey: ['recurring', id],
    queryFn: () => recurringAPI.getById(id).then(res => res.data), 
    enabled: !!id
  })

  const recurring = recurringResponse?.data?.transaction

  const { data: upcomingResponse, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['recurring', id, 'upcoming'],
    queryFn: () => recurringAPI.upcoming(id, 10).then(res => res.data),
    enabled: !!recurring
  })

  const upcoming = upcomingResponse?.data?.instances || []

  if (loadingRecurring || loadingUpcoming) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  if (!recurring) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
        <div className="text-center">
          <h2 className="text-5xl font-black text-muted-foreground mb-8">Recurring Transaction Not Found</h2>
          <Button size="lg" onClick={() => navigate('/recurring')} className="h-20 px-16 text-2xl">
            <ArrowLeft className="mr-4 h-8 w-8" />
            Back to Recurring
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="flex items-center gap-8 bg-gradient-to-r from-muted/50 p-12 rounded-3xl shadow-2xl">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/recurring')}
          className="h-20 w-20 p-0 shadow-xl"
        >
          <ArrowLeft className="h-10 w-10" />
        </Button>
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight mb-6">
            Upcoming Instances
          </h1>
          <p className="text-3xl text-muted-foreground font-bold">{recurring.description}</p>
        </div>
      </div>

      {/* Recurring Details */}
      <Card title="Transaction Details" icon={Repeat} className="shadow-2xl lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 p-12">
          <div className="group flex flex-col items-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 border-4 border-primary/30 hover:shadow-2xl transition-all hover:-translate-y-2 h-[300px]">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl mb-8 group-hover:scale-110 transition-all ${
              recurring.type === 'income' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-4 border-green-400' 
                : 'bg-gradient-to-br from-destructive to-red-500 border-4 border-destructive/50'
            }`}>
              <Repeat className="h-14 w-14 text-background font-bold" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-black mb-4 text-foreground">
                ₹{recurring.amount?.toLocaleString()}
              </p>
              <p className="text-2xl text-muted-foreground font-bold">Amount</p>
            </div>
          </div>

          <div className="space-y-8 p-12">
            <div className="flex items-center gap-8 p-8 bg-muted/50 rounded-3xl">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/60 rounded-2xl flex items-center justify-center">
                <Calendar className="h-10 w-10 text-background" />
              </div>
              <div>
                <p className="text-2xl text-muted-foreground font-bold mb-4">Frequency</p>
                <Badge variant="outline" className="text-3xl px-12 py-6 capitalize font-bold shadow-lg">
                  {recurring.recurringDetails?.frequency}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-8 p-8 bg-muted/50 rounded-3xl">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
                <svg className="h-10 w-10 text-background" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7H5V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl text-muted-foreground font-bold mb-4">Category</p>
                <Badge className="text-3xl px-12 py-6 capitalize font-bold shadow-lg w-full justify-center">
                  {recurring.category}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-12">
            <div className="flex items-center gap-8 p-8 bg-muted/50 rounded-3xl">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center">
                <Shield className="h-10 w-10 text-background" />
              </div>
              <div>
                <p className="text-2xl text-muted-foreground font-bold mb-4">Status</p>
                <Badge 
                  variant={recurring.isActive ? 'default' : 'secondary'} 
                  className="text-4xl px-16 py-8 font-black shadow-2xl h-24"
                >
                  {recurring.isActive ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
            </div>
            {recurring.recurringDetails?.endDate && (
              <div className="flex items-center gap-8 p-8 bg-muted/50 rounded-3xl">
                <div className="w-20 h-20 bg-gradient-to-br from-destructive to-destructive/60 rounded-2xl flex items-center justify-center">
                  <svg className="h-10 w-10 text-background" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl text-muted-foreground font-bold mb-4">Ends On</p>
                  <p className="text-4xl font-black">{dayjs(recurring.recurringDetails.endDate).format('MMM DD, YYYY')}</p>
                </div>
              </div>
            )}
          </div>

          {recurring.occurrencesRemaining && (
            <div className="col-span-1 md:col-span-2 lg:col-span-1 p-12 space-y-8">
              <div className="flex items-center gap-8 p-8 bg-gradient-to-r from-primary/20 border-2 border-primary/40 rounded-3xl h-full">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Repeat className="h-12 w-12 text-background font-bold" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-muted-foreground mb-8">Remaining Occurrences</p>
                  <p className="text-8xl font-black text-primary drop-shadow-2xl">{recurring.occurrencesRemaining}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Upcoming Instances */}
      <Card title={`Next ${upcoming.length} Occurrences`} icon={Calendar} className="shadow-2xl">
        <div className="space-y-6 p-12">
          {upcoming.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-center">
              <div>
                <Calendar className="h-32 w-32 text-muted-foreground/50 mx-auto mb-8" />
                <p className="text-4xl font-black text-muted-foreground">No upcoming occurrences</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.map((instance, index) => (
                <div key={index} className="group flex items-center justify-between p-12 rounded-3xl bg-gradient-to-r from-muted/50 hover:from-primary/10 hover:shadow-2xl transition-all hover:-translate-y-2 border border-border/50 h-32">
                  <div className="flex items-center gap-8">
                    <div className="flex-shrink-0 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-110 transition-all">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-4xl font-black group-hover:text-primary transition-colors mb-2">
                        {dayjs(instance.date).format('dddd, MMMM DD, YYYY')}
                      </p>
                      <p className="text-2xl text-muted-foreground font-mono">
                        {dayjs(instance.date).fromNow()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-6xl font-black drop-shadow-2xl ${
                    recurring.type === 'income' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent'
                  }`}>
                    {recurring.type === 'income' ? '+' : '-'}₹{instance.amount?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export { UpcomingInstances }
