/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: { ignoreBuildErrors: true },
  // Ensure local JSON data files are included in serverless function bundles on Vercel
  outputFileTracingIncludes: {
    '/**': ['./src/local-data/**'],
  },
}

export default nextConfig
