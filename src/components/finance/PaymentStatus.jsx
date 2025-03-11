// src/components/finance/PaymentStatus.jsx
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Ban } from 'lucide-react'

export function PaymentStatus({ status }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant='outline' className='flex items-center gap-1'>
          <Clock className='h-3 w-3' />
          <span>Đang xử lý</span>
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant='default' className='bg-green-500 flex items-center gap-1'>
          <CheckCircle className='h-3 w-3' />
          <span>Đã duyệt</span>
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant='destructive' className='flex items-center gap-1'>
          <XCircle className='h-3 w-3' />
          <span>Đã từ chối</span>
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge variant='secondary' className='flex items-center gap-1'>
          <Ban className='h-3 w-3' />
          <span>Đã hủy</span>
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}
