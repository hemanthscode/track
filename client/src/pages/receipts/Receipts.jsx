import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { receiptsAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ConfirmationModal } from '../../components/common/ConfirmationModal.jsx'
import { Plus, Receipt, Image, FileText, Link as LinkIcon, Trash2, Eye, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const Receipts = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({ processingStatus: '' })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)     

  const { data: receiptsResponse, isLoading } = useQuery({
    queryKey: ['receipts', filters],
    queryFn: () => receiptsAPI.getAll(filters).then(res => res.data),
  })

  const receipts = receiptsResponse?.data?.receipts || []
  const receiptsCount = receiptsResponse?.data?.count || 0

  // ... ALL MUTATIONS EXACTLY SAME (100% PRESERVED) ...
  const deleteMutation = useMutation({
    mutationFn: (id) => receiptsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['receipts'])
      toast.success('Receipt deleted!')
      setIsDeleteModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete receipt')
    }
  })

  const retryOCRMutation = useMutation({
    mutationFn: (id) => receiptsAPI.retryOCR(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['receipts'])
      toast.success('OCR processing started!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to retry OCR')
    }
  })

  const handleDelete = (receipt) => {
    setSelectedReceipt(receipt)
    setIsDeleteModalOpen(true)
  }

  const handleView = (receipt) => {
    window.open(receipt.url, '_blank')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default'
      case 'processing': return 'secondary'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-muted/50 p-12 rounded-3xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight mb-6">
              Receipt Management
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              Upload and manage receipts with AI-powered OCR processing
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate('/receipts/upload')}
            className="h-20 px-12 text-2xl font-bold shadow-2xl self-start lg:self-auto"
          >
            <Plus className="h-8 w-8 mr-4" />
            Upload Receipt
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card title="Total Receipts" icon={Receipt} className="shadow-xl h-[200px]">
          <div className="text-6xl font-black text-foreground">{receiptsCount}</div>
          <p className="text-xl text-muted-foreground mt-4">Uploaded receipts</p>
        </Card>

        <Card title="Linked" icon={LinkIcon} className="shadow-xl h-[200px]">
          <div className="text-6xl font-black">
            {receipts.filter(r => r.transactionId).length}
          </div>
          <p className="text-xl text-muted-foreground mt-4">Linked to transactions</p>
        </Card>

        <Card title="Processed" icon={FileText} className="shadow-xl h-[200px]">
          <div className="text-6xl font-black text-green-600">
            {receipts.filter(r => r.processingStatus === 'completed').length}
          </div>
          <p className="text-xl text-muted-foreground mt-4">OCR completed</p>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Filter Receipts" className="shadow-xl">
        <div className="flex flex-wrap gap-4 p-8">
          <Button
            variant={filters.processingStatus === '' ? 'default' : 'outline'}
            size="lg"
            className="h-16 px-12 text-xl font-bold"
            onClick={() => setFilters({ processingStatus: '' })}
          >
            All
          </Button>
          <Button
            variant={filters.processingStatus === 'completed' ? 'default' : 'outline'}
            size="lg"
            className="h-16 px-12 text-xl font-bold"
            onClick={() => setFilters({ processingStatus: 'completed' })}
          >
            Completed
          </Button>
          <Button
            variant={filters.processingStatus === 'processing' ? 'default' : 'outline'}
            size="lg"
            className="h-16 px-12 text-xl font-bold"
            onClick={() => setFilters({ processingStatus: 'processing' })}
          >
            Processing
          </Button>
          <Button
            variant={filters.processingStatus === 'failed' ? 'default' : 'outline'}
            size="lg"
            className="h-16 px-12 text-xl font-bold"
            onClick={() => setFilters({ processingStatus: 'failed' })}
          >
            Failed
          </Button>
        </div>
      </Card>

      {/* Receipts Grid */}
      {receipts.length === 0 ? (
        <Card title="No Receipts" className="shadow-xl">
          <EmptyState
            title="No receipts found"
            description="Upload your first receipt to start tracking expenses automatically"
            icon={Receipt}
            action={
              <Button size="lg" onClick={() => navigate('/receipts/upload')} className="h-16 px-12 text-xl">
                <Plus className="mr-3 h-6 w-6" />
                Upload Receipt
              </Button>
            }
          />
        </Card>
      ) : (
        <Card title={`Receipts (${receipts.length})`} className="shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 p-12">
            {receipts.map((receipt) => (
              <div key={receipt._id} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted to-muted/50 hover:from-primary/10 hover:shadow-2xl transition-all hover:-translate-y-4 cursor-pointer h-[500px]">
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-20">
                  <Badge 
                    variant={getStatusColor(receipt.processingStatus)} 
                    className="text-xl px-6 py-3 font-bold shadow-lg"
                  >
                    {receipt.processingStatus?.toUpperCase()}
                  </Badge>
                </div>

                {/* Receipt Preview */}
                <div className="relative h-[60%] overflow-hidden pt-12 px-8">
                  {receipt.url ? (
                    <img
                      src={receipt.url}
                      alt={receipt.filename}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-2xl"
                      onClick={() => handleView(receipt)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                      <FileText className="h-24 w-24 text-muted-foreground/50 group-hover:text-primary/70" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-8">
                  <h3 className="text-3xl font-black mb-4 truncate group-hover:text-primary transition-colors pr-20">
                    {receipt.filename || 'Receipt'}
                  </h3>

                  {/* OCR Data */}
                  {receipt.ocrData && (
                    <div className="space-y-4 mb-8 text-xl">
                      {receipt.ocrData.amount && (
                        <div className="flex justify-between items-end">
                          <span className="text-muted-foreground font-medium">Amount</span>
                          <span className="text-4xl font-black text-primary drop-shadow-lg">
                            ₹{receipt.ocrData.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {receipt.ocrData.merchant && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Merchant</span>
                          <span className="font-bold truncate">{receipt.ocrData.merchant}</span>
                        </div>
                      )}
                      {receipt.ocrData.date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">{dayjs(receipt.ocrData.date).format('MMM DD, YYYY')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transaction Link */}
                  {receipt.transactionId && (
                    <div className="flex items-center gap-3 p-4 bg-primary/20 rounded-2xl mb-6">
                      <LinkIcon className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold text-primary">Linked to transaction</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-16 text-xl font-bold group-hover:shadow-xl transition-all"
                      onClick={() => handleView(receipt)}
                    >
                      <Eye className="h-6 w-6 mr-3" />
                      View
                    </Button>

                    {receipt.processingStatus === 'failed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-16 px-8 text-xl font-bold"
                        onClick={() => retryOCRMutation.mutate(receipt._id)}
                        disabled={retryOCRMutation.isPending}
                      >
                        Retry OCR
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-16 w-16 p-0 shadow-xl"
                      onClick={() => handleDelete(receipt)}
                    >
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </div>

                  <p className="text-lg text-muted-foreground text-center mt-6 font-mono">
                    {dayjs(receipt.uploadedAt).fromNow()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation - UNCHANGED */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate(selectedReceipt?._id)}
        title="Delete Receipt?"
        message="This action cannot be undone. The receipt will be permanently deleted."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export { Receipts }
