// src/app/api/telegram/setup/route.js
import { NextResponse } from 'next/server'
import { initBot } from '@/utils/telegramBot'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

let isInitialized = false

export const GET = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    if (!isInitialized) {
      await initBot()
      isInitialized = true
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram bot đã được khởi tạo thành công'
    })
  } catch (error) {
    console.error('Không thể khởi tạo Telegram bot:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
})
