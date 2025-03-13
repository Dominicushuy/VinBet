// src/app/api/profile/activity/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Trong môi trường thực tế, hãy thực hiện truy vấn đến dữ liệu login history
    // Ví dụ: const { data, error } = await supabase.from('user_sessions').select('*').eq('user_id', userId)

    // Hiện tại trả về dữ liệu mẫu
    return NextResponse.json({
      sessions: [
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
        },
        {
          id: '4',
          device: 'Android Phone',
          browser: 'Chrome Mobile',
          ip: '103.7.xxx.xxx',
          location: 'Đà Nẵng, Việt Nam',
          time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          current: false
        }
      ]
    })
  } catch (error) {
    return handleApiError(error, 'Error fetching login history')
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const deviceId = params.deviceId || request.url.split('/').pop()

    // Xác thực rằng session thuộc về người dùng hiện tại
    // Trong môi trường thực tế, hãy thực hiện truy vấn để xác thực
    // Ví dụ: const { data, error } = await supabase.from('user_sessions').delete().eq('id', deviceId).eq('user_id', userId)

    // Hiện tại chỉ trả về thành công
    return NextResponse.json({
      success: true,
      message: 'Đã đăng xuất thiết bị'
    })
  } catch (error) {
    return handleApiError(error, 'Error signing out device')
  }
}
