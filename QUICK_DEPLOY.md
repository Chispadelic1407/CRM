# 🚀 Guía de Despliegue Rápido - CRM EC2

**Servidor:** 8.219.175.183  
**Tiempo estimado:** 15-20 minutos

---

## ⚡ Deployment en 3 Pasos

### Paso 1: Preparar archivos localmente

```bash
cd /home/sebastianvernis/Desarrollo/EC2/crm-consolidated

# Verificar que .env.production esté configurado
cat .env.production | grep -E "(DB_|PORT|JWT)"

# Ejecutar script de deployment
./deploy-production.sh
```

**Lo que hace automáticamente:**
- ✅ Empaqueta el código
- ✅ Sube archivos vía SFTP
- ✅ Instala dependencias en servidor
- ✅ Configura base de datos (tablas + usuarios)
- ✅ Inicia aplicación con PM2
- ✅ Verifica que todo funcione

---

### Paso 2: Verificar deployment (automático en el script)

El script ya ejecuta estas verificaciones, pero puedes ejecutarlas manualmente:

```bash
ssh root@8.219.175.183

# Verificar aplicación corriendo
pm2 status

# Ver logs
pm2 logs crm-avanza --lines 20

# Verificar health endpoint
curl http://localhost:3001/api/health

# Ejecutar verificación completa
cd /root/crm-consolidated
./scripts/verify-deployment.sh
```

---

### Paso 3: Configurar Nginx (opcional - primera vez)

```bash
# En el servidor EC2
ssh root@8.219.175.183

# Crear configuración de Nginx
sudo tee /etc/nginx/conf.d/crm-avanza.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name 8.219.175.183;
    
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
EOF

# Verificar y recargar Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Verificación Final

1. **Abrir en navegador:** http://8.219.175.183
2. **Login con usuario admin:**
   - Username: `Chispadelic`
   - Password: `Svernis1`
3. **Verificar funcionalidades:**
   - Dashboard carga
   - Crear/editar contactos
   - Generar respuesta con IA

---

## 🔄 Actualizaciones Futuras

Para actualizar el código después del deployment inicial:

```bash
# Localmente
cd /home/sebastianvernis/Desarrollo/EC2/crm-consolidated
./deploy-production.sh
```

El script detectará que ya existe y solo actualizará los archivos necesarios.

---

## 🆘 Si algo falla

### Problema: Script de deployment falla en SFTP
```bash
# Verificar conectividad SSH
ssh root@8.219.175.183

# Si funciona SSH, el problema es de permisos
# Revisar que el usuario root pueda escribir en /root/crm-consolidated
```

### Problema: Aplicación no inicia
```bash
ssh root@8.219.175.183
pm2 logs crm-avanza --err --lines 50

# Revisar variables de entorno
cat /root/crm-consolidated/.env

# Reiniciar manualmente
cd /root/crm-consolidated
pm2 restart crm-avanza
```

### Problema: Base de datos no conecta
```bash
ssh root@8.219.175.183
cd /root/crm-consolidated

# Verificar variables
cat .env | grep DB_

# Test de conexión manual
mysql -h $DB_HOST -u $DB_USER -p

# Re-ejecutar setup de BD
DB_FORCE_SYNC=true ./scripts/setup-database.sh
```

### Problema: Puerto 3001 ya en uso
```bash
ssh root@8.219.175.183

# Ver qué proceso usa el puerto
sudo lsof -i :3001

# Detener PM2 y reiniciar
pm2 stop crm-avanza
pm2 start ecosystem.config.js
```

---

## 📊 Monitoreo Post-Deployment

```bash
# Status de PM2
pm2 status

# Logs en tiempo real
pm2 logs crm-avanza

# Monitoreo de recursos
pm2 monit

# Información detallada
pm2 show crm-avanza

# Reiniciar si es necesario
pm2 restart crm-avanza
```

---

## 🔒 Seguridad Post-Deployment

1. **Configurar firewall:**
   ```bash
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

2. **Configurar SSL (Let's Encrypt):**
   ```bash
   sudo yum install -y certbot python3-certbot-nginx
   # Si tienes dominio:
   sudo certbot --nginx -d tu-dominio.com
   ```

3. **Cambiar passwords por defecto:**
   - Acceder a la aplicación
   - Ir a configuración de usuarios
   - Cambiar passwords de todos los usuarios por defecto

---

## 📚 Documentación Completa

Para más detalles, consultar:
- **DEPLOYMENT_CHECKLIST.md** - Checklist completo paso a paso (601 líneas)
- **TESTING_REPORT.md** - Análisis técnico del proyecto (723 líneas)
- **EC2_DEPLOYMENT.md** - Guía detallada de EC2

---

**¡Listo para deployment!** Ejecuta `./deploy-production.sh` y en 15-20 minutos tendrás el CRM funcionando.
