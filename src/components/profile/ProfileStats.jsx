// src/components/profile/ProfileStats.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingDown, TrendingUp, Trophy, User, Clock } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'

export function ProfileStats({ stats }) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md flex items-center'>
          <Trophy className='mr-2 h-4 w-4 text-primary' />
          Thành tích cá nhân
        </CardTitle>
        <CardDescription>Thống kê hoạt động của bạn</CardDescription>
      </CardHeader>

      <CardContent className='pb-2'>
        <div className='space-y-4'>
          <StatItem
            icon={<Clock className='h-4 w-4 text-muted-foreground' />}
            label='Thời gian tham gia'
            value={formatTimeJoined(stats?.created_at)}
          />

          <StatItem
            icon={<DollarSign className='h-4 w-4 text-muted-foreground' />}
            label='Tổng tiền cược'
            value={formatCurrency(stats?.total_bet_amount || 0)}
          />

          <StatItem
            icon={<TrendingUp className='h-4 w-4 text-green-500' />}
            label='Tổng tiền thắng'
            value={formatCurrency(stats?.total_win_amount || 0)}
          />

          <StatItem
            icon={<TrendingDown className='h-4 w-4 text-red-500' />}
            label='Tổng tiền thua'
            value={formatCurrency(stats?.total_lost_amount || 0)}
          />

          <StatItem
            icon={<Trophy className='h-4 w-4 text-amber-500' />}
            label='Tỷ lệ thắng'
            value={`${(stats?.win_rate || 0).toFixed(1)}%`}
          />

          <StatItem
            icon={<User className='h-4 w-4 text-blue-500' />}
            label='Người giới thiệu'
            value={stats?.referrals_count || 0}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ icon, label, value }) {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center gap-2'>
        {icon}
        <span className='text-sm text-muted-foreground'>{label}</span>
      </div>
      <span className='font-medium'>{value}</span>
    </div>
  )
}

function formatTimeJoined(dateString) {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) return `${diffDays} ngày`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng`
  return `${Math.floor(diffDays / 365)} năm`
}
