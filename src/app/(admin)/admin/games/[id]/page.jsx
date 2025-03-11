import { UserDetail } from '@/components/admin/AdminUserDetail'

export const metadata = {
  title: 'Chi tiết đặt cược - Admin - VinBet',
  description: 'Xem và quản lý thông tin chi tiết đặt cược trên VinBet'
}

export default function AdminUserDetailPage({ params }) {
  return (
    <div className='space-y-6'>
      <UserDetail userId={params.id} />
    </div>
  )
}
