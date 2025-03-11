/** @type {import('next').NextConfig} */

const nextConfig = {
  // React strict mode provides additional development-time checks
  reactStrictMode: true,

  // Set your preferred output mode
  output: 'standalone',

  // Disable the "X-Powered-By: Next.js" HTTP header
  poweredByHeader: false,

  // Configure image domains
  images: {
    domains: [
      'localhost'
      // Add other domains as needed
    ],
    formats: ['image/avif', 'image/webp']
  },

  // Example environment variables (if needed)
  env: {
    // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  // Example webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here if needed
    return config
  }
}

export default nextConfig
