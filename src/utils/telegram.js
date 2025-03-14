// src/utils/telegram.js

// Function gửi thông báo qua Telegram
async function sendTelegramMessage(message) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN chưa được cấu hình')
      return false
    }

    // Thêm parse_mode mặc định nếu không có
    const finalMessage = {
      ...message,
      parse_mode: message.parse_mode || 'HTML'
    }

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalMessage)
    })

    if (response.status !== 200 || !response.ok) {
      const errorData = await response.json()
      console.error('Telegram API error:', errorData)
      return false
    }

    return true
  } catch (error) {
    console.error('Không thể gửi tin nhắn Telegram:', error)
    return false
  }
}

export { sendTelegramMessage }
