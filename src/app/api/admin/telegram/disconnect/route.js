// src/app/api/admin/telegram/disconnect/route.js
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

    if (profileError) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    if (!profile.telegram_id) {
      return NextResponse.json({ error: 'Người dùng chưa kết nối Telegram' }, { status: 400 })
    }

    // Xóa thông tin Telegram khỏi profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_id: null,
        telegram_username: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    // Tạo thông báo cho người dùng
    await supabase.rpc('create_notification', {
      p_profile_id: userId,
      p_title: 'Ngắt kết nối Telegram',
      p_content: 'Tài khoản của bạn đã bị ngắt kết nối khỏi Telegram bởi admin.',
      p_type: 'system'
    })

    // Ghi log hành động admin
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'DISCONNECT_TELEGRAM',
      entity_type: 'profiles',
      entity_id: userId,
      details: {
        telegram_id: profile.telegram_id,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Đã ngắt kết nối Telegram của ${profile.display_name || profile.username}`
    })
  } catch (error) {
    console.error('Error disconnecting user from Telegram:', error)
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 })
  }
})
