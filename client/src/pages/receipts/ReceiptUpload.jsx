import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { receiptsAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ArrowLeft, Upload, FileText, CheckCircle, X, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ReceiptUpload = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  const uploadMutation = useMutation({
    mutationFn: (formData) => receiptsAPI.upload(formData),        
    onSuccess: (response) => {
      setUploadResult(response.data.data)
      queryClient.invalidateQueries(['receipts'])
      toast.success('Receipt uploaded and processed!')
    },
    onError: () => {
      toast.error('Failed to upload receipt')
    }
  })

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect({ target: { files: [file] } })
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleUpload = () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('receipt', selectedFile)
    uploadMutation.mutate(formData)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setUploadResult(null)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="flex items-center gap-8 bg-gradient-to-r from-muted/50 p-12 rounded-3xl shadow-2xl">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/receipts')}
          className="h-20 w-20 p-0 shadow-xl"
        >
          <ArrowLeft className="h-10 w-10" />
        </Button>
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight">
            Upload Receipt
          </h1>
          <p className="text-2xl text-muted-foreground mt-6 leading-relaxed">
            AI-powered OCR extracts details automatically
          </p>
        </div>
      </div>

      {!uploadResult ? (
        <>
          {/* Upload Area */}
          <Card title="Drop Your Receipt" className="shadow-2xl border-primary/30 hover:shadow-3xl transition-all h-[500px]">
            <div
              className={`flex flex-col items-center justify-center h-full transition-all group cursor-pointer ${
                preview 
                  ? 'p-8' 
                  : 'p-20 border-4 border-dashed border-muted-foreground/25 hover:border-primary'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input').click()}
            >
              {preview ? (
                <>
                  <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl mb-12 group-hover:scale-105 transition-transform">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-6 text-2xl font-bold">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                    <span className="truncate max-w-md">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReset()
                      }}
                      className="h-20 w-20 p-0 shadow-xl"
                    >
                      <X className="h-10 w-10" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-32 w-32 text-muted-foreground/50 group-hover:text-primary group-hover:scale-110 mb-12 transition-all" />
                  <p className="text-4xl font-black mb-6 text-foreground group-hover:text-primary transition-colors">
                    Drop receipt or click to browse
                  </p>
                  <p className="text-2xl text-muted-foreground font-medium">
                    JPG, PNG, WEBP • Max 5MB
                  </p>
                </>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </Card>

          {/* AI Features */}
          <Card title="AI Features" icon={Sparkles} className="shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-12">
              <div className="flex items-start gap-6 p-8 rounded-3xl bg-gradient-to-r from-primary/10 border border-primary/20 hover:shadow-xl transition-all">
                <CheckCircle className="h-20 w-20 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-3xl font-bold mb-4">Merchant Detection</h4>
                  <p className="text-xl text-muted-foreground leading-relaxed">Automatic merchant name recognition</p>
                </div>
              </div>
              <div className="flex items-start gap-6 p-8 rounded-3xl bg-gradient-to-r from-green-500/10 border border-green-500/20 hover:shadow-xl transition-all">
                <CheckCircle className="h-20 w-20 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-3xl font-bold mb-4">Amount Extraction</h4>
                  <p className="text-xl text-muted-foreground leading-relaxed">Total amount detection</p>
                </div>
              </div>
              <div className="flex items-start gap-6 p-8 rounded-3xl bg-gradient-to-r from-secondary/10 border border-secondary/20 hover:shadow-xl transition-all">
                <CheckCircle className="h-20 w-20 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-3xl font-bold mb-4">Smart Linking</h4>
                  <p className="text-xl text-muted-foreground leading-relaxed">Auto-link to transactions</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Upload Buttons */}
          {selectedFile && (
            <div className="flex gap-8 p-12 bg-muted/50 rounded-3xl">
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="flex-1 h-24 text-3xl font-bold shadow-xl"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="flex-1 h-24 text-3xl font-bold shadow-2xl"
              >
                {uploadMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-6 h-10 w-10" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Upload className="mr-6 h-10 w-10" />
                    Upload & Process
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Success Results */
        <Card title="Receipt Processed Successfully!" icon={CheckCircle} className="shadow-2xl border-green-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12">
            <div className="space-y-8">
              <img
                src={uploadResult.imageUrl}
                alt="Receipt"
                className="w-full h-96 object-contain rounded-3xl shadow-2xl border-4 border-green-500/20"
              />
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <div>
                  <p className="text-2xl text-muted-foreground mb-4 font-medium">Merchant</p>
                  <p className="text-4xl font-bold text-foreground">{uploadResult.merchantName || 'Not detected'}</p>
                </div>
                <div>
                  <p className="text-2xl text-muted-foreground mb-4 font-medium">Total Amount</p>
                  <p className="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-2xl">
                    ₹{uploadResult.totalAmount?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border/50">
                  <div>
                    <p className="text-2xl text-muted-foreground mb-4 font-medium">Date</p>
                    <p className="text-4xl font-bold">{uploadResult.date || 'Not detected'}</p>
                  </div>
                  <div>
                    <p className="text-2xl text-muted-foreground mb-4 font-medium">OCR Status</p>
                    <Badge variant={uploadResult.ocrStatus === 'completed' ? 'default' : 'secondary'} className="text-3xl px-12 py-6 font-bold shadow-lg">
                      {uploadResult.ocrStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-12 border-t border-border/50">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/receipts')}
                  className="flex-1 h-24 text-3xl font-bold shadow-xl"
                >
                  View All Receipts
                </Button>
                <Button
                  size="lg"
                  onClick={handleReset}
                  className="flex-1 h-24 text-3xl font-bold shadow-2xl"
                >
                  Upload Another
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export { ReceiptUpload }
