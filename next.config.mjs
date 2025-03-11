/** @type {import('next').NextConfig} */

const nextConfig = {
  // React strict mode provides additional development-time checks
  reactStrictMode: true,

  // Thay đổi output mode
  output: 'server', // Thay vì 'standalone'

  // Disable the "X-Powered-By: Next.js" HTTP header
  poweredByHeader: false,

  // Configure image domains
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp']
  },

  // Cấu hình tự động cho dynamic routes
  experimental: {
    serverActions: true
  },

  eslint: {
    ignoreDuringBuilds: true
  }
}

export default nextConfig
