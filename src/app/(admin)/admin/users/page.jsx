import { AdminUserManagement } from '@/components/admin/AdminUserManagement'

export const metadata = {
  title: 'Quản lý người dùng - Admin - VinBet',
  description: 'Quản lý danh sách người dùng trên nền tảng VinBet'
}

export default function AdminUsersPage() {
  return (
    <div className='space-y-6'>
      <AdminUserManagement />
    </div>
  )
}
