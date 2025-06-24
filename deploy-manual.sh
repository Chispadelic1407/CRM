#!/bin/bash

# Simple deployment script without sshpass
# You'll need to enter the password manually

set -e

# Configuration
SSH_HOST="access-5018020518.webspace-host.com"
SSH_USER="a951193"
SSH_PORT="22"
REMOTE_PATH="Apps/crm.sebastianvernis.com"

echo "🚀 Starting deployment to $SSH_HOST..."

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Create deployment package
print_status "Creating deployment package..."
rm -rf deployment-package
mkdir -p deployment-package

# Copy necessary files
cp -r backend deployment-package/
cp -r frontend deployment-package/
cp package.json deployment-package/
cp .env.production deployment-package/.env
cp ecosystem.config.js deployment-package/

# Create production package.json
cat > deployment-package/package.json << EOF
{
  "name": "crm-twilio-production",
  "version": "2.0.0",
  "description": "CRM Twilio Production Deployment",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "pm2:start": "pm2 start ecosystem.config.js --env production",
    "pm2:stop": "pm2 stop crm-twilio-app",
    "pm2:restart": "pm2 restart crm-twilio-app",
    "pm2:delete": "pm2 delete crm-twilio-app",
    "pm2:logs": "pm2 logs crm-twilio-app",
    "pm2:status": "pm2 status",
    "install:production": "npm install --production"
  },
  "dependencies": {
    "express": "^4.18.2",
    "twilio": "^4.19.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "node-cache": "^5.1.2",
    "uuid": "^9.0.1",
    "redis": "^4.6.10",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "@google/generative-ai": "^0.2.1",
    "sqlite3": "^5.1.6",
    "sequelize": "^6.35.2",
    "libphonenumber-js": "^1.10.51",
    "validator": "^13.11.0",
    "axios": "^1.6.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create startup script
cat > deployment-package/start-production.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting CRM Twilio Production Server..."

# Create necessary directories
mkdir -p logs
mkdir -p data

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
pm2 stop crm-twilio-app 2>/dev/null || true
pm2 delete crm-twilio-app 2>/dev/null || true

# Start the application with PM2
echo "🔄 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo "✅ CRM Twilio application started successfully!"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs crm-twilio-app"
EOF

chmod +x deployment-package/start-production.sh

# Create stop script
cat > deployment-package/stop-production.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping CRM Twilio Production Server..."

# Stop PM2 process
pm2 stop crm-twilio-app 2>/dev/null || true
pm2 delete crm-twilio-app 2>/dev/null || true

echo "✅ CRM Twilio application stopped successfully!"
EOF

chmod +x deployment-package/stop-production.sh

print_status "Deployment package created successfully!"

# Create the remote directory first
print_status "Creating remote directory..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "mkdir -p $REMOTE_PATH"

# Upload files using rsync over SSH
print_status "Uploading files to server..."
rsync -avz -e "ssh -p $SSH_PORT" deployment-package/ $SSH_USER@$SSH_HOST:$REMOTE_PATH/

print_status "Files uploaded successfully!"

# Execute deployment on remote server
print_status "Executing deployment on remote server..."

ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << EOF
cd $REMOTE_PATH
echo "📍 Current directory: \$(pwd)"
echo "📁 Directory contents:"
ls -la

# Make scripts executable
chmod +x *.sh

# Run the production startup script
./start-production.sh
EOF

print_status "Deployment completed successfully! 🎉"
print_status "Your CRM application should now be running at: https://crm.sebastianvernis.com"

# Cleanup
rm -rf deployment-package

echo ""
echo "📋 Deployment Summary:"
echo "   🌐 Domain: https://crm.sebastianvernis.com"
echo "   🖥️  Server: $SSH_HOST"
echo "   📂 Path: $REMOTE_PATH"
echo "   🔧 Process Manager: PM2"
echo ""
echo "🔧 Remote Management Commands:"
echo "   ssh -p $SSH_PORT $SSH_USER@$SSH_HOST"
echo "   cd $REMOTE_PATH"
echo "   pm2 status"
echo "   pm2 logs crm-twilio-app"
echo "   pm2 restart crm-twilio-app"
echo ""
