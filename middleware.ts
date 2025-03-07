// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect routes that require authentication
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/games') ||
    req.nextUrl.pathname.startsWith('/finance') ||
    req.nextUrl.pathname.startsWith('/referrals') ||
    req.nextUrl.pathname.startsWith('/admin')

  // Check if user is accessing admin routes
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  // If authenticated user is trying to access auth pages, redirect to home
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If unauthenticated user is trying to access protected routes, redirect to login
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is trying to access admin routes, check if they are admin
  if (isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session?.user?.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

// Add matcher for routes that should invoke this middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
