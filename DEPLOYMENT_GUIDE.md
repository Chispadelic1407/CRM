# 🚀 Guía de Despliegue del CRM - Múltiples Opciones

Esta guía presenta diferentes opciones para desplegar el sistema CRM según tus necesidades y preferencias.

## 📋 Opciones de Despliegue Disponibles

### 1. **SSH/rsync (Tradicional)** ✅ *Existente*
- **Script:** `deploy-production.sh`
- **Descripción:** Despliegue directo a servidor via SSH con rsync
- **Ideal para:** Servidores dedicados/VPS con acceso SSH

### 2. **Docker Compose** 🆕 *Nuevo*
- **Script:** `deploy-docker.sh`
- **Descripción:** Despliegue containerizado con Docker
- **Ideal para:** Cualquier servidor con Docker instalado

### 3. **Desarrollo Local** 🆕 *Nuevo*
- **Script:** `dev.sh`
- **Descripción:** Servidor de desarrollo con hot-reload
- **Ideal para:** Desarrollo y testing local

---

## 🛠️ Opción 1: Despliegue SSH/rsync (Existente)

### Requisitos
- Servidor con Node.js (18+) y npm
- Acceso SSH al servidor
- PM2 instalado en el servidor (opcional pero recomendado)

### Configuración
1. **Configura `.env.production`:**
```bash
cp .env.example .env.production
# Edita .env.production con tus valores de producción
```

2. **Ejecuta el despliegue:**
```bash
./deploy-production.sh [usuario@servidor] [ruta_remota]
```

### Características
- ✅ Usa rsync para transferencia eficiente
- ✅ Instala dependencias en el servidor
- ✅ Reinicia la aplicación automáticamente
- ✅ Verificación de salud post-despliegue

---

## 🐳 Opción 2: Despliegue con Docker (Nuevo)

### Requisitos
- Docker y Docker Compose instalados
- Al menos 2GB RAM disponible
- Puertos 80, 3001, 3306 disponibles

### Configuración
1. **Configura variables de entorno:**
```bash
cp .env.docker.example .env.docker
# Edita .env.docker con tus valores
```

2. **Ejecuta el despliegue:**
```bash
# Desarrollo
./deploy-docker.sh development

# Producción (incluye Nginx)
./deploy-docker.sh production
```

### Servicios Incluidos

#### Servicios Base
- **crm_app:** Aplicación principal (Node.js)
- **database:** MariaDB 11 con persistencia
- **nginx:** Proxy reverso con SSL (perfil production)

#### Servicios Opcionales
- **adminer:** Interfaz web para administrar BD
```bash
docker-compose --env-file=.env.docker --profile with-adminer up -d
```

### Comandos Útiles
```bash
# Ver logs
docker-compose --env-file=.env.docker logs -f

# Detener servicios
docker-compose --env-file=.env.docker down

# Reiniciar servicios
docker-compose --env-file=.env.docker restart

# Acceder a contenedor
docker-compose --env-file=.env.docker exec crm_app sh

# Ver estado de servicios
docker-compose --env-file=.env.docker ps
```

### URLs de Acceso
- **Desarrollo:** http://localhost:3001
- **Producción:** http://localhost (Puerto 80 via Nginx)
- **Adminer:** http://localhost:8080 (si está habilitado)

---

## 💻 Opción 3: Desarrollo Local (Nuevo)

### Requisitos
- Node.js 18+ y npm
- Base de datos local (opcional, usa SQLite por defecto)

### Configuración
1. **Configura el entorno:**
```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tu configuración local
```

2. **Inicia el servidor de desarrollo:**
```bash
./dev.sh
```

### Características
- ✅ Hot-reload automático con nodemon
- ✅ Instala dependencias automáticamente
- ✅ Frontend y backend en el mismo puerto
- ✅ Verificación automática de configuración

---

## 🔧 Configuración de Variables de Entorno

### Variables Críticas (Todas las opciones)
```env
# Seguridad
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro
BCRYPT_SALT_ROUNDS=12

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_production
DB_USER=crm_user
DB_PASSWORD=password_seguro
DB_DIALECT=mysql

# Servidor
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://tu-dominio.com
```

### Variables Opcionales
```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Gemini AI
GEMINI_API_KEY=xxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📊 Comparación de Opciones

| Característica | SSH/rsync | Docker | Desarrollo |
|----------------|-----------|---------|------------|
| **Facilidad de setup** | Media | Alta | Alta |
| **Aislamiento** | Bajo | Alto | Bajo |
| **Recursos requeridos** | Bajos | Medios | Bajos |
| **Escalabilidad** | Media | Alta | Baja |
| **Hot-reload** | No | No | Sí |
| **Base de datos incluida** | No | Sí | SQLite |
| **Proxy reverso** | No | Sí | No |
| **SSL/TLS** | Manual | Configurable | No |

---

## 🛡️ Consideraciones de Seguridad

### Para Producción (Todas las opciones)
1. **Cambia todas las contraseñas por defecto**
2. **Usa JWT_SECRET fuerte y único**
3. **Configura CORS_ORIGIN específicamente**
4. **Habilita HTTPS/SSL**
5. **Actualiza regularmente las dependencias**

### Específico para Docker
1. **No uses contraseñas débiles en .env.docker**
2. **Considera usar Docker secrets para datos sensibles**
3. **Mantén las imágenes actualizadas**

---

## 🔍 Verificación Post-Despliegue

### Health Checks
```bash
# Verificar aplicación
curl -f http://tu-servidor:3001/api/health

# Verificar base de datos (Docker)
docker-compose --env-file=.env.docker exec database mysql -u root -p -e "SHOW DATABASES;"
```

### Logs
```bash
# SSH/rsync
tail -f /ruta/del/proyecto/logs/app.log

# Docker
docker-compose --env-file=.env.docker logs -f crm_app

# Desarrollo
# Logs en la consola donde ejecutaste dev.sh
```

### Setup Inicial
1. **Accede a la aplicación**
2. **Crea el primer Super Administrador** (si es instalación nueva)
3. **Verifica funcionalidades básicas**

---

## 🚨 Resolución de Problemas

### Problemas Comunes

#### "Cannot connect to database"
- Verifica credenciales en archivo de entorno
- Asegúrate que la BD esté corriendo
- Revisa logs de la aplicación

#### "Port already in use"
- Cambia el puerto en variables de entorno
- Detén otros servicios en el mismo puerto
- Para Docker: `docker-compose down` y reinicia

#### "Permission denied"
- Dale permisos de ejecución a los scripts: `chmod +x *.sh`
- Para Docker: verifica que Docker daemon esté corriendo

### Obtener Ayuda
- Revisa los logs detallados
- Verifica la configuración de variables de entorno
- Comprueba que todos los servicios estén corriendo

---

## 🎯 Recomendaciones por Caso de Uso

### 🏢 Producción Empresarial
**Recomendado:** Docker Compose
- Aislamiento y seguridad
- Fácil escalabilidad
- Backup automatizable

### 🖥️ Servidor Dedicado Simple
**Recomendado:** SSH/rsync
- Control directo del servidor
- Menor overhead
- Configuración familiar

### 💻 Desarrollo y Testing
**Recomendado:** Desarrollo Local
- Iteración rápida
- Sin complejidad de contenedores
- Hot-reload automático

---

**¿Necesitas ayuda específica con alguna opción?** Revisa los archivos de documentación específicos o contacta al equipo de desarrollo.
