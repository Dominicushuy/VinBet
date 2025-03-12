// src/components/admin/payment-request/detail/PaymentUserInfo.jsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserCircle } from 'lucide-react'

export function PaymentUserInfo({ request, onViewUser }) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <UserCircle className='h-5 w-5 text-blue-500' />
        <h3 className='font-medium'>Thông tin người dùng</h3>
      </div>

      <div className='flex items-center space-x-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={request.profiles?.avatar_url} />
          <AvatarFallback>
            {(request.profiles?.display_name || request.profiles?.username || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className='font-medium'>{request.profiles?.display_name || request.profiles?.username}</div>
          <div className='text-sm text-muted-foreground'>{request.profiles?.email}</div>
        </div>
      </div>

      <Button variant='outline' size='sm' className='w-full' onClick={onViewUser}>
        <UserCircle className='mr-2 h-4 w-4' />
        Xem hồ sơ người dùng
      </Button>
    </div>
  )
}
