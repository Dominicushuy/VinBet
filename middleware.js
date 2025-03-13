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

  // Tạo helper functions để tăng khả năng đọc hiểu code
  const isPublicFile = pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/i)
  const isNextInternal = pathname.startsWith('/_next/')
  const isApiRoute = pathname.startsWith('/api/')

  if (isPublicFile || isNextInternal || isApiRoute) {
    return NextResponse.next()
  }

  // Sử dụng tối ưu cho route matching
  const routePatterns = {
    auth: authRoutes.map(route => new RegExp(`^${route}(/.*)?$`)),
    protected: protectedRoutes.map(route => new RegExp(`^${route}(/.*)?$`)),
    admin: adminRoutes.map(route => new RegExp(`^${route}(/.*)?$`))
  }

  const isAuthRoute = routePatterns.auth.some(pattern => pathname.match(pattern))
  const isProtectedRoute = routePatterns.protected.some(pattern => pathname.match(pattern))
  const isAdminRoute = routePatterns.admin.some(pattern => pathname.match(pattern))
  const isHomePage = pathname === '/' || pathname === '/home'

  // Tạo response
  const res = NextResponse.next()

  // Khởi tạo Supabase client
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Kiểm tra có phải vừa mới đăng nhập không (thông qua cookie hoặc query param)
  const justLoggedIn =
    req.cookies.get('just_logged_in')?.value === 'true' || req.nextUrl.searchParams.get('just_logged_in') === 'true'

  // Sử dụng try-catch để xử lý lỗi khi truy vấn admin status
  let isAdmin = false
  if (session) {
    try {
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single()

      isAdmin = data?.is_admin === true
    } catch (error) {
      console.error('Error fetching admin status:', error)
    }
  }

  // Admin đã đăng nhập đang ở trang chủ hoặc trang auth hoặc vừa đăng nhập -> chuyển đến admin dashboard
  if (session && isAdmin && (isHomePage || isAuthRoute || justLoggedIn)) {
    // Nếu có cookie just_logged_in, xóa nó
    if (justLoggedIn) {
      const redirectResponse = NextResponse.redirect(new URL('/admin/dashboard', req.url))
      redirectResponse.cookies.delete('just_logged_in')
      return redirectResponse
    }

    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  // Route bảo vệ mà không có session -> chuyển đến đăng nhập
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Route admin mà không phải admin hoặc không có session -> chuyển đến trang chủ
  if (isAdminRoute && (!session || !isAdmin)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Route auth nhưng đã đăng nhập (và không phải admin) -> chuyển đến trang chủ
  if (isAuthRoute && session && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
