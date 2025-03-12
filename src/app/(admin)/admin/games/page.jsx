// src/app/(admin)/admin/games/page.jsx
import { Suspense } from 'react'
import { AdminGameManagement } from '@/components/admin/game'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'
import { GameManagementSkeleton } from '@/components/admin/game/GameManagementSkeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'Quản lý trò chơi - Admin - VinBet',
  description: 'Quản lý các lượt chơi trên nền tảng VinBet'
}

export default function AdminGamesPage() {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb
        items={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Trò chơi', href: '/admin/games' }
        ]}
      />
      <ErrorBoundary>
        <Suspense fallback={<GameManagementSkeleton />}>
          <AdminGameManagement />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
