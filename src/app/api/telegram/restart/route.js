// src/app/api/telegram/restart/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { Telegraf } from 'telegraf'
import botService from '@/lib/telegram/botService'

export async function POST() {
  try {
    console.log('🔄 Thực hiện reset hoàn toàn Telegram bot...')

    // 1. Dừng bot hiện tại nếu đang chạy
    await botService.stop('manual_reset')

    // 2. Tạo bot tạm thời để làm sạch kết nối
    const tempBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
    await tempBot.telegram.deleteWebhook({ drop_pending_updates: true })
    await tempBot.telegram.getUpdates(1, 100, -1)

    // 3. Đợi đủ lâu để đảm bảo kết nối cũ đã bị xóa
    await new Promise(resolve => setTimeout(resolve, 8000))

    // 4. Khởi động lại bot
    const bot = await botService.initialize()

    if (bot) {
      try {
        const botInfo = await bot.telegram.getMe()
        return NextResponse.json({
          success: true,
          message: 'Bot đã được reset và khởi động lại thành công',
          bot_info: botInfo
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Bot khởi động nhưng không lấy được thông tin',
          error: error.message
        })
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể khởi động lại bot sau khi reset'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error resetting bot:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
