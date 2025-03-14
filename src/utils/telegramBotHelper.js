import botService from '@/lib/telegram/botService'
import { updateTelegramStats } from '@/utils/telegramStats'

/**
 * Hàm để đảm bảo bot đã được khởi tạo và trả về instance
 * Với cơ chế retry nếu bot chưa sẵn sàng
 */
export async function getBot(retryCount = 0) {
  const MAX_RETRIES = 2

  if (!botService.isReady()) {
    try {
      await botService.initialize()
    } catch (error) {
      console.error('Lỗi khởi tạo bot trong helper:', error)

      // Nếu vẫn có thể thử lại và không phải lỗi 409
      if (retryCount < MAX_RETRIES && (!error.message || !error.message.includes('409'))) {
        console.log(`Thử lại getBot lần ${retryCount + 1}...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Chờ 1s
        return getBot(retryCount + 1)
      }
    }
  }

  return botService.getBot()
}

// Gửi thông báo nạp tiền thành công
export async function sendDepositNotification(telegramId, amount, transactionId) {
  const bot = await getBot()
  if (!bot || !telegramId) return false

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `
💰 *Nạp tiền thành công*

✅ Số tiền: +${amount.toLocaleString('vi-VN')} VND
🕒 Thời gian: ${new Date().toLocaleString('vi-VN')}
🔢 Mã giao dịch: ${transactionId}

Số tiền đã được cộng vào tài khoản của bạn.
`,
      { parse_mode: 'Markdown' }
    )

    // Cập nhật thống kê gửi thông báo
    await updateTelegramStats('notifications_sent')
    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo nạp tiền:`, error)
    return false
  }
}

// Gửi thông báo thắng cược
export async function sendWinNotification(telegramId, amount, gameId, betInfo) {
  const bot = await getBot()
  if (!bot || !telegramId) return false

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `
🎉 *Chúc mừng! Bạn đã thắng cược*

💵 Tiền thắng: +${amount.toLocaleString('vi-VN')} VND
🎮 Mã trò chơi: #${gameId}
🎯 Số đặt: ${betInfo.chosenNumber}
🎲 Kết quả: ${betInfo.result}
🕒 Thời gian: ${new Date().toLocaleString('vi-VN')}

Số tiền đã được cộng vào tài khoản của bạn.
`,
      { parse_mode: 'Markdown' }
    )

    // Cập nhật thống kê gửi thông báo
    await updateTelegramStats('notifications_sent')
    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo thắng cược:`, error)
    return false
  }
}

// Gửi thông báo đăng nhập
export async function sendLoginNotification(telegramId, device, location, time) {
  const bot = await getBot()
  if (!bot || !telegramId) return false

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `
🔐 *Đăng nhập mới phát hiện*

📱 Thiết bị: ${device}
📍 Vị trí: ${location}
🕒 Thời gian: ${time}

❗ Nếu không phải bạn, hãy thay đổi mật khẩu ngay!
`,
      { parse_mode: 'Markdown' }
    )

    // Cập nhật thống kê gửi thông báo
    await updateTelegramStats('notifications_sent')
    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo đăng nhập:`, error)
    return false
  }
}

// Gửi thông báo rút tiền được duyệt
export async function sendWithdrawalApprovedNotification(telegramId, amount, paymentMethod) {
  const bot = await getBot()
  if (!bot || !telegramId) return false

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `
💸 *Yêu cầu rút tiền được duyệt*

✅ Số tiền: ${amount.toLocaleString('vi-VN')} VND
💳 Phương thức: ${paymentMethod}
🕒 Thời gian: ${new Date().toLocaleString('vi-VN')}

Số tiền sẽ được chuyển trong vòng 24 giờ.
`,
      { parse_mode: 'Markdown' }
    )

    // Cập nhật thống kê gửi thông báo
    await updateTelegramStats('notifications_sent')
    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo rút tiền:`, error)
    return false
  }
}

// Gửi thông báo tùy chỉnh
export async function sendCustomNotification(telegramId, title, message) {
  const bot = await getBot()
  if (!bot || !telegramId) return false

  try {
    await bot.telegram.sendMessage(
      telegramId,
      `
*${title}*

${message}

🕒 ${new Date().toLocaleString('vi-VN')}
`,
      { parse_mode: 'Markdown' }
    )

    // Cập nhật thống kê gửi thông báo
    await updateTelegramStats('notifications_sent')
    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo tùy chỉnh:`, error)
    return false
  }
}

// Gửi cảnh báo bảo mật
export async function sendSecurityAlert(telegramId, alertType, details = {}) {
  const bot = await getBot()
  if (!bot || !telegramId) return false

  try {
    let title, message
    const now = new Date().toLocaleString('vi-VN')

    switch (alertType) {
      case 'login_new_device':
        title = '🔐 Đăng nhập mới phát hiện'
        message = `Tài khoản của bạn vừa được đăng nhập từ:
        
📱 Thiết bị: ${details.device || 'Không xác định'}
📍 Vị trí: ${details.location || 'Không xác định'}
🕒 Thời gian: ${details.time || now}

❗ Nếu không phải bạn, hãy thay đổi mật khẩu ngay!`
        break

      case 'password_changed':
        title = '🔑 Mật khẩu đã thay đổi'
        message = `Mật khẩu tài khoản của bạn vừa được thay đổi vào ${details.time || now}.

Nếu không phải bạn thực hiện thay đổi này, vui lòng liên hệ ngay với bộ phận hỗ trợ.`
        break

      case 'large_withdrawal': {
        const formattedAmount = details.amount
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(details.amount)
          : '0 VND'

        title = '💰 Rút tiền số lượng lớn'
        message = `Có yêu cầu rút ${formattedAmount} từ tài khoản của bạn.
        
🕒 Thời gian: ${details.time || now}
📱 Thiết bị: ${details.device || 'Không xác định'}

Nếu không phải bạn, hãy liên hệ ngay với bộ phận hỗ trợ.`
        break
      }

      default:
        title = '⚠️ Cảnh báo bảo mật'
        message = 'Phát hiện hoạt động bất thường trên tài khoản của bạn. Vui lòng kiểm tra và xác nhận.'
    }

    await bot.telegram.sendMessage(telegramId, `*${title}*\n\n${message}`, { parse_mode: 'Markdown' })

    // Cập nhật thống kê gửi thông báo
    await updateTelegramStats('notifications_sent')
    return true
  } catch (error) {
    console.error(`Lỗi gửi cảnh báo bảo mật:`, error)
    return false
  }
}
