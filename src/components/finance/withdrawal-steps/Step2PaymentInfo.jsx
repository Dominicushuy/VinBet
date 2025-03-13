// src/components/finance/withdrawal-steps/Step2PaymentInfo.jsx
'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatCurrency } from '@/utils/formatUtils'

export function Step2PaymentInfo({ selectedMethod, watchAmount, getSelectedMethodDetails, onPrev, onNext }) {
  // Copy to clipboard with improved error handling
  const copyToClipboard = (text, successMessage = 'Đã sao chép vào clipboard') => {
    if (!text) {
      toast.error('Không có dữ liệu để sao chép')
      return
    }

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(successMessage))
      .catch(() => toast.error('Không thể sao chép dữ liệu. Vui lòng thử lại.'))
  }

  // Get selected method details
  const method = getSelectedMethodDetails()
  if (!method) {
    return (
      <div className='text-center py-6'>
        <p>Không tìm thấy thông tin phương thức rút tiền. Vui lòng quay lại và thử lại.</p>
        <Button variant='outline' onClick={onPrev} className='mt-4'>
          <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-lg border bg-card p-6'>
        <h3 className='text-lg font-semibold mb-4'>Kiểm tra thông tin rút tiền</h3>

        <div className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0'>
              <Label>Phương thức rút tiền:</Label>
              <span className='font-medium'>{method.name}</span>
            </div>

            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0'>
              <Label>Số tiền rút:</Label>
              <span className='font-medium text-primary'>{formatCurrency(watchAmount)}</span>
            </div>

            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0'>
              <Label>Thời gian xử lý dự kiến:</Label>
              <span className='font-medium'>{method.processingTime}</span>
            </div>

            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0'>
              <Label>Phí giao dịch:</Label>
              <span className='font-medium'>{formatCurrency(0)}</span>
            </div>

            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0 border-t pt-3 mt-1'>
              <Label className='font-medium'>Số tiền sẽ nhận:</Label>
              <span className='font-medium text-primary'>{formatCurrency(watchAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <Alert variant='default' className='bg-blue-50 text-blue-800 border-blue-200'>
        <Info className='h-4 w-4' />
        <AlertTitle>Thông tin xác nhận</AlertTitle>
        <AlertDescription>
          <p className='mb-2'>
            Bạn đang yêu cầu rút <strong>{formatCurrency(watchAmount)}</strong> về <strong>{method.name}</strong>. Vui
            lòng kiểm tra lại thông tin trước khi xác nhận.
          </p>
          <p>
            Yêu cầu rút tiền sẽ được xử lý trong vòng <strong>{method.processingTime}</strong>. Bạn có thể kiểm tra
            trạng thái yêu cầu trong tab &quot;Lịch sử rút tiền&quot;.
          </p>
        </AlertDescription>
      </Alert>

      <div className='pt-4 flex justify-between'>
        <Button variant='outline' onClick={onPrev}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
        </Button>
        <Button onClick={onNext}>
          Xác nhận <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
