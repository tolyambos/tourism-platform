const { withSentryConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tourism/ui', '@tourism/database'],
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    domains: [
      'tourism-platform.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'res.cloudinary.com',
      'storage.googleapis.com',
      'r2.tourism-platform.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable ISR and static optimization
  experimental: {
    isrFlushToDisk: true,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Cache static assets
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (only in development)
  webpack: (config, { dev, isServer }) => {
    // Suppress Sentry warnings
    config.ignoreWarnings = [
      {
        module: /require-in-the-middle/,
        message: /Critical dependency/
      }
    ];
    if (!dev && !isServer) {
      // Replace react with preact in production for smaller bundle
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat'
      });
    }
    
    return config;
  },
  
  // Output configuration for CDN
  output: 'standalone',
  
  // Disable powered by header
  poweredByHeader: false,
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || 'tourism-platform',
  project: process.env.SENTRY_PROJECT || 'website-template',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Apply next-intl first, then Sentry
const configWithIntl = withNextIntl(nextConfig);

module.exports = process.env.SENTRY_DSN 
  ? withSentryConfig(configWithIntl, sentryWebpackPluginOptions)
  : configWithIntl;