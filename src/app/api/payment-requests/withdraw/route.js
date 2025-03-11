import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const createWithdrawalSchema = z.object({
  amount: z
    .number()
    .positive('Số tiền phải lớn hơn 0')
    .min(50000, 'Số tiền tối thiểu là 50,000 VND')
    .max(50000000, 'Số tiền tối đa là 50,000,000 VND'),
  paymentMethod: z.string(),
  paymentDetails: z.record(z.any()).optional()
})

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy thông tin user
    const { data: user } = await supabase.from('profiles').select('balance').eq('id', userId).single()

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin người dùng' }, { status: 404 })
    }

    // Parse và validate body request
    const body = await request.json()
    const validatedData = createWithdrawalSchema.parse(body)

    // Kiểm tra số dư
    if (user.balance < validatedData.amount) {
      return NextResponse.json({ error: 'Số dư không đủ để thực hiện giao dịch này' }, { status: 400 })
    }

    // Tạo yêu cầu rút tiền
    const { data: withdrawalRequest, error } = await supabase.rpc('create_payment_request', {
      p_profile_id: userId,
      p_amount: validatedData.amount,
      p_type: 'withdrawal',
      p_payment_method: validatedData.paymentMethod,
      p_payment_details: validatedData.paymentDetails
    })

    if (error) {
      console.error('Error creating withdrawal request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      requestId: withdrawalRequest,
      message: 'Yêu cầu rút tiền đã được tạo thành công'
    })
  } catch (error) {
    console.error('Withdrawal request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

    // Build query
    let query = supabase
      .from('payment_requests')
      .select('*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)', { count: 'exact' })
      .eq('profile_id', userId)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Add pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data: paymentRequests, error, count } = await query

    if (error) {
      console.error('Error fetching withdrawal requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    console.error('Withdrawal requests fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
