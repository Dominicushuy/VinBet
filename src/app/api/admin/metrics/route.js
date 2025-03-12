import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Cache response for metrics API
export const revalidate = 300 // Cache trong 5 phút (300 giây)
export const dynamic = 'force-dynamic'

const metricsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  interval: z.enum(['day', 'week', 'month']).optional()
})

export async function GET(request) {
  try {
    // Kiểm tra nếu cache header đã được gửi, tránh tính toán lại
    const cacheControl = request.headers.get('cache-control')
    if (cacheControl && cacheControl.includes('max-age=')) {
      return new Response(null, {
        status: 304 // Not Modified
      })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permission
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams)
    const validatedParams = metricsQuerySchema.parse(params)

    // Default to last 30 days if no dates provided
    const startDate = validatedParams.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
    const endDate = validatedParams.endDate || new Date().toISOString()
    const interval = validatedParams.interval || 'day'

    // Get metrics over time
    const { data: metrics, error } = await supabase.rpc('get_admin_metrics', {
      p_start_date: startDate,
      p_end_date: endDate,
      p_interval: interval
    })

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy dữ liệu metrics')
    }

    const response = NextResponse.json({ metrics: metrics || [] })

    // Thêm header cache cho browser và CDN
    response.headers.set('Cache-Control', 'public, max-age=300') // 5 phút

    return response
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy dữ liệu metrics')
  }
}
