// src/app/api/telegram/webhook/route.js (cập nhật chi tiết)
import { NextResponse } from 'next/server'
import { bot } from '@/utils/telegramBot'
import { updateTelegramStats } from '@/utils/telegramStats'

// Middleware xử lý các hành động bot
async function handleBotAction(update) {
  try {
    // Kiểm tra xem có phải message không
    if (!update.message) return false

    // Cập nhật thống kê tương tác
    await updateTelegramStats('bot_interactions')

    // Xử lý webhook
    await bot.handleUpdate(update)
    return true
  } catch (error) {
    console.error('Lỗi xử lý webhook Telegram:', error)
    return false
  }
}

export async function POST(request) {
  try {
    // Lấy body từ request
    const body = await request.json()

    // Nếu không có update, trả về lỗi
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          error: 'Empty update'
        },
        { status: 400 }
      )
    }

    // Xử lý webhook
    await handleBotAction(body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}

// Thêm xử lý GET để kiểm tra webhook đã được thiết lập đúng chưa
export async function GET() {
  try {
    return NextResponse.json({
      webhook_url: process.env.TELEGRAM_WEBHOOK_URL || 'Not configured',
      bot_username: process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured',
      message: 'Telegram webhook is ready'
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Webhook check failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}
