// src/app/api/admin/users/export/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { format } from 'date-fns'

export const GET = createAdminApiHandler(async (request, _, { supabase }) => {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('query') || ''
    const status = url.searchParams.get('status') || ''
    const role = url.searchParams.get('role') || ''
    const sortBy = url.searchParams.get('sortBy') || 'created_at'
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // Build query
    let dbQuery = supabase.from('profiles').select('*')

    // Apply search filter
    if (query) {
      dbQuery = dbQuery.or([
        { username: { ilike: `%${query}%` } },
        { email: { ilike: `%${query}%` } },
        { display_name: { ilike: `%${query}%` } }
      ])
    }

    // Apply status filter
    if (status === 'blocked') {
      dbQuery = dbQuery.eq('is_blocked', true)
    } else if (status === 'admin') {
      dbQuery = dbQuery.eq('is_admin', true)
    } else if (status === 'active') {
      dbQuery = dbQuery.eq('is_blocked', false)
    }

    // Apply role filter
    if (role === 'admin') {
      dbQuery = dbQuery.eq('is_admin', true)
    } else if (role === 'user') {
      dbQuery = dbQuery.eq('is_admin', false)
    }

    // Apply sorting
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' })

    // Execute query
    const { data: users, error } = await dbQuery

    if (error) {
      throw error
    }

    // Format data for CSV
    const csvRows = []

    // Add headers
    const headers = [
      'ID',
      'Tên người dùng',
      'Tên hiển thị',
      'Email',
      'Số dư',
      'Admin',
      'Bị khóa',
      'Ngày tạo',
      'Cập nhật lần cuối'
    ]
    csvRows.push(headers.join(','))

    // Add data rows
    users.forEach(user => {
      const row = [
        user.id,
        user.username ? `"${user.username}"` : '',
        user.display_name ? `"${user.display_name}"` : '',
        user.email ? `"${user.email}"` : '',
        user.balance || 0,
        user.is_admin ? 'Có' : 'Không',
        user.is_blocked ? 'Có' : 'Không',
        user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm:ss') : '',
        user.updated_at ? format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm:ss') : ''
      ]
      csvRows.push(row.join(','))
    })

    // Create CSV content
    const csvContent = csvRows.join('\n')

    // Create response with CSV
    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv; charset=utf-8')
    response.headers.set(
      'Content-Disposition',
      `attachment; filename=vinbet-users-${new Date().toISOString().slice(0, 10)}.csv`
    )

    return response
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json({ error: 'Không thể xuất dữ liệu người dùng' }, { status: 500 })
  }
})
