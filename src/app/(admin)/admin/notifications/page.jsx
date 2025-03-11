// src/app/(admin)/admin/notifications/page.jsx
import { NotificationSender } from '@/components/admin/NotificationSender'

export const metadata = {
  title: 'Quản lý thông báo - Admin - VinBet',
  description: 'Quản lý và gửi thông báo cho người dùng trên VinBet',
}

export default function AdminNotificationsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Quản lý thông báo</h2>
        <p className='text-muted-foreground'>
          Gửi thông báo tới người dùng VinBet
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <NotificationSender />
      </div>
    </div>
  )
}
