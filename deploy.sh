#!/bin/bash

# Tourism Platform Deployment Script
# This script helps deploy the website-template to Vercel

echo "🚀 Tourism Platform Deployment Script"
echo "===================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required variables:"
    echo "- VERCEL_TOKEN"
    echo "- VERCEL_PROJECT_ID"
    echo "- DATABASE_URL"
    echo "- GOOGLE_GEMINI_API_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$VERCEL_TOKEN" ] || [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please check your .env file"
    exit 1
fi

# Function to show menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Deploy to Vercel (Production)"
    echo "2) Deploy to Vercel (Preview)"
    echo "3) Add a custom domain"
    echo "4) List all domains"
    echo "5) Run database migrations"
    echo "6) Install dependencies"
    echo "7) Exit"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-7): " choice

    case $choice in
        1)
            echo "🚀 Deploying to Production..."
            cd apps/website-template
            vercel --prod
            cd ../..
            ;;
        2)
            echo "🚀 Deploying to Preview..."
            cd apps/website-template
            vercel
            cd ../..
            ;;
        3)
            read -p "Enter domain name (e.g., prahazoo.com): " domain
            if [ -z "$domain" ]; then
                echo "❌ Domain name cannot be empty!"
            else
                echo "Adding domain $domain..."
                tsx scripts/vercel-deploy.ts add-domain "$domain"
            fi
            ;;
        4)
            echo "📋 Listing all domains..."
            tsx scripts/vercel-deploy.ts list-domains
            ;;
        5)
            echo "🗄️ Running database migrations..."
            pnpm db:migrate
            ;;
        6)
            echo "📦 Installing dependencies..."
            pnpm install
            ;;
        7)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
done