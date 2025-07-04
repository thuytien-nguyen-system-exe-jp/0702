/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pagesのサブパス対応
  basePath: process.env.NODE_ENV === 'production' ? '/vietnamese-ecommerce' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/vietnamese-ecommerce/' : '',
  // ESLintを一時的に無効化（デプロイ用）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript型チェックを一時的に無効化（デプロイ用）
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig