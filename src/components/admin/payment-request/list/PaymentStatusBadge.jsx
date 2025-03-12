// src/components/admin/payment-request/list/PaymentStatusBadge.jsx
import { Badge } from '@/components/ui/badge'

export function PaymentStatusBadge({ status }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant='outline' className='bg-yellow-100 text-yellow-800'>
          Đang xử lý
        </Badge>
      )
    case 'approved':
      return <Badge className='bg-green-100 text-green-800'>Đã duyệt</Badge>
    case 'rejected':
      return <Badge variant='destructive'>Từ chối</Badge>
    case 'cancelled':
      return (
        <Badge variant='outline' className='bg-gray-100 text-gray-800'>
          Đã hủy
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}
