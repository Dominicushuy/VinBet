// src/app/api/referrals/list/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Skema validasi query parameter
const referralListSchema = z.object({
  status: z.enum(['pending', 'completed']).optional(),
  page: z
    .string()
    .optional()
    .transform(val => {
      const page = val ? parseInt(val, 10) : 1
      return isNaN(page) || page < 1 ? 1 : page
    }),
  pageSize: z
    .string()
    .optional()
    .transform(val => {
      const size = val ? parseInt(val, 10) : 10
      // Limit pageSize between 5 and 50
      return isNaN(size) || size < 5 ? 5 : size > 50 ? 50 : size
    })
})

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = referralListSchema.parse(queryParams)

    // Thiết lập phân trang (đã qua transform trong schema)
    const page = validatedParams.page
    const pageSize = validatedParams.pageSize
    const offset = (page - 1) * pageSize

    // Xây dựng truy vấn
    let query = supabase
      .from('referrals')
      .select(
        `
        id,
        status,
        reward_amount,
        created_at,
        updated_at,
        referred:referred_id (
          id,
          username,
          display_name,
          avatar_url,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Áp dụng bộ lọc trạng thái nếu được cung cấp
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status)
    }

    // Thực thi truy vấn
    const { data: referrals, error, count } = await query

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy danh sách giới thiệu')
    }

    // Check for null values in the response data
    const sanitizedReferrals = (referrals || []).map(ref => ({
      ...ref,
      reward_amount: ref.reward_amount || 0,
      referred: ref.referred || null
    }))

    return NextResponse.json({
      referrals: sanitizedReferrals,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil((count || 0) / pageSize))
      }
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
    return handleApiError(error, 'Lỗi khi xử lý danh sách giới thiệu')
  }
}
