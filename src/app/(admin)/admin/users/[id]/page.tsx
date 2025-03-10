import { Metadata } from 'next'
import { UserDetail } from '@/components/admin/UserDetail'

export const metadata: Metadata = {
  title: 'Chi tiết người dùng - Admin - VinBet',
  description: 'Xem và quản lý thông tin chi tiết người dùng trên VinBet',
}

export default function AdminUserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className='space-y-6'>
      <UserDetail userId={params.id} />
    </div>
  )
}
