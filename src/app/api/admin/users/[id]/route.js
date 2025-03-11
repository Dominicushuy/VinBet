export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user stats
    const { data: stats, error: statsError } = await supabase.rpc('get_user_admin_stats', { p_user_id: userId })

    if (statsError) {
      console.error('Error fetching user stats:', statsError)
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    // Fetch recent bets
    const { data: recentBets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (betsError) {
      console.error('Error fetching user bets:', betsError)
      return NextResponse.json({ error: betsError.message }, { status: 500 })
    }

    // Fetch recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (transactionsError) {
      console.error('Error fetching user transactions:', transactionsError)
      return NextResponse.json({ error: transactionsError.message }, { status: 500 })
    }

    return NextResponse.json({
      user,
      stats: stats || {},
      recentBets: recentBets || [],
      recentTransactions: recentTransactions || []
    })
  } catch (error) {
    console.error('Admin user detail fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      console.error('Error updating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If blocking user, we should log them out by invalidating their sessions
    if (validatedData.is_blocked === true) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin user update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
