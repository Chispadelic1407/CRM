#!/bin/bash

# Simple Deployment Script for CRM Twilio
# This script creates a deployment package and provides instructions for manual deployment

REMOTE_HOST="access-5018020518.webspace-host.com"
REMOTE_USER="a951193"
REMOTE_PORT="22"

echo "🚀 Preparing CRM Twilio Deployment Package..."

# Create deployment directory
mkdir -p deployment
cd deployment

# Clean previous deployment files
rm -rf crm-twilio-deploy
mkdir crm-twilio-deploy

echo "📦 Creating deployment package..."

# Copy application files (excluding unnecessary files)
rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='logs' \
          --exclude='*.log' \
          --exclude='deployment' \
          --exclude='.env.example' \
          --exclude='README*.md' \
          --exclude='.vercelignore' \
          --exclude='vercel.json' \
          ../. crm-twilio-deploy/

# Create a compressed archive
tar -czf crm-twilio-deploy.tar.gz crm-twilio-deploy/

echo "✅ Deployment package created: deployment/crm-twilio-deploy.tar.gz"

# Create deployment instructions
cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# CRM Twilio Deployment Instructions

## 1. Upload the deployment package to your server

```bash
scp -P 22 crm-twilio-deploy.tar.gz a951193@access-5018020518.webspace-host.com:~/
```

## 2. SSH into your server

```bash
ssh -p 22 a951193@access-5018020518.webspace-host.com
```

## 3. Extract and setup the application

```bash
# Extract the package
tar -xzf crm-twilio-deploy.tar.gz

# Remove old installation if exists
rm -rf crm-twilio-old
mv crm-twilio crm-twilio-old 2>/dev/null || true

# Move new version
mv crm-twilio-deploy crm-twilio
cd crm-twilio

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install application dependencies
npm install --production

# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 4. Verify deployment

```bash
# Check if application is running
pm2 status

# View application logs
pm2 logs crm-twilio

# Check if port 3001 is listening
netstat -tlnp | grep 3001
```

## 5. Access your application

Your CRM Twilio application should now be accessible at:
- http://access-5018020518.webspace-host.com:3001

## Useful PM2 Commands

```bash
# Restart application
pm2 restart crm-twilio

# Stop application
pm2 stop crm-twilio

# View logs
pm2 logs crm-twilio

# Monitor application
pm2 monit

# Reload application (zero-downtime)
pm2 reload crm-twilio
```

## Environment Variables

The application uses the following environment variables (already configured in .env):
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN  
- TWILIO_PHONE_NUMBER
- AGENT_PHONE_NUMBER
- GEMINI_API_KEY

## Troubleshooting

If you encounter issues:

1. Check logs: `pm2 logs crm-twilio`
2. Check if port is available: `netstat -tlnp | grep 3001`
3. Restart the application: `pm2 restart crm-twilio`
4. Check system resources: `htop` or `free -h`

EOF

echo ""
echo "📋 Deployment package ready!"
echo "📁 Location: $(pwd)/crm-twilio-deploy.tar.gz"
echo "📖 Instructions: $(pwd)/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "🚀 Next steps:"
echo "1. Upload the package: scp -P 22 crm-twilio-deploy.tar.gz a951193@access-5018020518.webspace-host.com:~/"
echo "2. Follow the instructions in DEPLOYMENT_INSTRUCTIONS.md"
echo ""
