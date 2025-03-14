export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import botService from '@/lib/telegram/botService'

export async function GET() {
  try {
    const isInitialized = botService.isReady()
    const bot = botService.getBot()

    return NextResponse.json({
      initialized: isInitialized,
      running: isInitialized && bot != null,
      environment: process.env.NODE_ENV,
      botEnabled: process.env.TELEGRAM_BOT_ENABLED !== 'false',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        initialized: false,
        error: error.message,
        environment: process.env.NODE_ENV
      },
      { status: 500 }
    )
  }
}
