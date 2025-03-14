export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function POST() {
  try {
    // Tạo một Promise với timeout
    const botStartPromise = (async () => {
      // Dừng bot hiện tại nếu đang chạy
      await botService.stop('manual_restart')

      // Đợi 1 giây
      await new Promise(r => setTimeout(r, 1000))

      // Khởi động lại bot
      const bot = await botService.initialize()
      return bot
    })()

    // Thêm timeout 10 giây
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Bot initialization timed out after 10 seconds')), 10000)
    })

    // Chạy race giữa khởi tạo bot và timeout
    const bot = await Promise.race([botStartPromise, timeoutPromise])

    // Nếu thành công và có bot
    if (bot) {
      try {
        const botInfo = await bot.telegram.getMe()
        return NextResponse.json({
          success: true,
          message: 'Bot đã được khởi động lại thành công',
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
          message: 'Không thể khởi động lại bot'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error restarting bot:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: 'Đây là môi trường dev, nên có thể tắt bot với TELEGRAM_BOT_ENABLED=false'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Trả về hướng dẫn sử dụng API này
  return NextResponse.json({
    message: 'Sử dụng phương thức POST để khởi động lại bot',
    method: 'POST',
    usage: 'Gửi request POST đến endpoint này để khởi động lại bot Telegram',
    warning: 'Thao tác này sẽ ngắt kết nối bot hiện tại và khởi động lại nó. Có thể mất vài giây.'
  })
}
