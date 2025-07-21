#!/bin/bash

echo "Tourism Platform - Database Setup"
echo "================================"
echo ""
echo "This script will help you set up the database for the tourism platform."
echo ""

# Check if .env files exist
if [ ! -f "packages/database/.env" ] || [ ! -f "apps/cms/.env" ]; then
    echo "❌ Error: .env files not found!"
    echo ""
    echo "Please ensure you have:"
    echo "1. packages/database/.env"
    echo "2. apps/cms/.env"
    echo ""
    echo "You can copy the .env.example files as a starting point."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" packages/database/.env; then
    echo "❌ Error: DATABASE_URL not found in packages/database/.env"
    exit 1
fi

echo "✅ Found .env files"
echo ""
echo "Attempting to connect to the database..."
echo ""

# Generate Prisma Client
echo "1. Generating Prisma Client..."
pnpm db:generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

# Push schema to database
echo ""
echo "2. Pushing schema to database..."
pnpm db:push

if [ $? -eq 0 ]; then
    echo "✅ Database schema pushed successfully"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "You can now:"
    echo "- Run 'pnpm dev' to start the development servers"
    echo "- Run 'pnpm db:studio' to open Prisma Studio and view your data"
else
    echo ""
    echo "❌ Failed to push schema to database"
    echo ""
    echo "Common issues:"
    echo "1. PostgreSQL is not running"
    echo "2. Database credentials are incorrect"
    echo "3. Database 'tourism_platform' doesn't exist"
    echo ""
    echo "For easy setup, consider using a free cloud PostgreSQL service:"
    echo "- Neon (https://neon.tech) - Recommended"
    echo "- Supabase (https://supabase.com)"
    echo "- Railway (https://railway.app)"
    echo ""
    echo "See DATABASE_SETUP.md for detailed instructions."
    exit 1
fi