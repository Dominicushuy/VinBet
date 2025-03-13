// src/app/api/admin/profile/preferences/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Schema cho validation
const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  timezone: z.string(),
  date_format: z.string(),
  notification_settings: z.object({
    email_notifications: z.boolean(),
    push_notifications: z.boolean(),
    game_notifications: z.boolean(),
    transaction_notifications: z.boolean(),
    system_notifications: z.boolean()
  })
})

// GET: Lấy tùy chỉnh của admin
export const GET = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Lấy preferences từ database
    const { data: preferences, error } = await supabase
      .from('admin_preferences')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116: not found
      return handleApiError(error, 'Lỗi khi lấy tùy chỉnh')
    }

    // Nếu chưa có preferences, tạo mặc định
    if (!preferences) {
      const defaultPreferences = {
        admin_id: user.id,
        theme: 'system',
        timezone: 'Asia/Ho_Chi_Minh',
        date_format: 'dd/MM/yyyy',
        notification_settings: {
          email_notifications: true,
          push_notifications: true,
          game_notifications: true,
          transaction_notifications: true,
          system_notifications: true
        },
        updated_at: new Date().toISOString()
      }

      const { data: newPreferences, error: insertError } = await supabase
        .from('admin_preferences')
        .insert(defaultPreferences)
        .select()
        .single()

      if (insertError) {
        return handleApiError(insertError, 'Lỗi khi tạo tùy chỉnh mặc định')
      }

      return NextResponse.json(newPreferences)
    }

    return NextResponse.json(preferences)
  } catch (error) {
    return handleApiError(error, 'Lỗi server khi lấy tùy chỉnh')
  }
})

// PUT: Cập nhật tùy chỉnh của admin
export const PUT = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Parse request body
    const body = await request.json()

    // Validate dữ liệu đầu vào
    const validatedData = preferencesSchema.parse(body)

    // Cập nhật preferences
    const { data: updatedPreferences, error } = await supabase
      .from('admin_preferences')
      .upsert({
        admin_id: user.id,
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi cập nhật tùy chỉnh')
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
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
    return handleApiError(error, 'Lỗi server khi cập nhật tùy chỉnh')
  }
})
