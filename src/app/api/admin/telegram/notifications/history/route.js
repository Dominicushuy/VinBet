// src/app/api/admin/telegram/notifications/history/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'

export const GET = createAdminApiHandler(async (request, _, { supabase }) => {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const type = url.searchParams.get('type')
    const search = url.searchParams.get('search')

    // Lấy lịch sử gửi thông báo từ admin_logs
    let query = supabase
      .from('admin_logs')
      .select(
        `
        id,
        admin_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at,
        admin:profiles!admin_logs_admin_id_fkey(id, username, display_name, avatar_url)
      `
      )
      .eq('action', 'SEND_NOTIFICATION')
      .order('created_at', { ascending: false })

    // Áp dụng bộ lọc
    if (type) {
      query = query.filter('details->type', 'eq', type)
    }

    if (search) {
      query = query.filter('details->title', 'ilike', `%${search}%`)
    }

    // Thêm phân trang
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Thực hiện truy vấn và đếm tổng số
    const [{ data, error }, { count }] = await Promise.all([query.range(from, to), query.count('exact')])

    if (error) {
      throw error
    }

    // Định dạng dữ liệu
    const notifications = data.map(log => {
      const details = log.details || {}
      return {
        id: log.id,
        title: details.title || 'Untitled',
        content: details.content || '',
        type: details.type || 'system',
        sender_id: log.admin_id,
        sender_name: log.admin?.display_name || log.admin?.username,
        recipient_id: log.entity_id,
        recipient_name: details.recipient_name,
        recipient_count: details.recipient_count || 1,
        created_at: log.created_at,
        telegram_sent: details.telegram_sent || 0
      }
    })

    return NextResponse.json({
      notifications,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching notification history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
})
