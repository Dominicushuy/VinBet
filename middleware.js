// middleware.js
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Define protected routes for better maintainability
const PROTECTED_ROUTES = ['/profile', '/games', '/finance', '/referrals', '/admin']

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => path === route)

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/games/:path*',
    '/finance/:path*',
    '/referrals/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]
}
