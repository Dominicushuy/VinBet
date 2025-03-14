// src/app/(main)/notifications/telegram/page.jsx
import { TelegramConnect } from '@/components/notifications/TelegramConnect'

export const metadata = {
  title: 'Kết nối Telegram - VinBet',
  description: 'Kết nối tài khoản VinBet với Telegram để nhận thông báo quan trọng'
}

export default function TelegramConnectPage() {
  return (
    <div className='space-y-6'>
      <TelegramConnect />
    </div>
  )
}
