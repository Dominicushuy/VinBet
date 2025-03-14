// src/app/api/telegram/send/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  sendCustomNotification,
  sendDepositNotification,
  sendWinNotification,
  sendLoginNotification
} from '@/utils/telegramBot'
import { handleApiError } from '@/utils/errorHandler'
import { z } from 'zod'

// Schema cho thông báo tùy chỉnh
const customNotificationSchema = z.object({
  userId: z.string().uuid('User ID phải là UUID hợp lệ'),
  title: z.string().min(1, 'Tiêu đề không được trống'),
  message: z.string().min(1, 'Nội dung không được trống'),
  type: z.enum(['system', 'transaction', 'game', 'admin'])
})

// Schema cho thông báo nạp tiền
const depositNotificationSchema = z.object({
  userId: z.string().uuid('User ID phải là UUID hợp lệ'),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  transactionId: z.string()
})

// Schema cho thông báo thắng cược
const winNotificationSchema = z.object({
  userId: z.string().uuid('User ID phải là UUID hợp lệ'),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  gameId: z.string(),
  betInfo: z.object({
    chosenNumber: z.string(),
    result: z.string()
  })
})

// Schema cho thông báo đăng nhập
const loginNotificationSchema = z.object({
  userId: z.string().uuid('User ID phải là UUID hợp lệ'),
  device: z.string(),
  location: z.string(),
  time: z.string()
})

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra quyền admin hoặc system
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kiểm tra quyền admin (có thể bỏ qua nếu là API internal)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse và validate body request
    const body = await request.json()

    // Xác định loại thông báo từ notificationType
    const notificationType = body.notificationType

    // Tạo biến để lưu kết quả gửi
    let sendResult = false
    let validatedData

    // Lấy Telegram ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('id', body.userId)
      .single()

    if (userError || !userData?.telegram_id) {
      return NextResponse.json(
        {
          error: 'User không tồn tại hoặc chưa kết nối Telegram'
        },
        { status: 404 }
      )
    }

    const telegramId = userData.telegram_id

    // Xử lý theo loại thông báo
    switch (notificationType) {
      case 'custom':
        validatedData = customNotificationSchema.parse(body)
        sendResult = await sendCustomNotification(telegramId, validatedData.title, validatedData.message)

        // Tạo thông báo trong database
        if (sendResult) {
          await supabase.rpc('create_notification', {
            p_profile_id: validatedData.userId,
            p_title: validatedData.title,
            p_content: validatedData.message,
            p_type: validatedData.type
          })
        }
        break

      case 'deposit':
        validatedData = depositNotificationSchema.parse(body)
        sendResult = await sendDepositNotification(telegramId, validatedData.amount, validatedData.transactionId)
        break

      case 'win':
        validatedData = winNotificationSchema.parse(body)
        sendResult = await sendWinNotification(
          telegramId,
          validatedData.amount,
          validatedData.gameId,
          validatedData.betInfo
        )
        break

      case 'login':
        validatedData = loginNotificationSchema.parse(body)
        sendResult = await sendLoginNotification(
          telegramId,
          validatedData.device,
          validatedData.location,
          validatedData.time
        )
        break

      default:
        return NextResponse.json(
          {
            error: 'Không hỗ trợ loại thông báo này'
          },
          { status: 400 }
        )
    }

    if (!sendResult) {
      return NextResponse.json(
        {
          error: 'Không thể gửi thông báo'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi thông báo thành công'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Lỗi dữ liệu đầu vào',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return handleApiError(error, 'Không thể gửi thông báo Telegram')
  }
}
