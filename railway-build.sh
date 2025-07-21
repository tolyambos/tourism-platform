#!/bin/bash
set -e  # Exit on error

# Railway build script for pnpm monorepo
echo "🚀 Starting Railway build..."

# Install pnpm globally
echo "Installing pnpm..."
npm install -g pnpm@8

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "Generating Prisma client..."
pnpm db:generate

# Check environment variables
echo "Checking environment variables..."
cd apps/cms && node check-env.js || true
cd ../..

# Build CMS
echo "Building CMS..."
pnpm build:cms

# Check if build succeeded
if [ ! -d "apps/cms/.next/standalone" ]; then
  echo "❌ Build failed: standalone directory not created"
  exit 1
fi

# Copy static files to standalone
echo "Copying static files..."
cp -r apps/cms/.next/static apps/cms/.next/standalone/apps/cms/.next/
cp -r apps/cms/public apps/cms/.next/standalone/apps/cms/ 2>/dev/null || true

echo "✅ Build complete!"