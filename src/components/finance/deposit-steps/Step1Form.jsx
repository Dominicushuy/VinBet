import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { PaymentMethodCard } from '@/components/finance/PaymentMethodCard'
import { DollarSign, Loader2, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { useState, useEffect } from 'react'

const depositFormSchema = z.object({
  amount: z
    .number({
      required_error: 'Vui lòng nhập số tiền',
      invalid_type_error: 'Số tiền phải là số'
    })
    .int('Số tiền phải là số nguyên')
    .positive('Số tiền phải lớn hơn 0')
    .refine(val => val >= 50000, {
      message: 'Số tiền tối thiểu là 50,000 VND'
    })
    .refine(val => val <= 100000000, {
      message: 'Số tiền tối đa là 100,000,000 VND'
    }),
  paymentMethod: z.string({
    required_error: 'Vui lòng chọn phương thức thanh toán'
  })
})

export function Step1Form({ onSubmit, isLoading, config }) {
  // Find the first bank payment method ID
  const getDefaultPaymentMethod = () => {
    // Find first payment method with type/category "bank"
    const bankMethod = config.payment_methods.find(method => method.type === 'bank' || method.category === 'bank')

    // If no bank method found, use the first payment method
    return bankMethod?.id || config.payment_methods[0]?.id || ''
  }

  const form = useForm({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: 100000,
      paymentMethod: getDefaultPaymentMethod()
    }
  })

  // State to track the formatted display value
  const [formattedAmount, setFormattedAmount] = useState('100,000')

  // Format number with thousand separators
  const formatNumber = value => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Parse formatted string back to number
  const parseFormattedNumber = formattedValue => {
    return parseInt(formattedValue.replace(/,/g, '')) || 0
  }

  // Initialize formatted value when form loads
  useEffect(() => {
    const currentAmount = form.getValues('amount')
    setFormattedAmount(formatNumber(currentAmount))
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền nạp</FormLabel>
              <FormControl>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder='100,000'
                    className='pl-10'
                    value={formattedAmount}
                    onChange={e => {
                      // Remove non-numeric characters for processing
                      const rawValue = e.target.value.replace(/[^\d]/g, '')

                      // Convert to number for form validation
                      const numericValue = rawValue ? parseInt(rawValue) : 0

                      // Update the formatted display value
                      setFormattedAmount(rawValue ? formatNumber(rawValue) : '')

                      // Update the actual form value
                      field.onChange(numericValue)
                    }}
                    onBlur={e => {
                      // Ensure consistent formatting on blur
                      const numericValue = parseFormattedNumber(formattedAmount)
                      setFormattedAmount(numericValue ? formatNumber(numericValue) : '')
                      field.onBlur()
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Số tiền tối thiểu: {formatCurrency(config.min_deposit)}, tối đa: {formatCurrency(config.max_deposit)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='paymentMethod'
          render={({ field }) => (
            <FormItem className='space-y-4'>
              <FormLabel>Phương thức thanh toán</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className='grid gap-4 grid-cols-1 md:grid-cols-3'
                >
                  {config.payment_methods.map(method => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      selected={field.value === method.id}
                      onSelect={() => field.onChange(method.id)}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-4 flex justify-end space-x-2'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              <>
                Tiếp tục <ArrowRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
