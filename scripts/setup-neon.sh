#!/bin/bash

# Neon Database Setup Script
echo "🚀 Setting up Neon Database for Tourism Platform"
echo "=============================================="

# Check if .env exists
if [ ! -f packages/database/.env ]; then
    echo "Creating .env file for database package..."
    cp packages/database/.env.example packages/database/.env
fi

echo ""
echo "📝 Please add your Neon DATABASE_URL to:"
echo "1. packages/database/.env"
echo "2. apps/cms/.env (if running CMS locally)"
echo ""
echo "Your DATABASE_URL should look like:"
echo "postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
echo ""
read -p "Have you added the DATABASE_URL? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️ Running database setup..."
    
    # Generate Prisma Client
    echo "Generating Prisma Client..."
    pnpm db:generate
    
    # Push schema to database
    echo "Pushing schema to Neon..."
    pnpm db:push
    
    # Run migrations
    echo "Running migrations..."
    pnpm db:migrate
    
    # Seed database
    read -p "Do you want to seed the database with initial data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Seeding database..."
        pnpm --filter database db:seed
    fi
    
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Add the DATABASE_URL to Vercel environment variables"
    echo "2. Redeploy your Vercel app"
else
    echo "Please add your DATABASE_URL first, then run this script again."
    exit 1
fi