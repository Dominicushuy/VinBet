/** @type {import('next').NextConfig} */

const nextConfig = {
  // React strict mode provides additional development-time checks
  reactStrictMode: true,

  // Thay đổi output mode
  output: 'standalone',

  // Disable the "X-Powered-By: Next.js" HTTP header
  poweredByHeader: false,

  // Configure image domains
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp']
  },

  eslint: {
    ignoreDuringBuilds: true
  }
}

export default nextConfig
