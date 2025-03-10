/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // typescript: {
  //   // ⚠️ Bỏ qua lỗi TypeScript trong quá trình build
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
