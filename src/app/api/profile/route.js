export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Schema cho việc cập nhật profile
const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  display_name: z.string().min(2).max(50).optional(),
  phone_number: z
    .string()
    .regex(/^[0-9+]+$/)
    .optional()
    .nullable(),
  avatar_url: z.string().url().optional().nullable()
})

// GET: Lấy thông tin profile
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Kiểm tra session
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = sessionData.session.user.id

  // Lấy profile từ database
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Kiểm tra nếu không có profile và tạo profile mới
  if (!profile || profile.length === 0) {
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
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json({ profile: newProfile }, { status: 200 })
  }

  // Trả về profile đầu tiên
  return NextResponse.json({ profile: profile[0] }, { status: 200 })
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

    // Cập nhật profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// Helper function để tạo username từ email
function generateUsername(email) {
  const prefix = email.split('@')[0]
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${randomSuffix}`
}
