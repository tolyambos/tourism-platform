#!/bin/bash

# Script to set up Neon production database
echo "🚀 Setting up Neon Production Database"
echo "====================================="

# IMPORTANT: Set your DATABASE_URL as environment variable before running this script
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo "Please run: export DATABASE_URL='your-neon-database-url'"
    echo ""
    echo "Get your database URL from:"
    echo "1. Go to console.neon.tech"
    echo "2. Click on your project"
    echo "3. Copy the connection string"
    echo ""
    exit 1
fi

echo "📦 Generating Prisma Client..."
pnpm db:generate

echo ""
echo "🗄️ Pushing schema to Neon..."
cd packages/database
npx prisma db push --skip-generate
cd ../..

echo ""
echo "✅ Schema pushed to Neon!"
echo ""
echo "Would you like to seed the production database with initial templates?"
echo "⚠️  WARNING: Only do this on first setup!"
read -p "Seed production database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding production database..."
    cd packages/database
    npx prisma db seed
    cd ../..
    echo "✅ Database seeded!"
else
    echo "Skipping seed. You can run it later with: pnpm --filter database db:seed"
fi

echo ""
echo "🎉 Neon production database is ready!"
echo ""
echo "Next steps:"
echo "1. Redeploy on Vercel to use the new database"
echo "2. Check your site is working with production data"