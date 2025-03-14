// src/app/api/telegram/webhook/route.js
import { NextResponse } from 'next/server'
import { bot } from '@/utils/telegramBot'

export async function POST(request) {
  try {
    // Lấy body từ request
    const body = await request.json()

    // Chuyển update cho bot xử lý
    await bot.handleUpdate(body)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
