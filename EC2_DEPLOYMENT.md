# 🚀 CRM - EC2 Deployment Guide

**Última Actualización:** 30/11/2025  
**Alias:** avanza-server  
**Ubicación:** `/home/sebastianvernis/Desarrollo/EC2/crm-consolidated`

---

## 📋 Estado Actual

✅ **Sincronizado desde:** `/home/sebastianvernis/Desarrollo/Vercel/CRM`  
✅ **Commit:** 1b5d470 (Ultima)  
✅ **Archivos excluidos:** node_modules, .git, backend/logs, .env, .env.production

---

## 🎯 Configuración para EC2

### Variables de Entorno (.env)

Crear archivo `.env` en la raíz del proyecto con:

```bash
# Database (MariaDB/MySQL en EC2)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_avanza
DB_USER=crm_user
DB_PASSWORD=<strong_password>

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=<generate_strong_secret>
BCRYPT_SALT_ROUNDS=10

# Twilio
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>
AGENT_PHONE_NUMBER=<agent_phone>

# Google Gemini AI
GEMINI_API_KEY=<your_gemini_key>

# CORS
CORS_ORIGIN=http://localhost:3001,http://<EC2_PUBLIC_IP>:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache (opcional con Redis)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

---

## 🛠️ Instalación en EC2

### 1. Requisitos Previos

```bash
# Actualizar sistema
sudo yum update -y  # Amazon Linux
# o
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Instalar Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar MariaDB/MySQL
sudo yum install -y mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```

### 2. Configurar Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Crear base de datos y usuario
CREATE DATABASE crm_avanza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '<strong_password>';
GRANT ALL PRIVILEGES ON crm_avanza.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar esquema inicial
cd /home/sebastianvernis/Desarrollo/EC2/crm-consolidated
mysql -u crm_user -p crm_avanza < database/init.sql
```

### 3. Instalar Dependencias

```bash
cd /home/sebastianvernis/Desarrollo/EC2/crm-consolidated/backend
npm install --production

# Verificar instalación
npm list
```

### 4. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar con credenciales reales
nano .env
```

### 5. Probar Localmente

```bash
# Inicializar base de datos
node backend/init-database.js

# Iniciar servidor en modo desarrollo
npm run dev

# O modo producción
npm start

# Verificar
curl http://localhost:3001/api/health
```

---

## 🚀 Deployment con PM2

### Archivo ecosystem.config.js

Crear en la raíz del proyecto:

```javascript
module.exports = {
  apps: [{
    name: 'crm-avanza',
    script: './backend/server.js',
    cwd: '/home/sebastianvernis/Desarrollo/EC2/crm-consolidated',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './backend/logs/err.log',
    out_file: './backend/logs/out.log',
    log_file: './backend/logs/combined.log',
    time: true
  }]
}
```

### Comandos PM2

```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs crm-avanza

# Reiniciar
pm2 restart crm-avanza

# Detener
pm2 stop crm-avanza

# Auto-inicio en boot
pm2 startup
pm2 save
```

---

## 🌐 Configurar Nginx como Reverse Proxy

### Instalar Nginx

```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configuración Nginx

Crear `/etc/nginx/conf.d/crm-avanza.conf`:

```nginx
server {
    listen 80;
    server_name avanza-server <EC2_PUBLIC_IP>;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Verificar configuración
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

---

## 🔒 Seguridad

### Firewall (Security Groups en EC2)

```bash
# Permitir puertos necesarios
- SSH: 22
- HTTP: 80
- HTTPS: 443 (si configuras SSL)
- App (interno): 3001 (solo localhost)
```

### SSL con Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo yum install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d avanza-server.example.com

# Auto-renovación
sudo certbot renew --dry-run
```

---

## 📊 Monitoreo

### Logs

```bash
# PM2 logs
pm2 logs crm-avanza

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f backend/logs/combined.log
```

### Métricas PM2

```bash
# Monitoreo en tiempo real
pm2 monit

# Información detallada
pm2 show crm-avanza
```

---

## 🔄 Actualización

```bash
# Desde directorio Vercel/CRM (desarrollo)
cd /home/sebastianvernis/Desarrollo/Vercel/CRM

# Sincronizar cambios a EC2
rsync -av --delete ./ /home/sebastianvernis/Desarrollo/EC2/crm-consolidated/ \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'backend/logs' \
  --exclude '.env' \
  --exclude '.env.production' \
  --exclude 'crm-twilio-deployment.tar.gz'

# Reiniciar aplicación
cd /home/sebastianvernis/Desarrollo/EC2/crm-consolidated
pm2 restart crm-avanza
```

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3001/api/health
```

### API Endpoints

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Contacts
curl http://localhost:3001/api/contacts

# Advisors
curl http://localhost:3001/api/advisors
```

---

## 🆘 Troubleshooting

### Base de datos no conecta

```bash
# Verificar MariaDB corriendo
sudo systemctl status mariadb

# Verificar credenciales
mysql -u crm_user -p crm_avanza

# Revisar logs
tail -f backend/logs/err.log
```

### Puerto 3001 ocupado

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3001

# Matar proceso
sudo kill -9 <PID>
```

### PM2 no inicia

```bash
# Ver logs de error
pm2 logs crm-avanza --err

# Reiniciar PM2
pm2 kill
pm2 start ecosystem.config.js
```

---

## 📚 Documentación Adicional

- [README.md](README.md) - Información completa del proyecto
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía de deployment SSH/SFTP
- [MANUAL_DE_USO.md](MANUAL_DE_USO.md) - Manual de usuario en español
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Resumen de deployment

---

**Proyecto:** CRM con Gemini AI + Twilio  
**Alias:** avanza-server  
**Stack:** Node.js + Express + Sequelize + MariaDB + Gemini AI + Twilio
