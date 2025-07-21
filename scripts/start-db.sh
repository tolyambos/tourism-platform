#!/bin/bash

echo "🚀 Starting Tourism Platform Database..."

# Start Docker container
docker compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 8

# Check if database is running
if docker compose ps | grep -q "tourism_platform_db.*running"; then
    echo "✅ Database started successfully on port 5436"
    echo "📊 Connection string: postgresql://tourism_admin:tourism_local_2024@localhost:5436/tourism_platform"
else
    echo "❌ Failed to start database"
    docker compose logs postgres
    exit 1
fi