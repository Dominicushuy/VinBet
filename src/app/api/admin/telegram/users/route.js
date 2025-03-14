// src/app/api/admin/telegram/users/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

export const GET = createAdminApiHandler(async (request, _, { supabase }) => {
  try {
    const url = new URL(request.url)
    const connectedOnly = url.searchParams.get('connected') === 'true'

    // Xây dựng query
    let query = supabase
      .from('profiles')
      .select(
        `
        id,
        username, 
        display_name,
        email,
        avatar_url,
        telegram_id,
        telegram_username,
        telegram_connected_at,
        telegram_settings
      `
      )
      .order('display_name', { ascending: true })

    // Lọc người dùng đã kết nối Telegram nếu có yêu cầu
    if (connectedOnly) {
      query = query.not('telegram_id', 'is', null)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      users: data || [],
      totalConnected: data ? data.filter(user => user.telegram_id).length : 0,
      total: data ? data.length : 0
    })
  } catch (error) {
    console.error('Error fetching telegram users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
})
