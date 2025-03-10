import { Metadata } from 'next'
import { UserManagement } from '@/components/admin/UserManagement'

export const metadata: Metadata = {
  title: 'Quản lý người dùng - Admin - VinBet',
  description: 'Quản lý danh sách người dùng trên nền tảng VinBet',
}

export default function AdminUsersPage() {
  return (
    <div className='space-y-6'>
      <UserManagement />
    </div>
  )
}
