#!/bin/bash

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

# Build CMS
echo "Building CMS..."
pnpm build:cms

echo "✅ Build complete!"