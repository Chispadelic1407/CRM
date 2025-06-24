#!/bin/bash

# Quick deployment script for updates
# Use this for quick updates without full redeployment

set -e

# Configuration
SSH_HOST="access-5018020518.webspace-host.com"
SSH_USER="a951193"
SSH_PORT="22"
REMOTE_PATH="Apps/crm.sebastianvernis.com"

echo "🔄 Quick update deployment..."

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    sudo apt-get update && sudo apt-get install -y sshpass
fi

# Upload only changed files
print_status "Uploading updated files..."

# Upload backend changes
sshpass -p "Svernis1" rsync -avz -e "ssh -p $SSH_PORT -o StrictHostKeyChecking=no"     --exclude 'node_modules'     --exclude 'logs'     --exclude 'data'     backend/ $SSH_USER@$SSH_HOST:$REMOTE_PATH/backend/

# Upload frontend changes
sshpass -p "Svernis1" rsync -avz -e "ssh -p $SSH_PORT -o StrictHostKeyChecking=no"     frontend/ $SSH_USER@$SSH_HOST:$REMOTE_PATH/frontend/

# Upload environment file if changed
sshpass -p "Svernis1" scp -P $SSH_PORT -o StrictHostKeyChecking=no     .env.production $SSH_USER@$SSH_HOST:$REMOTE_PATH/.env

print_status "Restarting application..."

# Restart the application
sshpass -p "Svernis1" ssh -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_USER@$SSH_HOST << EOF
cd $REMOTE_PATH
pm2 restart crm-twilio-app
pm2 logs crm-twilio-app --lines 20
EOF

print_status "Quick update completed! ✅"
