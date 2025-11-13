#!/bin/bash

# Script para desarrollo local con hot-reload
# Uso: ./dev.sh

set -e

# Configuración
ENV_FILE=".env"
BACKEND_DIR="backend"
FRONTEND_PORT="8080"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[DEV]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "🛠️  Iniciando entorno de desarrollo..."

# Verificaciones
if [ ! -d "${BACKEND_DIR}" ]; then
    print_error "Directorio backend/ no encontrado"
    exit 1
fi

if [ ! -f "${BACKEND_DIR}/.env" ]; then
    if [ -f "${BACKEND_DIR}/.env.example" ]; then
        print_warning "Copiando .env.example a .env"
        cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
        print_warning "⚠️  Edita ${BACKEND_DIR}/.env con tu configuración antes de continuar"
        print_warning "Presiona Enter cuando hayas terminado..."
        read
    else
        print_error "No se encontró .env ni .env.example en ${BACKEND_DIR}/"
        exit 1
    fi
fi

# Instalar dependencias si es necesario
print_status "📦 Verificando dependencias del backend..."
cd "${BACKEND_DIR}"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    print_status "Instalando dependencias..."
    npm install
fi

# Verificar si nodemon está instalado
if ! npm list nodemon --depth=0 >/dev/null 2>&1; then
    print_warning "nodemon no encontrado, instalando como dependencia de desarrollo..."
    npm install --save-dev nodemon
fi

# Iniciar el servidor backend con nodemon
print_status "🚀 Iniciando servidor backend con hot-reload..."
print_status "Backend corriendo en: http://localhost:3001"
print_status "Frontend servido desde: http://localhost:3001"
print_status ""
print_status "📝 Para detener el servidor, presiona Ctrl+C"
print_status ""

# Iniciar con nodemon
npm run dev
