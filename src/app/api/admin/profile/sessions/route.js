// src/app/api/admin/profile/sessions/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { handleApiError } from '@/utils/errorHandler'

// GET: Lấy danh sách phiên đăng nhập
export const GET = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ bảng admin_sessions
    // Hiện tại mẫu dữ liệu để demo UI
    const mockSessions = [
      {
        id: '1',
        device: 'Windows PC',
        browser: 'Chrome 120',
        ip: '118.70.xxx.xxx',
        location: 'Hà Nội, Việt Nam',
        time: new Date(Date.now() - 1000 * 60 * 5),
        current: true
      },
      {
        id: '2',
        device: 'Macbook Pro',
        browser: 'Safari 17',
        ip: '118.70.xxx.xxx',
        location: 'Hà Nội, Việt Nam',
        time: new Date(Date.now() - 1000 * 60 * 60 * 3),
        current: false
      },
      {
        id: '3',
        device: 'iPhone 15',
        browser: 'Mobile Safari',
        ip: '113.23.xxx.xxx',
        location: 'Hồ Chí Minh, Việt Nam',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        current: false
      }
    ]

    return NextResponse.json(mockSessions)
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy danh sách phiên đăng nhập')
  }
})

// DELETE: Đăng xuất khỏi một phiên cụ thể
export const DELETE = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID bị thiếu' }, { status: 400 })
    }

    // Trong ứng dụng thực tế, sẽ cần xóa phiên từ bảng admin_sessions
    // và vô hiệu hóa session token
    // Hiện tại giả lập thành công để demo UI

    // Ghi log hành động
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'LOGOUT_SESSION',
      entity_type: 'admin_sessions',
      entity_id: sessionId,
      details: {
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Đã đăng xuất khỏi phiên thành công'
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi đăng xuất khỏi phiên')
  }
})
