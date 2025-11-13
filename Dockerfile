# Dockerfile para el CRM - Despliegue Containerizado
# Multi-stage build para optimización

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY backend/package*.json ./backend/
COPY frontend/ ./frontend/

# Instalar dependencias de producción
WORKDIR /app/backend
RUN npm ci --only=production --silent

# Stage 2: Runtime
FROM node:18-alpine AS runtime

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S crm -u 1001

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copiar archivos desde builder
COPY --from=builder /app/backend/ ./backend/
COPY --from=builder /app/frontend/ ./frontend/
COPY --chown=crm:nodejs backend/server.js ./backend/
COPY --chown=crm:nodejs backend/controllers/ ./backend/controllers/
COPY --chown=crm:nodejs backend/middleware/ ./backend/middleware/
COPY --chown=crm:nodejs backend/models/ ./backend/models/
COPY --chown=crm:nodejs backend/routes/ ./backend/routes/
COPY --chown=crm:nodejs backend/services/ ./backend/services/
COPY --chown=crm:nodejs backend/utils/ ./backend/utils/

# Crear directorio de logs
RUN mkdir -p /app/logs && chown -R crm:nodejs /app/logs

# Cambiar al usuario no-root
USER crm

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Usar dumb-init como PID 1 para mejor manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
WORKDIR /app/backend
CMD ["node", "server.js"]
