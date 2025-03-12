export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const createWithdrawalSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(50000, 'Minimum withdrawal is 50,000 VND')
    .max(50000000, 'Maximum withdrawal is 50,000,000 VND'),
  paymentMethod: z.string(),
  paymentDetails: z.record(z.any()).optional()
})

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Get user's balance
    const { data: user } = await supabase.from('profiles').select('balance').eq('id', userId).single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validatedData = createWithdrawalSchema.parse(body)

    // Check balance
    if (user.balance < validatedData.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Create withdrawal request
    const { data: withdrawalRequest, error } = await supabase.rpc('create_payment_request', {
      p_profile_id: userId,
      p_amount: validatedData.amount,
      p_type: 'withdrawal',
      p_payment_method: validatedData.paymentMethod,
      p_payment_details: validatedData.paymentDetails
    })

    if (error) {
      return handleApiError(error, 'Error creating withdrawal request')
    }

    return NextResponse.json({
      requestId: withdrawalRequest,
      message: 'Withdrawal request created successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
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
      return handleApiError(error, 'Error fetching withdrawal requests')
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
    return handleApiError(error)
  }
}
