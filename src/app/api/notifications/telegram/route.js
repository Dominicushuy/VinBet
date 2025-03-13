// src/app/api/notifications/telegram/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { sendTelegramMessage } from '@/utils/telegram'
import { handleApiError } from '@/utils/errorHandler'

const telegramConnectSchema = z.object({
  telegram_id: z
    .string()
    .min(1, 'Telegram ID là bắt buộc')
    .max(50, 'Telegram ID không hợp lệ')
    .regex(/^[0-9]+$/, 'Telegram ID phải là chuỗi số')
})

// POST: Connect account with Telegram
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse and validate body
    const body = await request.json()
    const validatedData = telegramConnectSchema.parse(body)

    // Update telegram_id in profiles
    const { data, error } = await supabase
      .from('profiles')
      .update({
        telegram_id: validatedData.telegram_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return handleApiError(error, 'Error connecting Telegram')
    }

    // Create notification about successful connection
    await supabase.rpc('create_notification', {
      p_profile_id: userId,
      p_title: 'Kết nối Telegram thành công',
      p_content:
        'Tài khoản của bạn đã được kết nối với Telegram. Bạn sẽ nhận được các thông báo quan trọng qua Telegram.',
      p_type: 'system'
    })

    // Optional: Send test message with error handling
    try {
      await sendTelegramMessage({
        chat_id: validatedData.telegram_id,
        text: 'Tài khoản VinBet của bạn đã được kết nối thành công!',
        parse_mode: 'HTML'
      })
    } catch (msgError) {
      console.error('Không thể gửi tin nhắn kiểm tra:', msgError)
      // Do not throw error as this is just an optional step
    }

    return NextResponse.json({
      success: true,
      telegram_id: data.telegram_id
    })
  } catch (error) {
    return handleApiError(error, 'Cannot connect to Telegram')
  }
}

// DELETE: Disconnect Telegram account
export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Remove telegram_id in profiles
    const { error } = await supabase
      .from('profiles')
      .update({
        telegram_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      return handleApiError(error, 'Error disconnecting Telegram')
    }

    // Create notification about disconnection
    await supabase.rpc('create_notification', {
      p_profile_id: userId,
      p_title: 'Ngắt kết nối Telegram',
      p_content:
        'Tài khoản của bạn đã được ngắt kết nối khỏi Telegram. Bạn sẽ không nhận được thông báo qua Telegram nữa.',
      p_type: 'system'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Cannot disconnect Telegram')
  }
}

// GET: Check Telegram connection status
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Get telegram_id from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('telegram_id, notification_settings')
      .eq('id', userId)
      .single()

    if (error) {
      return handleApiError(error, 'Error fetching Telegram status')
    }

    return NextResponse.json({
      connected: data.telegram_id !== null,
      telegram_id: data.telegram_id,
      telegram_notifications: data.notification_settings?.telegram_notifications ?? true
    })
  } catch (error) {
    return handleApiError(error, 'Cannot check Telegram status')
  }
}
