export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

// API này dùng để xóa webhook đang được cấu hình trên Telegram
// Hữu ích khi chuyển từ webhook sang polling hoặc khi gặp lỗi 409
export async function POST() {
  try {
    let bot = botService.getBot()

    // Nếu bot chưa sẵn sàng, thử khởi tạo
    if (!bot) {
      try {
        await botService.initialize()
        bot = botService.getBot()
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bot initialization failed: ' + error.message
          },
          { status: 500 }
        )
      }
    }

    if (!bot) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bot is not available'
        },
        { status: 500 }
      )
    }

    // Lấy thông tin webhook hiện tại
    const webhookInfo = await bot.telegram.getWebhookInfo()
    const hasWebhook = webhookInfo && webhookInfo.url && webhookInfo.url.length > 0

    // Xóa webhook
    await bot.telegram.deleteWebhook({ drop_pending_updates: true })

    // Dừng bot nếu đang chạy
    try {
      await botService.stop('webhook_removed')
    } catch (stopError) {
      console.warn('Cảnh báo khi dừng bot:', stopError.message)
    }

    // Đợi một chút
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Khởi động lại với polling nếu là môi trường dev
    let restartResult = null
    if (process.env.NODE_ENV !== 'production') {
      try {
        await botService.initialize()
        restartResult = { success: botService.isReady() }
      } catch (restartError) {
        restartResult = {
          success: false,
          error: restartError.message
        }
      }
    }

    return NextResponse.json({
      success: true,
      previous_webhook: hasWebhook ? webhookInfo.url : null,
      webhook_removed: true,
      restarted: restartResult,
      message:
        'Webhook đã được xóa thành công' +
        (hasWebhook ? ` (Webhook cũ: ${webhookInfo.url})` : '') +
        (process.env.NODE_ENV !== 'production'
          ? restartResult?.success
            ? '. Bot đã được khởi động lại với long polling'
            : '. Khởi động lại bot thất bại, vui lòng thử endpoint /api/telegram/restart'
          : '')
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

export async function GET() {
  // Trả về hướng dẫn sử dụng API này
  return NextResponse.json({
    message: 'Sử dụng phương thức POST để xóa webhook',
    method: 'POST',
    usage: 'Gửi request POST đến endpoint này để xóa webhooks đang được cấu hình trên Telegram API',
    warning: 'Thao tác này sẽ xóa webhook hiện tại và có thể làm gián đoạn kết nối. Chỉ sử dụng khi gặp lỗi 409.'
  })
}
