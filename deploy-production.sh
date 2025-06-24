#!/bin/bash

# Production Deployment Script for SSH/SFTP
# Target: access-5018020518.webspace-host.com

set -e

echo "🚀 Starting production deployment..."

# Configuration
SSH_HOST="access-5018020518.webspace-host.com"
SSH_USER="a951193"
SSH_PORT="22"
REMOTE_PATH="/home/a951193/crm-twilio"
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
cp package.json dist/
cp .env.production dist/.env
cp README.md dist/
cp MANUAL_DE_USO.md dist/ 2>/dev/null || true
cp -r config.php dist/ 2>/dev/null || true
cp -r status.php dist/ 2>/dev/null || true

# Create logs directory
mkdir -p dist/logs/

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

# Execute SFTP upload
sftp -P ${SSH_PORT} -b sftp_commands.txt ${SSH_USER}@${SSH_HOST}

# Clean up
rm -f sftp_commands.txt

print_status "Files uploaded successfully!"

# Install dependencies and start application via SSH
print_status "Installing dependencies and starting application..."

ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << 'ENDSSH'
cd /home/a951193/crm-twilio

# Install Node.js dependencies
npm install --production

# Stop any existing processes
pkill -f "node.*server.js" || true

# Start the application
nohup node backend/server.js > logs/app.log 2>&1 &

# Wait a moment for startup
sleep 3

# Check if application is running
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Application started successfully!"
    echo "🌐 Application should be available at: https://access-5018020518.webspace-host.com:3001"
else
    echo "❌ Failed to start application. Check logs:"
    tail -20 logs/app.log
    exit 1
fi
ENDSSH

print_status "Deployment completed successfully!"
print_status "Application URL: https://access-5018020518.webspace-host.com:3001"
print_warning "Please verify the application is working by visiting the URL above."

# Clean up local dist folder
rm -rf dist/

echo "🎉 Deployment finished!"
