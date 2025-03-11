// src/components/finance/WithdrawalFlowSteps.jsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Clock,
  Wallet,
  AlertCircle,
  Loader2,
  RefreshCw,
  Landmark,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PaymentMethodCard } from '@/components/finance/PaymentMethodCard'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useCreateWithdrawalMutation } from '@/hooks/queries/useFinanceQueries'

// Schema cho withdrawal form
const withdrawalFormSchema = z.object({
  amount: z
    .number({
      required_error: 'Vui lòng nhập số tiền',
      invalid_type_error: 'Số tiền phải là số'
    })
    .int('Số tiền phải là số nguyên')
    .positive('Số tiền phải lớn hơn 0'),
  paymentMethod: z.string({
    required_error: 'Vui lòng chọn phương thức rút tiền'
  }),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  branch: z.string().optional(),
  phoneNumber: z.string().optional(),
  fullName: z.string().optional(),
  notes: z.string().optional()
})

export function WithdrawalFlowSteps({ userBalance, config }) {
  const [step, setStep] = useState(1)
  const [requestId, setRequestId] = useState(null)
  const router = useRouter()
  const createWithdrawalMutation = useCreateWithdrawalMutation()

  // Setup form với validation
  const form = useForm({
    resolver: zodResolver(
      withdrawalFormSchema
        .refine(data => data.amount >= config.min_withdrawal, {
          message: `Số tiền tối thiểu là ${formatMoney(config.min_withdrawal)}`,
          path: ['amount']
        })
        .refine(data => data.amount <= config.max_withdrawal, {
          message: `Số tiền tối đa là ${formatMoney(config.max_withdrawal)}`,
          path: ['amount']
        })
        .refine(data => data.amount <= userBalance, {
          message: 'Số dư không đủ để thực hiện giao dịch này',
          path: ['amount']
        })
        .refine(
          data => {
            if (data.paymentMethod === 'bank_transfer') {
              return !!data.bankName && !!data.accountNumber && !!data.accountName
            }
            if (data.paymentMethod === 'momo' || data.paymentMethod === 'zalopay') {
              return !!data.phoneNumber && !!data.fullName
            }
            return true
          },
          {
            message: 'Vui lòng điền đầy đủ thông tin rút tiền',
            path: ['paymentMethod']
          }
        )
    ),
    defaultValues: {
      amount: config.min_withdrawal,
      paymentMethod: '',
      notes: ''
    }
  })

  // Watch form values
  const watchAmount = form.watch('amount')
  const watchPaymentMethod = form.watch('paymentMethod')

  // Format tiền
  function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Tính phí và số tiền nhận được
  function calculateFee(amount) {
    return config.withdrawal_fee
  }

  function calculateNetAmount(amount) {
    return amount - calculateFee(amount)
  }

  // Xử lý khi submit step 1
  const handleStep1Submit = async data => {
    // Get the selected payment method
    const selectedMethod = config.withdrawal_methods.find(method => method.id === data.paymentMethod)

    if (!selectedMethod) {
      toast.error('Vui lòng chọn phương thức rút tiền')
      return
    }

    // Prepare payment details based on selected method
    let paymentDetails = {}

    if (data.paymentMethod === 'bank_transfer') {
      paymentDetails = {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        branch: data.branch
      }
    } else if (data.paymentMethod === 'momo' || data.paymentMethod === 'zalopay') {
      paymentDetails = {
        phoneNumber: data.phoneNumber,
        fullName: data.fullName
      }
    }

    try {
      // Create withdrawal request
      const result = await createWithdrawalMutation.mutateAsync({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails: {
          ...paymentDetails,
          notes: data.notes
        }
      })

      if (result.requestId) {
        setRequestId(result.requestId)
        setStep(2)
      }
    } catch (error) {
      console.error('Error creating withdrawal request:', error)
      toast.error('Không thể tạo yêu cầu rút tiền. Vui lòng thử lại.')
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
                <FormLabel>{field.label}</FormLabel>
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

  // Reset flow
  const handleReset = () => {
    form.reset()
    setRequestId(null)
    setStep(1)
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <div className='col-span-1 md:col-span-2'>
        <Card className='w-full'>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <div>
                <CardTitle>Rút tiền về tài khoản</CardTitle>
                <CardDescription>Rút tiền từ số dư VinBet về tài khoản của bạn</CardDescription>
              </div>
              <div className='flex items-center space-x-4'>
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            {step === 1 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleStep1Submit)} className='space-y-6'>
                  <div className='flex items-center justify-between bg-muted/50 p-3 rounded-md'>
                    <span>Số dư có thể rút:</span>
                    <span className='font-semibold text-primary'>{formatMoney(userBalance)}</span>
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
                              type='number'
                              placeholder='100,000'
                              className='pl-10'
                              {...field}
                              onChange={e => {
                                const value = parseInt(e.target.value)
                                field.onChange(isNaN(value) ? config.min_withdrawal : value)
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Số tiền tối thiểu: {formatMoney(config.min_withdrawal)}, tối đa:{' '}
                          {formatMoney(Math.min(config.max_withdrawal, userBalance))}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchAmount > 0 && (
                    <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Số tiền rút:</span>
                        <span className='text-sm font-medium'>{formatMoney(watchAmount)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-muted-foreground'>Phí giao dịch:</span>
                        <span className='text-sm font-medium'>{formatMoney(calculateFee(watchAmount))}</span>
                      </div>
                      <div className='border-t pt-2 mt-2 flex justify-between'>
                        <span className='font-medium'>Số tiền nhận được:</span>
                        <span className='font-medium text-primary'>{formatMoney(calculateNetAmount(watchAmount))}</span>
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
                    <Button type='submit' disabled={createWithdrawalMutation.isLoading}>
                      {createWithdrawalMutation.isLoading ? (
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
            )}

            {step === 2 && (
              <div className='space-y-6 text-center py-6'>
                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
                  <Check className='h-10 w-10 text-green-600' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold tracking-tight'>Yêu cầu rút tiền thành công!</h3>
                  <p className='text-muted-foreground'>
                    Yêu cầu rút tiền của bạn đã được gửi thành công. Vui lòng chờ admin xác nhận và tiền sẽ được chuyển
                    vào tài khoản của bạn trong thời gian sớm nhất.
                  </p>
                </div>

                <div className='bg-muted p-4 rounded-md my-6'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Phương thức:</span>
                      <span className='font-medium'>
                        {config.withdrawal_methods.find(m => m.id === watchPaymentMethod)?.name}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Số tiền rút:</span>
                      <span className='font-medium'>{formatMoney(watchAmount)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Số tiền nhận được:</span>
                      <span className='font-medium text-primary'>{formatMoney(calculateNetAmount(watchAmount))}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Trạng thái:</span>
                      <span className='font-medium text-amber-600'>Đang xử lý</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Thời gian yêu cầu:</span>
                      <span className='font-medium'>{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <Alert variant='default' className='bg-blue-50 text-blue-800 border-blue-200 text-left'>
                  <Info className='h-4 w-4' />
                  <AlertTitle>Thời gian xử lý</AlertTitle>
                  <AlertDescription>
                    Yêu cầu rút tiền của bạn sẽ được xử lý trong vòng{' '}
                    <strong>
                      {config.withdrawal_methods.find(m => m.id === watchPaymentMethod)?.processingTime || '24-48 giờ'}
                    </strong>
                    . Bạn có thể kiểm tra trạng thái trong lịch sử rút tiền.
                  </AlertDescription>
                </Alert>

                <div className='pt-4 flex justify-center space-x-4'>
                  <Button variant='outline' onClick={handleReset}>
                    <RefreshCw className='mr-2 h-4 w-4' /> Tạo yêu cầu mới
                  </Button>
                  <Button onClick={() => router.push('/finance')}>
                    <Wallet className='mr-2 h-4 w-4' /> Quay lại trang Tài chính
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='col-span-1'>
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn rút tiền</CardTitle>
            <CardDescription>Các bước thực hiện rút tiền</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                  1
                </div>
                <p className='text-sm'>Chọn phương thức và nhập số tiền muốn rút</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                  2
                </div>
                <p className='text-sm'>Điền đầy đủ thông tin tài khoản nhận tiền</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                  3
                </div>
                <p className='text-sm'>Xác nhận thông tin và gửi yêu cầu rút tiền</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                  4
                </div>
                <p className='text-sm'>Kiểm tra trạng thái yêu cầu trong lịch sử rút tiền</p>
              </div>
            </div>

            <div className='pt-4 border-t'>
              <p className='font-medium text-sm mb-2'>Thời gian xử lý:</p>
              <ul className='text-xs text-muted-foreground space-y-1'>
                <li className='flex items-center gap-2'>
                  <Landmark className='h-4 w-4 text-primary' />
                  <span>Ngân hàng: 24-48 giờ làm việc</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Wallet className='h-4 w-4 text-primary' />
                  <span>Ví điện tử: 5-30 phút</span>
                </li>
              </ul>
            </div>

            <div className='pt-4 border-t'>
              <p className='font-medium text-sm mb-2'>Lưu ý:</p>
              <ul className='text-xs text-muted-foreground space-y-1'>
                <li>• Thông tin tài khoản nhận tiền phải trùng khớp với tên tài khoản VinBet</li>
                <li>• Số tiền tối thiểu cho mỗi lần rút là {formatMoney(config.min_withdrawal)}</li>
                <li>• Bạn chỉ có thể rút tiền về tài khoản của chính mình</li>
                <li>• Không thể hủy yêu cầu rút tiền sau khi đã được xác nhận</li>
                <li>• Mỗi ngày chỉ được thực hiện tối đa 3 lần rút tiền</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
