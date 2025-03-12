// src/utils/adminAuthHandler.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/utils/errorHandler'

/**
 * Hàm xử lý API cho Admin, kết hợp kiểm tra quyền và xử lý lỗi
 * @param {Function} handler - Hàm xử lý API chính, nhận tham số supabase và user
 * @returns {Function} - Next.js route handler
 */
export function createAdminApiHandler(handler) {
  return async function (request, context) {
    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Kiểm tra session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        console.error('Authentication error:', sessionError)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Kiểm tra quyền admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', sessionData.session.user.id)
        .single()

      if (profileError || !profileData?.is_admin) {
        console.error('Permission error:', profileError)
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
      }

      // Gọi handler chính
      return await handler(request, context, {
        supabase,
        user: sessionData.session.user
      })
    } catch (error) {
      console.error('Unhandled admin API error:', error)
      return handleApiError(error, 'Lỗi server không xác định')
    }
  }
}

/**
 * Ví dụ sử dụng:
 *
 * import { createAdminApiHandler } from '@/utils/adminAuthHandler'
 *
 * export const GET = createAdminApiHandler(async (request, context, { supabase, user }) => {
 *   // Logic xử lý API ở đây, đã có sẵn supabase client và user
 *   // không cần kiểm tra quyền admin nữa
 *
 *   return NextResponse.json({ success: true, data: {...} })
 * })
 */
