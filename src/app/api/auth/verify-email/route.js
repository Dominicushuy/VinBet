export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/lib/auth/api/error-handler'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const token = requestUrl.searchParams.get('token')
    const acceptJson = request.headers.get('accept')?.includes('application/json')

    if (!token) {
      const error = new Error('Thiếu mã xác thực email')
      error.code = 'missing_token'

      // Kiểm tra nếu là API request (expect JSON) hoặc browser request (expect HTML)
      if (acceptJson) {
        return handleApiError(error)
      } else {
        // Log lỗi trước khi chuyển hướng
        console.error('Email verification error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_verification_token`)
      }
    }

    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error) {
      // Log lỗi trước khi chuyển hướng
      console.error('OTP verification error:', error)

      if (acceptJson) {
        return handleApiError(error, 'Mã xác thực email không hợp lệ hoặc đã hết hạn')
      } else {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_verification_token`)
      }
    }

    // Xác thực thành công
    if (acceptJson) {
      return NextResponse.json(
        {
          success: true,
          message: 'Xác thực email thành công'
        },
        { status: 200 }
      )
    } else {
      return NextResponse.redirect(`${requestUrl.origin}/login?verified=true`)
    }
  } catch (error) {
    const requestUrl = new URL(request.url)
    const acceptJson = request.headers.get('accept')?.includes('application/json')

    // Log lỗi không mong đợi
    console.error('Unexpected error in email verification:', error)

    if (acceptJson) {
      return handleApiError(error, 'Lỗi xác thực email')
    } else {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`)
    }
  }
}
