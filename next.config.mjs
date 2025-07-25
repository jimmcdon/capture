/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper output for Vercel deployment
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@ai-sdk/openai']
  }
}

export default nextConfig