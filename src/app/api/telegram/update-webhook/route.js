// src/app/api/telegram/update-webhook/route.js

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function POST(request) {
  try {
    const { webhookUrl } = await request.json()

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webhook URL is required'
        },
        { status: 400 }
      )
    }

    const bot = botService.getBot()
    if (!bot) {
      throw new Error('Bot chưa được khởi tạo')
    }

    // Xóa webhook hiện tại
    await bot.telegram.deleteWebhook()

    // Đặt webhook mới
    await bot.telegram.setWebhook(webhookUrl, {
      drop_pending_updates: true,
      allowed_updates: ['message', 'callback_query']
    })

    // Kiểm tra webhook đã được thiết lập
    const webhookInfo = await bot.telegram.getWebhookInfo()

    return NextResponse.json({
      success: true,
      message: 'Webhook đã được cập nhật',
      webhookInfo
    })
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
