// src/components/admin/payment-request/detail/PaymentRequestInfo.jsx
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FileText, Clock, BadgeCheck, ShieldAlert } from 'lucide-react'

export function PaymentRequestInfo({ request }) {
  const renderStatusIcon = () => {
    switch (request.status) {
      case 'approved':
        return <BadgeCheck className='h-5 w-5 text-green-500' />
      case 'rejected':
        return <ShieldAlert className='h-5 w-5 text-red-500' />
      case 'pending':
        return <Clock className='h-5 w-5 text-yellow-500' />
      default:
        return <Clock className='h-5 w-5 text-gray-500' />
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <FileText className='h-5 w-5 text-purple-500' />
        <h3 className='font-medium'>Thông tin chi tiết</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
          <div className='text-sm text-muted-foreground'>ID Yêu cầu</div>
          <div className='text-sm font-mono break-all'>{request.id}</div>
        </div>

        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
          <div className='text-sm text-muted-foreground'>Trạng thái</div>
          <div className='flex items-center space-x-2'>
            {renderStatusIcon()}
            <span className='font-medium'>
              {request.status === 'approved' ? 'Đã duyệt' : request.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}
            </span>
          </div>
        </div>

        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
          <div className='text-sm text-muted-foreground'>Thời gian tạo</div>
          <div>{format(new Date(request.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</div>
        </div>

        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
          <div className='text-sm text-muted-foreground'>Thời gian cập nhật</div>
          <div>{format(new Date(request.updated_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</div>
        </div>
      </div>
    </div>
  )
}
