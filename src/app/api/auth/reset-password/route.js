// src/app/api/auth/reset-password/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/lib/auth/api/error-handler'

// Schema validation for password reset
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate input using Zod
    const validatedData = resetPasswordSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session hiện tại
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      return handleApiError(sessionError, 'Lỗi khi kiểm tra phiên đăng nhập')
    }

    if (!session) {
      // Create a custom error object for consistency
      const authError = new Error('Không tìm thấy phiên xác thực')
      authError.code = 'unauthorized'
      return handleApiError(authError)
    }

    // Cập nhật mật khẩu cho người dùng hiện tại
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password
    })

    if (error) {
      return handleApiError(error, 'Không thể cập nhật mật khẩu')
    }

    // Đăng xuất sau khi đổi mật khẩu
    await supabase.auth.signOut()

    return NextResponse.json(
      {
        success: true,
        message: 'Mật khẩu đã được cập nhật thành công'
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
