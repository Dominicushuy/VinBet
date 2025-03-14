// Trong file src/app/api/telegram/setup-production/route.js

import { NextResponse } from 'next/server'
import { Telegraf } from 'telegraf'

export async function POST() {
  try {
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

    // 1. Xóa webhook và settings cũ
    await bot.telegram.deleteWebhook({ drop_pending_updates: true })

    // 2. Thiết lập webhook mới
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/webhook`
    await bot.telegram.setWebhook(webhookUrl, {
      allowed_updates: ['message', 'callback_query', 'my_chat_member', 'chat_member'],
      drop_pending_updates: true
    })

    // 3. Kiểm tra webhook
    const webhookInfo = await bot.telegram.getWebhookInfo()

    return NextResponse.json({
      success: true,
      webhook: webhookInfo,
      url: webhookUrl
    })
  } catch (error) {
    console.error('Error setting up production webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
