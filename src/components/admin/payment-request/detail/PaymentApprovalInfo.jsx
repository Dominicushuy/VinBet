// src/components/admin/payment-request/detail/PaymentApprovalInfo.jsx
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle } from 'lucide-react'

export function PaymentApprovalInfo({ request }) {
  return (
    <>
      <Separator />
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          {request.status === 'approved' ? (
            <CheckCircle className='h-5 w-5 text-green-500' />
          ) : (
            <XCircle className='h-5 w-5 text-red-500' />
          )}
          <h3 className='font-medium'>{request.status === 'approved' ? 'Thông tin phê duyệt' : 'Lý do từ chối'}</h3>
        </div>

        <div className='grid gap-3'>
          {request.approved_by && (
            <div className='bg-muted/50 p-3 rounded-md space-y-2'>
              <div className='text-sm text-muted-foreground'>Admin xử lý</div>
              <div>{request.approved_by_profile?.display_name || request.approved_by_profile?.username || 'Admin'}</div>
            </div>
          )}

          {request.approved_at && (
            <div className='bg-muted/50 p-3 rounded-md space-y-2'>
              <div className='text-sm text-muted-foreground'>Thời gian xử lý</div>
              <div>{format(new Date(request.approved_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</div>
            </div>
          )}

          {request.notes && (
            <div className='bg-muted/50 p-3 rounded-md space-y-2'>
              <div className='text-sm text-muted-foreground'>Ghi chú</div>
              <div>{request.notes}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
