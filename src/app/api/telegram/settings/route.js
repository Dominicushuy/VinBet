// src/app/api/notifications/telegram/settings/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Schema validation cho thiết lập Telegram
const telegramSettingsSchema = z.object({
  receive_win_notifications: z.boolean().default(true),
  receive_deposit_notifications: z.boolean().default(true),
  receive_withdrawal_notifications: z.boolean().default(true),
  receive_login_alerts: z.boolean().default(true),
  receive_system_notifications: z.boolean().default(true)
})

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy thiết lập Telegram từ profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_settings')
      .eq('id', userId)
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thiết lập Telegram')
    }

    return NextResponse.json({
      settings: profile.telegram_settings || {
        receive_win_notifications: true,
        receive_deposit_notifications: true,
        receive_withdrawal_notifications: true,
        receive_login_alerts: true,
        receive_system_notifications: true
      }
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thiết lập Telegram')
  }
}

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
    const validatedData = telegramSettingsSchema.parse(body)

    // Kiểm tra kết nối Telegram
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('id', userId)
      .single()

    if (profileError) {
      return handleApiError(profileError, 'Lỗi khi kiểm tra thông tin profile')
    }

    if (!profile.telegram_id) {
      return NextResponse.json(
        {
          error: 'Telegram chưa được kết nối'
        },
        { status: 400 }
      )
    }

    // Cập nhật thiết lập Telegram
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_settings: validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      return handleApiError(updateError, 'Không thể cập nhật thiết lập Telegram')
    }

    return NextResponse.json({
      success: true,
      message: 'Thiết lập Telegram đã được cập nhật',
      settings: validatedData
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
    return handleApiError(error, 'Lỗi cập nhật thiết lập Telegram')
  }
}
