// src/app/(admin)/admin/dashboard/page.jsx
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata = {
  title: 'Admin Dashboard - VinBet',
  description: 'Tổng quan hệ thống VinBet',
}

export default function AdminDashboardPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
        <p className='text-muted-foreground'>
          Tổng quan về hoạt động của hệ thống VinBet
        </p>
      </div>

      <AdminDashboard />
    </div>
  )
}
