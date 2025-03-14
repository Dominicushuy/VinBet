// src/utils/telegramBot.js
import { Telegraf } from 'telegraf'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Tạo bot instance từ token
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// Middleware xử lý lỗi
bot.catch((err, ctx) => {
  console.error(`Lỗi bot: ${err.message}`, err)
  ctx.reply('❌ Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.').catch(e => {
    console.error('Lỗi khi gửi tin nhắn lỗi:', e)
  })
})

// Xử lý lệnh /start
bot.start(async ctx => {
  try {
    const chatId = ctx.chat.id
    const username = ctx.from.username || 'người dùng'

    const welcomeMessage = `
👋 *Xin chào ${username}!*

Chào mừng đến với *VinBet Notifications Bot*

🔔 Bot sẽ gửi thông báo tự động về:
- Trạng thái nạp/rút tiền
- Kết quả trò chơi và phần thưởng
- Cảnh báo đăng nhập và bảo mật
- Thông báo hệ thống quan trọng

🔗 *Cách liên kết tài khoản:*
1️⃣ Đăng nhập vào trang web VinBet
2️⃣ Vào Cài đặt > Thông báo > Telegram
3️⃣ Nhập Chat ID: \`${chatId}\`

🆔 *Chat ID của bạn là:* \`${chatId}\`

Hoặc sử dụng mã xác thực từ trang cài đặt với lệnh:
/verify_XXXXXX (thay XXXXXX bằng mã xác thực)

Gõ /help để xem thêm thông tin.
`

    await ctx.replyWithMarkdown(welcomeMessage)

    console.log(`User started bot: ${username}, ChatID: ${chatId}`)
  } catch (error) {
    console.error('Lỗi trong lệnh start:', error)
    ctx.reply('❌ Đã xảy ra lỗi khi bắt đầu. Vui lòng thử lại sau.')
  }
})

// Xử lý lệnh /help
bot.help(ctx => {
  const helpMessage = `
📋 *Hướng dẫn sử dụng VinBet Bot*

*Các lệnh:*
/start - Khởi động bot và nhận thông tin
/help - Hiển thị hướng dẫn này
/status - Kiểm tra trạng thái kết nối
/verify_XXXXXX - Xác thực tài khoản với mã từ web
/disconnect - Hủy kết nối với tài khoản

*Trạng thái:*
- Chat ID của bạn: \`${ctx.chat.id}\`
- Sử dụng Chat ID này để liên kết tài khoản trên web

*Lưu ý:*
- Bot không lưu nội dung trò chuyện
- Thắc mắc trợ giúp: support@vinbet.com
`

  ctx.replyWithMarkdown(helpMessage)
})

// Xử lý xác thực tài khoản theo mã
bot.hears(/\/verify_([a-zA-Z0-9]{6,})/, async ctx => {
  try {
    const verificationCode = ctx.match[1] // Lấy mã xác thực từ lệnh
    const chatId = ctx.chat.id

    // Kiểm tra mã xác thực trong database
    const { data, error } = await supabaseAdmin
      .from('telegram_verification')
      .select('profile_id, expires_at, is_used')
      .eq('code', verificationCode)
      .single()

    if (error || !data) {
      return ctx.reply('❌ Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới từ trang web.')
    }

    // Kiểm tra mã đã được sử dụng chưa
    if (data.is_used) {
      return ctx.reply('❌ Mã xác thực này đã được sử dụng trước đó.')
    }

    // Kiểm tra mã còn hiệu lực không
    const now = new Date()
    if (new Date(data.expires_at) < now) {
      return ctx.reply('❌ Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới từ trang web.')
    }

    // Cập nhật Telegram ID cho người dùng
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        telegram_id: chatId.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', data.profile_id)

    if (updateError) {
      console.error('Lỗi cập nhật profile:', updateError)
      return ctx.reply('❌ Có lỗi xảy ra khi liên kết tài khoản. Vui lòng thử lại sau.')
    }

    // Đánh dấu mã đã sử dụng
    await supabaseAdmin
      .from('telegram_verification')
      .update({
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('code', verificationCode)

    // Gửi thông báo thành công
    await ctx.replyWithMarkdown(`
✅ *Xác thực thành công!*

Tài khoản VinBet của bạn đã được liên kết với Telegram Bot.
Từ giờ bạn sẽ nhận được các thông báo quan trọng về:

- Trạng thái nạp/rút tiền
- Kết quả các lượt cược
- Thông báo đăng nhập
- Các thông báo hệ thống quan trọng

Cám ơn bạn đã sử dụng dịch vụ của VinBet! 🎮
`)

    // Tạo thông báo trong Supabase
    await supabaseAdmin.rpc('create_notification', {
      p_profile_id: data.profile_id,
      p_title: 'Kết nối Telegram thành công',
      p_content:
        'Tài khoản của bạn đã được kết nối thành công với Telegram. Bạn sẽ nhận được các thông báo quan trọng qua Telegram.',
      p_type: 'system'
    })
  } catch (error) {
    console.error('Lỗi trong quá trình xác thực:', error)
    ctx.reply('❌ Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.')
  }
})

// Xử lý lệnh /status - kiểm tra trạng thái kết nối
bot.command('status', async ctx => {
  try {
    const chatId = ctx.chat.id

    // Kiểm tra xem chat ID này đã liên kết với tài khoản nào chưa
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name, created_at')
      .eq('telegram_id', chatId.toString())
      .single()

    if (error || !data) {
      return ctx.replyWithMarkdown(`
❌ *Chưa kết nối*

Telegram của bạn chưa được liên kết với tài khoản VinBet nào.

🆔 Chat ID của bạn: \`${chatId}\`

Để kết nối, vui lòng:
1. Đăng nhập vào website VinBet
2. Vào Cài đặt > Thông báo > Telegram
3. Nhập Chat ID này và làm theo hướng dẫn
`)
    }

    // Định dạng thời gian
    const joinDate = new Date(data.created_at)
    const formattedDate = joinDate.toLocaleDateString('vi-VN')

    // Hiển thị thông tin
    await ctx.replyWithMarkdown(`
✅ *Đã kết nối*

👤 Tài khoản: ${data.display_name || data.username}
📅 Ngày tham gia: ${formattedDate}
🆔 Chat ID: \`${chatId}\`

Bot đang gửi thông báo cho tài khoản này.
Để ngắt kết nối, sử dụng lệnh /disconnect
`)
  } catch (error) {
    console.error('Lỗi kiểm tra trạng thái:', error)
    ctx.reply('❌ Đã xảy ra lỗi khi kiểm tra trạng thái. Vui lòng thử lại sau.')
  }
})

// Xử lý lệnh /disconnect - ngắt kết nối tài khoản
bot.command('disconnect', async ctx => {
  try {
    const chatId = ctx.chat.id

    // Kiểm tra xem chat ID này đã liên kết với tài khoản nào chưa
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, display_name')
      .eq('telegram_id', chatId.toString())
      .single()

    if (error || !data) {
      return ctx.reply('❌ Telegram của bạn chưa được liên kết với tài khoản VinBet nào.')
    }

    // Xóa telegram_id trong profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        telegram_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)

    if (updateError) {
      console.error('Lỗi ngắt kết nối tài khoản:', updateError)
      return ctx.reply('❌ Có lỗi xảy ra khi ngắt kết nối tài khoản. Vui lòng thử lại sau.')
    }

    // Tạo thông báo trong Supabase
    await supabaseAdmin.rpc('create_notification', {
      p_profile_id: data.id,
      p_title: 'Ngắt kết nối Telegram',
      p_content:
        'Tài khoản của bạn đã được ngắt kết nối khỏi Telegram. Bạn sẽ không nhận được thông báo qua Telegram nữa.',
      p_type: 'system'
    })

    // Gửi thông báo thành công
    await ctx.replyWithMarkdown(`
✅ *Ngắt kết nối thành công!*

Tài khoản VinBet ${data.display_name || data.username} đã được ngắt kết nối khỏi Telegram Bot.
Bạn sẽ không nhận được thông báo qua Telegram nữa.

Để kết nối lại, hãy truy cập trang web VinBet và làm theo hướng dẫn.
`)
  } catch (error) {
    console.error('Lỗi khi ngắt kết nối:', error)
    ctx.reply('❌ Đã xảy ra lỗi khi ngắt kết nối. Vui lòng thử lại sau.')
  }
})

// Khởi động bot
const initBot = async () => {
  try {
    // Thiết lập webhook hoặc polling tùy môi trường
    if (process.env.NODE_ENV === 'production' && process.env.TELEGRAM_WEBHOOK_URL) {
      // Sử dụng webhook trong môi trường production
      await bot.telegram.setWebhook(`${process.env.TELEGRAM_WEBHOOK_URL}/api/telegram/webhook`)
      console.log('Telegram webhook đã được thiết lập')
    } else {
      // Sử dụng polling trong môi trường development
      await bot.launch()
      console.log('Telegram bot đã khởi động với long polling')
    }

    // Xử lý tắt bot đúng cách
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))

    return true
  } catch (error) {
    console.error('Lỗi khởi động Telegram bot:', error)
    throw error
  }
}

// Export các hàm gửi thông báo

// Gửi thông báo nạp tiền thành công
const sendDepositNotification = async (telegramId, amount, transactionId) => {
  try {
    if (!telegramId) return false

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

    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo nạp tiền:`, error)
    return false
  }
}

// Gửi thông báo thắng cược
const sendWinNotification = async (telegramId, amount, gameId, betInfo) => {
  try {
    if (!telegramId) return false

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

    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo thắng cược:`, error)
    return false
  }
}

// Gửi thông báo đăng nhập
const sendLoginNotification = async (telegramId, device, location, time) => {
  try {
    if (!telegramId) return false

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

    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo đăng nhập:`, error)
    return false
  }
}

// Gửi thông báo rút tiền được duyệt
const sendWithdrawalApprovedNotification = async (telegramId, amount, paymentMethod) => {
  try {
    if (!telegramId) return false

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

    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo rút tiền:`, error)
    return false
  }
}

// Gửi thông báo tùy chỉnh
const sendCustomNotification = async (telegramId, title, message) => {
  try {
    if (!telegramId) return false

    await bot.telegram.sendMessage(
      telegramId,
      `
*${title}*

${message}

🕒 ${new Date().toLocaleString('vi-VN')}
`,
      { parse_mode: 'Markdown' }
    )

    return true
  } catch (error) {
    console.error(`Lỗi gửi thông báo tùy chỉnh:`, error)
    return false
  }
}

export {
  bot,
  initBot,
  sendDepositNotification,
  sendWinNotification,
  sendLoginNotification,
  sendWithdrawalApprovedNotification,
  sendCustomNotification
}
