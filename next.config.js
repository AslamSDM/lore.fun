/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.com", "via.placeholder.com", "images.unsplash.com"],
    unoptimized: true,
  },
}

module.exports = nextConfig
