import { initializeTelegramBot } from '@/middleware/telegramBot'

let isInitialized = false
let initRetryCount = 0
const MAX_RETRIES = 3

export async function initializeServices() {
  if (isInitialized) return

  console.log('🚀 Đang khởi tạo các dịch vụ...')

  try {
    // Khởi tạo Telegram Bot
    const botResult = await initializeTelegramBot()

    if (botResult.success) {
      console.log('🤖 Telegram Bot: Đã khởi động thành công')
      isInitialized = true
    } else if (botResult.retryNeeded && initRetryCount < MAX_RETRIES) {
      // Nếu cần thử lại (do lỗi 409)
      initRetryCount++
      console.log(`⏳ Thử khởi động lại bot lần ${initRetryCount}/${MAX_RETRIES} sau 3 giây...`)
      setTimeout(initializeServices, 3000)
      return
    } else if (botResult.reason === 'disabled') {
      console.log('⚠️ Telegram Bot đã bị tắt qua biến môi trường')
      isInitialized = true // Vẫn đánh dấu là đã khởi tạo
    } else {
      console.error('❌ Không thể khởi động Telegram Bot:', botResult.error || 'Unknown error')
      // Vẫn đánh dấu là đã khởi tạo để không thử lại trong vòng đời của request hiện tại
      isInitialized = true
    }

    console.log('✅ Đã khởi tạo xong các dịch vụ!')
  } catch (err) {
    console.error('❌ Lỗi khởi tạo dịch vụ:', err)
    isInitialized = true // Vẫn đánh dấu là đã khởi tạo để tránh lặp lại lỗi
  }
}

// Khởi tạo với delay để tránh xung đột - đặc biệt quan trọng trong môi trường dev
setTimeout(() => {
  initializeServices().catch(err => {
    console.error('❌ Lỗi không xác định trong quá trình khởi tạo:', err)
  })
}, 1500) // Delay 1.5s để đảm bảo server đã hoàn tất khởi động
