export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { Telegraf } from 'telegraf'

export async function POST() {
  try {
    // Tạo instance bot mới trực tiếp để tránh sử dụng service hiện tại
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token không được cấu hình'
        },
        { status: 400 }
      )
    }

    const telegraf = new Telegraf(token)

    // Xóa webhook và bỏ qua tất cả updates đang chờ
    await telegraf.telegram.deleteWebhook({ drop_pending_updates: true })

    // Đợi để đảm bảo các kết nối cũ đã đóng
    await new Promise(resolve => setTimeout(resolve, 5000))

    return NextResponse.json({
      success: true,
      message: 'Đã xóa webhook và ngắt kết nối bot. Khởi động lại ứng dụng để khởi tạo lại bot.'
    })
  } catch (error) {
    console.error('Error clearing webhook:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
