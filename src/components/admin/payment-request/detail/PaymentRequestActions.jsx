// src/components/admin/payment-request/detail/PaymentRequestActions.jsx
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

export function PaymentRequestActions({ onApprove, onReject }) {
  return (
    <div className='space-y-3 pt-2'>
      <Button className='w-full bg-green-600 hover:bg-green-700' onClick={onApprove}>
        <CheckCircle className='mr-2 h-4 w-4' />
        Phê duyệt yêu cầu
      </Button>

      <Button variant='outline' className='w-full text-red-600 border-red-200 hover:bg-red-50' onClick={onReject}>
        <XCircle className='mr-2 h-4 w-4' />
        Từ chối yêu cầu
      </Button>
    </div>
  )
}
