// src/components/finance/WithdrawalFlowSteps.jsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateWithdrawalMutation } from '@/hooks/queries/useFinanceQueries'
import { toast } from 'react-hot-toast'
import { Step1Form } from '@/components/finance/withdrawal-steps/Step1Form'
import { Step2PaymentInfo } from '@/components/finance/withdrawal-steps/Step2PaymentInfo'
import { Step3Success } from '@/components/finance/withdrawal-steps/Step3Success'

export function WithdrawalFlowSteps({ userBalance, config }) {
  const [step, setStep] = useState(1)
  const [requestId, setRequestId] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(0)
  const [transferCode, setTransferCode] = useState('')
  const [watchAmount, setWatchAmount] = useState(config.min_withdrawal || 50000)

  const createWithdrawalMutation = useCreateWithdrawalMutation()

  // Memoized functions to prevent unnecessary re-renders
  const getSelectedMethodDetails = useCallback(() => {
    return config.withdrawal_methods.find(m => m.id === selectedMethod)
  }, [config.withdrawal_methods, selectedMethod])

  const getSelectedAccount = useCallback(() => {
    const method = getSelectedMethodDetails()
    if (!method || !method.fields) return null
    return method
  }, [getSelectedMethodDetails])

  // Handle step 1 form submission
  const handleStep1Submit = useCallback(
    async data => {
      setWatchAmount(data.amount)
      setSelectedMethod(data.paymentMethod)

      // Generate reference code
      const code = `RUT${data.amount}VB${Math.floor(Math.random() * 1000)}`
      setTransferCode(code)

      try {
        // Parse payment details from form data
        const paymentDetails = {}

        // Extract form fields based on selected method
        const method = config.withdrawal_methods.find(m => m.id === data.paymentMethod)
        if (method && method.fields) {
          method.fields.forEach(field => {
            if (data[field.name]) {
              paymentDetails[field.name] = data[field.name]
            }
          })
        }

        // Add notes if provided
        if (data.notes) {
          paymentDetails.notes = data.notes
        }

        // Create withdrawal request
        const result = await createWithdrawalMutation.mutateAsync({
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDetails
        })

        if (result?.requestId) {
          setRequestId(result.requestId)
          setStep(2)
        } else {
          toast.error('Tạo yêu cầu không thành công. Vui lòng thử lại.')
        }
      } catch (error) {
        console.error('Error creating withdrawal request:', error)
        toast.error(error.message || 'Không thể tạo yêu cầu rút tiền. Vui lòng thử lại.')
      }
    },
    [config.withdrawal_methods, createWithdrawalMutation]
  )

  // Reset flow
  const handleReset = useCallback(() => {
    setStep(1)
    setRequestId(null)
    setSelectedMethod('')
    setSelectedAccount(0)
    setTransferCode('')
    setWatchAmount(config.min_withdrawal || 50000)
  }, [config.min_withdrawal])

  // Memoize flow step indicators to prevent re-renders when step changes
  const stepIndicators = useMemo(
    () => (
      <div className='flex items-center space-x-4'>
        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
      </div>
    ),
    [step]
  )

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
              {stepIndicators}
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            {step === 1 && (
              <Step1Form
                onSubmit={handleStep1Submit}
                isLoading={createWithdrawalMutation.isLoading}
                config={config}
                userBalance={userBalance}
              />
            )}

            {step === 2 && (
              <Step2PaymentInfo
                selectedMethod={selectedMethod}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                watchAmount={watchAmount}
                transferCode={transferCode}
                getSelectedMethodDetails={getSelectedMethodDetails}
                getSelectedAccount={getSelectedAccount}
                requestId={requestId}
                onPrev={() => setStep(1)}
                onNext={() => setStep(3)}
                onUploadComplete={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <Step3Success
                watchAmount={watchAmount}
                getSelectedMethodDetails={getSelectedMethodDetails}
                handleReset={handleReset}
              />
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
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-4 w-4 text-primary'
                  >
                    <path d='m2 2 20 20'></path>
                    <path d='M14.5 2H18a2 2 0 0 1 2 2v3.5'></path>
                    <path d='M11.5 22H6a2 2 0 0 1-2-2v-5.5'></path>
                    <path d='M14 7V7'></path>
                    <path d='M4 15a1 1 0 0 0 1 1h4'></path>
                    <path d='M9 17a1 1 0 0 0 1 1h4'></path>
                    <path d='M17 14V4'></path>
                    <path d='M21 10V4'></path>
                    <path d='M22 22 2 2'></path>
                  </svg>
                  <span>Ngân hàng: 24-48 giờ làm việc</span>
                </li>
                <li className='flex items-center gap-2'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-4 w-4 text-primary'
                  >
                    <path d='M18.2 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6.2 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7 6v12'></path>
                    <path d='M19 6c0 1.7-.8 3-2 3a2 2 0 0 1-2-2'></path>
                    <path d='M20 15v4a3 3 0 0 1-6 0v-6.5a8 8 0 0 0-8-8'></path>
                    <path d='M2 2h2v20H2z'></path>
                  </svg>
                  <span>Ví điện tử: 5-30 phút</span>
                </li>
              </ul>
            </div>

            <div className='pt-4 border-t'>
              <p className='font-medium text-sm mb-2'>Lưu ý:</p>
              <ul className='text-xs text-muted-foreground space-y-1'>
                <li>• Thông tin tài khoản nhận tiền phải trùng khớp với tên tài khoản VinBet</li>
                <li>
                  • Số tiền tối thiểu cho mỗi lần rút là{' '}
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0
                  }).format(config.min_withdrawal)}
                </li>
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
