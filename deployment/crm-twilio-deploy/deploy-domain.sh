#!/bin/bash

# =============================================================================
# CRM Twilio Deployment Script for crm.sebastianvernis.com
# =============================================================================

set -e  # Exit on any error

# Deployment Configuration
DOMAIN="crm.sebastianvernis.com"
REMOTE_HOST="sebastianvernis.com"  # Main server host
REMOTE_USER="your_ssh_user"        # Update with actual SSH user
REMOTE_PORT="22"
REMOTE_PATH="/var/www/Apps/crm-twilio"
LOCAL_PATH="/home/user/workspace"
APP_PORT="3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting CRM Twilio Deployment for ${DOMAIN}...${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    if ! command -v rsync &> /dev/null; then
        print_error "rsync is required but not installed"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        print_error "ssh is required but not installed"
        exit 1
    fi
    
    print_status "All dependencies are available"
}

# Create deployment package
create_deployment_package() {
    echo -e "${BLUE}📦 Creating deployment package...${NC}"
    
    # Create deployment directory
    mkdir -p deployment
    cd deployment
    
    # Clean previous deployment files
    rm -rf crm-twilio-deploy
    mkdir crm-twilio-deploy
    
    # Copy application files (excluding unnecessary files)
    rsync -av --exclude='node_modules' \
              --exclude='.git' \
              --exclude='logs' \
              --exclude='*.log' \
              --exclude='deployment' \
              --exclude='.env' \
              --exclude='README*.md' \
              --exclude='.vercelignore' \
              --exclude='vercel.json' \
              ../. crm-twilio-deploy/
    
    print_status "Deployment package created"
}

# Create domain-specific configuration files
create_domain_configs() {
    echo -e "${BLUE}⚙️  Creating domain-specific configurations...${NC}"
    
    # Create Nginx configuration
    cat > crm-twilio-deploy/nginx-crm.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Main application proxy
    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # API routes with longer timeout
    location /api/ {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        access_log off;
    }
}
EOF

    # Create domain-specific PM2 ecosystem
    cat > crm-twilio-deploy/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'crm-twilio',
    script: 'backend/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT},
      DOMAIN: '${DOMAIN}',
      VOICE_WEBHOOK_URL: 'https://${DOMAIN}'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT},
      DOMAIN: '${DOMAIN}',
      VOICE_WEBHOOK_URL: 'https://${DOMAIN}'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000
  }]
};
EOF

    # Create domain-specific environment template
    cat > crm-twilio-deploy/.env.production << EOF
# Production Environment Configuration for ${DOMAIN}

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
AGENT_PHONE_NUMBER=+1987654321

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
NODE_ENV=production
PORT=${APP_PORT}
DOMAIN=${DOMAIN}

# Security Configuration
ALLOWED_ORIGINS=https://${DOMAIN}

# Voice Webhook URL
VOICE_WEBHOOK_URL=https://${DOMAIN}

# Database Configuration
DATABASE_URL=sqlite:./database.sqlite

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/

# Cache Configuration
CACHE_TTL=3600
CACHE_MAX_KEYS=1000
EOF

    print_status "Domain-specific configurations created"
}

# Create SSL setup script
create_ssl_setup() {
    echo -e "${BLUE}🔒 Creating SSL setup script...${NC}"
    
    cat > crm-twilio-deploy/setup-ssl.sh << 'EOF'
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
EOF

    chmod +x crm-twilio-deploy/setup-ssl.sh
    print_status "SSL setup script created"
}

# Create comprehensive setup script
create_setup_script() {
    echo -e "${BLUE}🛠️  Creating comprehensive setup script...${NC}"
    
    cat > crm-twilio-deploy/remote-setup.sh << 'EOF'
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

EOF

    chmod +x crm-twilio-deploy/remote-setup.sh
    print_status "Setup script created"
}

# Create backup script
create_backup_script() {
    echo -e "${BLUE}💾 Creating backup script...${NC}"
    
    cat > crm-twilio-deploy/backup.sh << 'EOF'
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
EOF

    chmod +x crm-twilio-deploy/backup.sh
    print_status "Backup script created"
}

# Create monitoring script
create_monitoring_script() {
    echo -e "${BLUE}📊 Creating monitoring script...${NC}"
    
    cat > crm-twilio-deploy/monitor.sh << 'EOF'
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

EOF

    chmod +x crm-twilio-deploy/monitor.sh
    print_status "Monitoring script created"
}

# Create deployment package
create_deployment_package() {
    echo -e "${BLUE}📦 Creating deployment package...${NC}"
    
    # Create deployment directory
    mkdir -p deployment
    cd deployment
    
    # Clean previous deployment files
    rm -rf crm-twilio-deploy
    mkdir crm-twilio-deploy
    
    # Copy application files (excluding unnecessary files)
    rsync -av --exclude='node_modules'               --exclude='.git'               --exclude='logs'               --exclude='*.log'               --exclude='deployment'               --exclude='.env'               --exclude='README*.md'               --exclude='.vercelignore'               --exclude='vercel.json'               ../. crm-twilio-deploy/
    
    print_status "Deployment package created"
}

# Create final deployment package
create_final_package() {
    echo -e "${BLUE}📦 Creating final deployment package...${NC}"
    
    # Create tarball
    tar -czf crm-twilio-deploy.tar.gz crm-twilio-deploy/
    
    # Get package size
    PACKAGE_SIZE=$(du -h crm-twilio-deploy.tar.gz | cut -f1)
    
    print_status "Deployment package created: crm-twilio-deploy.tar.gz ($PACKAGE_SIZE)"
}

# Main execution
main() {
    check_dependencies
    create_deployment_package
    create_domain_configs
    create_ssl_setup
    create_setup_script
    create_backup_script
    create_monitoring_script
    create_final_package
    
    echo ""
    echo -e "${GREEN}🎉 Deployment package ready for ${DOMAIN}!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Update REMOTE_USER in this script with your SSH username"
    echo "2. Copy the deployment package to your server:"
    echo "   scp deployment/crm-twilio-deploy.tar.gz user@sebastianvernis.com:~/"
    echo ""
    echo "3. SSH into your server and run:"
    echo "   tar -xzf crm-twilio-deploy.tar.gz"
    echo "   cd crm-twilio-deploy"
    echo "   sudo mv . /var/www/Apps/crm-twilio"
    echo "   cd /var/www/Apps/crm-twilio"
    echo "   cp .env.production .env"
    echo "   # Edit .env with your actual credentials"
    echo "   ./remote-setup.sh"
    echo ""
    echo -e "${YELLOW}⚠️  Remember to:${NC}"
    echo "- Update .env with your actual Twilio and Gemini API credentials"
    echo "- Ensure DNS points $DOMAIN to your server IP"
    echo "- Configure your SSH user in the deployment script"
    echo ""
    echo -e "${GREEN}🌐 After deployment, your CRM will be available at: https://${DOMAIN}${NC}"
}

# Run main function
main
