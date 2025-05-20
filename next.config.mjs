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
  // Safety measures for production
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  // Ensure API routes work properly even with CSR pages
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default nextConfig
