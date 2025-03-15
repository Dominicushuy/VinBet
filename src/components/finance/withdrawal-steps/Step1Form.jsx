'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PaymentMethodCard } from '@/components/finance/PaymentMethodCard'
import { Wallet, Loader2, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { useState, useEffect } from 'react'

// Hàm chuyển đổi chuỗi đã format thành số nguyên
const parseFormattedNumber = value => {
  if (!value) return 0
  return parseInt(value.replace(/[^\d]/g, ''))
}

// Hàm format số thành chuỗi có dấu phân cách hàng ngàn
const formatNumberWithCommas = value => {
  if (!value) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function Step1Form({ onSubmit, isLoading, config, userBalance }) {
  // State lưu giá trị đã format của input amount
  const [formattedAmount, setFormattedAmount] = useState(formatNumberWithCommas(config.min_withdrawal))
  // State để lưu trữ schema validation hiện tại
  const [validationSchema, setValidationSchema] = useState(null)

  // Schema cơ bản cho withdrawal form
  const baseSchema = z.object({
    amount: z
      .number({
        required_error: 'Vui lòng nhập số tiền',
        invalid_type_error: 'Số tiền phải là số'
      })
      .int('Số tiền phải là số nguyên')
      .positive('Số tiền phải lớn hơn 0')
      .refine(data => data >= config.min_withdrawal, {
        message: `Số tiền tối thiểu là ${formatCurrency(config.min_withdrawal)}`
      })
      .refine(data => data <= config.max_withdrawal, {
        message: `Số tiền tối đa là ${formatCurrency(config.max_withdrawal)}`
      })
      .refine(data => data <= userBalance, {
        message: 'Số dư không đủ để thực hiện giao dịch này'
      }),
    paymentMethod: z.string({
      required_error: 'Vui lòng chọn phương thức rút tiền'
    }),
    notes: z.string().optional()
  })

  // Khởi tạo form
  const form = useForm({
    defaultValues: {
      amount: config.min_withdrawal,
      paymentMethod: '',
      notes: ''
    }
  })

  // Watch form values
  const watchPaymentMethod = form.watch('paymentMethod')
  const watchAmount = form.watch('amount')

  // Cập nhật schema validation khi payment method thay đổi
  useEffect(() => {
    if (watchPaymentMethod) {
      const selectedMethod = config.withdrawal_methods.find(method => method.id === watchPaymentMethod)

      if (selectedMethod && selectedMethod.fields) {
        // Xây dựng schema mở rộng với các trường dynamic
        let schemaExtension = {}

        selectedMethod.fields.forEach(field => {
          if (field.required) {
            schemaExtension[field.name] = z.string().min(1, `${field.label} là bắt buộc`)
          } else {
            schemaExtension[field.name] = z.string().optional()
          }

          // Đảm bảo trường được đăng ký trong form
          if (!form.getValues(field.name)) {
            form.setValue(field.name, '')
          }
        })

        // Tạo schema mới kết hợp với baseSchema
        const newSchema = baseSchema.extend(schemaExtension)
        setValidationSchema(newSchema)

        // Cập nhật resolver với schema mới
        form.clearErrors()
        form.reset(form.getValues(), {
          resolver: zodResolver(newSchema)
        })
      }
    } else {
      // Nếu không có phương thức nào được chọn, sử dụng schema cơ bản
      setValidationSchema(baseSchema)
      form.reset(form.getValues(), {
        resolver: zodResolver(baseSchema)
      })
    }
  }, [watchPaymentMethod])

  // Cập nhật formatted amount khi amount thay đổi từ bên ngoài
  useEffect(() => {
    if (typeof watchAmount === 'number' && watchAmount >= 0) {
      setFormattedAmount(formatNumberWithCommas(watchAmount))
    }
  }, [watchAmount])

  // Form submit handler lấy tất cả dữ liệu cần thiết
  const handleFormSubmit = async data => {
    try {
      // Tất cả dữ liệu đã được xác thực và đăng ký với form
      console.log('Dữ liệu form trước khi gửi:', data)

      // Gọi hàm submit được truyền vào từ component cha
      await onSubmit(data)
    } catch (error) {
      console.error('Lỗi khi submit form:', error)
    }
  }

  // Render payment method form fields
  const renderPaymentMethodFields = () => {
    if (!watchPaymentMethod) return null

    const selectedMethod = config.withdrawal_methods.find(method => method.id === watchPaymentMethod)

    if (!selectedMethod) return null

    return (
      <div className='space-y-4 border-t pt-4 mt-4'>
        <h3 className='font-medium text-sm'>Thông tin rút tiền</h3>
        {selectedMethod.fields.map(field => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  {field.required && <span className='text-red-500 ml-1'>*</span>}
                </FormLabel>
                <FormControl>
                  <Input type={field.type} placeholder={field.label} {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
              <FormControl>
                <Textarea placeholder='Nhập thêm ghi chú nếu cần' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-6'>
        <div className='flex items-center justify-between bg-muted/50 p-3 rounded-md'>
          <span>Số dư có thể rút:</span>
          <span className='font-semibold text-primary'>{formatCurrency(userBalance)}</span>
        </div>

        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền rút</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Wallet className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder='100,000'
                    className='pl-10'
                    value={formattedAmount}
                    onChange={e => {
                      // Chỉ cho phép nhập số và dấu phẩy
                      const rawValue = e.target.value.replace(/[^\d,]/g, '')
                      setFormattedAmount(rawValue)

                      // Cập nhật giá trị số thực cho form validation
                      const numericValue = parseFormattedNumber(rawValue)
                      field.onChange(numericValue)
                    }}
                    onBlur={() => {
                      // Format lại khi blur để đảm bảo hiển thị đúng
                      const numericValue = parseFormattedNumber(formattedAmount)
                      const formatted = formatNumberWithCommas(numericValue)
                      setFormattedAmount(formatted)
                      field.onChange(numericValue)
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Số tiền tối thiểu: {formatCurrency(config.min_withdrawal)}, tối đa:{' '}
                {formatCurrency(Math.min(config.max_withdrawal, userBalance))}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('amount') > 0 && (
          <div className='bg-muted/50 p-3 rounded-md space-y-2'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Số tiền rút:</span>
              <span className='text-sm font-medium'>{formatCurrency(form.watch('amount'))}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Phí giao dịch:</span>
              <span className='text-sm font-medium'>{formatCurrency(config.withdrawal_fee || 0)}</span>
            </div>
            <div className='border-t pt-2 mt-2 flex justify-between'>
              <span className='font-medium'>Số tiền nhận được:</span>
              <span className='font-medium text-primary'>
                {formatCurrency(form.watch('amount') - (config.withdrawal_fee || 0))}
              </span>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name='paymentMethod'
          render={({ field }) => (
            <FormItem className='space-y-4'>
              <FormLabel>Phương thức rút tiền</FormLabel>
              <FormControl>
                <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
                  {config.withdrawal_methods.map(method => (
                    <PaymentMethodCard
                      key={method.id}
                      method={{
                        id: method.id,
                        name: method.name,
                        description: method.description,
                        accounts: []
                      }}
                      selected={field.value === method.id}
                      onSelect={() => field.onChange(method.id)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderPaymentMethodFields()}

        <div className='pt-4 flex justify-end space-x-2'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              <>
                Xác nhận rút tiền <ArrowRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
