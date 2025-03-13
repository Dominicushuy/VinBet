// src/app/api/admin/profile/activity/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { handleApiError } from '@/utils/errorHandler'

export const GET = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const action = url.searchParams.get('action')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Calculate pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Build query
    let query = supabase
      .from('admin_logs')
      .select('*', { count: 'exact' })
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false })

    // Add filters
    if (action) {
      query = query.eq('action', action)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Add pagination
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy lịch sử hoạt động')
    }

    return NextResponse.json({
      logs: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi server khi lấy lịch sử hoạt động')
  }
})
