// src/app/api/telegram/commands/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function GET() {
  try {
    const bot = botService.getBot()
    if (!bot) {
      throw new Error('Bot chưa được khởi tạo')
    }

    // Lấy danh sách commands đã đăng ký với Telegram
    const commands = await bot.telegram.getMyCommands()

    return NextResponse.json({
      success: true,
      commands
    })
  } catch (error) {
    console.error('Error fetching commands:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
