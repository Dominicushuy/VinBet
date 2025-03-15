// src/app/api/admin/notifications/send/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { z } from 'zod'
import { sendCustomTelegramNotification } from '@/utils/sendTelegramServer'

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

    // Nếu userIds trống, lấy tất cả người dùng có kết nối Telegram
    let targetUserIds = [...userIds]

    if (targetUserIds.length === 0) {
      // Lấy danh sách tất cả người dùng đã kết nối Telegram
      const { data: connectedUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .not('telegram_id', 'is', null)
        .eq('is_blocked', false) // Chỉ lấy tài khoản chưa bị khóa

      if (usersError) {
        return NextResponse.json({ error: 'Lỗi khi lấy danh sách người dùng' }, { status: 500 })
      }

      targetUserIds = connectedUsers.map(user => user.id)
    } else {
      // Validate users tồn tại và đã kết nối Telegram
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, telegram_id')
        .in('id', targetUserIds)
        .not('telegram_id', 'is', null)

      if (userError) {
        return NextResponse.json({ error: 'Lỗi khi kiểm tra người dùng' }, { status: 500 })
      }

      // Chỉ lấy ID của những người dùng thực sự tồn tại và đã kết nối Telegram
      targetUserIds = users.map(user => user.id)
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: 'Không có người dùng nào đã kết nối Telegram để gửi thông báo' },
        { status: 400 }
      )
    }

    const adminId = user.id
    const now = new Date().toISOString()

    // Tạo thông báo trong hệ thống
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

    // Gửi thông báo qua Telegram cho những user
    let telegramSentCount = 0

    const telegramResults = await Promise.allSettled(
      targetUserIds.map(async userId => {
        return sendCustomTelegramNotification(userId, title, content)
      })
    )

    // Đếm số lượng thông báo Telegram gửi thành công
    telegramSentCount = telegramResults.filter(result => result.status === 'fulfilled').length

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
        content,
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
