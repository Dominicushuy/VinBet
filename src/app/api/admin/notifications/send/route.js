// src/app/api/admin/notifications/send/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { z } from 'zod'

const sendNotificationSchema = z.object({
  title: z.string().min(3, 'Tiêu đề cần ít nhất 3 ký tự'),
  content: z.string().min(5, 'Nội dung cần ít nhất 5 ký tự'),
  type: z.enum(['system', 'transaction', 'game', 'admin']),
  userIds: z.array(z.string().uuid()).default([])
})

export const POST = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    const body = await request.json()
    const validatedData = sendNotificationSchema.parse(body)
    const { title, content, type, userIds } = validatedData

    // Nếu userIds trống, lấy tất cả người dùng (trừ admin nếu cần)
    let targetUserIds = [...userIds]

    if (targetUserIds.length === 0) {
      // Lấy danh sách tất cả ID người dùng
      const { data: allUsers, error: usersError } = await supabase.from('profiles').select('id').eq('is_blocked', false) // Chỉ lấy tài khoản chưa bị khóa

      if (usersError) {
        return NextResponse.json({ error: 'Lỗi khi lấy danh sách người dùng' }, { status: 500 })
      }

      targetUserIds = allUsers.map(user => user.id)
    } else {
      // Validate users exist
      const { data: users, error: userError } = await supabase.from('profiles').select('id').in('id', targetUserIds)

      if (userError) {
        return NextResponse.json({ error: 'Lỗi khi kiểm tra người dùng' }, { status: 500 })
      }

      if (users.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
      }

      // Chỉ lấy ID của những người dùng thực sự tồn tại
      targetUserIds = users.map(user => user.id)
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ error: 'Không có người dùng nào để gửi thông báo' }, { status: 400 })
    }

    const adminId = user.id
    const now = new Date().toISOString()

    // Tạo thông báo
    const notifications = targetUserIds.map(profileId => ({
      profile_id: profileId,
      title,
      content,
      type,
      is_read: false,
      created_at: now
    }))

    const { error: notificationError } = await supabase.from('notifications').insert(notifications)

    if (notificationError) {
      return NextResponse.json({ error: 'Lỗi khi tạo thông báo' }, { status: 500 })
    }

    // Gửi thông báo qua Telegram cho những user đã liên kết
    const { data: connectedUsers, error: telegramError } = await supabase
      .from('profiles')
      .select('id, telegram_id')
      .in('id', targetUserIds)
      .not('telegram_id', 'is', null)

    if (telegramError) {
      console.error('Error fetching telegram connected users:', telegramError)
    }

    let telegramSentCount = 0
    if (connectedUsers && connectedUsers.length > 0) {
      // Gửi thông báo Telegram
      const telegramResults = await Promise.allSettled(
        connectedUsers.map(async user => {
          if (user.telegram_id) {
            return fetch('/api/telegram/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                notificationType: 'custom',
                userId: user.id,
                title,
                message: content
              })
            })
          }
        })
      )

      // Đếm số lượng thông báo Telegram gửi thành công
      telegramSentCount = telegramResults.filter(result => result.status === 'fulfilled').length
    }

    // Create admin log
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'SEND_NOTIFICATION',
      entity_type: 'notifications',
      entity_id: targetUserIds[0], // Log first user ID
      details: {
        recipient_count: targetUserIds.length,
        telegram_sent: telegramSentCount,
        type,
        title,
        time: now
      }
    })

    return NextResponse.json({
      success: true,
      message: `Đã gửi thông báo cho ${targetUserIds.length} người dùng (${telegramSentCount} qua Telegram)`
    })
  } catch (error) {
    console.error('Error sending notifications:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Lỗi khi gửi thông báo' }, { status: 500 })
  }
})
