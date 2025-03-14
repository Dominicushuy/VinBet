// Tạo một API endpoint để cập nhật handlers
// src/app/api/telegram/update-handlers/route.js

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function POST() {
  try {
    // Dừng bot hiện tại
    await botService.stop('update_handlers')

    // Đợi một chút để đảm bảo bot dừng hoàn toàn
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Khởi động lại bot với handlers mới
    await botService.initialize()

    return NextResponse.json({
      success: botService.isReady(),
      message: 'Bot đã được khởi động lại với handlers mới'
    })
  } catch (error) {
    console.error('Error updating handlers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
