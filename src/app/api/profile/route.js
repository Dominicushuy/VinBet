// src/app/api/profile/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { handleApiError } from '@/utils/errorHandler'

// Schema cho việc cập nhật profile
const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(20, 'Username không được vượt quá 20 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới')
    .optional(),
  display_name: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(50, 'Tên hiển thị không được vượt quá 50 ký tự')
    .optional(),
  phone_number: z
    .string()
    .regex(/^[0-9+]+$/, 'Số điện thoại chỉ chứa số và dấu +')
    .optional()
    .nullable(),
  avatar_url: z.string().url('URL không hợp lệ').optional().nullable(),
  bio: z.string().max(200, 'Giới thiệu không được vượt quá 200 ký tự').optional().nullable()
})

// GET: Lấy thông tin profile
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy profile từ database
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thông tin profile')
    }

    // Kiểm tra nếu không có profile và tạo profile mới
    if (!profile) {
      // Tạo profile mặc định
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: sessionData.session.user.email,
          username: generateUsername(sessionData.session.user.email || ''),
          referral_code: nanoid(8),
          balance: 0,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        return handleApiError(createError, 'Lỗi khi tạo profile')
      }

      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT: Cập nhật thông tin profile
export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const body = await request.json()

    // Validate dữ liệu cập nhật
    const validatedData = profileUpdateSchema.parse(body)

    // Kiểm tra username
    if (validatedData.username) {
      // Lấy profile hiện tại
      const { data: currentProfile } = await supabase.from('profiles').select('username').eq('id', userId).single()

      // Nếu đã có username và đang cố thay đổi
      if (currentProfile?.username && currentProfile.username !== validatedData.username) {
        return NextResponse.json(
          {
            error: 'Username không thể thay đổi sau khi đã đặt',
            details: {
              field: 'username'
            }
          },
          { status: 400 }
        )
      }

      // Kiểm tra trùng username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', validatedData.username)
        .neq('id', userId)
        .single()

      if (existingUser) {
        return NextResponse.json(
          {
            error: 'Username đã được sử dụng',
            details: {
              field: 'username'
            }
          },
          { status: 400 }
        )
      }
    }

    // Cập nhật profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi cập nhật thông tin profile')
    }

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
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

// Helper function để tạo username từ email
function generateUsername(email) {
  const prefix = email.split('@')[0]
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${randomSuffix}`
}
