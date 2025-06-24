# 🚀 Complete Deployment Guide for CRM Twilio on crm.sebastianvernis.com

## 📋 Overview

This guide provides step-by-step instructions to deploy the CRM Twilio application on the domain `crm.sebastianvernis.com` in the Apps folder of your SSH server.

## 🏗️ Architecture

```
crm.sebastianvernis.com (HTTPS)
         ↓
    Nginx Reverse Proxy
         ↓
    Node.js App (Port 3001)
         ↓
    SQLite Database + Twilio + Gemini AI
```

## 📦 What's Included

- **Complete Application**: Frontend + Backend with all dependencies
- **Nginx Configuration**: SSL-enabled reverse proxy setup
- **SSL Certificate**: Automated Let's Encrypt setup
- **PM2 Configuration**: Process management for production
- **Monitoring Scripts**: Health checks and system monitoring
- **Backup Scripts**: Automated backup system
- **Security Configuration**: Firewall, headers, and best practices

## 🔧 Prerequisites

### Server Requirements
- **OS**: Ubuntu 18.04+ or Debian 9+
- **RAM**: Minimum 1GB (2GB recommended)
- **Storage**: 5GB free space
- **Node.js**: 16+ (will be installed automatically)
- **Nginx**: (will be installed automatically)
- **PM2**: (will be installed automatically)

### Domain Requirements
- DNS A record pointing `crm.sebastianvernis.com` to your server IP
- Port 80 and 443 open for HTTP/HTTPS traffic
- Port 3001 open for the application (internal)

### API Keys Required
- **Twilio Account**: Account SID, Auth Token, Phone Number
- **Google Gemini API**: API Key for AI features

## 🚀 Deployment Steps

### Step 1: Prepare Deployment Package

Run the deployment script to create the package:

```bash
cd /home/user/workspace
chmod +x deploy-domain.sh
./deploy-domain.sh
```

This creates `deployment/crm-twilio-deploy.tar.gz` with all necessary files.

### Step 2: Upload to Server

```bash
# Replace 'your_user' with your actual SSH username
scp deployment/crm-twilio-deploy.tar.gz your_user@sebastianvernis.com:~/
```

### Step 3: SSH into Server

```bash
ssh your_user@sebastianvernis.com
```

### Step 4: Extract and Setup

```bash
# Extract the deployment package
tar -xzf crm-twilio-deploy.tar.gz

# Create the Apps directory if it doesn't exist
sudo mkdir -p /var/www/Apps

# Move application to Apps folder
sudo mv crm-twilio-deploy /var/www/Apps/crm-twilio

# Change to application directory
cd /var/www/Apps/crm-twilio

# Set proper ownership
sudo chown -R $USER:$USER /var/www/Apps/crm-twilio
```

### Step 5: Configure Environment

```bash
# Copy production environment template
cp .env.production .env

# Edit environment file with your credentials
nano .env
```

**Required Environment Variables:**
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_actual_twilio_account_sid
TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token
TWILIO_PHONE_NUMBER=your_actual_twilio_phone_number
AGENT_PHONE_NUMBER=your_actual_agent_phone_number

# Gemini AI Configuration
GEMINI_API_KEY=your_actual_gemini_api_key

# Server Configuration (keep as is)
NODE_ENV=production
PORT=3001
DOMAIN=crm.sebastianvernis.com
ALLOWED_ORIGINS=https://crm.sebastianvernis.com
VOICE_WEBHOOK_URL=https://crm.sebastianvernis.com
```

### Step 6: Run Automated Setup

```bash
# Make setup script executable
chmod +x remote-setup.sh

# Run the complete setup
./remote-setup.sh
```

This script will:
- Install Node.js, PM2, and Nginx
- Install application dependencies
- Configure Nginx with SSL
- Setup SSL certificate with Let's Encrypt
- Start the application with PM2
- Configure firewall rules

## 🔍 Verification

### Check Application Status

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs crm-twilio

# Check Nginx status
sudo systemctl status nginx

# Test application health
curl https://crm.sebastianvernis.com/health
```

### Access the Application

Open your browser and navigate to:
**https://crm.sebastianvernis.com**

You should see the CRM dashboard interface.

## 📊 Monitoring and Maintenance

### Daily Monitoring

```bash
# Run comprehensive system check
./monitor.sh
```

### Create Backups

```bash
# Create manual backup
./backup.sh

# Setup automated daily backups (optional)
sudo crontab -e
# Add: 0 2 * * * /var/www/Apps/crm-twilio/backup.sh
```

### View Logs

```bash
# Application logs
pm2 logs crm-twilio

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## 🔧 Common Operations

### Restart Application

```bash
pm2 restart crm-twilio
```

### Update Application

```bash
# Stop application
pm2 stop crm-twilio

# Create backup
./backup.sh

# Update files (upload new version)
# ... upload process ...

# Install new dependencies
npm install --production

# Start application
pm2 start crm-twilio
```

### SSL Certificate Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal if needed
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## 🛠️ Troubleshooting

### Application Won't Start

1. **Check logs**: `pm2 logs crm-twilio`
2. **Check environment**: Verify `.env` file has correct values
3. **Check dependencies**: Run `npm install --production`
4. **Check permissions**: Ensure proper file ownership

### SSL Certificate Issues

1. **Check DNS**: Ensure domain points to server IP
2. **Check firewall**: Ports 80 and 443 must be open
3. **Manual certificate**: Run `./setup-ssl.sh` again

### Nginx Configuration Issues

1. **Test configuration**: `sudo nginx -t`
2. **Check logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Restart Nginx**: `sudo systemctl restart nginx`

### Database Issues

1. **Check file permissions**: SQLite database file must be writable
2. **Check disk space**: Ensure sufficient storage
3. **Check logs**: Application logs will show database errors

## 🔒 Security Considerations

### Firewall Configuration

```bash
# Check current rules
sudo ufw status

# Allow necessary ports
sudo ufw allow 'Nginx Full'
sudo ufw allow 22  # SSH
sudo ufw enable
```

### SSL Security

- Automatic HTTPS redirect
- Strong SSL ciphers
- HSTS headers
- Security headers (XSS, CSRF protection)

### Application Security

- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## 📈 Performance Optimization

### PM2 Configuration

The application is configured with:
- Auto-restart on crashes
- Memory limit monitoring
- Log rotation
- Cluster mode ready (can be scaled)

### Nginx Optimization

- Gzip compression enabled
- Static file caching
- Proxy buffering
- Keep-alive connections

### Database Optimization

- SQLite with proper indexing
- Connection pooling
- Query optimization
- Regular maintenance

## 🆘 Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Check logs and system status
2. **Monthly**: Update system packages
3. **Quarterly**: Review and rotate logs
4. **Annually**: Review SSL certificates

### Getting Help

1. **Check logs first**: Most issues are logged
2. **Review this guide**: Common solutions included
3. **Check application health**: Use monitoring script
4. **Verify configuration**: Ensure all settings are correct

## 📝 File Structure

After deployment, your file structure will be:

```
/var/www/Apps/crm-twilio/
├── backend/                 # Node.js backend application
├── frontend/               # Static frontend files
├── logs/                   # Application logs
├── .env                    # Environment configuration
├── ecosystem.config.js     # PM2 configuration
├── nginx-crm.conf         # Nginx configuration
├── remote-setup.sh        # Setup script
├── setup-ssl.sh          # SSL setup script
├── backup.sh             # Backup script
├── monitor.sh            # Monitoring script
└── package.json          # Node.js dependencies
```

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Application accessible at https://crm.sebastianvernis.com
- ✅ SSL certificate valid and auto-renewing
- ✅ PM2 shows application running
- ✅ Health check returns 200 OK
- ✅ Logs show no critical errors
- ✅ All API endpoints responding
- ✅ Twilio integration working
- ✅ Gemini AI features functional

## 🔮 Next Steps

After successful deployment:

1. **Configure Twilio webhooks** to point to your domain
2. **Setup monitoring alerts** for production
3. **Configure automated backups** with cron jobs
4. **Setup log rotation** to manage disk space
5. **Configure additional security** as needed
6. **Setup staging environment** for testing updates

---

**🎉 Congratulations! Your CRM Twilio application is now live on crm.sebastianvernis.com**

For any issues or questions, refer to the troubleshooting section or check the application logs for detailed error information.
