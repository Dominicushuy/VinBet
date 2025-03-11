// src/app/(admin)/admin/games/page.jsx
import { AdminGameManagement } from '@/components/admin/AdminGameManagement'

export const metadata = {
  title: 'Quản lý trò chơi - Admin - VinBet',
  description: 'Quản lý các lượt chơi trên nền tảng VinBet'
}

export default function AdminGamesPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Quản lý trò chơi</h2>
        <p className='text-muted-foreground'>Tạo và quản lý các lượt chơi trên hệ thống</p>
      </div>

      <AdminGameManagement />
    </div>
  )
}
