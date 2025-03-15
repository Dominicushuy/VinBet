export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Xử lý formData
    const formData = await request.formData()
    const file = formData.get('proof')
    const requestId = formData.get('requestId')

    // Thêm logging
    console.log('Processing upload request:', {
      requestId,
      fileExists: !!file,
      fileType: file?.type,
      fileSize: file?.size
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    // Tạo tên file an toàn hơn
    const fileExt = file.name.split('.').pop().toLowerCase()
    // Chỉ chấp nhận các định dạng an toàn
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']

    if (!allowedExts.includes(fileExt)) {
      return NextResponse.json({ error: 'File format not supported' }, { status: 400 })
    }

    // Tạo đường dẫn theo userId để tăng an toàn
    const fileName = `${userId}/${requestId}-${Date.now()}.${fileExt}`

    // Giờ upload file lên Supabase
    try {
      const { data, error } = await supabase.storage.from('payment_proofs').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Thêm contentType rõ ràng
      })

      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json({ error: 'File upload failed: ' + error.message }, { status: 500 })
      }

      // Lấy public URL
      const { data: publicUrlData } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)

      const proofUrl = publicUrlData.publicUrl

      // Cập nhật payment_request
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          proof_url: proofUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('profile_id', userId) // Thêm điều kiện này để tăng an toàn

      if (updateError) {
        console.error('Update payment request error:', updateError)
        return NextResponse.json({ error: 'Error updating payment request: ' + updateError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, proofUrl }, { status: 200 })
    } catch (uploadError) {
      console.error('Caught upload error:', uploadError)
      return NextResponse.json({ error: 'Error during file upload process: ' + uploadError.message }, { status: 500 })
    }
  } catch (error) {
    console.error('General error in upload route:', error)
    return NextResponse.json({ error: 'Proof upload failed: ' + error.message }, { status: 500 })
  }
}
