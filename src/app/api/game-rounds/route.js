export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const getGameRoundsSchema = z.object({
  status: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
  jackpotOnly: z.string().optional()
})

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lấy query parameters
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams)

    // Validate
    const validatedParams = getGameRoundsSchema.parse(params)

    // Parse các query params
    const status = validatedParams.status
    const fromDate = validatedParams.fromDate ? new Date(validatedParams.fromDate).toISOString() : null
    const toDate = validatedParams.toDate ? new Date(validatedParams.toDate).toISOString() : null
    const page = validatedParams.page ? parseInt(validatedParams.page) : 1
    const pageSize = validatedParams.pageSize ? parseInt(validatedParams.pageSize) : 10

    // Gọi function để lấy game rounds
    const { data, error } = await supabase.rpc('get_game_rounds', {
      status_filter: status,
      from_date: fromDate,
      to_date: toDate,
      page_number: page,
      page_size: pageSize
    })

    if (error) {
      console.error('Error fetching game rounds:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract total count từ kết quả
    const totalCount = data.length > 0 ? data[0].total_count : 0

    // Remove total_count từ từng item
    const gameRounds = data.map(({ total_count, ...rest }) => rest)

    return NextResponse.json(
      {
        gameRounds,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(Number(totalCount) / pageSize)
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Game rounds request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Tạo một game round mới
export async function POST(request) {
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

    // Parse request body
    const body = await request.json()

    // Validate body
    const createGameRoundSchema = z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime()
    })

    const validatedData = createGameRoundSchema.parse(body)

    // Gọi function để tạo game round
    const { data, error } = await supabase.rpc('create_game_round', {
      start_time: validatedData.startTime,
      end_time: validatedData.endTime,
      created_by: sessionData.session.user.id
    })

    if (error) {
      console.error('Error creating game round:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        gameRoundId: data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create game round error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
