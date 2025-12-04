#!/bin/bash

# Script de verificación post-deployment
# Verifica que todos los componentes estén funcionando correctamente

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Verificación de Deployment ===${NC}\n"

# 1. Verificar PM2
echo -e "${YELLOW}1. Verificando PM2...${NC}"
if pm2 list | grep -q "crm-avanza.*online"; then
    echo -e "${GREEN}✓${NC} PM2 está ejecutando la aplicación"
    pm2 list | grep crm-avanza
else
    echo -e "${RED}✗${NC} La aplicación no está corriendo en PM2"
    exit 1
fi

# 2. Verificar puerto
echo -e "\n${YELLOW}2. Verificando puerto 3001...${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":3001" || ss -tlnp 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}✓${NC} Puerto 3001 está en uso (aplicación escuchando)"
else
    echo -e "${RED}✗${NC} Puerto 3001 no está en uso"
    exit 1
fi

# 3. Verificar health endpoint
echo -e "\n${YELLOW}3. Verificando health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Health endpoint respondió: 200 OK"
    curl -s http://localhost:3001/api/health | head -3
else
    echo -e "${RED}✗${NC} Health endpoint respondió: $HEALTH_RESPONSE"
    exit 1
fi

# 4. Verificar base de datos
echo -e "\n${YELLOW}4. Verificando conexión a base de datos...${NC}"
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    if mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | grep -q "Users"; then
        echo -e "${GREEN}✓${NC} Base de datos conectada y tablas creadas"
        TABLE_COUNT=$(mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | wc -l)
        echo -e "  Tablas encontradas: $((TABLE_COUNT - 1))"
    else
        echo -e "${RED}✗${NC} Base de datos no accesible o tablas no creadas"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} No se puede verificar BD (archivo .env no encontrado)"
fi

# 5. Verificar logs
echo -e "\n${YELLOW}5. Verificando logs...${NC}"
if [ -d "backend/logs" ]; then
    LOG_FILES=$(ls -1 backend/logs/*.log 2>/dev/null | wc -l)
    if [ "$LOG_FILES" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Archivos de logs encontrados: $LOG_FILES"
        echo -e "  Últimas líneas del log:"
        tail -3 backend/logs/pm2-combined.log 2>/dev/null || tail -3 backend/logs/*.log 2>/dev/null | head -3
    else
        echo -e "${YELLOW}⚠${NC} No se encontraron archivos de logs"
    fi
else
    echo -e "${YELLOW}⚠${NC} Directorio de logs no existe"
fi

# 6. Verificar Nginx (si está configurado)
echo -e "\n${YELLOW}6. Verificando Nginx...${NC}"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Nginx está corriendo"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓${NC} Nginx está sirviendo contenido"
    else
        echo -e "${YELLOW}⚠${NC} Nginx corriendo pero no responde correctamente"
    fi
else
    echo -e "${YELLOW}⚠${NC} Nginx no está corriendo (puede ser opcional)"
fi

# 7. Verificar memoria y CPU
echo -e "\n${YELLOW}7. Verificando recursos del sistema...${NC}"
MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')
echo -e "  Memoria en uso: $MEMORY_USAGE"

CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')
echo -e "  CPU en uso: $CPU_USAGE"

# Resumen final
echo -e "\n${GREEN}=== Verificación Completada ===${NC}"
echo -e "${GREEN}✓ Todos los componentes críticos están funcionando${NC}\n"

echo -e "Información de deployment:"
echo -e "  • URL: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo -e "  • Health: http://localhost:3001/api/health"
echo -e "  • PM2 Status: pm2 status"
echo -e "  • Logs: pm2 logs crm-avanza"

exit 0
