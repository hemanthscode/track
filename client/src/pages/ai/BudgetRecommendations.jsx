import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { aiAPI } from '../../lib/api.js'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx'
import { Sparkles, PiggyBank, DollarSign, Home, ShoppingBag, Wallet } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const BudgetRecommendations = () => {
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [recommendations, setRecommendations] = useState(null)     

  const recommendMutation = useMutation({
    mutationFn: (income) => aiAPI.budgetRecommendations(parseFloat(income)),
    onSuccess: (response) => {
      setRecommendations(response.data.data)
      toast.success('Budget generated successfully!')
    },
    onError: () => {
      toast.error('Failed to generate budget')
    }
  })

  const handleGenerate = () => {
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {        
      toast.error('Enter valid monthly income')
      return
    }
    recommendMutation.mutate(monthlyIncome)
  }

  const showResults = recommendations && recommendations.budgets?.length > 0

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6']
  const pieData = recommendations?.budgets?.map((budget, index) => ({
    name: budget.category.split(' (')[0],
    value: budget.percentage,
    amount: budget.amount,
    fill: COLORS[index]
  })) || []

  const categoryIcons = [Home, ShoppingBag, Wallet]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
          Budget Recommendations
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Get a clear budget breakdown based on the proven <strong>50/30/20 rule</strong>
        </p>
      </div>

      {!showResults ? (
        <Card 
          title="Enter Your Monthly Income"
          subtitle="Your take-home salary after taxes"
          icon={DollarSign}
          className="max-w-xl mx-auto shadow-2xl"
        >
          <div className="space-y-6">
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
              <Input
                type="number"
                placeholder="₹50,000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)} 
                className="pl-14 h-16 text-2xl font-mono bg-gradient-to-r from-muted/50 backdrop-blur-sm shadow-inner"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={recommendMutation.isPending || !monthlyIncome}
              className="w-full h-16 shadow-2xl bg-gradient-to-r from-primary to-primary/90 text-xl font-bold"
              size="xl"
            >
              {recommendMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-3 h-6 w-6" />      
                  Generating Budget...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
                  Generate Budget Plan
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card 
            title="Your Budget Breakdown"
            subtitle={`Monthly Income: ₹${parseFloat(monthlyIncome).toLocaleString()}`}
            badges={[
              <Button key="change" variant="outline" size="sm" onClick={() => setRecommendations(null)}>
                Change Income
              </Button>
            ]}
          >
            <div className="h-[360px] w-full flex items-center justify-center p-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    cornerRadius={12}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={3} stroke="white" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `₹${props.payload.amount.toLocaleString()}`,
                      `${name}: ${value}%`
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            {recommendations.budgets.map((budget, index) => {      
              const Icon = categoryIcons[index]
              return (
                <Card 
                  key={index}
                  title={budget.category.split(' (')[0]}
                  subtitle={`₹${budget.amount.toLocaleString()}`}
                  icon={Icon}
                  badges={[
                    <Badge key="pct" variant="secondary" className="font-mono text-lg px-4 py-2 shadow-md">
                      {budget.percentage}%
                    </Badge>
                  ]}
                  className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group hover:border-primary/50"
                >
                  <p className="text-muted-foreground leading-relaxed mt-2">{budget.description}</p>
                </Card>
              )
            })}
          </div>

          <Card 
            title="Implementation Tips"
            icon={PiggyBank}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.tips.map((tip, index) => (        
                <div
                  key={index}
                  className="group flex items-start gap-4 p-6 bg-gradient-to-r from-muted/30 rounded-2xl border border-border/50 hover:bg-accent/50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full mt-2 flex-shrink-0 shadow-lg" />
                  <p className="text-base leading-relaxed group-hover:text-foreground transition-colors">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export { BudgetRecommendations }
