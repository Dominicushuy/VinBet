import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const getPaymentRequestsSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional()
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
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('payment_requests')
      .select(
        `*, 
        profiles!payment_requests_profile_id_fkey(id, username, display_name, email, avatar_url),
        approved_by_profile:profiles!payment_requests_approved_by_fkey(id, username, display_name)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Apply filters if provided
    if (validatedParams.type) {
      query = query.eq('type', validatedParams.type)
    }

    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status)
    }

    // Execute query
    const { data: requests, error, count } = await query

    if (error) {
      console.error('Error fetching payment requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      paymentRequests: requests || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Payment requests fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Không thể lấy danh sách yêu cầu' }, { status: 500 })
  }
}
