export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const createPaymentRequestSchema = z.object({
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  paymentMethod: z.string().min(1, 'Phương thức thanh toán là bắt buộc'),
  paymentDetails: z.record(z.any()).optional()
})

const getPaymentRequestsSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional()
})

// POST: tạo yêu cầu nạp tiền mới
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse và validate body
    const body = await request.json()
    const validatedData = createPaymentRequestSchema.parse(body)

    // Gọi function để tạo payment request
    const { data: requestId, error } = await supabase.rpc('create_payment_request', {
      p_profile_id: userId,
      p_amount: validatedData.amount,
      p_type: 'deposit', // Mặc định là nạp tiền
      p_payment_method: validatedData.paymentMethod,
      p_payment_details: validatedData.paymentDetails || null
    })

    if (error) {
      console.error('Error creating payment request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, requestId }, { status: 201 })
  } catch (error) {
    console.error('Payment request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Không thể tạo yêu cầu nạp tiền' }, { status: 500 })
  }
}

// GET: lấy danh sách yêu cầu nạp/rút tiền của người dùng
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
    const validatedParams = getPaymentRequestsSchema.parse(queryParams)

    // Thiết lập các thông số cho query
    const page = Number(validatedParams.page) || 1
    const pageSize = Number(validatedParams.pageSize) || 10
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('payment_requests')
      .select('*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)', {
        count: 'exact'
      })
      .eq('profile_id', userId)
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
