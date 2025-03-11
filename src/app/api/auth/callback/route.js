export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/lib/auth/api/error-handler'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        return handleApiError(error, 'Lỗi xác thực tài khoản')
      }
    } else {
      // Không có code trong URL là một lỗi
      return handleApiError(new Error('Missing authorization code'), 'Thiếu mã xác thực')
    }

    if (next === '/reset-password') {
      return NextResponse.redirect(`${requestUrl.origin}/reset-password?type=recovery`)
    }

    // Chuyển hướng đến trang được chỉ định hoặc trang chủ
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    return handleApiError(error, 'Lỗi xác thực tài khoản')
  }
}
