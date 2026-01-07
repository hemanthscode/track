import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Select } from '../ui/Select.jsx'
import { Card } from '../ui/Card.jsx'
import { PiggyBank, AlertTriangle, DollarSign } from 'lucide-react'
import { budgetsAPI } from '../../lib/api.js'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const budgetSchema = z.object({
  type: z.enum(['budget', 'savings']),
  category: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  alertThreshold: z.number().min(0).max(100).default(80),
})

const BudgetForm = ({ 
  defaultValues, 
  onSuccess, 
  onCancel,
  isEdit = false 
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues
  })

  const type = watch('type')
  const showCategory = type === 'budget'

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
      }
      
      if (isEdit) {
        await budgetsAPI.update(defaultValues.id, payload)
        toast.success('Budget updated!')
      } else {
        await budgetsAPI.create(payload)
        toast.success('Budget created!')
      }
      
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to save budget')
    }
  }

  return (
    <Card title={isEdit ? 'Edit Budget' : 'New Budget'} className="max-w-2xl shadow-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type */}
          <div>
            <Input.Label>Type</Input.Label>
            <input type="hidden" {...register('type')} />
            <Select 
              options={[
                { value: 'budget', label: 'Budget' },
                { value: 'savings', label: 'Savings Goal' }
              ]}
              value={watch('type') || ''}
              onValueChange={(val) => setValue('type', val)}
              error={errors.type?.message}
            />
          </div>

          {/* Category */}
          {showCategory && (
            <div>
              <Input.Label>Category</Input.Label>
              <input type="hidden" {...register('category')} />
              <Select 
                options={[
                  { value: 'food', label: 'Food' },
                  { value: 'housing', label: 'Housing' },
                  { value: 'transport', label: 'Transport' },
                  { value: 'utilities', label: 'Utilities' },
                  { value: 'entertainment', label: 'Entertainment' },
                  { value: 'health', label: 'Health' },
                  { value: 'shopping', label: 'Shopping' }
                ]}
                value={watch('category') || ''}
                onValueChange={(val) => setValue('category', val)}
                error={errors.category?.message}
              />
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <Input.Label icon={DollarSign}>Amount (₹)</Input.Label>
          <Input 
            type="number" 
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>

        {/* Period */}
        <div>
          <Input.Label>Period</Input.Label>
          <input type="hidden" {...register('period')} />
          <Select 
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' }
            ]}
            value={watch('period') || ''}
            onValueChange={(val) => setValue('period', val)}
            error={errors.period?.message}
          />
        </div>

        {/* Alert Threshold */}
        <div>
          <Input.Label icon={AlertTriangle}>Alert Threshold (%)</Input.Label>
          <Input 
            type="number" 
            min="0" 
            max="100"
            placeholder="80"
            error={errors.alertThreshold?.message}
            {...register('alertThreshold', { valueAsNumber: true })}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isEdit ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export { BudgetForm }
