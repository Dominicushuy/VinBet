// src/components/admin/payment-request/list/PaymentRequestEmptyState.jsx
import { FileX } from 'lucide-react'

export function PaymentRequestEmptyState() {
  return (
    <div className='flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
        <FileX className='h-6 w-6 text-muted-foreground' />
      </div>
      <h3 className='mt-4 text-lg font-semibold'>Không có yêu cầu nào</h3>
      <p className='mt-2 text-sm text-muted-foreground mb-4'>
        Không tìm thấy yêu cầu thanh toán nào phù hợp với điều kiện tìm kiếm.
      </p>
      <p className='text-sm text-muted-foreground'>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
    </div>
  )
}
