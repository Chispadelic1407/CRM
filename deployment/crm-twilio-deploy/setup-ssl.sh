#!/bin/bash

DOMAIN="crm.sebastianvernis.com"

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "📥 Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@sebastianvernis.com

# Start nginx
sudo systemctl start nginx

# Test certificate renewal
sudo certbot renew --dry-run

echo "✅ SSL certificate setup completed for $DOMAIN"
