import { cookies } from 'next/headers'

/**
 * Gửi thông báo tới Telegram từ phía server
 * @param {Object} options - Các tùy chọn thông báo
 * @param {string} options.notificationType - Loại thông báo (deposit, withdrawal, win, etc.)
 * @param {string} options.userId - ID của người dùng
 * @param {number} [options.amount] - Số tiền giao dịch/thắng cược
 * @param {string} [options.transactionId] - ID giao dịch (tùy chọn)
 * @param {string} [options.paymentMethod] - Phương thức thanh toán (tùy chọn)
 * @param {string} [options.gameId] - ID của vòng game (tùy chọn)
 * @param {Object} [options.betInfo] - Thông tin cược (tùy chọn)
 * @param {boolean} [options.isSkipError] - Cờ bỏ qua lỗi (tùy chọn)
 * @param {Object} [options.additionalData] - Dữ liệu bổ sung (tùy chọn)
 * @returns {Promise<Object>} Kết quả từ API
 */
export async function sendTelegramNotification(options) {
  try {
    const cookieStore = cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const urlSendTelegram = `${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/send`

    const response = await fetch(urlSendTelegram, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      },
      body: JSON.stringify(options)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      if (options.isSkipError) {
        console.error(`Telegram notification failed: ${response.status} ${errorData?.error || response.statusText}`)
        return { success: false, error: errorData?.error || response.statusText }
      }
      throw new Error(`Telegram notification failed: ${response.status} ${errorData?.error || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    if (options.isSkipError) {
      return { success: false, error: error.message }
    }
    throw error
  }
}

/**
 * Gửi thông báo nạp tiền
 */
export async function sendDepositTelegramNotification(userId, amount, transactionId, additionalData = {}) {
  return sendTelegramNotification({
    notificationType: 'deposit',
    userId,
    amount,
    transactionId,
    ...additionalData
  })
}

/**
 * Gửi thông báo rút tiền
 */
export async function sendWithdrawalTelegramNotification(userId, amount, paymentMethod, additionalData = {}) {
  return sendTelegramNotification({
    notificationType: 'withdrawal',
    userId,
    amount,
    paymentMethod,
    ...additionalData
  })
}

/**
 * Gửi thông báo tùy chỉnh
 * @param {string} userId - ID của người dùng
 * @param {string} title - Tiêu đề thông báo
 * @param {string} content - Nội dung thông báo
 * @param {Object} [additionalData={}] - Dữ liệu bổ sung (tùy chọn)
 * @returns {Promise<Object>} Kết quả từ API
 */
export async function sendCustomTelegramNotification(userId, title, content, additionalData = {}) {
  return sendTelegramNotification({
    notificationType: 'custom',
    userId,
    title,
    message: content,
    ...additionalData
  })
}

/**
 * Gửi thông báo thắng cược
 * @param {string} userId - ID của người dùng
 * @param {number} amount - Số tiền thắng
 * @param {string} gameId - ID của vòng game
 * @param {Object} betInfo - Thông tin về cược
 * @param {number|string} betInfo.chosenNumber - Số người chơi đã chọn
 * @param {number|string} betInfo.result - Kết quả của trò chơi
 * @param {boolean} [isSkipError=true] - Bỏ qua lỗi khi gửi thông báo
 * @param {Object} [additionalData={}] - Dữ liệu bổ sung (tùy chọn)
 * @returns {Promise<Object>} Kết quả từ API
 */
export async function sendWinTelegramNotification(
  userId,
  amount,
  gameId,
  betInfo,
  isSkipError = true,
  additionalData = {}
) {
  return sendTelegramNotification({
    notificationType: 'win',
    userId,
    amount,
    gameId,
    betInfo,
    isSkipError,
    ...additionalData
  })
}
