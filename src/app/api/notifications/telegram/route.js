// src/app/api/notifications/telegram/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Schema validation cho kết nối Telegram
const telegramConnectSchema = z.object({
  telegram_id: z.string().min(1, 'Telegram ID là bắt buộc')
})

// GET: Kiểm tra kết nối Telegram
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy thông tin Telegram từ profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_id, telegram_username, telegram_connected_at, telegram_settings')
      .eq('id', userId)
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thông tin kết nối Telegram')
    }

    return NextResponse.json({
      connected: !!profile.telegram_id,
      telegram_id: profile.telegram_id,
      telegram_username: profile.telegram_username,
      connected_at: profile.telegram_connected_at,
      settings: profile.telegram_settings
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi kiểm tra kết nối Telegram')
  }
}

// POST: Kết nối Telegram
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse và validate body
    const body = await request.json()
    const validatedData = telegramConnectSchema.parse(body)

    // Kiểm tra xem Telegram ID đã được sử dụng bởi người dùng khác chưa
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', validatedData.telegram_id)
      .neq('id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Telegram ID này đã được liên kết với tài khoản khác'
        },
        { status: 409 }
      )
    }

    // Cập nhật profile với Telegram ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_id: validatedData.telegram_id,
        telegram_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      return handleApiError(updateError, 'Không thể cập nhật kết nối Telegram')
    }

    // Tạo notification thông báo kết nối thành công
    await supabase.rpc('create_notification', {
      p_profile_id: userId,
      p_title: 'Kết nối Telegram thành công',
      p_content:
        'Tài khoản của bạn đã được kết nối thành công với Telegram. Bạn sẽ nhận được thông báo qua Telegram từ bây giờ.',
      p_type: 'system'
    })

    // Cập nhật thống kê kết nối mới
    await updateTelegramStats('new_connections')

    return NextResponse.json({
      success: true,
      message: 'Kết nối Telegram thành công'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: error.errors
        },
        { status: 400 }
      )
    }
    return handleApiError(error, 'Lỗi kết nối Telegram')
  }
}

// DELETE: Ngắt kết nối Telegram
export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Xóa thông tin Telegram khỏi profile
    const { error } = await supabase
      .from('profiles')
      .update({
        telegram_id: null,
        telegram_username: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      return handleApiError(error, 'Không thể ngắt kết nối Telegram')
    }

    // Cập nhật thống kê ngắt kết nối
    await updateTelegramStats('disconnections')

    // Tạo notification thông báo ngắt kết nối thành công
    await supabase.rpc('create_notification', {
      p_profile_id: userId,
      p_title: 'Đã ngắt kết nối Telegram',
      p_content:
        'Tài khoản của bạn đã được ngắt kết nối khỏi Telegram. Bạn sẽ không nhận được thông báo qua Telegram nữa.',
      p_type: 'system'
    })

    return NextResponse.json({
      success: true,
      message: 'Đã ngắt kết nối Telegram'
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi ngắt kết nối Telegram')
  }
}

// Helper function cập nhật thống kê Telegram
async function updateTelegramStats(metric) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase.from('telegram_stats').select('*').eq('date', today).single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking telegram stats:', error)
      return
    }

    if (data) {
      await supabase
        .from('telegram_stats')
        .update({ [metric]: data[metric] + 1 })
        .eq('id', data.id)
    } else {
      await supabase.from('telegram_stats').insert({
        date: today,
        [metric]: 1
      })
    }
  } catch (error) {
    console.error('Error updating telegram stats:', error)
  }
}
