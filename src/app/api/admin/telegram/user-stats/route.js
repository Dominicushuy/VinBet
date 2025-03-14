// src/app/api/admin/telegram/user-stats/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { subDays } from 'date-fns'

export async function GET() {
  try {
    // Tổng số người dùng
    const { count: totalUsers, error: totalError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError

    // Số người dùng đã kết nối Telegram
    const { count: connectedUsers, error: connectedError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('telegram_id', 'is', null)

    if (connectedError) throw connectedError

    // Tính tỷ lệ kết nối
    const connectionRate = totalUsers > 0 ? (connectedUsers / totalUsers) * 100 : 0

    // Lấy thống kê người dùng mới theo khoảng thời gian
    const today = new Date().toISOString()
    const yesterday = subDays(new Date(), 1).toISOString()
    const lastWeek = subDays(new Date(), 7).toISOString()
    const lastMonth = subDays(new Date(), 30).toISOString()

    // Người dùng mới hôm nay
    const { count: newUsersToday, error: todayUsersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)

    if (todayUsersError) throw todayUsersError

    // Kết nối Telegram mới hôm nay
    const { count: newConnectionsToday, error: todayConnectionsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('telegram_id', 'is', null)
      .gte('telegram_connected_at', yesterday)

    if (todayConnectionsError) throw todayConnectionsError

    // Người dùng mới trong 7 ngày qua
    const { count: newUsersWeek, error: weekUsersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek)

    if (weekUsersError) throw weekUsersError

    // Kết nối Telegram mới trong 7 ngày qua
    const { count: newConnectionsWeek, error: weekConnectionsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('telegram_id', 'is', null)
      .gte('telegram_connected_at', lastWeek)

    if (weekConnectionsError) throw weekConnectionsError

    // Người dùng mới trong 30 ngày qua
    const { count: newUsersMonth, error: monthUsersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth)

    if (monthUsersError) throw monthUsersError

    // Kết nối Telegram mới trong 30 ngày qua
    const { count: newConnectionsMonth, error: monthConnectionsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('telegram_id', 'is', null)
      .gte('telegram_connected_at', lastMonth)

    if (monthConnectionsError) throw monthConnectionsError

    // Thống kê cài đặt thông báo
    const { data: notificationSettingsData, error: settingsError } = await supabaseAdmin.rpc(
      'get_telegram_settings_stats'
    )

    if (settingsError) throw settingsError

    // Map cài đặt thông báo vào định dạng dễ sử dụng
    const notificationSettings = {
      win_enabled: 0,
      win_disabled: 0,
      transaction_enabled: 0,
      transaction_disabled: 0,
      login_enabled: 0,
      login_disabled: 0,
      system_enabled: 0,
      system_disabled: 0
    }

    if (notificationSettingsData) {
      notificationSettings.win_enabled = notificationSettingsData.win_enabled || 0
      notificationSettings.win_disabled = notificationSettingsData.win_disabled || 0
      notificationSettings.transaction_enabled = notificationSettingsData.transaction_enabled || 0
      notificationSettings.transaction_disabled = notificationSettingsData.transaction_disabled || 0
      notificationSettings.login_enabled = notificationSettingsData.login_enabled || 0
      notificationSettings.login_disabled = notificationSettingsData.login_disabled || 0
      notificationSettings.system_enabled = notificationSettingsData.system_enabled || 0
      notificationSettings.system_disabled = notificationSettingsData.system_disabled || 0
    }

    // Thống kê thông báo đã gửi
    const { data: notificationsData, error: notificationsError } = await supabaseAdmin
      .from('telegram_stats')
      .select('SUM(notifications_sent)::int as total_notifications')
      .single()

    if (notificationsError) throw notificationsError

    // Thống kê thông báo theo loại
    const { data: notificationTypeData, error: typeError } = await supabaseAdmin.rpc('get_telegram_notification_types')

    if (typeError) throw typeError

    const notificationsByType = {
      system: 0,
      transaction: 0,
      game: 0,
      admin: 0
    }

    if (notificationTypeData) {
      notificationTypeData.forEach(item => {
        notificationsByType[item.type] = item.count
      })
    }

    return NextResponse.json({
      totalUsers,
      connectedUsers,
      connectionRate,
      today: {
        newUsers: newUsersToday,
        newConnections: newConnectionsToday
      },
      week: {
        newUsers: newUsersWeek,
        newConnections: newConnectionsWeek
      },
      month: {
        newUsers: newUsersMonth,
        newConnections: newConnectionsMonth
      },
      notificationSettings,
      totalNotifications: notificationsData?.total_notifications || 0,
      notificationsByType
    })
  } catch (error) {
    console.error('Error fetching telegram user stats:', error)
    return NextResponse.json(
      {
        error: error.message || 'Không thể lấy thống kê người dùng Telegram'
      },
      { status: 500 }
    )
  }
}
