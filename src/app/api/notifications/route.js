export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const getNotificationsSchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  type: z.string().optional(),
  isRead: z.string().optional()
})

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = getNotificationsSchema.parse(queryParams)

    // Set up parameters for the function call
    const page = Number(validatedParams.page) || 1
    const pageSize = Number(validatedParams.pageSize) || 10
    const type = validatedParams.type || null
    const isRead = validatedParams.isRead ? validatedParams.isRead === 'true' : null

    // Call the function to get user notifications
    const { data: notifications, error } = await supabase.rpc('get_user_notifications', {
      p_profile_id: userId,
      p_page_number: page,
      p_page_size: pageSize,
      p_type: type,
      p_is_read: isRead
    })

    if (error) {
      return handleApiError(error, 'Error fetching notifications')
    }

    // Extract total count from results for pagination
    const totalCount = notifications.length > 0 ? notifications[0].total_count : 0

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(Number(totalCount) / pageSize)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
