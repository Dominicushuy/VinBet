export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const actionSchema = z.object({
  notes: z.string().optional()
})

export async function POST(request, { params }) {
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

    const requestId = params.id
    const action = params.action

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const validatedData = actionSchema.parse(body)

    // Kiểm tra payment request có tồn tại không
    const { data: paymentRequest, error: checkError } = await supabase
      .from('payment_requests')
      .select('id, status')
      .eq('id', requestId)
      .single()

    if (checkError || !paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Can only process pending requests' }, { status: 400 })
    }

    let result
    if (action === 'approve') {
      // Gọi function để phê duyệt payment request
      result = await supabase.rpc('approve_payment_request', {
        p_request_id: requestId,
        p_admin_id: sessionData.session.user.id,
        p_notes: validatedData.notes || null
      })
    } else {
      // Gọi function để từ chối payment request
      result = await supabase.rpc('reject_payment_request', {
        p_request_id: requestId,
        p_admin_id: sessionData.session.user.id,
        p_notes: validatedData.notes || null
      })
    }

    if (result.error) {
      console.error(`Error ${action}ing payment request:`, result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Payment request action error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Không thể xử lý yêu cầu thanh toán' }, { status: 500 })
  }
}
