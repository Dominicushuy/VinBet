// src/components/admin/payment-request/detail/PaymentRequestHeader.jsx
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'

export function PaymentRequestHeader({ request }) {
  const renderActivityIcon = () => {
    if (request.type === 'deposit') {
      return <ArrowUpRight className='h-5 w-5 text-green-500' />
    } else {
      return <ArrowDownRight className='h-5 w-5 text-red-500' />
    }
  }

  return (
    <div className='bg-muted p-4 rounded-lg'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          {renderActivityIcon()}
          <h3 className='font-medium'>{request.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}</h3>
        </div>
        <Badge
          className={
            request.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : request.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }
        >
          {request.status === 'approved' ? 'Đã duyệt' : request.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}
        </Badge>
      </div>

      <div className='flex flex-col'>
        <span className='text-sm text-muted-foreground'>Số tiền</span>
        <span className='text-2xl font-bold'>{formatCurrency(request.amount)}</span>
      </div>

      <div className='flex items-center space-x-1 text-sm text-muted-foreground mt-1'>
        <Clock className='h-3.5 w-3.5' />
        <span>{format(new Date(request.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</span>
      </div>
    </div>
  )
}
