#!/bin/bash

DOMAIN="crm.sebastianvernis.com"
APP_PORT="3001"

echo "📊 CRM Twilio System Status"
echo "=========================="

# Check PM2 status
echo "🔄 PM2 Status:"
pm2 status

echo ""

# Check application health
echo "🏥 Application Health:"
curl -s https://$DOMAIN/health | jq . 2>/dev/null || echo "Health check failed"

echo ""

# Check Nginx status
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""

# Check SSL certificate
echo "🔒 SSL Certificate:"
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates

echo ""

# Check disk usage
echo "💾 Disk Usage:"
df -h /var/www/Apps/crm-twilio

echo ""

# Check memory usage
echo "🧠 Memory Usage:"
free -h

echo ""

# Check recent logs
echo "📋 Recent Application Logs:"
pm2 logs crm-twilio --lines 10 --nostream

