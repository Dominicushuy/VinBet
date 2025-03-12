export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleApiError } from '@/utils/errorHandler'

const updateUserSchema = z.object({
  display_name: z.string().optional(),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  is_admin: z.boolean().optional(),
  is_blocked: z.boolean().optional(),
  phone_number: z.string().optional().nullable()
})

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kiểm tra quyền admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const userId = params.id

    // Fetch user profile
    const { data: user, error: userError } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (userError) {
      return handleApiError(userError, 'Lỗi khi lấy thông tin người dùng')
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user stats
    const { data: stats, error: statsError } = await supabase.rpc('get_user_admin_stats', { p_user_id: userId })

    if (statsError) {
      return handleApiError(statsError, 'Lỗi khi lấy thống kê người dùng')
    }

    // Fetch recent bets
    const { data: recentBets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (betsError) {
      return handleApiError(betsError, 'Lỗi khi lấy lịch sử đặt cược')
    }

    // Fetch recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (transactionsError) {
      return handleApiError(transactionsError, 'Lỗi khi lấy lịch sử giao dịch')
    }

    return NextResponse.json({
      user,
      stats: stats || {},
      recentBets: recentBets || [],
      recentTransactions: recentTransactions || []
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thông tin người dùng')
  }
}

export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kiểm tra quyền admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Prevent self-demotion
    if (userId === sessionData.session.user.id && validatedData.is_admin === false) {
      return NextResponse.json({ error: 'Admins cannot remove their own admin rights' }, { status: 400 })
    }

    // Update user profile
    const { data: user, error } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi cập nhật thông tin người dùng')
    }

    // If blocking user, we should log them out by invalidating their sessions
    if (validatedData.is_blocked === true) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi cập nhật thông tin người dùng')
  }
}
