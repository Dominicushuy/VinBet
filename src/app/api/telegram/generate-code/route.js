// src/app/api/notifications/telegram/generate-code/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Gọi function để tạo mã xác thực
    const { data, error } = await supabase.rpc('create_telegram_verification_code', {
      p_profile_id: userId
    })

    if (error) {
      return handleApiError(error, 'Không thể tạo mã xác thực')
    }

    return NextResponse.json({
      success: true,
      code: data
    })
  } catch (error) {
    return handleApiError(error, 'Không thể tạo mã xác thực')
  }
}
