#!/bin/bash

# Server monitoring script
# Use this to check the status of the CRM application

# Configuration
SSH_HOST="access-5018020518.webspace-host.com"
SSH_USER="a951193"
SSH_PORT="22"
REMOTE_PATH="Apps/crm.sebastianvernis.com"

echo "📊 Checking CRM Twilio server status..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    print_error "sshpass is required but not installed."
    exit 1
fi

print_status "Connecting to server..."

# Execute monitoring commands on remote server
sshpass -p "Svernis1" ssh -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_USER@$SSH_HOST << 'EOF'
echo "🖥️  Server Information:"
echo "   Hostname: $(hostname)"
echo "   Date: $(date)"
echo "   Uptime: $(uptime)"
echo ""

cd Apps/crm.sebastianvernis.com

echo "📂 Application Directory:"
echo "   Path: $(pwd)"
echo "   Disk Usage: $(du -sh . 2>/dev/null || echo 'N/A')"
echo ""

echo "📦 PM2 Status:"
pm2 status 2>/dev/null || echo "   PM2 not running or not installed"
echo ""

echo "🔍 Application Process:"
ps aux | grep "node.*server.js" | grep -v grep || echo "   No Node.js server process found"
echo ""

echo "📋 Recent Logs (last 10 lines):"
if [ -f "logs/pm2-combined.log" ]; then
    tail -10 logs/pm2-combined.log
elif [ -f "logs/combined.log" ]; then
    tail -10 logs/combined.log
else
    echo "   No log files found"
fi
echo ""

echo "💾 Database Status:"
if [ -f "data/crm_production.db" ]; then
    echo "   Database file exists: $(ls -lh data/crm_production.db | awk '{print $5, $6, $7, $8}')"
else
    echo "   Database file not found"
fi
echo ""

echo "🌐 Network Status:"
netstat -tlnp 2>/dev/null | grep ":3000" || echo "   Port 3000 not listening"
echo ""

echo "📊 System Resources:"
echo "   Memory Usage:"
free -h 2>/dev/null || echo "   Memory info not available"
echo "   CPU Load:"
cat /proc/loadavg 2>/dev/null || echo "   Load info not available"
EOF

echo ""
print_status "Health check via HTTP..."

# Check if the application is responding
if curl -s -o /dev/null -w "%{http_code}" "https://crm.sebastianvernis.com/health" | grep -q "200"; then
    print_status "✅ Application is responding (HTTP 200)"
else
    print_warning "⚠️  Application may not be responding properly"
fi

echo ""
print_status "Monitoring completed!"
