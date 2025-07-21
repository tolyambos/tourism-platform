const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tourism/ui', '@tourism/database'],
  
  // Asset optimization
  images: {
    domains: ['storage.googleapis.com', 'r2.tourism-platform.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Suppress Sentry warnings
    config.ignoreWarnings = [
      {
        module: /require-in-the-middle/,
        message: /Critical dependency/
      }
    ];
    // Analyze bundle in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer 
            ? '../analyze/server.html' 
            : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
          }
        ]
      }
    ];
  },
  
  // Compression
  compress: true,
  
  // Output configuration
  output: 'standalone',
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || 'tourism-platform',
  project: process.env.SENTRY_PROJECT || 'cms',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
};

module.exports = process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;