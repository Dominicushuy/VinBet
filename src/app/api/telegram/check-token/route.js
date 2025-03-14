// src/app/api/telegram/check-token/route.js
export const dynamic = 'force-dynamic'

import { getBot } from '@/utils/telegramBotHelper'
import { NextResponse } from 'next/server'

export async function GET() {
  const bot = await getBot()

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'TELEGRAM_BOT_TOKEN không được cấu hình'
        },
        { status: 400 }
      )
    }

    // Kiểm tra token hợp lệ bằng cách lấy thông tin bot
    const botInfo = await bot.telegram.getMe()

    return NextResponse.json({
      success: true,
      token_configured: true,
      token_length: token.length,
      bot_info: botInfo
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        token_configured: !!process.env.TELEGRAM_BOT_TOKEN
      },
      { status: 500 }
    )
  }
}
