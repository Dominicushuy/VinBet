// src/middleware.js
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Danh sách các routes xác thực
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

// Danh sách các routes yêu cầu đăng nhập, không bao gồm admin routes
const protectedRoutes = ['/profile', '/referrals', '/finance', '/games', '/notifications']

// Danh sách các routes chỉ dành cho admin
const adminRoutes = ['/admin']

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Bỏ qua các file tĩnh
  const isPublicFile = /\.(js|css|png|jpg|jpeg|svg|ico|json)$/i.test(pathname)
  const isNextInternal = pathname.startsWith('/_next/')
  const isApiRoute = pathname.startsWith('/api/')

  if (isPublicFile || isNextInternal) {
    return NextResponse.next()
  }

  // Xác định loại route
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  const isAdminRoute = adminRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  // Tạo response
  const res = NextResponse.next()

  // Khởi tạo Supabase client
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Lấy profile để kiểm tra admin
  let isAdmin = false
  if (session) {
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()

    isAdmin = data?.is_admin === true
  }

  // Route bảo vệ và không có session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Route admin và không phải admin
  if (isAdminRoute && (!session || !isAdmin)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Route auth nhưng đã đăng nhập
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
