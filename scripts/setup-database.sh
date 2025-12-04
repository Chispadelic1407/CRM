#!/bin/bash

# Script de configuración de base de datos para deployment
# Crea la base de datos, tablas y usuarios iniciales

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Configuración de Base de Datos ===${NC}\n"

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Variables de entorno cargadas"
else
    echo -e "${RED}✗${NC} Archivo .env no encontrado"
    exit 1
fi

# Verificar variables requeridas
REQUIRED_VARS=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗${NC} Variable $var no configurada"
        exit 1
    fi
done

echo -e "${GREEN}✓${NC} Variables de base de datos verificadas"

# Test de conectividad
echo -e "\n${YELLOW}Probando conectividad a base de datos...${NC}"
if command -v mysql &> /dev/null; then
    if mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} Conexión a base de datos exitosa"
    else
        echo -e "${RED}✗${NC} No se pudo conectar a la base de datos"
        echo -e "${YELLOW}Intentando crear base de datos...${NC}"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cliente MySQL no instalado, saltando test de conexión"
fi

# Ejecutar script de inicialización de Node.js
echo -e "\n${YELLOW}Inicializando base de datos con Sequelize...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Instalando dependencias de Node.js..."
    npm install --production --silent
fi

# Ejecutar script de inicialización
echo -e "${YELLOW}Creando tablas y usuarios iniciales...${NC}"
node init-database.js

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Base de datos configurada correctamente${NC}"
    echo -e "${GREEN}✓ Tablas creadas${NC}"
    echo -e "${GREEN}✓ Usuarios iniciales creados${NC}"
    echo -e "\n${GREEN}=== Configuración completada ===${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Error en la configuración de la base de datos${NC}"
    exit 1
fi
