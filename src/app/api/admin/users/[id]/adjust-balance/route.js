// Tạo file mới: src/app/api/admin/users/[id]/adjust-balance/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { handleApiError } from '@/utils/errorHandler'
import { z } from 'zod'

// Schema validation
const adjustBalanceSchema = z.object({
  amount: z.number().min(1, 'Số tiền phải lớn hơn 0'),
  action: z.enum(['add', 'subtract', 'set'], {
    errorMap: () => ({ message: 'Hành động không hợp lệ' })
  }),
  adminNote: z.string().optional(),
  userNote: z.string().optional()
})

export const POST = createAdminApiHandler(async (request, { params }, { user, supabase }) => {
  try {
    const userId = params.id

    // Kiểm tra định dạng UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return NextResponse.json({ error: 'ID người dùng không hợp lệ' }, { status: 400 })
    }

    // Parse và validate body
    const body = await request.json()
    const validatedData = adjustBalanceSchema.parse(body)

    // Lấy thông tin user hiện tại
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    if (userError) {
      return handleApiError(userError, 'Không tìm thấy người dùng')
    }

    // Tính toán số dư mới
    let newBalance = userData.balance || 0
    if (validatedData.action === 'add') {
      newBalance += validatedData.amount
    } else if (validatedData.action === 'subtract') {
      newBalance -= validatedData.amount
      // Đảm bảo số dư không âm
      if (newBalance < 0) {
        return NextResponse.json(
          {
            error: 'Số dư không thể âm'
          },
          { status: 400 }
        )
      }
    } else if (validatedData.action === 'set') {
      newBalance = validatedData.amount
    }

    // Cập nhật số dư
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      return handleApiError(updateError, 'Không thể cập nhật số dư')
    }

    // Tạo transaction record
    const transactionType =
      validatedData.action === 'add'
        ? 'admin_add'
        : validatedData.action === 'subtract'
        ? 'admin_subtract'
        : 'admin_set'

    const transactionAmount =
      validatedData.action === 'add'
        ? validatedData.amount
        : validatedData.action === 'subtract'
        ? -validatedData.amount
        : validatedData.amount - userData.balance

    await supabase.from('transactions').insert({
      profile_id: userId,
      amount: transactionAmount,
      type: transactionType,
      status: 'completed',
      description: validatedData.userNote || 'Điều chỉnh số dư bởi admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // Ghi log admin
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'ADJUST_BALANCE',
      entity_type: 'profiles',
      entity_id: userId,
      details: {
        previous_balance: userData.balance,
        new_balance: newBalance,
        amount: validatedData.amount,
        action: validatedData.action,
        admin_note: validatedData.adminNote,
        timestamp: new Date().toISOString()
      }
    })

    // Tạo thông báo cho người dùng
    if (validatedData.userNote) {
      await supabase.from('notifications').insert({
        profile_id: userId,
        title: 'Số dư đã được cập nhật',
        content: validatedData.userNote,
        type: 'transaction',
        created_at: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Số dư đã được cập nhật thành công'
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi điều chỉnh số dư')
  }
})
