// src/app/api/auth/reset-password/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Mật khẩu là bắt buộc' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session hiện tại
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Không tìm thấy phiên xác thực' }, { status: 401 })
    }

    // Cập nhật mật khẩu cho người dùng hiện tại
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Không thể cập nhật mật khẩu' }, { status: 400 })
    }

    // Đăng xuất sau khi đổi mật khẩu
    await supabase.auth.signOut()

    return NextResponse.json({ success: true, message: 'Mật khẩu đã được cập nhật thành công' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in reset-password route:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ không mong muốn' }, { status: 500 })
  }
}
