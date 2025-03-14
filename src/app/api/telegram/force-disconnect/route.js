// src/app/api/telegram/force-disconnect/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { Telegraf } from 'telegraf'

export async function POST() {
  try {
    console.log('🔄 Thực hiện force-disconnect Telegram bot...')

    // Tạo bot instance tạm thời (không lưu trữ, chỉ để thực hiện cleanup)
    const tempBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

    // Xóa webhook và bỏ các updates đang chờ
    await tempBot.telegram.deleteWebhook({ drop_pending_updates: true })

    // Sử dụng getUpdates với timeout ngắn và offset -1 để reset kết nối
    await tempBot.telegram.getUpdates(1, 100, -1)

    // Thêm thời gian chờ dài hơn để đảm bảo API đã xử lý yêu cầu
    await new Promise(resolve => setTimeout(resolve, 5000))

    return NextResponse.json({
      success: true,
      message: 'Đã thực hiện force-disconnect thành công. Bây giờ bạn có thể khởi động lại bot.'
    })
  } catch (error) {
    console.error('❌ Lỗi khi thực hiện force-disconnect:', error)
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
  return NextResponse.json({
    message: 'Sử dụng phương thức POST để ngắt kết nối bot Telegram',
    method: 'POST',
    usage: 'Sử dụng API này để ngắt kết nối bot hiện tại trước khi khởi động lại',
    warning: 'Thao tác này sẽ buộc bot ngắt kết nối hiện tại và làm mất các updates đang chờ.'
  })
}
