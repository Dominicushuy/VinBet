// src/components/notifications/EmptyNotifications.tsx
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyNotifications({ type = 'all' }) {
  const getMessage = () => {
    switch (type) {
      case 'system':
        return 'Không có thông báo hệ thống nào'
      case 'game':
        return 'Không có thông báo game nào'
      case 'transaction':
        return 'Không có thông báo giao dịch nào'
      case 'admin':
        return 'Không có thông báo từ admin nào'
      default:
        return 'Chưa có thông báo nào'
    }
  }

  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4'>
        <Bell className='h-8 w-8 text-muted-foreground' />
      </div>
      <h3 className='text-lg font-medium'>{getMessage()}</h3>
      <p className='text-sm text-muted-foreground max-w-sm text-center mt-1'>
        {type === 'all'
          ? 'Khi bạn có thông báo mới, chúng sẽ xuất hiện ở đây.'
          : 'Thông báo sẽ được hiển thị khi có cập nhật mới.'}
      </p>
      <Button variant='outline' className='mt-4'>
        Làm mới
      </Button>
    </div>
  )
}
