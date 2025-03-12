export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const createPaymentRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentDetails: z.record(z.any()).optional()
})

const getPaymentRequestsSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional()
})

// POST: Create a new payment request
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse and validate body
    const body = await request.json()
    const validatedData = createPaymentRequestSchema.parse(body)

    // Call function to create payment request
    const { data: requestId, error } = await supabase.rpc('create_payment_request', {
      p_profile_id: userId,
      p_amount: validatedData.amount,
      p_type: 'deposit', // Default to deposit
      p_payment_method: validatedData.paymentMethod,
      p_payment_details: validatedData.paymentDetails || null
    })

    if (error) {
      return handleApiError(error, 'Error creating payment request')
    }

    return NextResponse.json({ success: true, requestId }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET: Fetch payment requests for the user
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
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = getPaymentRequestsSchema.parse(queryParams)

    // Setup pagination
    const page = Number(validatedParams.page) || 1
    const pageSize = Number(validatedParams.pageSize) || 10
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('payment_requests')
      .select('*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)', { count: 'exact' })
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
      return handleApiError(error, 'Error fetching payment requests')
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
    return handleApiError(error)
  }
}
