// src/app/api/admin/profile/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Schema cho validation
const profileUpdateSchema = z.object({
  display_name: z.string().min(3, 'Tên hiển thị phải có ít nhất 3 ký tự'),
  phone_number: z.string().optional().nullable(),
  bio: z.string().max(500, 'Giới thiệu không được vượt quá 500 ký tự').optional().nullable(),
  telegram_id: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable()
})

// GET: Lấy thông tin profile admin
export const GET = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Lấy profile từ database
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thông tin profile')
    }

    return NextResponse.json(profile)
  } catch (error) {
    return handleApiError(error, 'Lỗi server khi lấy thông tin profile')
  }
})

// PUT: Cập nhật thông tin profile admin
export const PUT = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Parse request body
    const body = await request.json()

    // Validate dữ liệu đầu vào
    const validatedData = profileUpdateSchema.parse(body)

    // Cập nhật profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi cập nhật profile')
    }

    // Ghi log hành động
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'UPDATE_PROFILE',
      entity_type: 'profiles',
      entity_id: user.id,
      details: {
        updated_fields: Object.keys(validatedData),
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
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
    return handleApiError(error, 'Lỗi server khi cập nhật profile')
  }
})
