@echo off
echo 🚀 Starting Feature Flags Demo Project...
echo ========================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo 📦 Building and starting services...
echo    - PostgreSQL Database (port 5432)
echo    - Redis Cache (port 6380)
echo    - Next.js Application (port 3000)
echo.

REM Build and start all services
docker-compose up --build -d

echo.
echo ⏳ Waiting for services to be ready...

REM Wait for services to be healthy
echo    Waiting for PostgreSQL...
:wait_postgres
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)

echo    Waiting for Redis...
:wait_redis
docker-compose exec -T redis redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_redis
)

echo    Waiting for application...
:wait_app
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 3 /nobreak >nul
    goto wait_app
)

echo.
echo ✅ All services are ready!
echo.
echo 🌐 Application: http://localhost:3000
echo 🗄️  Database: localhost:5432
echo 🔴 Redis: localhost:6380
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
echo 🧹 Clean up: docker-compose down -v
echo.
echo Happy coding! 🎉
pause
