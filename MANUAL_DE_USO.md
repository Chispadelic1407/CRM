# Manual de Uso - Sistema CRM con Integración Twilio

## Índice
1. [Introducción](#introducción)
2. [Características Principales](#características-principales)
3. [Acceso al Sistema](#acceso-al-sistema)
4. [Interfaz de Usuario](#interfaz-de-usuario)
5. [Gestión de Contactos](#gestión-de-contactos)
6. [Sistema de Llamadas](#sistema-de-llamadas)
7. [Gestión de Asesores](#gestión-de-asesores)
8. [Análisis con IA](#análisis-con-ia)
9. [Configuración](#configuración)
10. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

El Sistema CRM con Integración Twilio es una plataforma avanzada diseñada para gestionar contactos, realizar llamadas automatizadas y optimizar las operaciones de ventas mediante inteligencia artificial.

### Tecnologías Utilizadas
- **Backend**: Node.js con Express
- **Base de Datos**: MariaDB
- **Servicios**: Twilio (SMS/Llamadas), Google Gemini AI
- **Frontend**: HTML5, CSS3, JavaScript

---

## Características Principales

### 🔧 Funcionalidades Core
- **Gestión de Contactos**: CRUD completo con validación automática
- **Sistema de Llamadas**: Integración completa con Twilio
- **Spoof Calling**: Capacidad de realizar llamadas con números personalizados
- **Análisis de IA**: Evaluación automática de calidad de contactos
- **Gestión de Asesores**: Asignación automática y seguimiento de rendimiento
- **Autenticación**: Sistema seguro de usuarios con roles

### 🚀 Características Avanzadas
- **Cache Inteligente**: Optimización de rendimiento
- **Rate Limiting**: Protección contra abuso
- **Logging Avanzado**: Monitoreo completo del sistema
- **Validación de Teléfonos**: Verificación automática de números
- **Distribución Automática**: Asignación inteligente de contactos

---

## Acceso al Sistema

### URL de Acceso
```
https://access-5018020518.webspace-host.com:3001
```

### Usuarios Predeterminados

#### Administradores
| Usuario | Contraseña | Rol |
|---------|------------|-----|
| Chispadelic | Svernis1 | admin |
| Kimbowimbo | c0razonK | admin |

#### Asesores
| Usuario | Contraseña | Rol |
|---------|------------|-----|
| Rafurioso | Miau1234* | asesor |
| Wero | Miau1234* | asesor |

---

## Configuración

### Variables de Entorno

#### Configuración de Twilio
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
AGENT_PHONE_NUMBER=+525613714594
```

#### Configuración de IA
```env
GEMINI_API_KEY=your_gemini_api_key
```

#### Base de Datos
```env
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

---

## Despliegue en Producción

### Preparación
1. Crear archivo `.env.production` con credenciales reales
2. Configurar acceso SSH al servidor
3. Ejecutar script de despliegue

### Comando de Despliegue
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

### Verificación
- Verificar que la aplicación esté ejecutándose
- Comprobar logs en `/home/a951193/crm-twilio/logs/`
- Acceder a la URL de producción

---

*Última actualización: Diciembre 2024*
*Versión del manual: 3.0*
