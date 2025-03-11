// src/app/(admin)/admin/games/[id]/page.tsx
import { AdminGameDetail } from '@/components/admin/AdminGameDetail'

export const metadata = {
  title: 'Chi tiết lượt chơi - Admin - VinBet',
  description: 'Xem và quản lý thông tin chi tiết lượt chơi trên VinBet'
}

export default function GameDetailPage({ params }) {
  return <AdminGameDetail gameId={params.id} />
}
