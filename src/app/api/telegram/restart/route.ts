export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function POST() {
  try {
    // Dừng bot hiện tại nếu đang chạy
    await botService.stop('manual_restart')

    // Đợi 3 giây - quan trọng để đảm bảo session polling cũ đã hết hạn
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Khởi động lại bot
    const bot = await botService.initialize()

    if (bot) {
      try {
        // Lấy thông tin bot để xác nhận đang chạy
        const botInfo = await bot.telegram.getMe()

        return NextResponse.json({
          success: true,
          message: 'Bot đã được khởi động lại thành công',
          status: 'online',
          bot_info: {
            id: botInfo.id,
            username: botInfo.username,
            first_name: botInfo.first_name
          }
        })
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: 'Bot đã khởi động nhưng không thể lấy thông tin',
            error: error.message
          },
          { status: 500 }
        )
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
        error: error.message
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
