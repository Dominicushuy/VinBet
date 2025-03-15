// src/app/api/admin/payment-requests/[id]/[action]/route.js

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const actionSchema = z.object({
  notes: z.string().optional()
})

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Validate requestId format
    const requestId = params.id
    if (!requestId || !uuidRegex.test(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID format' }, { status: 400 })
    }

    // Validate action
    const action = params.action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

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

    // Parse request body
    let body
    let validatedData

    try {
      body = await request.json()
      validatedData = actionSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid input data',
            details: error.errors
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Kiểm tra payment request có tồn tại không
    const { data: paymentRequest, error: checkError } = await supabase
      .from('payment_requests')
      .select('id, status, type, amount, profile_id')
      .eq('id', requestId)
      .single()

    if (checkError || !paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Can only process pending requests' }, { status: 400 })
    }

    // Gọi function với transaction để phê duyệt hoặc từ chối payment request
    let result
    if (action === 'approve') {
      result = await supabase.rpc('approve_payment_request', {
        p_request_id: requestId,
        p_admin_id: sessionData.session.user.id,
        p_notes: validatedData.notes || null
      })

      // Gửi thông báo Telegram nếu là deposit
      const urlSendTelegram = `${process.env.NEXT_PUBLIC_SITE_URL}/api/telegram/send`

      if (paymentRequest.type === 'deposit') {
        await fetch(urlSendTelegram, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationType: 'deposit',
            userId: paymentRequest.profile_id,
            amount: paymentRequest.amount,
            transactionId: paymentRequest.id
          })
        })
      } // Gửi thông báo nếu là withdrawal
      else if (paymentRequest.type === 'withdrawal') {
        await fetch(urlSendTelegram, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationType: 'withdrawal',
            userId: paymentRequest.profile_id,
            amount: paymentRequest.amount,
            paymentMethod: paymentRequest.payment_method
          })
        })
      }
    } else {
      result = await supabase.rpc('reject_payment_request', {
        p_request_id: requestId,
        p_admin_id: sessionData.session.user.id,
        p_notes: validatedData.notes || null
      })
    }

    if (result.error) {
      return handleApiError(
        result.error,
        `Lỗi khi ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu thanh toán`
      )
    }

    // Create admin log
    await supabase.from('admin_logs').insert({
      admin_id: sessionData.session.user.id,
      action: action === 'approve' ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT',
      entity_type: 'payment_requests',
      entity_id: requestId,
      details: {
        payment_type: paymentRequest.type,
        amount: paymentRequest.amount,
        profile_id: paymentRequest.profile_id,
        notes: validatedData.notes,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: action === 'approve' ? 'Yêu cầu đã được phê duyệt' : 'Yêu cầu đã bị từ chối'
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'Không thể xử lý yêu cầu thanh toán')
  }
}
