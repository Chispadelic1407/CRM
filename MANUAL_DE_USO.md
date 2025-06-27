# Manual de Uso - Sistema CRM con Integración Twilio y Gemini AI

## Índice
1. [Introducción](#introducción)
2. [Características Principales](#características-principales)
3. [Acceso al Sistema](#acceso-al-sistema)
4. [Interfaz de Usuario](#interfaz-de-usuario)
5. [Gestión de Contactos](#gestión-de-contactos)
   - [Análisis de Calidad del Contacto](#análisis-de-calidad-del-contacto)
6. [Sistema de Llamadas y SMS](#sistema-de-llamadas-y-sms)
7. [Gestión de Asesores](#gestión-de-asesores)
   - [Distribución Inteligente de Contactos](#distribución-inteligente-de-contactos)
8. [Configuración Avanzada](#configuración-avanzada)
9. [Despliegue y Mantenimiento](#despliegue-y-mantenimiento)
10. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

El Sistema CRM con Integración Twilio y Gemini AI es una plataforma de vanguardia para la gestión de relaciones con clientes. Optimiza las operaciones de ventas y atención mediante el uso de inteligencia artificial para el análisis de contactos, la automatización de comunicaciones y la asignación eficiente de tareas a asesores.

### Tecnologías Utilizadas
- **Backend**: Node.js con Express.js
- **Base de Datos**: MariaDB (o MySQL compatible)
- **Servicios de Comunicación**: Twilio (SMS/Voz)
- **Inteligencia Artificial**: Google Gemini AI para análisis y scoring.
- **Frontend**: HTML5, CSS3, JavaScript (con enfoque en la interacción dinámica para funciones como Spoof Calling).

---

## Características Principales

### 🔧 Funcionalidades Core
- **Gestión Integral de Contactos**: Creación, lectura, actualización y eliminación (CRUD) de contactos con validaciones automáticas y normalización de datos (ej. formato de teléfono E.164).
- **Sistema de Llamadas y SMS**: Integración completa con Twilio para realizar y recibir llamadas, y enviar SMS.
- **Spoof Calling**: Capacidad de realizar llamadas salientes mostrando un Caller ID personalizado (configurado como `spoofNumber`).
- **Autenticación Segura**: Sistema de usuarios con roles (admin, asesor) y contraseñas hasheadas (bcrypt). Validación de fortaleza de contraseña.

### 🧠 Análisis y Gestión con IA (Gemini AI)
- **Evaluación Automática de Calidad de Contactos**:
    - Puntuación de calidad (0-100) basada en múltiples factores: validez de teléfono y email, completitud del nombre, campos requeridos y opcionales.
    - Detección de nombres sospechosos mediante patrones predefinidos (ej. "test", "demo", caracteres repetidos).
    - Análisis de sospecha por IA: Gemini AI evalúa la autenticidad del contacto, aplicando penalizaciones si se detecta alta probabilidad de ser falso o de prueba.
- **Gestión de Asesores Optimizada**:
    - Perfiles de asesor con seguimiento de rendimiento (`performanceScore`) y capacidad (`maxContacts`, `currentContactCount`).
    - **Distribución Inteligente de Contactos**: Asignación automática de contactos nuevos o sin asignar a los asesores más adecuados, considerando su rendimiento, carga actual y la calidad del contacto.

### 🚀 Características Avanzadas de la Plataforma
- **Seguridad Mejorada**: Uso de `helmet` para configurar cabeceras HTTP seguras (incluyendo CSP), protección contra CSRF y XSS (básica).
- **Optimización de Rendimiento**: Compresión de respuestas HTTP (`compression`).
- **Rate Limiting**: Protección contra abuso de API (configurable).
- **Logging Avanzado**: Registro detallado de peticiones, errores y eventos importantes del sistema con Winston.
- **Configuración Flexible de CORS**: Permite especificar orígenes permitidos a través de variables de entorno.
- **Manejo Robusto de Errores**: Captura global de errores y respuestas JSON estandarizadas.
- **Cierre Seguro del Servidor (`Graceful Shutdown`)**: Asegura que las conexiones activas se manejen correctamente antes de detener el servidor.
- **Script de Despliegue Mejorado**: Automatización del despliegue a producción usando `rsync` para eficiencia y `npm ci` para instalaciones consistentes.

---

## Acceso al Sistema

### URL de Acceso (Ejemplo)
El acceso al sistema se realiza a través de la URL configurada durante el despliegue. Ejemplo:
```
https://access-5018020518.webspace-host.com:3001
```
*Nota: Esta URL es un ejemplo y dependerá de tu configuración de hosting y dominio.*

### Usuarios Predeterminados
El sistema puede inicializarse con los siguientes usuarios (si se crean en `databaseService.js`):

#### Administradores
| Usuario     | Contraseña         | Rol   |
|-------------|--------------------|-------|
| Chispadelic | Svernis1Password!  | admin |
| Kimbowimbo  | corazonKPassword!  | admin |

#### Asesores
| Usuario   | Contraseña | Rol    |
|-----------|------------|--------|
| Rafurioso | Miau1234*  | asesor |
| Wero      | Miau1234*  | asesor |

*Nota: Las contraseñas deben cumplir con los requisitos de seguridad: mínimo 8 caracteres, una mayúscula, una minúscula y un número.*

---
## Gestión de Contactos
El sistema permite una gestión completa de los contactos. Al crear o actualizar un contacto, se realiza un análisis de calidad.

### Análisis de Calidad del Contacto
Cada contacto es evaluado por el sistema `geminiService` utilizando una combinación de reglas y análisis de IA:
- **Puntuación de Calidad (`qualityScore`)**: Un valor numérico de 0 a 100.
    - **`SCORING_WEIGHTS`**: Define cuánto suma o resta cada criterio:
        - `VALID_PHONE`: +30 puntos por teléfono válido.
        - `VALID_EMAIL`: +20 puntos por email válido.
        - `COMPLETE_NAME`: +20 puntos por nombre completo.
        - `IS_COMPLETE`: +20 puntos por campos básicos completos.
        - `OPTIONAL_FIELDS_BONUS`: +10 puntos por llenar campos opcionales.
        - `AI_SUSPICION_PENALTY`: -20 puntos si la IA lo marca como sospechoso.
- **Detección de Patrones Sospechosos**: Nombres como "test", "demo", o con caracteres repetitivos pueden reducir la puntuación o marcar el contacto.
- **Análisis de IA (Gemini)**: Si está configurado, Gemini AI proporciona una evaluación más profunda sobre la autenticidad y calidad, pudiendo marcar un contacto como sospechoso y afectar su puntuación. Los detalles de este análisis pueden almacenarse junto al contacto.

---
## Sistema de Llamadas y SMS
Integrado con Twilio, permite:
- **Enviar SMS**: A través del endpoint `/api/twilio/send-sms`. Se requiere número de destino, cuerpo del mensaje y opcionalmente un número de origen (`from`).
- **Realizar Llamadas**: A través del endpoint `/api/twilio/make-call`. Se requiere número de destino (`to`) y un número de origen falso (`spoofNumber`). Se pueden pasar opciones como mensaje a reproducir y si se debe grabar la llamada.
- **Webhooks**: El sistema está preparado para recibir webhooks de Twilio para actualizar el estado de las llamadas y grabaciones (configurar en la consola de Twilio apuntando a `/api/twilio/webhook/...`).

---
## Gestión de Asesores
Los asesores son usuarios del sistema que gestionan los contactos.
- **Creación y Actualización**: Se pueden gestionar asesores, incluyendo su estado (activo/inactivo), `performanceScore` y `maxContacts`.
- **Asociación con Usuarios**: Un perfil de usuario de rol "asesor" puede estar vinculado a un perfil de `Advisor`.

### Distribución Inteligente de Contactos
El `databaseService` utiliza `geminiService` para distribuir contactos no asignados:
1. Se obtienen contactos sin `assignedAdvisorId`.
2. Se obtienen asesores activos que no han alcanzado su `maxContacts`.
3. Los contactos se ordenan por `qualityScore` (mayor primero) y luego por fecha de creación.
4. Los asesores se ordenan por `performanceScore` (mayor primero) y luego por menor carga actual.
5. Se asignan los contactos iterativamente, actualizando la carga del asesor.
El proceso queda registrado para auditoría.

---

## Configuración Avanzada

### Variables de Entorno Críticas
Asegúrate de configurar estas variables en tu archivo `.env` (o `.env.production` para producción):

#### Twilio
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890 # Número Twilio por defecto para envíos/llamadas
AGENT_PHONE_NUMBER=+525512345678 # Ejemplo de número de agente para ciertas lógicas
VOICE_WEBHOOK_URL=https://tu-dominio.com/api/twilio/webhook # URL base para webhooks de voz
```

#### Google Gemini AI
```env
GEMINI_API_KEY=AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Base de Datos (MariaDB/MySQL)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_database
DB_USER=crm_user
DB_PASSWORD=secret_password
DB_DIALECT=mysql # o mariadb
```

#### Servidor y Aplicación
```env
NODE_ENV=production # o development
PORT=3001
API_PREFIX=/api # Prefijo para todas las rutas de la API
CORS_ORIGIN=http://localhost:3000,https://tu-frontend.com # Orígenes CORS permitidos, separados por coma
BCRYPT_SALT_ROUNDS=12 # Costo de hasheo para contraseñas
```
*Otros como `JWT_SECRET` si implementas autenticación JWT.*

---
## Despliegue y Mantenimiento

### Proceso de Despliegue con `deploy-production.sh`
El script `deploy-production.sh` ha sido mejorado para un despliegue más robusto:
1.  **Preparación Local**:
    *   Asegura tener `rsync` instalado localmente.
    *   Verifica que el archivo `.env.production` exista en la raíz del proyecto con las configuraciones correctas para el entorno de producción.
2.  **Ejecución del Script**:
    ```bash
    chmod +x deploy-production.sh
    ./deploy-production.sh [usuario_ssh] [host_ssh] [ruta_remota_absoluta]
    ```
    *   Los argumentos son opcionales si los valores por defecto en el script son correctos.
3.  **¿Qué hace el script?**
    *   Crea un paquete de deployment local en una carpeta `dist/`.
    *   Sube los archivos al servidor remoto especificado usando `rsync` (eficiente y borra archivos obsoletos del destino).
    *   Se conecta por SSH al servidor y ejecuta:
        *   `npm ci --omit=dev --legacy-peer-deps`: Instala dependencias de producción de forma limpia desde `package-lock.json`.
        *   Detiene cualquier proceso anterior de la aplicación.
        *   Inicia la aplicación con `nohup node backend/server.js`, redirigiendo logs a `logs/app.log`.
        *   Verifica que la aplicación se haya iniciado correctamente.
4.  **Verificación Post-Despliegue**:
    *   Accede a la URL de la aplicación.
    *   Revisa los logs en el servidor: `[ruta_remota_absoluta]/logs/app.log`.

### Mantenimiento
- **Logs**: Revisa regularmente los logs del servidor para detectar problemas.
- **Actualizaciones**: Para actualizar, sube los nuevos cambios (preferiblemente vía Git en el servidor o re-ejecutando el script de deploy) y reinicia la aplicación. `npm ci` se encargará de las dependencias.
- **Backups**: Asegura tener una estrategia de backup para la base de datos.

---

## Solución de Problemas Comunes
- **Error de conexión a la BD**: Verifica las variables de entorno `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y que el servidor de BD sea accesible desde el servidor de la aplicación.
- **Fallos en llamadas/SMS Twilio**: Revisa las credenciales de Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`), el saldo de tu cuenta Twilio, y los logs en la consola de Twilio.
- **Errores de Gemini AI**: Confirma que `GEMINI_API_KEY` es correcta y tiene los permisos necesarios. Revisa los logs del `geminiService` para detalles.
- **Problemas de CORS**: Asegúrate que `CORS_ORIGIN` en tu `.env` incluye la URL desde la cual el frontend está accediendo a la API.
- **Aplicación no inicia después del deploy**: Revisa `[ruta_remota_absoluta]/logs/app.log` en el servidor para ver mensajes de error detallados. Puede ser un problema de dependencias o configuración.

---

*Última actualización: Julio 2024*
*Versión del manual: 3.1*

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
