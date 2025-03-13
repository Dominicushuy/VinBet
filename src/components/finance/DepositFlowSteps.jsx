// src/components/finance/DepositFlowSteps.jsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useCreatePaymentRequestMutation } from '@/hooks/queries/useFinanceQueries'
import { Step1Form } from '@/components/finance/deposit-steps/Step1Form'
import { Step2PaymentInfo } from '@/components/finance/deposit-steps/Step2PaymentInfo'
import { Step3Success } from '@/components/finance/deposit-steps/Step3Success'

export function DepositFlowSteps({ initialConfig }) {
  const [step, setStep] = useState(1)
  const [requestId, setRequestId] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(0)
  const [transferCode, setTransferCode] = useState('')
  const [watchAmount, setWatchAmount] = useState(100000)
  const createPaymentRequestMutation = useCreatePaymentRequestMutation()

  const config = initialConfig || {
    min_deposit: 50000,
    max_deposit: 100000000,
    payment_methods: [
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản qua ngân hàng',
        accounts: [
          {
            bank_name: 'Vietcombank',
            account_number: '1234567890',
            account_name: 'NGUYEN VAN A',
            branch: 'Hồ Chí Minh'
          }
        ]
      },
      {
        id: 'momo',
        name: 'Ví MoMo',
        description: 'Chuyển tiền qua ví MoMo',
        accounts: [
          {
            phone: '0987654321',
            name: 'NGUYEN VAN A'
          }
        ]
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        description: 'Chuyển tiền qua ZaloPay',
        accounts: [
          {
            phone: '0987654321',
            name: 'NGUYEN VAN A'
          }
        ]
      }
    ]
  }

  // Handle deposit step 1
  const handleStep1Submit = async data => {
    setWatchAmount(data.amount)
    setSelectedMethod(data.paymentMethod)

    // Generate transfer code
    const code = `NAP${data.amount}VB${Math.floor(Math.random() * 1000)}`
    setTransferCode(code)

    try {
      // Create payment request
      const result = await createPaymentRequestMutation.mutateAsync({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails: {
          transferCode: code
        }
      })

      if (result?.requestId) {
        setRequestId(result.requestId)
        setStep(2)
      } else {
        // Thêm xử lý khi không có requestId
        toast.error('Tạo yêu cầu không thành công. Vui lòng thử lại.')
        console.error('Missing requestId in response:', result)
      }
    } catch (error) {
      console.error('Error creating payment request:', error)
      toast.error('Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.')
    }
  }

  // Reset flow and start over
  const handleReset = () => {
    setWatchAmount(100000)
    setSelectedMethod('')
    setSelectedAccount(0)
    setTransferCode('')
    setRequestId(null)
    setStep(1)
  }

  // Get selected payment method details
  const getSelectedMethodDetails = () => {
    return config.payment_methods.find(m => m.id === selectedMethod)
  }

  // Get account details
  const getSelectedAccount = () => {
    const method = getSelectedMethodDetails()
    if (!method || method.accounts.length === 0) return null
    return method.accounts[selectedAccount]
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>Nạp tiền vào tài khoản</CardTitle>
            <CardDescription>Chọn phương thức và số tiền bạn muốn nạp</CardDescription>
          </div>
          <div className='flex items-center space-x-4'>
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        {step === 1 && (
          <Step1Form onSubmit={handleStep1Submit} isLoading={createPaymentRequestMutation.isLoading} config={config} />
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
  )
}
