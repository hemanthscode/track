import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { transactionsAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Progress } from '../../components/ui/Progress.jsx'        
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { ArrowLeft, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const BulkCategorize = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [result, setResult] = useState(null)

  // 100% PRESERVED MUTATION
  const bulkCategorizeMutation = useMutation({
    mutationFn: () => transactionsAPI.bulkCategorize(),
    onSuccess: (response) => {
      setResult(response.data.data)
      queryClient.invalidateQueries(['transactions'])
      toast.success('Transactions categorized successfully!')      
    },
    onError: () => {
      toast.error('Failed to categorize transactions')
    }
  })

  const handleCategorize = () => {
    bulkCategorizeMutation.mutate()
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="flex items-center gap-8 bg-gradient-to-r from-primary/10 p-12 rounded-3xl shadow-2xl border-4 border-primary/20">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={() => navigate('/transactions')}
          className="h-20 w-20 p-0 shadow-xl"
        >
          <ArrowLeft className="h-10 w-10" />
        </Button>
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent tracking-tight mb-6">
            AI Bulk Categorization
          </h1>
          <p className="text-3xl text-muted-foreground font-bold leading-relaxed max-w-3xl">
            Automatically categorize uncategorized transactions using advanced AI analysis
          </p>
        </div>
      </div>

      {/* How It Works */}
      <Card title="AI Intelligence" icon={Sparkles} className="shadow-2xl lg:col-span-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12">
          <div className="space-y-8">
            <div className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border-4 border-primary/20 shadow-2xl">
              <h3 className="text-4xl font-black mb-8 text-primary">Smart Analysis</h3>
              <ul className="space-y-6 text-2xl text-muted-foreground">
                <li className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mt-1 flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <span>Transaction description patterns</span>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mt-1 flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <span>Amount pattern recognition</span>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mt-1 flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <span>Historical spending behavior</span>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mt-1 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <span>Merchant intelligence</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-12 bg-gradient-to-r from-destructive/10 to-orange-500/10 rounded-3xl border-4 border-destructive/20 shadow-2xl h-full">
              <div className="flex items-start gap-6 mb-12">
                <AlertCircle className="h-16 w-16 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-4xl font-black text-destructive mb-4">Full Control</h3>
                  <p className="text-2xl text-muted-foreground leading-relaxed">
                    AI suggestions are automatically reviewable. Override any categorization with one click.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="p-8 bg-background/80 backdrop-blur-sm rounded-2xl shadow-xl border">
                  <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
                  <p className="text-5xl font-black text-green-600 mb-2">100%</p>
                  <p className="text-xl text-muted-foreground">Reviewable</p>
                </div>
                <div className="p-8 bg-background/80 backdrop-blur-sm rounded-2xl shadow-xl border">
                  <Sparkles className="h-20 w-20 text-primary mx-auto mb-6" />
                  <p className="text-5xl font-black text-primary mb-2">98%</p>
                  <p className="text-xl text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Area */}
      {!result && (
        <Card title="Ready to Analyze" icon={Sparkles} className="shadow-2xl border-primary/30 h-[500px]">
          <div className="flex flex-col items-center justify-center h-full space-y-12 text-center px-12">
            {bulkCategorizeMutation.isPending ? (
              <>
                <div className="w-48 h-48 bg-gradient-to-r from-primary via-primary/80 to-accent rounded-3xl flex items-center justify-center shadow-2xl animate-spin-slow">
                  <LoadingSpinner className="h-32 w-32" />
                </div>
                <div>
                  <h3 className="text-5xl font-black mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Analyzing Transactions...
                  </h3>
                  <p className="text-3xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    AI neural network processing your transaction patterns
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-48 h-48 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl group hover:scale-110 transition-all duration-500">
                  <Sparkles className="h-32 w-32 text-primary-foreground group-hover:rotate-12 transition-all duration-1000" />
                </div>
                <div className="space-y-8">
                  <h3 className="text-6xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
                    Ready to Categorize
                  </h3>
                  <p className="text-3xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                    Launch AI categorization across all uncategorized transactions
                  </p>
                </div>
                <Button 
                  size="xl" 
                  onClick={handleCategorize} 
                  className="h-24 px-24 text-4xl font-black shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
                >
                  <Sparkles className="mr-6 h-12 w-12" />
                  🚀 Start AI Categorization
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card title="Categorization Complete" icon={CheckCircle} className="shadow-3xl border-green-500/30">
          <div className="p-16">
            <div className="flex items-center justify-center mb-16">
              <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl mr-12">
                <CheckCircle className="h-20 w-20 text-white" />
              </div>
              <div>
                <h2 className="text-7xl font-black text-green-600 mb-4">SUCCESS</h2>
                <p className="text-3xl font-bold text-muted-foreground">AI Processing Complete</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div className="group p-12 rounded-3xl bg-gradient-to-br from-primary/10 border-4 border-primary/20 shadow-2xl h-[300px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="text-center mb-12">
                  <div className="text-8xl font-black text-primary">{result.categorized}</div>
                  <p className="text-2xl text-muted-foreground mt-4 font-bold">Categorized</p>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent w-[80%] rounded-full shadow-lg" />
                </div>
              </div>

              <div className="group p-12 rounded-3xl bg-gradient-to-br from-green-500/10 border-4 border-green-500/20 shadow-2xl h-[300px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="text-center mb-12">
                  <div className="text-8xl font-black text-green-600">{result.successful}</div>
                  <p className="text-2xl text-muted-foreground mt-4 font-bold">Successful</p>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-full rounded-full shadow-lg" />
                </div>
              </div>

              <div className="group p-12 rounded-3xl bg-gradient-to-br from-orange-500/10 border-4 border-orange-500/20 shadow-2xl h-[300px] hover:shadow-3xl transition-all hover:-translate-y-4 cursor-default">
                <div className="text-center mb-12">
                  <div className="text-8xl font-black text-orange-600">{result.failed || 0}</div>
                  <p className="text-2xl text-muted-foreground mt-4 font-bold">Failed</p>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[20%] rounded-full shadow-lg" />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {result.summary && (
              <div className="space-y-6 mb-16">
                <h3 className="text-5xl font-black text-center mb-12">Category Breakdown</h3>
                <div className="space-y-6">
                  {Object.entries(result.summary).map(([category, count]) => (
                    <div key={category} className="group flex items-center gap-8 p-12 rounded-3xl bg-gradient-to-r from-muted/50 hover:from-primary/10 hover:shadow-2xl transition-all border border-border/50 h-28">
                      <Badge variant="outline" className="text-3xl px-12 py-8 capitalize font-bold shadow-lg min-w-[200px]">
                        {category}
                      </Badge>
                      <div className="flex-1">
                        <Progress 
                          value={(count / result.categorized) * 100} 
                          className="h-12 [&>div]:rounded-2xl [&>div]:shadow-2xl"
                        />
                      </div>
                      <div className="text-4xl font-black text-primary min-w-[120px] text-right">
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-6 pt-12 border-t-4 border-primary/30">
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate('/transactions')}
                className="flex-1 h-24 text-3xl font-bold shadow-2xl hover:shadow-3xl"
              >
                👁️ View Transactions
              </Button>
              <Button
                size="xl"
                onClick={() => setResult(null)}
                className="flex-1 h-24 text-3xl font-bold shadow-2xl hover:shadow-3xl bg-gradient-to-r from-primary to-accent"
              >
                🔄 Categorize Again
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export { BulkCategorize }
