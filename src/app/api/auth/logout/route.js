import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { handleApiError } from '@/utils/errorHandler.js'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.signOut()

    if (error) {
      return handleApiError(error, 'Đăng xuất thất bại')
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
