// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Kiểm tra nếu request là tới các route cần xác thực
  const protectedPaths = ['/profile', '/games', '/finance', '/referrals']
  const { pathname } = request.nextUrl

  // Kiểm tra nếu path có phải là protected hay không
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  // Bỏ qua nếu không phải là protected path
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Tạo Supabase client
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Kiểm tra session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Nếu không có session và đang truy cập vào protected path
  if (!session && isProtectedPath) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)',
  ],
}
