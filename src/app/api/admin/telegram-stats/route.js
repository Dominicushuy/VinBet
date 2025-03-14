// src/app/api/admin/telegram-stats/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

export const GET = createAdminApiHandler(async (request, _, { supabase }) => {
  try {
    const url = new URL(request.url)
    const startDate =
      url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0]

    // Lấy thống kê từ bảng telegram_stats
    const { data, error } = await supabase
      .from('telegram_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching Telegram stats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Tính tổng số liệu
    const summary = data.reduce(
      (acc, day) => {
        acc.total_notifications += day.notifications_sent || 0
        acc.total_connections += day.new_connections || 0
        acc.total_disconnections += day.disconnections || 0
        acc.total_interactions += day.bot_interactions || 0
        return acc
      },
      {
        total_notifications: 0,
        total_connections: 0,
        total_disconnections: 0,
        total_interactions: 0
      }
    )

    // Lấy tỷ lệ người dùng liên kết
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    const { count: telegramUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('telegram_id', 'is', null)

    summary.connection_rate = totalUsers > 0 ? ((telegramUsers / totalUsers) * 100).toFixed(2) : 0

    return NextResponse.json({
      daily: data,
      summary,
      period: { startDate, endDate }
    })
  } catch (error) {
    console.error('Error in Telegram stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
