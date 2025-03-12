export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z
    .string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .refine(
      password => {
        // Kiểm tra mật khẩu mạnh
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
      },
      {
        message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
      }
    )
})

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate dữ liệu đầu vào
    const validatedData = changePasswordSchema.parse(body)

    // Kiểm tra mật khẩu hiện tại bằng cách thử đăng nhập
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: sessionData.session.user.email,
      password: validatedData.currentPassword
    })

    if (signInError) {
      return NextResponse.json(
        {
          error: 'Mật khẩu hiện tại không đúng',
          details: 'Vui lòng nhập lại mật khẩu hiện tại'
        },
        { status: 400 }
      )
    }

    // Cập nhật mật khẩu mới
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword
    })

    if (updateError) {
      return handleApiError(updateError, 'Không thể cập nhật mật khẩu')
    }

    // Đăng xuất khỏi tất cả các phiên
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Lỗi validation',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    return handleApiError(error)
  }
}
