#!/bin/bash

set -e

DOMAIN="crm.sebastianvernis.com"
APP_PORT="3001"
APP_DIR="/var/www/Apps/crm-twilio"

echo "🔧 Setting up CRM Twilio application for $DOMAIN..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    sudo npm install -g pm2
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📥 Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Create application directory
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Navigate to application directory
cd $APP_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create logs directory
mkdir -p logs

# Set proper permissions
chmod +x backend/server.js
chmod +x remote-setup.sh
chmod +x setup-ssl.sh

# Copy Nginx configuration
echo "⚙️  Configuring Nginx..."
sudo cp nginx-crm.conf /etc/nginx/sites-available/crm-twilio
sudo ln -sf /etc/nginx/sites-available/crm-twilio /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Setup SSL certificate
echo "🔒 Setting up SSL certificate..."
./setup-ssl.sh

# Reload Nginx with new configuration
sudo systemctl reload nginx

# Setup firewall rules
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow $APP_PORT

# Stop any existing PM2 processes
pm2 delete crm-twilio 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Enable PM2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo "✅ CRM Twilio application deployed and started successfully!"
echo "🌐 Application is now accessible at: https://$DOMAIN"
echo ""
echo "📋 Useful commands:"
echo "   Check PM2 status: pm2 status"
echo "   View logs: pm2 logs crm-twilio"
echo "   Restart app: pm2 restart crm-twilio"
echo "   Check Nginx status: sudo systemctl status nginx"
echo "   View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🔍 Health check: curl https://$DOMAIN/health"

