// src/components/finance/deposit-steps/Step3Success.jsx
import { Button } from '@/components/ui/button'
import { Check, RefreshCw, Wallet } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { useRouter } from 'next/navigation'

export function Step3Success({ watchAmount, getSelectedMethodDetails, handleReset }) {
  const router = useRouter()

  return (
    <div className='space-y-6 text-center py-6'>
      <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
        <Check className='h-10 w-10 text-green-600' />
      </div>
      <div className='space-y-2'>
        <h3 className='text-2xl font-semibold tracking-tight'>Yêu cầu nạp tiền thành công!</h3>
        <p className='text-muted-foreground'>
          Yêu cầu nạp tiền của bạn đã được gửi thành công. Vui lòng chờ admin xác nhận và tiền sẽ được cộng vào tài
          khoản của bạn trong thời gian sớm nhất.
        </p>
      </div>

      <div className='bg-muted p-4 rounded-md my-6'>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Phương thức:</span>
            <span className='font-medium'>{getSelectedMethodDetails()?.name}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Số tiền:</span>
            <span className='font-medium'>{formatCurrency(watchAmount)}</span>
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

      <div className='pt-4 flex justify-center space-x-4'>
        <Button variant='outline' onClick={handleReset}>
          <RefreshCw className='mr-2 h-4 w-4' /> Tạo yêu cầu mới
        </Button>
        <Button onClick={() => router.push('/finance/overview')}>
          <Wallet className='mr-2 h-4 w-4' /> Quay lại trang Tài chính
        </Button>
      </div>
    </div>
  )
}
