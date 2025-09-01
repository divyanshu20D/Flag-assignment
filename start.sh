#!/bin/bash

echo "🚀 Starting Feature Flags Demo Project..."
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building and starting services..."
echo "   - PostgreSQL Database (port 5432)"
echo "   - Redis Cache (port 6380)"
echo "   - Next.js Application (port 3000)"
echo ""

# Build and start all services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for services to be healthy
echo "   Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done

echo "   Waiting for Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 2
done

echo "   Waiting for application..."
until curl -f http://localhost:3000 > /dev/null 2>&1; do
    sleep 3
done

echo ""
echo "✅ All services are ready!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
echo "🔴 Redis: localhost:6380"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo "🧹 Clean up: docker-compose down -v"
echo ""
echo "Happy coding! 🎉"
