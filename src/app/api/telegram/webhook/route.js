import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'
import { updateTelegramStats } from '@/utils/telegramStats'

// Middleware xử lý các hành động bot
async function handleBotAction(update) {
  try {
    // Kiểm tra xem có phải message không
    if (!update.message && !update.callback_query) {
      console.log('Webhook nhận update không phải message hoặc callback_query:', update)
      return false
    }

    // Đảm bảo bot đã được khởi tạo
    if (!botService.isReady()) {
      console.log('Bot chưa sẵn sàng, đang khởi tạo...')
      await botService.initialize()

      // Kiểm tra lại sau khi khởi tạo
      if (!botService.isReady()) {
        console.error('Không thể khởi tạo bot để xử lý webhook')
        return false
      }
    }

    // Cập nhật thống kê tương tác
    await updateTelegramStats('bot_interactions')

    // Xử lý webhook với bot từ service
    const bot = botService.getBot()
    if (bot) {
      await bot.handleUpdate(update)
      return true
    }

    return false
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

    console.log('📨 Webhook nhận được update:', JSON.stringify(body, null, 2).substring(0, 200) + '...')

    // Xử lý webhook
    const success = await handleBotAction(body)

    return NextResponse.json({
      success,
      timestamp: new Date().toISOString()
    })
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
    // Đảm bảo bot đã được khởi tạo
    if (!botService.isReady()) {
      try {
        await botService.initialize()
      } catch (error) {
        return NextResponse.json({
          webhook_url: process.env.TELEGRAM_WEBHOOK_URL || 'Not configured',
          bot_status: 'initialization_failed',
          error: error.message,
          environment: process.env.NODE_ENV
        })
      }
    }

    const bot = botService.getBot()
    let botInfo = null
    let webhookInfo = null

    if (bot) {
      try {
        // Lấy thông tin bot
        botInfo = await bot.telegram.getMe()

        // Lấy thông tin webhook hiện tại
        webhookInfo = await bot.telegram.getWebhookInfo()
      } catch (err) {
        console.error('Error getting bot or webhook info:', err)
      }
    }

    return NextResponse.json({
      webhook_url: process.env.TELEGRAM_WEBHOOK_URL || 'Not configured',
      webhook_info: webhookInfo,
      bot_username: botInfo ? botInfo.username : 'Unknown',
      bot_status: botService.isReady() ? 'Ready' : 'Not initialized',
      environment: process.env.NODE_ENV,
      current_time: new Date().toISOString()
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
