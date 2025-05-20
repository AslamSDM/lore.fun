/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable SSR completely
  reactStrictMode: false,
  experimental: {
    // Ensures all pages are client-side rendered
    runtime: 'experimental-edge',
  },
}

export default nextConfig
