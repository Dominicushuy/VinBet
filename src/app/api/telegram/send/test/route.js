// src/app/api/telegram/send/test/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendCustomNotification } from '@/utils/telegramBot'
import { handleApiError } from '@/utils/errorHandler'
import { updateTelegramStats } from '@/utils/telegramStats'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy thông tin Telegram từ profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_id, telegram_settings, username, display_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.telegram_id) {
      return NextResponse.json(
        {
          error: 'Telegram chưa được kết nối với tài khoản này'
        },
        { status: 400 }
      )
    }

    const telegramId = profile.telegram_id
    const displayName = profile.display_name || profile.username || 'Người dùng'

    // Tạo nội dung tin nhắn thử nghiệm
    const title = '🔔 Kiểm tra kết nối Telegram'
    const message = `Xin chào ${displayName}!

Đây là tin nhắn thử nghiệm từ VinBet.
Kết nối Telegram của bạn đang hoạt động bình thường. Bạn sẽ nhận được các thông báo quan trọng qua kênh này.

⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}
🆔 Telegram ID: ${telegramId}

Cảm ơn bạn đã sử dụng dịch vụ của VinBet!`

    // Gửi thông báo
    const success = await sendCustomNotification(telegramId, title, message)

    // Cập nhật thống kê
    if (success) {
      await updateTelegramStats('notifications_sent')
    }

    return NextResponse.json({
      success,
      message: success ? 'Đã gửi tin nhắn thử nghiệm' : 'Không thể gửi tin nhắn thử nghiệm'
    })
  } catch (error) {
    return handleApiError(error, 'Không thể gửi tin nhắn thử nghiệm')
  }
}
