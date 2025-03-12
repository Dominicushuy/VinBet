export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const settingsSchema = z.object({
  email_notifications: z.boolean().default(true),
  push_notifications: z.boolean().default(true),
  game_notifications: z.boolean().default(true),
  transaction_notifications: z.boolean().default(true),
  system_notifications: z.boolean().default(true),
  telegram_notifications: z.boolean().default(true),
  security_alerts: z.boolean().default(true),
  deposit_notifications: z.boolean().default(true),
  withdrawal_notifications: z.boolean().default(true),
  large_bet_notifications: z.boolean().default(true)
})

// GET: Get notification settings
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Get notification settings from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('id', userId)
      .single()

    if (error) {
      return handleApiError(error, 'Error fetching notification settings')
    }

    // Default settings if none exist
    const defaultSettings = {
      email_notifications: true,
      push_notifications: true,
      game_notifications: true,
      transaction_notifications: true,
      system_notifications: true,
      telegram_notifications: true,
      security_alerts: true,
      deposit_notifications: true,
      withdrawal_notifications: true,
      large_bet_notifications: true
    }

    // Use stored settings or defaults
    const settings = profile?.notification_settings || defaultSettings

    return NextResponse.json({ settings })
  } catch (error) {
    return handleApiError(error, 'Notification settings request error')
  }
}

// PUT: Update notification settings
export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse and validate request body
    const body = await request.json()
    const validatedSettings = settingsSchema.parse(body)

    // Update notification settings in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({
        notification_settings: validatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('notification_settings')
      .single()

    if (error) {
      return handleApiError(error, 'Error updating notification settings')
    }

    return NextResponse.json({ settings: data.notification_settings })
  } catch (error) {
    return handleApiError(error)
  }
}
