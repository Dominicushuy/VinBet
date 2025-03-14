import botService from '@/lib/telegram/botService'

export async function initializeTelegramBot() {
  try {
    if (process.env.TELEGRAM_BOT_ENABLED === 'false') {
      console.log('⚠️ Telegram Bot đã bị tắt thông qua biến môi trường')
      return {
        success: false,
        reason: 'disabled'
      }
    }

    try {
      await botService.initialize()
      return {
        success: botService.isReady(),
        initialized: botService.isReady()
      }
    } catch (error) {
      // Kiểm tra lỗi 409 để thử lại
      if (error.message && error.message.includes('409')) {
        return {
          success: false,
          retryNeeded: true,
          error: error.message
        }
      }

      throw error
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Telegram Bot:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getBot() {
  if (!botService.isReady()) {
    await botService.initialize()
  }
  return botService.getBot()
}
