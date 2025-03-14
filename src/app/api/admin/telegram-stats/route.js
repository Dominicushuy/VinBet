// src/app/api/admin/telegram-stats/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { subDays } from 'date-fns'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    // Tự động thiết lập khoảng thời gian là 30 ngày gần đây nếu không được chỉ định
    const startDate = subDays(new Date(), 30).toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    // Lấy dữ liệu thống kê theo ngày
    const { data: stats, error } = await supabaseAdmin
      .from('telegram_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      return handleApiError(error, 'Không thể lấy thống kê Telegram')
    }

    // Tính tổng số liệu trong khoảng thời gian
    const totalNotificationsSent = stats.reduce((total, day) => total + (day.notifications_sent || 0), 0)
    const totalNewConnections = stats.reduce((total, day) => total + (day.new_connections || 0), 0)
    const totalDisconnections = stats.reduce((total, day) => total + (day.disconnections || 0), 0)
    const totalBotInteractions = stats.reduce((total, day) => total + (day.bot_interactions || 0), 0)

    // Tính tỷ lệ kết nối
    const { count: totalUsers, error: totalError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      return handleApiError(totalError, 'Không thể lấy số lượng người dùng')
    }

    const { count: connectedUsers, error: connectedError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('telegram_id', 'is', null)

    if (connectedError) {
      return handleApiError(connectedError, 'Không thể lấy số lượng người dùng kết nối Telegram')
    }

    const connectionRate = totalUsers > 0 ? (connectedUsers / totalUsers) * 100 : 0

    // Tính tổng kết nối
    const { data: connections, error: connectionsError } = await supabaseAdmin.rpc('count_telegram_connections')

    if (connectionsError) {
      console.warn('Error getting telegram connections:', connectionsError)
    }

    // Thêm trường total_activity vào mỗi ngày
    const statsWithTotalActivity = stats.map(day => ({
      ...day,
      total_activity:
        (day.notifications_sent || 0) +
        (day.new_connections || 0) +
        (day.disconnections || 0) +
        (day.bot_interactions || 0)
    }))

    // Trả về kết quả
    return NextResponse.json({
      stats: statsWithTotalActivity,
      summary: {
        total_notifications_sent: totalNotificationsSent,
        total_new_connections: totalNewConnections,
        total_disconnections: totalDisconnections,
        total_bot_interactions: totalBotInteractions,
        total_connections: connections?.count || connectedUsers,
        total_users: totalUsers,
        connection_rate: connectionRate
      }
    })
  } catch (error) {
    return handleApiError(error, 'Không thể lấy thống kê Telegram')
  }
}
