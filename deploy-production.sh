#!/bin/bash

# Production Deployment Script for SSH/SFTP
# Target: access-5018020518.webspace-host.com

set -e

echo "🚀 Starting production deployment..."

# Configuration
SSH_HOST="8.219.175.183"
SSH_USER="root"
SSH_PORT="22"
REMOTE_PATH="/root/crm-consolidated"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
print_status "Checking required files..."
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found! Please create it with actual credentials."
    exit 1
fi

if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    exit 1
fi

# Create deployment package
print_status "Creating deployment package..."
rm -rf dist/
mkdir -p dist/

# Copy necessary files
cp -r backend/ dist/
cp -r frontend/ dist/
cp -r scripts/ dist/
cp package.json dist/
cp ecosystem.config.js dist/
cp .env.production dist/.env
cp README.md dist/
cp MANUAL_DE_USO.md dist/ 2>/dev/null || true

# Create necessary directories
mkdir -p dist/backend/logs/

print_status "Deployment package created in dist/"

# Upload files via SFTP
print_status "Uploading files to server..."

# Create SFTP batch file
cat > sftp_commands.txt << EOF
mkdir ${REMOTE_PATH}
mkdir ${REMOTE_PATH}/backend
mkdir ${REMOTE_PATH}/frontend
mkdir ${REMOTE_PATH}/logs
put -r dist/* ${REMOTE_PATH}/
chmod 755 ${REMOTE_PATH}/backend/server.js
quit
EOF

# Execute SFTP upload with password prompt
echo "Please enter the password for ${SSH_USER}@${SSH_HOST} when prompted:"
sftp -P ${SSH_PORT} -b sftp_commands.txt ${SSH_USER}@${SSH_HOST}

# Clean up
rm -f sftp_commands.txt

print_status "Files uploaded successfully!"

# Install dependencies and start application via SSH
print_status "Installing dependencies and starting application..."
echo "Please enter the password for ${SSH_USER}@${SSH_HOST} when prompted for SSH connection:"

ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << 'ENDSSH'
cd /root/crm-consolidated

# Install Node.js dependencies
echo "📦 Installing dependencies..."
cd backend
npm install --production

# Return to root directory
cd /root/crm-consolidated

# Setup database
echo "🗄️  Setting up database..."
chmod +x scripts/setup-database.sh
DB_FORCE_SYNC=true ./scripts/setup-database.sh

if [ $? -ne 0 ]; then
    echo "❌ Database setup failed. Aborting deployment."
    exit 1
fi

# Stop any existing processes
echo "🔄 Stopping existing processes..."
pm2 stop crm-avanza || true
pm2 delete crm-avanza || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Wait for startup
sleep 5

# Check if application is running
if pm2 list | grep -q "crm-avanza.*online"; then
    echo "✅ Application started successfully!"
    echo "🌐 Application should be available at: http://8.219.175.183"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    echo ""
    echo "📝 Recent logs:"
    pm2 logs crm-avanza --lines 10 --nostream
else
    echo "❌ Failed to start application. Check logs:"
    pm2 logs crm-avanza --lines 50 --nostream
    exit 1
fi
ENDSSH

print_status "Deployment completed successfully!"
print_status "Application URL: http://8.219.175.183"
print_warning "Please verify the application is working by visiting the URL above."

# Clean up local dist folder
rm -rf dist/

echo ""
echo "🎉 Deployment finished!"
echo ""
echo "Next steps:"
echo "  1. Visit http://8.219.175.183 to verify the application"
echo "  2. Check PM2 status: ssh root@8.219.175.183 'pm2 status'"
echo "  3. View logs: ssh root@8.219.175.183 'pm2 logs crm-avanza'"
