// src/app/api/admin/metrics/route.js
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

// Cache response for metrics API - 5 phút (300 giây)
export const revalidate = 300
export const dynamic = 'force-dynamic'

const metricsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  interval: z.enum(['day', 'week', 'month']).optional()
})

export const GET = createAdminApiHandler(async (request, _, { supabase }) => {
  try {
    // Kiểm tra nếu cache header đã được gửi, tránh tính toán lại
    const cacheControl = request.headers.get('cache-control')
    if (cacheControl && cacheControl.includes('max-age=')) {
      return new Response(null, {
        status: 304 // Not Modified
      })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams)

    try {
      const validatedParams = metricsQuerySchema.parse(params)

      // Default to last 30 days if no dates provided
      const startDate =
        validatedParams.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
      const endDate = validatedParams.endDate || new Date().toISOString()
      const interval = validatedParams.interval || 'day'

      console.log(`Fetching metrics: interval=${interval}, startDate=${startDate}, endDate=${endDate}`)

      // Get metrics over time
      const { data: metrics, error } = await supabase.rpc('get_admin_metrics', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_interval: interval
      })

      if (error) {
        console.error('Metrics API error:', error)
        return handleApiError(error, 'Lỗi khi lấy dữ liệu metrics')
      }

      const response = NextResponse.json({
        metrics: metrics || [],
        timestamp: new Date().toISOString()
      })

      // Thêm header cache cho browser và CDN (5 phút)
      response.headers.set('Cache-Control', 'public, max-age=300')

      return response
    } catch (validationError) {
      console.error('Metrics validation error:', validationError)
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validationError.errors
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Unhandled metrics API error:', error)
    return handleApiError(error, 'Lỗi khi lấy dữ liệu metrics')
  }
})
