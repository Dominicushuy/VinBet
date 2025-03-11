// src/app/(main)/notifications/settings/page.jsx
import { NotificationSettings } from '@/components/notifications/NotificationSettings'

export const metadata = {
  title: 'Cài đặt thông báo - VinBet',
  description: 'Quản lý cài đặt thông báo của bạn trên VinBet'
}

export default function NotificationSettingsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Cài đặt thông báo</h2>
        <p className='text-muted-foreground'>Quản lý cách bạn nhận thông báo từ VinBet</p>
      </div>

      <NotificationSettings />
    </div>
  )
}
