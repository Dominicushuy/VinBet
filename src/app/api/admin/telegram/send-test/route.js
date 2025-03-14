// src/app/api/admin/telegram/send-test/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

export const POST = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu thông tin người dùng' }, { status: 400 })
    }

    // Lấy thông tin Telegram của người dùng
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_id, telegram_username, display_name, username')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.telegram_id) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng hoặc người dùng chưa kết nối Telegram' },
        { status: 404 }
      )
    }

    // Gửi tin nhắn thử nghiệm
    const result = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationType: 'custom',
        userId: userId,
        title: '🛠️ Kiểm tra kết nối Telegram',
        message: `Đây là tin nhắn thử nghiệm được gửi bởi admin.\n\nXin chào ${
          profile.display_name || profile.username || 'người dùng'
        }!\n\nKết nối Telegram của bạn đang hoạt động bình thường.\n\nThời gian: ${new Date().toLocaleString('vi-VN')}`
      })
    }).then(res => res.json())

    if (!result.success) {
      throw new Error(result.message || 'Không thể gửi tin nhắn thử nghiệm')
    }

    // Ghi log hành động admin
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'SEND_TEST_NOTIFICATION',
      entity_type: 'profiles',
      entity_id: userId,
      details: {
        telegram_id: profile.telegram_id,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Đã gửi tin nhắn thử nghiệm tới ${profile.display_name || profile.username}`
    })
  } catch (error) {
    console.error('Error sending test message:', error)
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
  }
})
