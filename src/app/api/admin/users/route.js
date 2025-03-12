export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

// Helper function to sanitize search queries and prevent SQL injection
function sanitizeSearchQuery(query) {
  if (!query) return ''
  // Remove special characters and brackets that could be used for SQL injection
  return query.replace(/[;'"\\{}()]/g, '').trim()
}

const getUsersSchema = z.object({
  query: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
  status: z.enum(['all', 'active', 'blocked', 'admin']).optional()
})

export const GET = createAdminApiHandler(async (request, _, { supabase }) => {
  try {
    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = getUsersSchema.parse(queryParams)

    // Setup pagination
    const page = Number(validatedParams.page) || 1
    const pageSize = Number(validatedParams.pageSize) || 10
    const offset = (page - 1) * pageSize

    // Sanitize search query to prevent SQL injection
    const searchQuery = sanitizeSearchQuery(validatedParams.query?.trim().toLowerCase()) || ''

    const sortBy = validatedParams.sortBy || 'created_at'
    const sortOrder = validatedParams.sortOrder === 'asc' ? 'asc' : 'desc'
    const status = validatedParams.status || 'all'

    // Build query
    let query = supabase.from('profiles').select('*', { count: 'exact' })

    // Apply search filter with sanitized input
    if (searchQuery) {
      query = query.or([
        { username: { ilike: `%${searchQuery}%` } },
        { email: { ilike: `%${searchQuery}%` } },
        { display_name: { ilike: `%${searchQuery}%` } }
      ])
    }

    // Apply status filter
    if (status === 'blocked') {
      query = query.eq('is_blocked', true)
    } else if (status === 'admin') {
      query = query.eq('is_admin', true)
    } else if (status === 'active') {
      query = query.eq('is_blocked', false)
    }

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1)

    // Execute query
    const { data: users, error, count } = await query

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy danh sách người dùng')
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      },
      filters: {
        searchQuery,
        sortBy,
        sortOrder,
        status
      }
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy danh sách người dùng')
  }
})
