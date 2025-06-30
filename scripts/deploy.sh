#!/bin/bash

echo "🚀 Deploying Jivhala Motors Backend..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Run database migrations if any
# npm run migrate

# Build application
npm run build

# Restart services
docker-compose down
docker-compose up -d --build

# Wait for services to start
sleep 10

# Health check
curl -f http://localhost:3000/health || {
    echo "❌ Health check failed!"
    exit 1
}

echo "✅ Deployment completed successfully!"
echo "🔗 Backend is running at http://localhost:3000"
