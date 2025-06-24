#!/bin/bash

BACKUP_DIR="/var/backups/crm-twilio"
APP_DIR="/var/www/Apps/crm-twilio"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Creating backup..."

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Stop application
pm2 stop crm-twilio

# Create backup
sudo tar -czf $BACKUP_DIR/crm-twilio-backup-$DATE.tar.gz -C $APP_DIR .

# Keep only last 5 backups
sudo find $BACKUP_DIR -name "crm-twilio-backup-*.tar.gz" -type f -mtime +5 -delete

# Start application
pm2 start crm-twilio

echo "✅ Backup created: $BACKUP_DIR/crm-twilio-backup-$DATE.tar.gz"
