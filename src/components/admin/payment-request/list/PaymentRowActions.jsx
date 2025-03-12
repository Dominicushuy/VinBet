// src/components/admin/payment-request/list/PaymentRowActions.jsx
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react'

export function PaymentRowActions({ payment, onViewDetail, onViewUser }) {
  return (
    <div className='flex space-x-2'>
      <Button variant='outline' size='sm' onClick={() => onViewDetail(payment)}>
        <Eye className='h-4 w-4' />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='sm'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => onViewDetail(payment)}>
            <Eye className='mr-2 h-4 w-4' />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewUser}>
            <ExternalLink className='mr-2 h-4 w-4' />
            Xem người dùng
          </DropdownMenuItem>

          {payment.status === 'pending' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetail(payment)}>
                <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                <span className='text-green-500'>Phê duyệt</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewDetail(payment)}>
                <XCircle className='mr-2 h-4 w-4 text-red-500' />
                <span className='text-red-500'>Từ chối</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
