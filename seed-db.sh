#!/usr/bin/env zsh

# Script to reset and seed the database
# Usage: ./seed-db.sh

echo "🌱 Starting database seeding process..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if the Postgres container is running
if ! docker ps | grep -q "lorefun_postgres"; then
  echo "🐘 Starting PostgreSQL container..."
  docker-compose up -d
  
  # Wait for PostgreSQL to be ready
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 5
fi

# Reset the database (if needed)
echo "🔄 Resetting the database..."
npx prisma migrate reset --force

# Run the seed script
echo "🌱 Running seed script..."
npx prisma db seed

echo "✅ Database seeding completed!"

# Optional: Run Prisma Studio to view the data
if [[ "$1" == "--studio" ]]; then
  echo "🔍 Opening Prisma Studio..."
  npx prisma studio
fi
