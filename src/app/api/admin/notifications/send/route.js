// src/app/api/admin/notifications/send/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { z } from 'zod'

const sendNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()),
  type: z.enum(['email', 'system', 'both']),
  title: z.string().min(3),
  content: z.string().min(5)
})

export const POST = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    const body = await request.json()
    const { userIds, type, title, content } = sendNotificationSchema.parse(body)

    if (userIds.length === 0) {
      return NextResponse.json({ error: 'Danh sách người dùng trống' }, { status: 400 })
    }

    // Check if users exist
    const { data: users, error: userError } = await supabase.from('profiles').select('id, email').in('id', userIds)

    if (userError) {
      return NextResponse.json({ error: 'Lỗi khi kiểm tra người dùng' }, { status: 500 })
    }

    if (users.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    const adminId = user.id
    const now = new Date().toISOString()

    // Create system notifications
    if (type === 'system' || type === 'both') {
      const notifications = userIds.map(profileId => ({
        profile_id: profileId,
        title,
        content,
        type: 'admin',
        is_read: false,
        created_at: now
      }))

      const { error: notificationError } = await supabase.from('notifications').insert(notifications)

      if (notificationError) {
        return NextResponse.json({ error: 'Lỗi khi tạo thông báo hệ thống' }, { status: 500 })
      }
    }

    // Create admin log
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'SEND_NOTIFICATION',
      entity_type: 'notifications',
      entity_id: userIds[0], // Log first user ID
      details: {
        userIds,
        type,
        title,
        time: now
      }
    })

    return NextResponse.json({
      success: true,
      message: `Đã gửi thông báo cho ${userIds.length} người dùng`
    })
  } catch (error) {
    console.error('Error sending notifications:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Lỗi khi gửi thông báo' }, { status: 500 })
  }
})
