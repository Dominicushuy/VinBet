// src/app/api/utils/client-info/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const headers = request.headers

  // Attempt to get IP from various headers (in order of reliability)
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    '127.0.0.1' // Fallback for local development

  return NextResponse.json({
    ip,
    isDevelopment: process.env.NODE_ENV === 'development'
  })
}
