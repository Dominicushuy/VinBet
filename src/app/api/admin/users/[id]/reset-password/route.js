// Tạo file mới: src/app/api/admin/users/[id]/reset-password/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleApiError } from '@/utils/errorHandler'

export const POST = createAdminApiHandler(async (request, { params }, { user }) => {
  try {
    const userId = params.id

    // Kiểm tra định dạng UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return NextResponse.json({ error: 'ID người dùng không hợp lệ' }, { status: 400 })
    }

    // Lấy thông tin user để kiểm tra
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) {
      return handleApiError(userError, 'Không tìm thấy người dùng')
    }

    // Gửi email reset password
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: userData.email
    })

    if (error) {
      return handleApiError(error, 'Không thể gửi email reset mật khẩu')
    }

    // Ghi log hành động
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: user.id,
      action: 'RESET_PASSWORD',
      entity_type: 'profiles',
      entity_id: userId,
      details: {
        initiated_by: user.email,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email reset mật khẩu đã được gửi thành công'
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi gửi yêu cầu reset mật khẩu')
  }
})
