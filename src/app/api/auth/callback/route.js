// src/app/api/auth/callback/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { handleApiError } from '@/lib/auth/api/error-handler'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/'

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        // Thêm query param để frontend biết có lỗi
        return NextResponse.redirect(
          new URL(
            `/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`,
            process.env.NEXT_PUBLIC_SITE_URL
          )
        )
      }

      // Kiểm tra xem đây có phải là xác minh email không
      const { data } = await supabase.auth.getSession()
      const isEmailVerification = data?.session?.user?.email_confirmed_at !== null

      // Thêm query param để frontend hiển thị thông báo phù hợp
      if (isEmailVerification) {
        return NextResponse.redirect(new URL(`/login?verified=true`, process.env.NEXT_PUBLIC_SITE_URL))
      }
    }

    // Redirect người dùng đến trang được chỉ định hoặc trang chủ
    return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_SITE_URL))
  } catch (error) {
    return handleApiError(error)
  }
}
