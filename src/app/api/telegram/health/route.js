export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function GET() {
  try {
    // Lấy thông tin bot
    let bot = botService.getBot()
    let botInfo = null
    let status = 'offline'

    // Kiểm tra bot đã sẵn sàng chưa
    if (!botService.isReady()) {
      console.log('Bot chưa sẵn sàng, thử khởi tạo...')
      try {
        await botService.initialize()
        bot = botService.getBot()
        status = botService.isReady() ? 'online' : 'initialization_failed'
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bot initialization failed: ' + error.message,
            token_configured: !!process.env.TELEGRAM_BOT_TOKEN
          },
          { status: 500 }
        )
      }
    } else {
      status = 'online'
    }

    // Lấy thông tin bot nếu có
    if (bot) {
      try {
        botInfo = await bot.telegram.getMe()
      } catch (getInfoError) {
        console.error('Lỗi lấy thông tin bot:', getInfoError)
        return NextResponse.json(
          {
            success: false,
            status: 'error',
            error: getInfoError.message,
            token_configured: !!process.env.TELEGRAM_BOT_TOKEN
          },
          { status: 500 }
        )
      }
    }

    // Nếu đã có thông tin bot, đánh dấu thành công
    if (botInfo) {
      // Lấy thêm thông tin webhook nếu đang ở production
      let webhookInfo = null
      if (process.env.NODE_ENV === 'production' && bot) {
        try {
          webhookInfo = await bot.telegram.getWebhookInfo()
        } catch (webhookError) {
          console.warn('Không thể lấy thông tin webhook:', webhookError)
        }
      }

      return NextResponse.json({
        success: true,
        status,
        bot: {
          id: botInfo.id,
          username: botInfo.username,
          first_name: botInfo.first_name,
          is_bot: botInfo.is_bot
        },
        webhook: webhookInfo,
        environment: process.env.NODE_ENV,
        mode: process.env.NODE_ENV === 'production' ? 'webhook' : 'polling',
        timestamp: new Date().toISOString()
      })
    }

    // Nếu không có thông tin bot, trả về lỗi
    return NextResponse.json(
      {
        success: false,
        status,
        error: 'Bot is not properly initialized',
        token_configured: !!process.env.TELEGRAM_BOT_TOKEN
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error checking bot health:', error)
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
