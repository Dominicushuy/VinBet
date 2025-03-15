// src/app/api/telegram/send/route.js
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'
import {
  sendCustomNotification,
  sendDepositNotification,
  sendWithdrawalApprovedNotification,
  sendWinNotification,
  sendLoginNotification,
  sendSecurityAlert
} from '@/utils/telegramBotHelper'

// Schema validation tùy theo loại thông báo
const notificationSchemas = {
  custom: z.object({
    userId: z.string().uuid('User ID phải là UUID'),
    title: z.string().min(1, 'Tiêu đề không được trống'),
    message: z.string().min(1, 'Nội dung không được trống')
  }),
  deposit: z.object({
    userId: z.string().uuid('User ID phải là UUID'),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    transactionId: z.string()
  }),
  withdrawal: z.object({
    userId: z.string().uuid('User ID phải là UUID'),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    paymentMethod: z.string()
  }),
  win: z.object({
    userId: z.string().uuid('User ID phải là UUID'),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    gameId: z.string(),
    betInfo: z.object({
      chosenNumber: z.string(),
      result: z.string()
    })
  }),
  login: z.object({
    userId: z.string().uuid('User ID phải là UUID'),
    device: z.string(),
    location: z.string(),
    time: z.string()
  }),
  security: z.object({
    userId: z.string().uuid('User ID phải là UUID'),
    alertType: z.enum(['login_new_device', 'password_changed', 'large_withdrawal']),
    details: z.record(z.any()).optional()
  })
}

export async function POST(request) {
  // Parse body và xác định loại thông báo
  const body = await request.json()
  const { notificationType, isSkipError, ...data } = body

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Helper function to handle errors based on isSkipError flag
    const handleError = (errorMessage, status = 400) => {
      if (isSkipError) {
        // If isSkipError is true, return a success response instead of an error
        return NextResponse.json({
          success: true,
          message: 'Request processed without returning errors',
          _suppressed: errorMessage // Optional: include suppressed error for debugging
        })
      }
      // Otherwise return the normal error response
      return NextResponse.json({ error: errorMessage, success: false }, { status })
    }

    // Kiểm tra quyền gửi thông báo
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return handleError('Unauthorized', 401)
    }

    // Validate body theo schema tương ứng
    if (!notificationType || !notificationSchemas[notificationType]) {
      return handleError('Không hỗ trợ loại thông báo này', 400)
    }

    let validatedData
    try {
      validatedData = notificationSchemas[notificationType].parse(body)
    } catch (error) {
      return handleError('Dữ liệu không hợp lệ', 400)
    }

    // Lấy Telegram ID từ database
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('telegram_id, telegram_settings')
      .eq('id', validatedData.userId)
      .single()

    if (userError || !userData?.telegram_id) {
      return handleError('User không tồn tại hoặc chưa kết nối Telegram', 404)
    }

    const telegramId = userData.telegram_id
    const telegramSettings = userData.telegram_settings || {}

    // Kiểm tra user có chọn nhận loại thông báo này không
    const notificationMap = {
      deposit: 'receive_deposit_notifications',
      withdrawal: 'receive_withdrawal_notifications',
      win: 'receive_win_notifications',
      login: 'receive_login_alerts',
      security: 'receive_login_alerts',
      custom: 'receive_system_notifications'
    }

    const settingKey = notificationMap[notificationType]
    if (settingKey && telegramSettings[settingKey] === false) {
      return handleError('Người dùng đã tắt nhận thông báo loại này')
    }

    // Gửi thông báo theo loại sử dụng helper mới
    let sendResult = false

    switch (notificationType) {
      case 'custom':
        sendResult = await sendCustomNotification(telegramId, validatedData.title, validatedData.message)
        break
      case 'deposit':
        sendResult = await sendDepositNotification(telegramId, validatedData.amount, validatedData.transactionId)
        break
      case 'withdrawal':
        sendResult = await sendWithdrawalApprovedNotification(
          telegramId,
          validatedData.amount,
          validatedData.paymentMethod
        )
        break
      case 'win':
        sendResult = await sendWinNotification(
          telegramId,
          validatedData.amount,
          validatedData.gameId,
          validatedData.betInfo
        )
        break
      case 'login':
        sendResult = await sendLoginNotification(
          telegramId,
          validatedData.device,
          validatedData.location,
          validatedData.time
        )
        break
      case 'security':
        sendResult = await sendSecurityAlert(telegramId, validatedData.alertType, validatedData.details)
        break
    }

    // If failed to send but isSkipError is true, return success anyway
    if (!sendResult && isSkipError) {
      return NextResponse.json({
        success: true,
        message: 'Request processed without returning errors',
        _suppressed: 'Không thể gửi thông báo'
      })
    }

    return NextResponse.json({
      success: sendResult,
      message: sendResult ? 'Đã gửi thông báo thành công' : 'Không thể gửi thông báo'
    })
  } catch (error) {
    // Handle unexpected errors while still respecting isSkipError
    if (isSkipError || (typeof body === 'object' && isSkipError)) {
      return NextResponse.json({
        success: true,
        message: 'Request processed without returning errors',
        _suppressed: 'Unexpected error occurred'
      })
    }
    return handleApiError(error, 'Không thể gửi thông báo Telegram')
  }
}
