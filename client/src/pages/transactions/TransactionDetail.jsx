import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { transactionsAPI, receiptsAPI } from '../../lib/api.js'    
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ArrowLeft, Edit, Trash2, Receipt, Calendar, DollarSign, Tag, FileText, MapPin, Link as LinkIcon } from 'lucide-react'        
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'

const TransactionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsAPI.getById(id).then(res => res.data.data),
  })

  // 100% PRESERVED MUTATION
  const deleteMutation = useMutation({
    mutationFn: () => transactionsAPI.delete(id),
    onSuccess: () => {
      toast.success('Transaction deleted!')
      navigate('/transactions')
    },
    onError: () => {
      toast.error('Failed to delete transaction')
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-12">
        <h2 className="text-6xl font-black text-muted-foreground">Transaction Not Found</h2>
        <Button size="lg" onClick={() => navigate('/transactions')} className="h-20 px-16 text-2xl">
          <ArrowLeft className="mr-4 h-8 w-8" />
          Back to Transactions
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="flex items-center justify-between p-12 bg-gradient-to-r from-muted/50 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-8">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={() => navigate('/transactions')}
            className="h-20 w-20 p-0 shadow-xl"
          >
            <ArrowLeft className="h-10 w-10" />
          </Button>
          <div>
            <h1 className="text-6xl font-black tracking-tight mb-4">Transaction Details</h1>
            <p className="text-4xl text-muted-foreground font-bold">
              {dayjs(transaction.date).format('MMMM DD, YYYY')}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate(`/transactions/${id}/edit`)}
            className="h-20 px-12 text-2xl font-bold shadow-xl"
          >
            <Edit className="mr-4 h-8 w-8" />
            Edit
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="h-20 px-12 text-2xl font-bold shadow-xl"
          >
            <Trash2 className="mr-4 h-8 w-8" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Transaction Card */}
      <Card title="Transaction Overview" className="shadow-3xl lg:col-span-2 h-[600px]">
        <div className="p-16">
          <div className="flex items-start justify-between mb-16">
            <div className="flex items-center gap-8">
              <Badge 
                variant={transaction.type === 'income' ? 'default' : 'destructive'} 
                className="text-3xl px-12 py-6 font-black shadow-2xl h-20"
              >
                {transaction.type.toUpperCase()}
              </Badge>
              {transaction.isRecurring && (
                <div className="px-12 py-6 bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-3xl border-2 border-secondary/40 shadow-xl">
                  <p className="text-2xl font-bold text-secondary-foreground">🔄 RECURRING</p>
                </div>
              )}
            </div>
          </div>

          {/* Massive Amount */}
          <div className="text-center mb-20">
            <div className={`text-9xl font-black drop-shadow-4xl mb-8 ${
              transaction.type === 'income' 
                ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-destructive via-red-600 to-orange-500 bg-clip-text text-transparent'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
            </div>
            <div className="w-48 h-2 mx-auto bg-gradient-to-r from-muted to-muted/0 rounded-full" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-12">
              <div className="group flex items-center gap-8 p-12 rounded-3xl bg-gradient-to-r from-muted/50 hover:from-primary/10 border border-border/50 shadow-xl hover:shadow-2xl transition-all h-32">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                  <Tag className="h-12 w-12 text-background font-bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl text-muted-foreground font-bold mb-4">Category</p>
                  <Badge className="text-4xl px-16 py-8 capitalize font-black shadow-2xl w-full justify-center">
                    {transaction.category}
                  </Badge>
                </div>
              </div>

              {transaction.description && (
                <div className="group flex items-start gap-8 p-12 rounded-3xl bg-gradient-to-r from-muted/50 hover:from-primary/10 border border-border/50 shadow-xl hover:shadow-2xl transition-all">
                  <div className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary/60 rounded-3xl flex items-center justify-center shadow-2xl mt-1 flex-shrink-0">
                    <FileText className="h-12 w-12 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl text-muted-foreground font-bold mb-6">Description</p>
                    <p className="text-3xl font-bold leading-relaxed">{transaction.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-12">
              <div className="group flex items-center gap-8 p-12 rounded-3xl bg-gradient-to-r from-accent/10 hover:from-primary/10 border border-accent/50 shadow-xl hover:shadow-2xl transition-all h-32">
                <div className="w-24 h-24 bg-gradient-to-br from-accent to-accent/60 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                  <Calendar className="h-12 w-12 text-background font-bold" />
                </div>
                <div>
                  <p className="text-2xl text-muted-foreground font-bold mb-4">Date</p>
                  <p className="text-5xl font-black">{dayjs(transaction.date).format('MMMM DD, YYYY')}</p>
                  <p className="text-2xl text-muted-foreground mt-2 font-mono">
                    {dayjs(transaction.date).format('HH:mm')}
                  </p>
                </div>
              </div>

              {transaction.location && (
                <div className="group flex items-center gap-8 p-12 rounded-3xl bg-gradient-to-r from-destructive/10 hover:from-primary/10 border border-destructive/30 shadow-xl hover:shadow-2xl transition-all">
                  <div className="w-24 h-24 bg-gradient-to-br from-destructive to-destructive/60 rounded-3xl flex items-center justify-center shadow-2xl mt-1 flex-shrink-0">
                    <MapPin className="h-12 w-12 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl text-muted-foreground font-bold mb-6">Location</p>
                    <p className="text-3xl font-bold leading-relaxed">{transaction.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Receipt Section */}
      {transaction.receipt && (
        <Card title="Attached Receipt" icon={Receipt} className="shadow-2xl">
          <div className="p-16">
            <div className="group flex items-center justify-between p-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl border-4 border-primary/20 shadow-2xl hover:shadow-3xl transition-all cursor-pointer h-[300px]">
              <div className="flex items-center gap-12">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                  <Receipt className="h-16 w-16 text-background font-bold" />
                </div>
                <div>
                  <h3 className="text-5xl font-black mb-6 text-primary">Receipt Image</h3>
                  <p className="text-3xl text-muted-foreground font-bold">
                    Uploaded {dayjs(transaction.receipt.uploadDate).format('MMM DD, YYYY')}
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-24 px-16 text-3xl font-bold shadow-2xl group-hover:shadow-3xl"
              >
                <LinkIcon className="mr-6 h-10 w-10" />
                View Receipt
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Metadata */}
      <Card title="Transaction Metadata" className="shadow-xl">
        <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group p-12 rounded-3xl bg-gradient-to-br from-muted/50 border border-border/50 shadow-xl hover:shadow-2xl transition-all text-center h-[280px]">
            <p className="text-2xl text-muted-foreground font-bold mb-8">Created</p>
            <p className="text-5xl font-black">{dayjs(transaction.createdAt).format('MMM DD, YYYY')}</p>
            <p className="text-3xl font-mono text-muted-foreground mt-4">
              {dayjs(transaction.createdAt).format('HH:mm')}
            </p>
          </div>
          <div className="group p-12 rounded-3xl bg-gradient-to-br from-muted/50 border border-border/50 shadow-xl hover:shadow-2xl transition-all text-center h-[280px]">
            <p className="text-2xl text-muted-foreground font-bold mb-8">Last Updated</p>
            <p className="text-5xl font-black">{dayjs(transaction.updatedAt).format('MMM DD, YYYY')}</p>
            <p className="text-3xl font-mono text-muted-foreground mt-4">
              {dayjs(transaction.updatedAt).format('HH:mm')}
            </p>
          </div>
          <div className="md:col-span-1 p-12 rounded-3xl bg-gradient-to-br from-secondary/10 border border-secondary/30 shadow-xl text-center h-[280px] overflow-hidden">
            <p className="text-2xl text-muted-foreground font-bold mb-8">Transaction ID</p>
            <div className="bg-secondary/20 backdrop-blur-sm p-8 rounded-2xl border font-mono text-2xl font-bold text-secondary-foreground break-all h-48 flex items-center justify-center">
              {transaction._id}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export { TransactionDetail }
