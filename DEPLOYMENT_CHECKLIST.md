# 📋 CHECKLIST DE DESPLIEGUE - CRM EC2

**Proyecto:** CRM Consolidated  
**Fecha:** 3 de diciembre de 2025  
**Servidor Objetivo:** EC2 (8.219.175.183)  
**Estado:** Pre-despliegue

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### Análisis Local Completado

#### 🟢 COMPONENTES VERIFICADOS (PASS)
- ✅ **Estructura de archivos:** Completa y correcta
  - Backend: controllers, middleware, models, routes, services, utils
  - Frontend: index.html y assets
  - Database: init.sql preparado
  
- ✅ **Dependencias Node.js:** Instaladas correctamente
  - Express, Sequelize, MySQL2, Dotenv, JWT
  - Twilio SDK, Gemini AI, bcrypt, helmet, cors
  - Middleware de caché y rate limiting
  
- ✅ **Archivos de configuración:**
  - package.json (raíz y backend)
  - Dockerfile optimizado (multi-stage)
  - docker-compose.yml con MariaDB
  - ecosystem.config.js para PM2
  - Nginx reverse proxy config

- ✅ **Versiones:**
  - Node.js: v25.1.0 (✅ Cumple requisito >=18.0.0)
  - npm: 11.6.2
  - Docker: 28.2.2

### 🟡 COMPONENTES CON CONFIGURACIÓN PENDIENTE

#### Credenciales de Servicios Externos
- ⚠️ **Twilio:** Variables configuradas con placeholders
  - `TWILIO_ACCOUNT_SID`: Necesita credencial real
  - `TWILIO_AUTH_TOKEN`: Necesita credencial real
  - `TWILIO_PHONE_NUMBER`: Necesita número real
  - **Impacto:** Funcionalidad de llamadas spoofing NO funcionará hasta configurar

- ✅ **Gemini AI:** Configurado y listo
  - API Key presente y válido

- ✅ **Base de Datos:** Credenciales configuradas
  - Host: db5018065428.hosting-data.io
  - Database: dbu2025297
  - Usuario configurado

---

## 📊 RESUMEN DE TESTING LOCAL

```
Test 1 - Variables de entorno:         🟡 PARCIAL (Twilio pendiente)
Test 2 - Estructura de archivos:       ✅ PASS
Test 3 - Dependencias Node.js:         ✅ PASS
Test 4 - Conexión a BD:                🟡 PENDIENTE (requiere red EC2)
Test 5 - Inicio del servidor:          🟡 PENDIENTE (requiere Twilio config)
```

**Nota:** Los tests de BD y servidor requieren estar en el entorno de producción o tener las credenciales completas. La estructura base está lista.

---

## 🚀 CHECKLIST DE DESPLIEGUE EN EC2

### FASE 1: Preparación del Servidor EC2

#### 1.1 Acceso y Configuración Inicial
- [ ] Conectar a EC2 vía SSH
  ```bash
  ssh root@8.219.175.183
  ```
- [ ] Actualizar sistema
  ```bash
  sudo yum update -y  # Amazon Linux
  # o
  sudo apt update && sudo apt upgrade -y  # Ubuntu
  ```

#### 1.2 Instalar Dependencias del Sistema
- [ ] Instalar Node.js 18+
  ```bash
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
  sudo yum install -y nodejs
  node --version  # Verificar >=18.0.0
  ```
  
- [ ] Instalar PM2 globalmente
  ```bash
  sudo npm install -g pm2
  pm2 --version
  ```

- [ ] Instalar Git (si no está)
  ```bash
  sudo yum install -y git
  ```

- [ ] Instalar MariaDB/MySQL (si se usará local)
  ```bash
  sudo yum install -y mariadb-server
  sudo systemctl start mariadb
  sudo systemctl enable mariadb
  sudo mysql_secure_installation
  ```

- [ ] Instalar Nginx (reverse proxy)
  ```bash
  sudo yum install -y nginx
  sudo systemctl start nginx
  sudo systemctl enable nginx
  ```

### FASE 2: Configuración de Base de Datos

#### 2.1 Base de Datos Remota (hosting-data.io)
- [x] Credenciales configuradas en .env.production
- [ ] Verificar conectividad desde EC2
  ```bash
  mysql -h db5018065428.hosting-data.io -u dbu2025297 -p -e "SHOW DATABASES;"
  ```
- [ ] Importar esquema (si no existe)
  ```bash
  mysql -h db5018065428.hosting-data.io -u dbu2025297 -p dbu2025297 < database/init.sql
  ```
- [ ] Verificar tablas creadas
  ```bash
  mysql -h db5018065428.hosting-data.io -u dbu2025297 -p -e "USE dbu2025297; SHOW TABLES;"
  ```

#### 2.2 O Base de Datos Local (alternativa)
- [ ] Crear base de datos
  ```sql
  CREATE DATABASE crm_avanza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON crm_avanza.* TO 'crm_user'@'localhost';
  FLUSH PRIVILEGES;
  ```
- [ ] Actualizar .env.production con credenciales locales

### FASE 3: Deployment del Código

#### 3.1 Transferir Archivos
**Opción A: Git Clone (Recomendado)**
- [ ] Clonar repositorio en EC2
  ```bash
  cd /root
  git clone <repository_url> crm-consolidated
  cd crm-consolidated
  git checkout deployment-regeneration
  ```

**Opción B: SFTP/SCP**
- [ ] Usar script `deploy-production.sh` (actualizar credenciales)
  ```bash
  ./deploy-production.sh
  ```

**Opción C: rsync**
- [ ] Sincronizar archivos
  ```bash
  rsync -avz --exclude 'node_modules' --exclude '.git' \
    ./ root@8.219.175.183:/root/crm-consolidated/
  ```

#### 3.2 Configurar Variables de Entorno
- [ ] Copiar template de producción
  ```bash
  cp .env.production .env
  ```
- [ ] **CRÍTICO:** Actualizar credenciales de Twilio (si se usa)
  ```bash
  nano .env
  # Editar:
  # TWILIO_ACCOUNT_SID=<real_sid>
  # TWILIO_AUTH_TOKEN=<real_token>
  # TWILIO_PHONE_NUMBER=<real_number>
  ```
- [ ] Verificar todas las variables
  ```bash
  cat .env | grep -E "(DB_|TWILIO_|GEMINI_|JWT_)"
  ```

#### 3.3 Instalar Dependencias
- [ ] Instalar dependencias de backend
  ```bash
  cd /root/crm-consolidated/backend
  npm install --production
  ```
- [ ] Verificar instalación
  ```bash
  npm list express sequelize mysql2 twilio
  ```

### FASE 4: Inicialización de Base de Datos

- [ ] Ejecutar script automático de setup
  ```bash
  cd /root/crm-consolidated
  chmod +x scripts/setup-database.sh
  DB_FORCE_SYNC=true ./scripts/setup-database.sh
  ```
  **Nota:** Este script:
  - Verifica conectividad a la BD
  - Crea/actualiza todas las tablas con Sequelize
  - Crea usuarios iniciales (Chispadelic, Kimbowimbo, etc.)
  - Valida que todo se creó correctamente

- [ ] Verificar tablas creadas
  ```bash
  mysql -h $DB_HOST -u $DB_USER -p -e "USE $DB_NAME; SHOW TABLES;"
  # Esperado: Users, Contacts, Advisors
  ```

### FASE 5: Testing Pre-Producción

#### 5.1 Test Manual del Servidor
- [ ] Iniciar servidor en modo test
  ```bash
  cd /root/crm-consolidated/backend
  NODE_ENV=production PORT=3001 node server.js
  ```
- [ ] En otra terminal, verificar health endpoint
  ```bash
  curl http://localhost:3001/api/health
  # Esperado: {"status":"ok"}
  ```
- [ ] Verificar logs
  ```bash
  # Debería ver: "Server running on port 3001"
  ```
- [ ] Detener servidor (Ctrl+C)

#### 5.2 Test de Endpoints Críticos
- [ ] Test de autenticación
  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"Admin123!@#"}'
  # Esperado: JWT token
  ```
- [ ] Test de contactos (con token)
  ```bash
  curl http://localhost:3001/api/contacts \
    -H "Authorization: Bearer <token>"
  ```

### FASE 6: Deployment con PM2

#### 6.1 Configurar PM2
- [ ] Verificar ecosystem.config.js existe
  ```bash
  ls -la /root/crm-consolidated/ecosystem.config.js
  ```
- [ ] Iniciar aplicación con PM2
  ```bash
  cd /root/crm-consolidated
  pm2 start ecosystem.config.js
  ```
- [ ] Verificar estado
  ```bash
  pm2 status
  pm2 logs crm-avanza --lines 50
  ```
- [ ] Configurar auto-inicio en boot
  ```bash
  pm2 startup
  # Copiar y ejecutar el comando que muestra
  pm2 save
  ```

#### 6.2 Monitoreo PM2
- [ ] Ver métricas en tiempo real
  ```bash
  pm2 monit
  ```
- [ ] Ver información detallada
  ```bash
  pm2 show crm-avanza
  ```

### FASE 7: Configurar Nginx Reverse Proxy

#### 7.1 Crear Configuración
- [ ] Crear archivo de configuración
  ```bash
  sudo nano /etc/nginx/conf.d/crm-avanza.conf
  ```
- [ ] Pegar configuración desde `nginx/nginx.conf` o usar:
  ```nginx
  server {
      listen 80;
      server_name 8.219.175.183 avanza-server;
      
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
  }
  ```

#### 7.2 Activar Nginx
- [ ] Verificar configuración
  ```bash
  sudo nginx -t
  ```
- [ ] Recargar Nginx
  ```bash
  sudo systemctl reload nginx
  ```
- [ ] Verificar status
  ```bash
  sudo systemctl status nginx
  ```

### FASE 8: Configuración de Firewall/Security Groups

#### 8.1 AWS Security Groups
- [ ] Permitir puerto 22 (SSH) - Tu IP solamente
- [ ] Permitir puerto 80 (HTTP) - 0.0.0.0/0
- [ ] Permitir puerto 443 (HTTPS) - 0.0.0.0/0 (si usas SSL)
- [ ] Puerto 3001 (App) - SOLO localhost (no exponerlo)

#### 8.2 Firewall del Sistema (si aplica)
- [ ] Verificar firewall
  ```bash
  sudo firewall-cmd --list-all
  # o
  sudo ufw status
  ```
- [ ] Permitir puertos necesarios
  ```bash
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
  ```

### FASE 9: SSL/HTTPS (Opcional pero Recomendado)

#### 9.1 Instalar Certbot
- [ ] Instalar certbot
  ```bash
  sudo yum install -y certbot python3-certbot-nginx
  ```

#### 9.2 Obtener Certificado
- [ ] Si tienes dominio, obtener certificado
  ```bash
  sudo certbot --nginx -d tu-dominio.com
  ```
- [ ] Configurar auto-renovación
  ```bash
  sudo certbot renew --dry-run
  ```

### FASE 10: Testing Post-Deployment

#### 10.1 Verificación de Acceso
- [ ] Acceder desde navegador
  ```
  http://8.219.175.183
  ```
- [ ] Verificar página de login carga
- [ ] Probar login con credenciales admin
- [ ] Verificar dashboard carga

#### 10.2 Testing Funcional Automatizado
- [ ] Ejecutar script de verificación
  ```bash
  cd /root/crm-consolidated
  chmod +x scripts/verify-deployment.sh
  ./scripts/verify-deployment.sh
  ```
  **Este script verifica:**
  - PM2 status
  - Puerto 3001 activo
  - Health endpoint respondiendo
  - Base de datos conectada
  - Logs generándose
  - Nginx (si aplica)
  - Uso de recursos

- [ ] Testing Manual (UI)
  - [ ] Login con usuario admin
  - [ ] CRUD de Contactos (crear, listar, editar, eliminar)
  - [ ] CRUD de Asesores (crear, listar, editar, eliminar)
  - [ ] Generar respuesta con Gemini AI
  - [ ] Twilio spoof calling (si configurado)

#### 10.3 Testing de Performance
- [ ] Verificar tiempo de respuesta
  ```bash
  curl -w "@curl-format.txt" -o /dev/null -s http://8.219.175.183/api/health
  ```
- [ ] Monitorear uso de recursos
  ```bash
  pm2 monit
  htop  # o top
  ```

### FASE 11: Monitoreo y Logs

#### 11.1 Configurar Logs
- [ ] Verificar directorio de logs
  ```bash
  ls -la /root/crm-consolidated/backend/logs/
  ```
- [ ] Verificar logs de PM2
  ```bash
  pm2 logs crm-avanza
  ```
- [ ] Verificar logs de Nginx
  ```bash
  sudo tail -f /var/log/nginx/access.log
  sudo tail -f /var/log/nginx/error.log
  ```

#### 11.2 Configurar Alertas (opcional)
- [ ] Configurar PM2 keymetrics (opcional)
  ```bash
  pm2 link <secret> <public>
  ```

### FASE 12: Backup y Recuperación

#### 12.1 Backup de Base de Datos
- [ ] Crear script de backup
  ```bash
  mysqldump -h db5018065428.hosting-data.io -u dbu2025297 -p dbu2025297 > backup_$(date +%Y%m%d).sql
  ```
- [ ] Configurar cron job para backups automáticos
  ```bash
  crontab -e
  # Añadir: 0 2 * * * /root/scripts/backup-db.sh
  ```

#### 12.2 Backup de Código
- [ ] Crear snapshot de EC2 desde AWS Console
- [ ] O configurar backup de código
  ```bash
  tar -czf crm-backup-$(date +%Y%m%d).tar.gz /root/crm-consolidated/
  ```

---

## 🔄 PROCEDIMIENTO DE ACTUALIZACIÓN

### Para Actualizaciones Futuras:

1. **Desde desarrollo (local):**
   ```bash
   cd /home/sebastianvernis/Desarrollo/Vercel/CRM
   git push origin main
   ```

2. **En EC2:**
   ```bash
   cd /root/crm-consolidated
   git pull origin main
   cd backend && npm install --production
   pm2 restart crm-avanza
   ```

3. **Verificar:**
   ```bash
   pm2 logs crm-avanza --lines 50
   curl http://localhost:3001/api/health
   ```

---

## 🆘 TROUBLESHOOTING

### Problemas Comunes

#### Servidor no inicia
```bash
# Ver logs detallados
pm2 logs crm-avanza --err
pm2 logs crm-avanza --out

# Verificar variables de entorno
pm2 env crm-avanza

# Reiniciar forzado
pm2 delete crm-avanza
pm2 start ecosystem.config.js
```

#### Base de datos no conecta
```bash
# Test de conectividad
mysql -h db5018065428.hosting-data.io -u dbu2025297 -p

# Verificar .env
cat /root/crm-consolidated/backend/.env | grep DB_

# Ver logs de DB
pm2 logs crm-avanza | grep -i "database\|mysql\|sequelize"
```

#### Puerto 3001 ocupado
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3001

# Matar proceso
sudo kill -9 <PID>

# O detener PM2
pm2 stop crm-avanza
```

#### Nginx no sirve la aplicación
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### Errores de permisos
```bash
# Ajustar permisos de logs
chown -R $USER:$USER /root/crm-consolidated/backend/logs/
chmod -R 755 /root/crm-consolidated/backend/logs/
```

---

## 📊 MÉTRICAS DE ÉXITO

### Criterios de Aceptación del Deployment:

- ✅ Servidor responde en http://8.219.175.183
- ✅ Health endpoint retorna 200: http://8.219.175.183/api/health
- ✅ Login funciona correctamente
- ✅ CRUD de contactos operativo
- ✅ CRUD de asesores operativo
- ✅ Gemini AI responde (si configurado)
- ✅ Twilio realiza llamadas (si configurado)
- ✅ PM2 mantiene el proceso vivo
- ✅ Nginx sirve el sitio correctamente
- ✅ Logs se generan sin errores críticos

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

- [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md) - Guía detallada EC2
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía general
- [README.md](README.md) - Documentación del proyecto
- [MANUAL_DE_USO.md](MANUAL_DE_USO.md) - Manual de usuario

---

## 📝 NOTAS FINALES

### Configuraciones Pendientes para Funcionalidad Completa:

1. **Twilio Spoof Calling:**
   - Obtener Account SID y Auth Token de Twilio
   - Comprar número de teléfono Twilio
   - Configurar webhook público (puede requerir dominio)
   - Actualizar variables en .env.production

2. **SSL/HTTPS (Producción):**
   - Registrar dominio (opcional)
   - Configurar DNS apuntando a IP EC2
   - Instalar certificado Let's Encrypt
   - Actualizar CORS_ORIGIN en .env

3. **Monitoreo Avanzado (opcional):**
   - Integrar PM2 Keymetrics
   - Configurar alertas de uptime
   - Implementar logging centralizado

### Siguientes Pasos Recomendados:

1. Completar deployment base (Fases 1-10)
2. Verificar funcionalidad core (sin Twilio)
3. Configurar Twilio si se requiere funcionalidad de llamadas
4. Implementar SSL/HTTPS para producción
5. Configurar backups automáticos
6. Documentar credenciales en lugar seguro

---

**Estado Actual:** ✅ LISTO PARA DEPLOYMENT BASE  
**Fecha de Actualización:** 3 de diciembre de 2025  
**Próxima Revisión:** Post-deployment en EC2
