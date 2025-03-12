// src/components/admin/payment-request/list/UserAvatar.jsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserAvatar({ user }) {
  if (!user) {
    return (
      <Avatar className='h-8 w-8'>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className='h-8 w-8'>
      <AvatarImage src={user.avatar_url || ''} />
      <AvatarFallback>{(user.display_name || user.username || 'U')[0].toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
