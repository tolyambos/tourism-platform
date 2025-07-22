const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ensure Prisma engines are included
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma binaries are copied
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      });
    }
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'r2.tourism-platform.com',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)