# CRM Twilio Production Deployment Guide

## Overview
This guide covers the deployment of the CRM Twilio system to the production server at `crm.sebastianvernis.com`.

## Server Information
- **Hostname**: access-5018020518.webspace-host.com
- **Username**: a951193
- **Protocol**: SFTP + SSH
- **Port**: 22
- **Domain**: crm.sebastianvernis.com
- **Path**: Apps/crm.sebastianvernis.com

## Environment Variables
The following environment variables are configured for production:

```bash
NODE_ENV=production
PORT=3000
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
AGENT_PHONE_NUMBER=YOUR_AGENT_PHONE_NUMBER
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
ALLOWED_ORIGINS=https://crm.sebastianvernis.com,http://crm.sebastianvernis.com
VOICE_WEBHOOK_URL=https://crm.sebastianvernis.com
```

## Deployment Process

### 1. Automatic Deployment
Run the deployment script:
```bash
./deploy.sh
```

This script will:
- Create a deployment package with all necessary files
- Upload files to the production server
- Install dependencies
- Start the application using PM2
- Configure automatic startup

### 2. Manual Deployment Steps

If you need to deploy manually:

1. **Connect to the server**:
   ```bash
   ssh -p 22 a951193@access-5018020518.webspace-host.com
   cd Apps/crm.sebastianvernis.com
   ```

2. **Upload files** (from local machine):
   ```bash
   scp -P 22 -r ./backend ./frontend ./package.json ./.env.production ./ecosystem.config.js a951193@access-5018020518.webspace-host.com:Apps/crm.sebastianvernis.com/
   ```

3. **Install dependencies**:
   ```bash
   npm install --production
   ```

4. **Install PM2** (if not installed):
   ```bash
   npm install -g pm2
   ```

5. **Start the application**:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## Application Management

### PM2 Commands
- **Check status**: `pm2 status`
- **View logs**: `pm2 logs crm-twilio-app`
- **Restart app**: `pm2 restart crm-twilio-app`
- **Stop app**: `pm2 stop crm-twilio-app`
- **Delete app**: `pm2 delete crm-twilio-app`

### Application Scripts
- **Start production**: `./start-production.sh`
- **Stop production**: `./stop-production.sh`
- **Create backup**: `./backup.sh`

## Monitoring and Logs

### Log Files
- **Application logs**: `./logs/`
- **PM2 logs**: `./logs/pm2-*.log`
- **Error logs**: `./logs/error.log`
- **Combined logs**: `./logs/combined.log`

### Health Check
Access the health check endpoint:
```
https://crm.sebastianvernis.com/health
```

## Database

The application uses SQLite database stored at:
```
./data/crm_production.db
```

### Backup Database
```bash
./backup.sh
```

Backups are stored in the `./backups/` directory.

## Security Considerations

1. **HTTPS**: Ensure the domain is configured with SSL/TLS
2. **Firewall**: Only necessary ports should be open
3. **Environment Variables**: Sensitive data is stored in `.env` file
4. **Rate Limiting**: Application includes built-in rate limiting
5. **CORS**: Configured for production domain only

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   pm2 stop crm-twilio-app
   pm2 delete crm-twilio-app
   ./start-production.sh
   ```

2. **Dependencies missing**:
   ```bash
   npm install --production
   ```

3. **Permission issues**:
   ```bash
   chmod +x *.sh
   ```

4. **Database issues**:
   ```bash
   mkdir -p data
   # Check if database file exists and has proper permissions
   ```

### Log Analysis
```bash
# View real-time logs
pm2 logs crm-twilio-app --lines 100

# View error logs
tail -f logs/error.log

# View PM2 logs
tail -f logs/pm2-error.log
```

## Performance Optimization

1. **Memory Management**: PM2 is configured to restart if memory usage exceeds 1GB
2. **Caching**: Application includes built-in caching mechanisms
3. **Compression**: Gzip compression is enabled
4. **Rate Limiting**: Protects against abuse

## Backup and Recovery

### Automated Backups
Run the backup script regularly:
```bash
./backup.sh
```

### Manual Backup
```bash
# Backup database
cp data/crm_production.db backups/manual_backup_$(date +%Y%m%d_%H%M%S).db

# Backup logs
tar -czf backups/logs_backup_$(date +%Y%m%d_%H%M%S).tar.gz logs/
```

### Recovery
```bash
# Restore database
cp backups/[backup_file].db data/crm_production.db

# Restart application
pm2 restart crm-twilio-app
```

## Support and Maintenance

### Regular Maintenance Tasks
1. Monitor application logs
2. Check disk space usage
3. Review backup files
4. Update dependencies (when needed)
5. Monitor performance metrics

### Contact Information
- **Domain**: https://crm.sebastianvernis.com
- **Server**: access-5018020518.webspace-host.com
- **Application**: CRM Twilio System v2.0.0

## API Endpoints

### Main Endpoints
- **Health Check**: `GET /health`
- **Send SMS**: `POST /send-sms`
- **Make Call**: `POST /make-call`
- **Spoof Calling**: `POST /api/spoof/*`
- **AI Services**: `POST /api/ai/*`
- **Contacts**: `GET|POST|PUT|DELETE /api/contacts/*`
- **Advisors**: `GET|POST|PUT|DELETE /api/advisors/*`

### Frontend
The frontend is served as static files and accessible at the root domain.
