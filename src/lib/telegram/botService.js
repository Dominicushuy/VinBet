// src/lib/telegram/botService.js

import { Telegraf } from 'telegraf'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Sử dụng biến global để theo dõi instance của bot
// Biến global này sẽ duy trì trạng thái giữa các lần hot-reload
const globalAny = global
globalAny.botInstance = globalAny.botInstance || {
  bot: null,
  isRunning: false,
  lastInitTime: 0
}

class TelegramBotService {
  constructor() {
    this.isInitialized = false
    this.instanceToken = Date.now().toString() // Để nhận dạng instance này
  }

  initialize() {
    if (process.env.NODE_ENV === 'production') {
      const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

      // Trong production, sử dụng webhook
      this._setupHandlers(bot)
      globalAny.botInstance.bot = bot
      globalAny.botInstance.isRunning = true
      this.isInitialized = true
      console.log('⚡ Telegram bot đã khởi tạo với webhook mode')
      return bot
    } else {
      // Trong dev, sử dụng polling
      return this._initializeBot()
    }
  }

  async _initializeBot() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN không được cấu hình')
      return null
    }

    try {
      // Tạo bot tạm thời để cleanup trước
      const cleanupBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

      try {
        // Xóa webhook nếu có
        await cleanupBot.telegram.deleteWebhook({ drop_pending_updates: true })

        // Gọi getUpdates với timeout=0 và offset=-1 để reset kết nối
        await cleanupBot.telegram.getUpdates(0, 100, -1)

        // Tăng thời gian chờ lên 5 giây để đảm bảo kết nối cũ đã bị hủy
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (cleanupError) {
        console.warn('⚠️ Lỗi khi cleanup bot cũ:', cleanupError.message)
      }

      // Tạo bot mới
      const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

      // Thêm các handlers
      this._setupHandlers(bot)

      // Cập nhật biến global
      globalAny.botInstance.bot = bot

      // Khởi động bot với tùy chọn
      try {
        await bot.launch({
          allowedUpdates: ['message', 'callback_query', 'my_chat_member', 'chat_member'],
          dropPendingUpdates: true
        })
        console.log('⚡ Telegram bot đã khởi động với long polling')
        globalAny.botInstance.isRunning = true
      } catch (launchError) {
        if (launchError.message && launchError.message.includes('409')) {
          console.warn('⚠️ Lỗi 409: Bot đã được khởi động ở nơi khác.')
          console.warn('⚠️ Sử dụng API /api/telegram/force-disconnect và khởi động lại')

          return {
            success: false,
            retryNeeded: false,
            error: 'Lỗi 409: Bot đã được khởi động ở nơi khác',
            reason: 'conflict'
          }
        }
        throw launchError
      }

      this.isInitialized = true
      return bot
    } catch (error) {
      console.error('❌ Lỗi khởi tạo Telegram bot:', error)
      return null
    }
  }

  _setupDebugPolling(bot) {
    const originalGetUpdates = bot.telegram.getUpdates
    bot.telegram.getUpdates = async function (...args) {
      try {
        console.log('📊 Gửi getUpdates đến Telegram API...', args[0])
        const result = await originalGetUpdates.apply(this, args)
        if (result && result.length > 0) {
          console.log(`📥 Nhận được ${result.length} cập nhật từ Telegram`)
        }
        return result
      } catch (error) {
        console.error('📛 Lỗi getUpdates:', error.message)
        throw error
      }
    }
  }

  _setupHandlers(bot) {
    if (!bot) return

    // Debug middleware
    bot.use((ctx, next) => {
      console.log(`👁️ Bot nhận update từ: ${ctx.from?.username || 'Unknown'}`)
      return next()
    })

    // Xử lý lỗi global
    bot.catch((err, ctx) => {
      console.error(`❌ Bot error: ${err.message}`, err)
      ctx.reply('❌ Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.').catch(e => {
        console.error('Lỗi khi gửi tin nhắn lỗi:', e)
      })
    })

    // Xử lý /start
    bot.start(async ctx => {
      try {
        const chatId = ctx.chat.id
        const username = ctx.from?.username || 'người dùng'

        // Sử dụng HTML thay vì Markdown để tránh lỗi
        const welcomeMessage = `  
<b>👋 Xin chào ${username}!</b>  

Chào mừng đến với <b>VinBet Notifications Bot</b>  

🔔 Bot sẽ gửi thông báo tự động về:  
- Trạng thái nạp/rút tiền  
- Kết quả trò chơi và phần thưởng  
- Cảnh báo đăng nhập và bảo mật  
- Thông báo hệ thống quan trọng  

<b>🔗 Cách liên kết tài khoản:</b>  
1️⃣ Đăng nhập vào trang web VinBet  
2️⃣ Vào Cài đặt > Thông báo > Telegram  
3️⃣ Nhập Chat ID: <code>${chatId}</code>  

<b>🆔 Chat ID của bạn là:</b> <code>${chatId}</code>  

Hoặc sử dụng mã xác thực từ trang cài đặt với lệnh:  
/verify_XXXXXX (thay XXXXXX bằng mã xác thực)  

Gõ /help để xem thêm thông tin.  
`

        await ctx.reply(welcomeMessage, { parse_mode: 'HTML' })
        console.log(`👤 User khởi động bot: ${username}, ChatID: ${chatId}`)
      } catch (error) {
        console.error('❌ Lỗi trong lệnh start:', error)
        // Nếu gặp lỗi, thử gửi tin nhắn không có định dạng
        ctx.reply('❌ Đã xảy ra lỗi khi bắt đầu. Vui lòng thử lại sau.')
      }
    })

    // Xử lý /help
    bot.help(ctx => {
      try {
        const helpMessage = `  
<b>📋 Hướng dẫn sử dụng VinBet Bot</b>  

<b>Các lệnh:</b>  
/start - Khởi động bot và nhận thông tin  
/help - Hiển thị hướng dẫn này  
/status - Kiểm tra trạng thái kết nối  
/verify_XXXXXX - Xác thực tài khoản với mã từ web  
/disconnect - Hủy kết nối với tài khoản  
/ping - Kiểm tra bot còn hoạt động không  

<b>Trạng thái:</b>  
- Chat ID của bạn: <code>${ctx.chat.id}</code>  
- Sử dụng Chat ID này để liên kết tài khoản trên web  

<b>Lưu ý:</b>  
- Bot không lưu nội dung trò chuyện  
- Thắc mắc trợ giúp: support@vinbet.com  
`

        ctx.reply(helpMessage, { parse_mode: 'HTML' })
      } catch (error) {
        console.error('❌ Lỗi trong lệnh help:', error)
        ctx.reply('Đã xảy ra lỗi khi hiển thị hướng dẫn. Vui lòng thử lại sau.')
      }
    })

    // Xử lý /ping để kiểm tra bot còn live không
    bot.command('ping', ctx => {
      ctx.reply('Pong! 🏓 Bot đang hoạt động bình thường')
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

        // Gửi thông báo thành công - sử dụng HTML
        await ctx.reply(
          `  
<b>✅ Xác thực thành công!</b>  

Tài khoản VinBet của bạn đã được liên kết với Telegram Bot.  
Từ giờ bạn sẽ nhận được các thông báo quan trọng về:  

- Trạng thái nạp/rút tiền  
- Kết quả các lượt cược  
- Thông báo đăng nhập  
- Các thông báo hệ thống quan trọng  

Cám ơn bạn đã sử dụng dịch vụ của VinBet! 🎮  
`,
          { parse_mode: 'HTML' }
        )

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
          return ctx.reply(
            `  
<b>❌ Chưa kết nối</b>  

Telegram của bạn chưa được liên kết với tài khoản VinBet nào.  

<b>🆔 Chat ID của bạn:</b> <code>${chatId}</code>  

Để kết nối, vui lòng:  
1. Đăng nhập vào website VinBet  
2. Vào Cài đặt > Thông báo > Telegram  
3. Nhập Chat ID này và làm theo hướng dẫn  
`,
            { parse_mode: 'HTML' }
          )
        }

        // Định dạng thời gian
        const joinDate = new Date(data.created_at)
        const formattedDate = joinDate.toLocaleDateString('vi-VN')

        // Hiển thị thông tin
        await ctx.reply(
          `  
<b>✅ Đã kết nối</b>  

<b>👤 Tài khoản:</b> ${data.display_name || data.username}  
<b>📅 Ngày tham gia:</b> ${formattedDate}  
<b>🆔 Chat ID:</b> <code>${chatId}</code>  

Bot đang gửi thông báo cho tài khoản này.  
Để ngắt kết nối, sử dụng lệnh /disconnect  
`,
          { parse_mode: 'HTML' }
        )
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
        await ctx.reply(
          `  
<b>✅ Ngắt kết nối thành công!</b>  

Tài khoản VinBet ${data.display_name || data.username} đã được ngắt kết nối khỏi Telegram Bot.  
Bạn sẽ không nhận được thông báo qua Telegram nữa.  

Để kết nối lại, hãy truy cập trang web VinBet và làm theo hướng dẫn.  
`,
          { parse_mode: 'HTML' }
        )
      } catch (error) {
        console.error('Lỗi khi ngắt kết nối:', error)
        ctx.reply('❌ Đã xảy ra lỗi khi ngắt kết nối. Vui lòng thử lại sau.')
      }
    })

    // Bot command để xem giao dịch gần đây
    bot.command('transactions', async ctx => {
      try {
        const chatId = ctx.chat.id

        // Kiểm tra tài khoản đã liên kết chưa
        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('telegram_id', chatId.toString())
          .single()

        if (error || !profile) {
          return ctx.reply(
            '❌ Không tìm thấy tài khoản liên kết với Telegram này. Vui lòng kết nối tài khoản trên web trước.'
          )
        }

        // Lấy 5 giao dịch gần đây nhất
        const { data: transactions, error: txError } = await supabaseAdmin
          .from('transactions')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (txError) {
          return ctx.reply('❌ Không thể lấy thông tin giao dịch. Vui lòng thử lại sau.')
        }

        if (!transactions || transactions.length === 0) {
          return ctx.reply('👀 Bạn chưa có giao dịch nào gần đây.')
        }

        // Format thông tin giao dịch với HTML
        const messageLines = ['<b>5 Giao dịch gần đây nhất của bạn:</b>\n']

        transactions.forEach((tx, index) => {
          const date = new Date(tx.created_at).toLocaleString('vi-VN')
          const type = this._getTransactionTypeName(tx.type)

          const amount =
            tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_reward'
              ? `+${tx.amount.toLocaleString('vi-VN')} VND`
              : `-${tx.amount.toLocaleString('vi-VN')} VND`

          messageLines.push(`${index + 1}. <b>${type}:</b> ${amount}`)
          messageLines.push(`   ${date}`)
          messageLines.push(`   Trạng thái: ${this._getTransactionStatusName(tx.status)}\n`)
        })

        messageLines.push('💻 Xem chi tiết tại: vinbet.com/finance/transactions')

        await ctx.reply(messageLines.join('\n'), { parse_mode: 'HTML' })
      } catch (error) {
        console.error('Lỗi xử lý lệnh transactions:', error)
        ctx.reply('❌ Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.')
      }
    })
  }

  _getTransactionTypeName(type) {
    const types = {
      deposit: 'Nạp tiền',
      withdrawal: 'Rút tiền',
      bet: 'Đặt cược',
      win: 'Thắng cược',
      referral_reward: 'Thưởng giới thiệu'
    }
    return types[type] || type
  }

  _getTransactionStatusName(status) {
    const statuses = {
      completed: 'Hoàn thành',
      pending: 'Đang xử lý',
      failed: 'Thất bại',
      cancelled: 'Đã hủy'
    }
    return statuses[status] || status
  }

  async stop(reason) {
    console.log(`🛑 Stopping Telegram bot due to ${reason}`)

    if (globalAny.botInstance.bot && globalAny.botInstance.isRunning) {
      try {
        await globalAny.botInstance.bot.stop()
        globalAny.botInstance.isRunning = false
        this.isInitialized = false
        console.log('👍 Bot đã dừng thành công')
      } catch (error) {
        console.error('❌ Lỗi khi dừng bot:', error)
      }
    }
  }

  getBot() {
    return globalAny.botInstance.bot
  }

  isReady() {
    return this.isInitialized && globalAny.botInstance.bot !== null && globalAny.botInstance.isRunning
  }

  reloadHandlers() {
    if (!this.isReady() || !globalAny.botInstance.bot) {
      console.error('❌ Bot chưa được khởi tạo, không thể cập nhật handlers')
      return false
    }

    const bot = globalAny.botInstance.bot

    // Xóa tất cả handlers hiện tại
    bot.telegram.middleware.handlers = []

    // Thiết lập lại handlers
    this._setupHandlers(bot)

    console.log('✅ Đã cập nhật handlers thành công')
    return true
  }
}

// Create singleton instance
const botService = new TelegramBotService()

export default botService
