// src/lib/auth/api/error-handler.js
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleApiError(error, customMessage = null) {
  console.error('API Error:', error)

  // Xử lý lỗi validation từ Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi dữ liệu đầu vào',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      },
      { status: 400 }
    )
  }

  // Xử lý các lỗi từ Supabase
  if (error?.code && error?.message) {
    // Mã lỗi từ Supabase và PostgreSQL
    const status =
      // Auth errors
      error.code === 'invalid_credentials'
        ? 401
        : error.code === 'user_not_found'
        ? 404
        : error.code === 'email_taken'
        ? 409
        : // Supabase RLS/DB errors
        error.code === 'PGRST116'
        ? 404 // Not found
        : error.code === 'PGRST201'
        ? 403 // Permission denied
        : error.code === '23505'
        ? 409 // Unique violation
        : error.code === '23503'
        ? 400 // Foreign key violation
        : error.code === '22P02'
        ? 400 // Invalid text representation
        : error.code === '42P01'
        ? 500 // Undefined table
        : // Default to 500
          500

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status }
    )
  }

  // Xử lý lỗi thông thường
  return NextResponse.json(
    {
      success: false,
      error: customMessage || 'Lỗi server'
    },
    { status: 500 }
  )
}
