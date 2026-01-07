import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { recurringAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ConfirmationModal } from '../../components/common/ConfirmationModal.jsx'
import { Plus, Calendar, Repeat, Pause, Play } from 'lucide-react' 
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const Recurring = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRecurring, setSelectedRecurring] = useState(null) 

  const { data: recurringResponse, isLoading } = useQuery({        
    queryKey: ['recurring'],
    queryFn: () => recurringAPI.getAll().then(res => res.data),    
  })

  const recurring = recurringResponse?.data?.transactions || []    

  // ALL MUTATIONS 100% PRESERVED
  const cancelMutation = useMutation({
    mutationFn: (id) => recurringAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['recurring'])
      toast.success('Recurring transaction paused!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to pause recurring transaction')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => recurringAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['recurring'])
      toast.success('Recurring transaction deleted!')
      setIsDeleteModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete recurring transaction')
    }
  })

  const handleToggle = (item) => {
    if (item.isActive) {
      cancelMutation.mutate(item._id)
    } else {
      toast.info('Reactivation coming soon')
    }
  }

  const handleDelete = (item) => {
    setSelectedRecurring(item)
    setIsDeleteModalOpen(true)
  }

  const handleView = (item) => {
    navigate(`/recurring/${item._id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  const activeCount = recurring.filter(r => r.isActive).length     
  const monthlyTotal = recurring
    .filter(r => r.isActive && r.recurringDetails?.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0)
  const pausedCount = recurring.filter(r => !r.isActive).length    

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-muted/50 p-12 rounded-3xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight mb-6">
              Recurring Transactions
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              Automate your income and expenses tracking
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate('/recurring/create')}
            className="h-20 px-12 text-2xl font-bold shadow-2xl self-start lg:self-auto"
          >
            <Plus className="h-8 w-8 mr-4" />
            Add Recurring
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card title="Active" icon={Play} className="shadow-xl h-[220px]">
          <div className="text-6xl font-black text-green-600">{activeCount}</div>
          <p className="text-xl text-muted-foreground mt-6">Running automatically</p>
        </Card>

        <Card title="Monthly Total" icon={Calendar} className="shadow-xl h-[220px]">
          <div className="text-6xl font-black text-primary">₹{monthlyTotal.toLocaleString()}</div>
          <p className="text-xl text-muted-foreground mt-6">Per month</p>
        </Card>

        <Card title="Paused" icon={Pause} className="shadow-xl h-[220px]">
          <div className="text-6xl font-black text-muted-foreground">{pausedCount}</div>
          <p className="text-xl text-muted-foreground mt-6">Temporarily stopped</p>
        </Card>
      </div>

      {/* Recurring Transactions */}
      {recurring.length === 0 ? (
        <Card title="No Recurring Transactions" className="shadow-xl">
          <EmptyState
            title="No recurring transactions"
            description="Add recurring transactions to automate your expense tracking"
            icon={Repeat}
            action={
              <Button size="lg" onClick={() => navigate('/recurring/create')} className="h-16 px-12 text-xl">
                <Plus className="mr-3 h-6 w-6" />
                Add Recurring
              </Button>
            }
          />
        </Card>
      ) : (
        <Card title={`All Recurring Transactions (${recurring.length})`} icon={Repeat} className="shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 p-12">
            {recurring.map((item) => (
              <div key={item._id} className={`group relative overflow-hidden rounded-3xl p-8 h-[520px] transition-all hover:shadow-2xl hover:-translate-y-4 cursor-pointer ${
                item.isActive 
                  ? 'bg-gradient-to-br from-primary/10 border-primary/30 shadow-xl' 
                  : 'bg-gradient-to-br from-muted/50 border-muted/50 shadow-lg'
              }`}>
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-20">
                  <Badge 
                    variant={item.isActive ? 'default' : 'secondary'} 
                    className="text-2xl px-8 py-4 font-bold shadow-lg h-16"
                  >
                    {item.isActive ? 'ACTIVE' : 'PAUSED'}
                  </Badge>
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-6 mb-8 pt-20">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all ${
                    item.isActive 
                      ? 'bg-gradient-to-br from-primary to-primary/60 border-4 border-primary/40' 
                      : 'bg-gradient-to-br from-muted to-muted/50 border-2 border-muted/50'
                  }`}>
                    <Repeat className="h-12 w-12 text-background font-bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-4xl font-black group-hover:text-primary transition-colors mb-2 truncate">
                      {item.description}
                    </h3>
                    <Badge variant="outline" className="text-xl px-6 py-3 capitalize">
                      {item.recurringDetails?.frequency}
                    </Badge>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-12">
                  <p className="text-2xl text-muted-foreground font-bold mb-4">Amount</p>
                  <div className={`text-7xl font-black drop-shadow-2xl ${
                    item.type === 'income' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent'
                  }`}>
                    ₹{item.amount?.toLocaleString()}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div>
                    <p className="text-xl text-muted-foreground font-bold mb-4">Category</p>
                    <Badge className="text-2xl px-8 py-4 capitalize font-bold shadow-lg w-full justify-center">
                      {item.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xl text-muted-foreground font-bold mb-4">Next Date</p>
                    <p className={`text-4xl font-black ${item.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.isActive
                        ? dayjs(item.recurringDetails?.nextOccurrence).format('MMM DD, YYYY')
                        : 'Paused'}
                    </p>
                  </div>
                </div>

                {/* Remaining */}
                {item.occurrencesRemaining && (
                  <div className="mb-12 p-6 bg-muted/50 rounded-2xl">
                    <p className="text-xl text-muted-foreground font-bold mb-4">Remaining</p>
                    <p className="text-4xl font-black text-primary">{item.occurrencesRemaining}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-8 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-20 text-2xl font-bold group-hover:shadow-xl transition-all"
                    onClick={() => handleView(item)}
                  >
                    <Calendar className="h-8 w-8 mr-4" />
                    View Schedule
                  </Button>
                  <Button
                    size="lg"
                    variant={item.isActive ? "secondary" : "default"}
                    className="h-20 w-20 p-0 shadow-xl font-bold text-2xl"
                    onClick={() => handleToggle(item)}
                  >
                    {item.isActive ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="h-20 w-20 p-0 shadow-xl"
                    onClick={() => handleDelete(item)}
                  >
                    <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v11a3 3 0 01-3 3H7a3 3 0 01-3-3V5zm3 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedRecurring?._id)}
        title="Delete Recurring Transaction?"
        message="This will stop all future automated transactions. Past transactions will remain."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export { Recurring }
