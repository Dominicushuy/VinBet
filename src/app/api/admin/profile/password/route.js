// src/app/api/admin/profile/password/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Schema cho validation
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
    .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt')
})

export const POST = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Parse request body
    const body = await request.json()

    // Validate dữ liệu đầu vào
    const validatedData = passwordSchema.parse(body)

    // Kiểm tra mật khẩu hiện tại
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: validatedData.currentPassword
    })

    if (signInError) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 })
    }

    // Kiểm tra mật khẩu mới không giống mật khẩu cũ
    if (validatedData.currentPassword === validatedData.newPassword) {
      return NextResponse.json({ error: 'Mật khẩu mới không được giống mật khẩu cũ' }, { status: 400 })
    }

    // Cập nhật mật khẩu mới
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword
    })

    if (updateError) {
      return handleApiError(updateError, 'Không thể cập nhật mật khẩu')
    }

    // Ghi log hành động
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'CHANGE_PASSWORD',
      entity_type: 'profiles',
      entity_id: user.id,
      details: {
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: error.errors
        },
        { status: 400 }
      )
    }
    return handleApiError(error, 'Lỗi server khi cập nhật mật khẩu')
  }
})
