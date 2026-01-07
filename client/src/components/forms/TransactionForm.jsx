import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Select } from '../ui/Select.jsx'
import { Card } from '../ui/Card.jsx'
import { DollarSign, Calendar, CreditCard, Save, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionsAPI } from '../../lib/api.js'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import dayjs from 'dayjs'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(500, 'Description too long').optional(),
  date: z.string().min(1),
})

const TransactionForm = ({ 
  defaultValues = {}, 
  onSuccess, 
  onCancel,
  isEdit = false 
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    watch, 
    setValue,
    reset 
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
      ...defaultValues
    }
  })

  useEffect(() => {
    if (isEdit && defaultValues?._id) {
      reset({
        type: defaultValues.type || 'expense',
        amount: Number(defaultValues.amount) || 0,
        category: defaultValues.category || '',
        description: defaultValues.description || '',
        date: defaultValues.date ? dayjs(defaultValues.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      })
    }
  }, [isEdit, defaultValues?._id, reset])

  const watchedType = watch('type')
  const incomeCategories = [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment' },
    { value: 'gift', label: 'Gift' },
    { value: 'other', label: 'Other' }
  ]
  const expenseCategories = [
    { value: 'food', label: 'Food' },
    { value: 'housing', label: 'Housing' },
    { value: 'transport', label: 'Transport' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'travel', label: 'Travel' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'debt', label: 'Debt' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ]
  const categories = watchedType === 'income' ? incomeCategories : expenseCategories

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        date: dayjs(data.date).toISOString(),
      }
      
      if (isEdit && defaultValues?._id) {
        await transactionsAPI.update(defaultValues._id, payload)
        toast.success('Transaction updated!')
      } else {
        await transactionsAPI.create(payload)
        toast.success('Transaction added!')
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Transaction save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save transaction')
    }
  }

  return (
    <Card title={isEdit ? 'Edit Transaction' : 'New Transaction'} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type */}
          <div>
            <Input.Label>Type</Input.Label>
            <input type="hidden" {...register('type')} />
            <Select 
              options={[
                { value: 'income', label: 'Income', icon: TrendingUp },
                { value: 'expense', label: 'Expense', icon: TrendingDown }
              ]}
              value={watch('type') || 'expense'}
              onValueChange={(value) => setValue('type', value, { shouldValidate: true })}
              error={errors.type?.message}
            />
          </div>
          
          {/* Category */}
          <div>
            <Input.Label>Category</Input.Label>
            <input type="hidden" {...register('category')} />
            <Select 
              options={categories}
              value={watch('category') || ''}
              onValueChange={(value) => setValue('category', value, { shouldValidate: true })}
              error={errors.category?.message}
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <Input.Label icon={DollarSign}>Amount (₹)</Input.Label>
          <Input 
            type="number" 
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input.Label icon={Calendar}>Date</Input.Label>
            <Input 
              type="date"
              max={dayjs().format('YYYY-MM-DD')}
              error={errors.date?.message}
              {...register('date')}
            />
          </div>
          
          <div>
            <Input.Label icon={CreditCard}>Description</Input.Label>
            <Input 
              placeholder="What did you buy?"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Update' : 'Save'} Transaction
          </Button>
        </div>
      </form>
    </Card>
  )
}

export { TransactionForm }
