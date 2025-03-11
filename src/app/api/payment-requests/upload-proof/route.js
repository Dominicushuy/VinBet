export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy form data từ request
    const formData = await request.formData()
    const file = formData.get('proof')
    const requestId = formData.get('requestId')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    // Kiểm tra kiểu file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Giới hạn kích thước file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
    }

    // Kiểm tra payment request có tồn tại và thuộc về user không
    const { data: paymentRequest, error: checkError } = await supabase
      .from('payment_requests')
      .select('id, status')
      .eq('id', requestId)
      .eq('profile_id', userId)
      .single()

    if (checkError || !paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found or not yours' }, { status: 404 })
    }

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Can only upload proof for pending requests' }, { status: 400 })
    }

    // Tạo tên file duy nhất
    const fileExt = file.name.split('.').pop()
    const fileName = `${requestId}-${Date.now()}.${fileExt}`

    // Upload file lên Supabase Storage
    const { data, error } = await supabase.storage.from('payment_proofs').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Lấy public URL của file
    const { data: publicUrlData } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)

    const proofUrl = publicUrlData.publicUrl

    // Cập nhật proof_url trong payment_request
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({ proof_url: proofUrl, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, proofUrl }, { status: 200 })
  } catch (error) {
    console.error('Proof upload error:', error)
    return NextResponse.json({ error: 'Proof upload failed' }, { status: 500 })
  }
}
