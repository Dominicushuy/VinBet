// src/components/admin/payment-request/list/PaymentRequestHeader.jsx
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaymentRequestHeader({ onRefresh }) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Quản lý thanh toán</h2>
        <p className='text-muted-foreground'>Xem và xử lý các yêu cầu nạp/rút tiền từ người dùng</p>
      </div>
      <Button onClick={onRefresh} variant='outline'>
        <RefreshCw className='mr-2 h-4 w-4' />
        Làm mới
      </Button>
    </div>
  )
}
