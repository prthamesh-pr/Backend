@echo off
echo 🚀 Deploying Jivhala Motors Backend (Windows)...

REM Pull latest code
git pull origin main

REM Install dependencies
npm ci --only=production

REM Build application
npm run build

REM Restart services
docker-compose down
docker-compose up -d --build

REM Wait for services to start
timeout /t 10

REM Health check
curl -f http://localhost:3000/health
if %errorlevel% neq 0 (
    echo ❌ Health check failed!
    exit /b 1
)

echo ✅ Deployment completed successfully!
echo 🔗 Backend is running at http://localhost:3000
