export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const getPaymentRequestsSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

// GET: admin lấy danh sách tất cả payment requests
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session và quyền admin
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permission
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = getPaymentRequestsSchema.parse(queryParams)

    // Set up pagination parameters
    const page = Number(validatedParams.page) || 1
    const pageSize = Number(validatedParams.pageSize) || 10
    const sortBy = validatedParams.sortBy || 'created_at'
    const sortOrder = validatedParams.sortOrder || 'desc'

    // Build query
    let query = supabase
      .from('payment_requests')
      .select(
        `*, 
        profiles!payment_requests_profile_id_fkey(id, username, display_name, email, avatar_url),
        approved_by_profile:profiles!payment_requests_approved_by_fkey(id, username, display_name)`,
        { count: 'exact' }
      )
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply filters if provided
    if (validatedParams.type) {
      query = query.eq('type', validatedParams.type)
    }

    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status)
    }

    // Add date range filtering
    if (validatedParams.startDate) {
      query = query.gte('created_at', new Date(validatedParams.startDate).toISOString())
    }

    if (validatedParams.endDate) {
      const endDate = new Date(validatedParams.endDate)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte('created_at', endDate.toISOString())
    }

    // Add search functionality
    if (validatedParams.search) {
      query = query.or(
        `profiles.username.ilike.%${validatedParams.search}%,profiles.display_name.ilike.%${validatedParams.search}%,profiles.email.ilike.%${validatedParams.search}%`
      )
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data: paymentRequests, error, count } = await query

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy danh sách yêu cầu thanh toán')
    }

    return NextResponse.json({
      paymentRequests: paymentRequests || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    return handleApiError(error, 'Không thể lấy danh sách yêu cầu thanh toán')
  }
}
