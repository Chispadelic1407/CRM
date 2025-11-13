#!/bin/bash

# Script de despliegue con Docker Compose
# Uso: ./deploy-docker.sh [ambiente]
# Ambientes: development, production

set -e

# Configuración
ENVIRONMENT="${1:-development}"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.docker"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "🐳 Iniciando despliegue Docker para ambiente: ${ENVIRONMENT}"

# Verificaciones previas
if [ ! -f "${ENV_FILE}" ]; then
    print_error "Archivo ${ENV_FILE} no encontrado."
    print_error "Copia ${ENV_FILE}.example a ${ENV_FILE} y configura las variables."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está disponible."
    exit 1
fi

# Determinar comando de compose
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

print_status "📦 Deteniendo contenedores existentes..."
$COMPOSE_CMD --env-file="${ENV_FILE}" down

print_status "🔨 Construyendo imágenes..."
$COMPOSE_CMD --env-file="${ENV_FILE}" build --no-cache

if [ "${ENVIRONMENT}" = "production" ]; then
    print_status "🚀 Iniciando servicios de producción..."
    $COMPOSE_CMD --env-file="${ENV_FILE}" --profile with-proxy up -d
else
    print_status "🛠️  Iniciando servicios de desarrollo..."
    $COMPOSE_CMD --env-file="${ENV_FILE}" up -d
fi

# Esperar a que los servicios estén listos
print_status "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
print_status "📊 Estado de los contenedores:"
$COMPOSE_CMD --env-file="${ENV_FILE}" ps

# Verificar health checks
print_status "🔍 Verificando salud de los servicios..."
for i in {1..30}; do
    if $COMPOSE_CMD --env-file="${ENV_FILE}" exec -T crm_app wget --quiet --tries=1 --spider http://localhost:3001/api/health; then
        print_status "✅ Aplicación CRM está corriendo correctamente"
        break
    elif [ $i -eq 30 ]; then
        print_error "❌ La aplicación no responde después de 30 intentos"
        print_status "📋 Logs de la aplicación:"
        $COMPOSE_CMD --env-file="${ENV_FILE}" logs crm_app
        exit 1
    else
        print_warning "Intento $i/30: Esperando que la aplicación esté lista..."
        sleep 2
    fi
done

print_status "🎉 Despliegue completado exitosamente!"
print_status "🌐 La aplicación está disponible en:"
if [ "${ENVIRONMENT}" = "production" ]; then
    print_status "   - HTTP: http://localhost"
    print_status "   - HTTPS: https://localhost (si está configurado)"
else
    print_status "   - http://localhost:3001"
fi

print_status "🔧 Comandos útiles:"
print_status "   - Ver logs: $COMPOSE_CMD --env-file=${ENV_FILE} logs -f"
print_status "   - Detener: $COMPOSE_CMD --env-file=${ENV_FILE} down"
print_status "   - Reiniciar: $COMPOSE_CMD --env-file=${ENV_FILE} restart"

if [ "${ENVIRONMENT}" = "development" ]; then
    print_status "   - Adminer (DB): http://localhost:8080 (usar profile: --profile with-adminer)"
fi
