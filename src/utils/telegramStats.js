// src/utils/telegramStats.js
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Cập nhật thống kê Telegram
 * @param {string} metric - Loại thống kê cần cập nhật (notifications_sent, new_connections, disconnections, bot_interactions)
 * @returns {Promise<boolean>} - Kết quả cập nhật
 */
export async function updateTelegramStats(metric) {
  // try {
  //   const supabase = createRouteHandlerClient({ cookies })
  //   const today = new Date().toISOString().split('T')[0]

  //   // Kiểm tra bản ghi cho ngày hôm nay
  //   const { data, error } = await supabase.from('telegram_stats').select('*').eq('date', today).single()

  //   if (error && error.code !== 'PGRST116') {
  //     // PGRST116: not found
  //     console.error('Error checking telegram stats:', error)
  //     return false
  //   }

  //   if (data) {
  //     // Update bản ghi hiện có
  //     const updateData = {}
  //     updateData[metric] = data[metric] + 1

  //     const { error: updateError } = await supabase.from('telegram_stats').update(updateData).eq('id', data.id)

  //     if (updateError) {
  //       console.error('Error updating telegram stats:', updateError)
  //       return false
  //     }
  //   } else {
  //     // Tạo bản ghi mới cho ngày hôm nay
  //     const insertData = {
  //       date: today,
  //       notifications_sent: 0,
  //       new_connections: 0,
  //       disconnections: 0,
  //       bot_interactions: 0
  //     }

  //     insertData[metric] = 1

  //     const { error: insertError } = await supabase.from('telegram_stats').insert(insertData)

  //     if (insertError) {
  //       console.error('Error inserting telegram stats:', insertError)
  //       return false
  //     }
  //   }

  //   return true
  // } catch (error) {
  //   console.error('Error updating telegram stats:', error)
  //   return false
  // }
  try {
    // Gọi function RPC để cập nhật thống kê Telegram
    const { data, error } = await supabaseAdmin.rpc('update_telegram_stats', {
      p_metric: metric
    })

    if (error) {
      console.error('Lỗi cập nhật thống kê telegram:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Lỗi không xác định khi cập nhật thống kê telegram:', error)
    return false
  }
}

/**
 * Lấy thống kê Telegram theo ngày
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
 * @returns {Promise<Object>} - Dữ liệu thống kê
 */
export async function getTelegramStats(startDate, endDate) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    let query = supabase.from('telegram_stats').select('*').order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching telegram stats:', error)
      return { error: 'Không thể lấy thống kê' }
    }

    // Tính tổng số liệu
    const summary = data.reduce(
      (acc, item) => {
        acc.total_notifications_sent += item.notifications_sent || 0
        acc.total_new_connections += item.new_connections || 0
        acc.total_disconnections += item.disconnections || 0
        acc.total_bot_interactions += item.bot_interactions || 0
        return acc
      },
      {
        total_notifications_sent: 0,
        total_new_connections: 0,
        total_disconnections: 0,
        total_bot_interactions: 0
      }
    )

    return {
      stats: data || [],
      summary
    }
  } catch (error) {
    console.error('Error fetching telegram stats:', error)
    return { error: 'Không thể lấy thống kê' }
  }
}
