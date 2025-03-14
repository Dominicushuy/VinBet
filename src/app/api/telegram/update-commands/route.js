// src/app/api/telegram/update-commands/route.js

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function POST() {
  try {
    const bot = botService.getBot()
    if (!bot) {
      throw new Error('Bot chưa được khởi tạo')
    }

    // Định nghĩa commands mới
    const commands = [
      { command: 'start', description: 'Bắt đầu với bot' },
      { command: 'help', description: 'Xem hướng dẫn sử dụng' },
      { command: 'status', description: 'Kiểm tra trạng thái kết nối' },
      // Thêm commands mới ở đây
      { command: 'ping', description: 'Kiểm tra bot còn hoạt động không' }
    ]

    // Cập nhật commands lên Telegram server
    await bot.telegram.setMyCommands(commands)

    return NextResponse.json({
      success: true,
      message: 'Commands đã được cập nhật',
      commands
    })
  } catch (error) {
    console.error('Error updating commands:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
