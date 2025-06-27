# AI-Powered CRM System with Gemini Integration - v3.1.0

## Overview

This is an advanced Customer Relationship Management (CRM) system enhanced with Google Gemini AI capabilities for intelligent contact analysis, data quality assessment, and automated advisor assignment. The system combines traditional CRM functionality with cutting-edge AI to provide superior contact management and business intelligence. This version (3.1.0) incorporates significant updates to models, services, security, and deployment processes.

## 🚀 Key Features

### 🧠 AI-Powered Contact Analysis (Enhanced)
- **Intelligent Data Validation**: Automatic phone number (libphonenumber-js) and email validation. Normalization of phone numbers to E.164.
- **Comprehensive Quality Scoring**: AI-driven quality assessment (`qualityScore` 0-100) for each contact, based on configurable `SCORING_WEIGHTS` (valid phone/email, name completeness, AI suspicion).
- **Suspicious Contact Detection**:
    - Pattern-based detection for names (e.g., "test", "demo", repeated chars).
    - Gemini AI analysis for deeper authenticity checks, influencing the score.
- **Data Completeness Analysis**: Evaluates required vs. optional fields to contribute to the quality score.

### ♟️ Smart Advisor Management (Enhanced)
- **Automated Contact Distribution**: Gemini AI-assisted assignment logic considering advisor `performanceScore`, current workload (`currentContactCount` vs `maxContacts`), and contact `qualityScore`.
- **Performance Tracking**: Advisor model includes `performanceScore`.
- **Workload Balancing**: Distribution aims to assign to the best available advisor with capacity.

### 🗂️ Robust Data Management
- **Sequelize Models (User, Contact, Advisor)**: Enriched with more fields, strong validations (e.g., `isStrongPassword` for User), hooks for hashing and normalization, and optimized indexes.
- **Transactional Operations**: Key database operations (create contact, distribute) are wrapped in Sequelize transactions for data integrity.
- **Dynamic Model Loading**: `models/index.js` now loads models dynamically.

### 📞 Advanced Communication Features (Twilio)
- **Spoof Calling System**: Make calls with a custom Caller ID (`spoofNumber`).
- **SMS Integration**: Send SMS messages via Twilio.
- **Dedicated Twilio Controller & Routes**: Logic modularized into `twilioController.js` and routes grouped under `routes/twilio.js`.
- **Webhook Handling**: Ready for Twilio webhooks for call status and recordings.

### 🛡️ Enhanced Security & Reliability
- **Helmet.js**: Configured for security headers, including a Content Security Policy (CSP).
- **Graceful Shutdown**: Ensures the server handles active connections and closes resources properly on termination signals.
- **Improved Error Handling**: Standardized API error responses and more detailed server-side logging.
- **CORS Configuration**: Flexible CORS policy configurable via environment variables.
- **Input Validation**: `express-validator` used in controllers for request sanitization.
- **Password Security**: bcrypt for password hashing with configurable salt rounds.

### ⚙️ Performance & Deployment
- **Response Compression**: `compression` middleware enabled.
- **Optimized Deployment Script**: `deploy-production.sh` now uses `rsync` for efficient file transfer and `npm ci` for consistent production installs.
- **Structured Logging**: Winston logger for detailed application event tracking.

## 🏗️ System Architecture

### Backend (Node.js/Express) - Updated
```
backend/
├── controllers/      # Request handlers
│   └── twilioController.js # Logic for Twilio SMS/calls
├── models/           # Sequelize database models (User, Contact, Advisor, index)
│   ├── User.js       # User model with password validation and hashing
│   ├── Contact.js    # Contact model with qualityScore, AI analysis fields, phone normalization
│   ├── Advisor.js    # Advisor model with performanceScore, maxContacts
│   └── index.js      # Dynamic model loading, DB configuration
├── services/         # Business logic
│   ├── geminiService.js     # Enhanced AI analysis, scoring, distribution logic
│   ├── databaseService.js   # Transactional DB operations, default data creation
│   └── twilioService.js     # Twilio communication services
├── routes/           # API endpoints
│   ├── auth.js       # Authentication routes
│   ├── twilio.js     # Routes for Twilio functionalities (SMS, Call, Spoof, Webhooks)
│   ├── contacts.js   # Contact management
│   ├── advisors.js   # Advisor management
│   └── ai.js         # AI-specific analysis endpoints
├── middleware/       # Custom middleware (e.g., rateLimiter, auth)
└── utils/            # Utility functions (e.g., logger)
└── server.js         # Main Express server setup, security, error handling
```

### Frontend (HTML/CSS/JavaScript) - Updated
```
frontend/
├── js/
│   └── spoofCalling.js # Enhanced with DOM caching, robust polling, updated API calls
└── ... (index.html, css/)
```

## 🛠️ Instalación Fácil (¡Para Empezar a Jugar!)

¿Quieres probar este CRM en tu propia computadora? ¡Es más fácil de lo que piensas! Solo sigue estos pasos:

**¿Qué necesitas antes de empezar?**

1.  **Node.js y npm**: Imagina que Node.js es como el motor que hace funcionar nuestro CRM, y npm es la tienda donde conseguimos las piezas. Si no los tienes, pídele ayuda a un adulto para instalarlos desde [nodejs.org](https://nodejs.org/). (Necesitarás versión 18 o más nueva).
2.  **Git**: Es como una máquina del tiempo para guardar nuestro código. Si no lo tienes, también necesitarás ayuda para instalarlo desde [git-scm.com](https://git-scm.com/).
3.  **Una Base de Datos**: Piensa en esto como el archivador donde guardaremos todos los contactos. Este CRM usa MariaDB o MySQL. Para probar fácil, puedes usar una base de datos gratuita online o pedir ayuda para instalar una en tu compu.
4.  **Claves Secretas (API Keys)**:
    *   **Gemini AI**: Para que la inteligencia artificial funcione, necesitas una llave de Google Gemini.
    *   **Twilio**: Si quieres enviar SMS y hacer llamadas, necesitas llaves de Twilio.
    *   *(No te preocupes, el sistema puede funcionar en un "modo demo" sin estas si solo quieres ver cómo es por dentro, pero algunas funciones no estarán completas).*

**¡Manos a la Obra!**

1.  **Copia el Proyecto (Clonar)**:
    *   Abre una ventana de comandos (a veces se llama "Terminal" o "PowerShell").
    *   Escribe esto y presiona Enter (pídele a un adulto que te ayude a encontrar dónde quieres guardar el proyecto):
        ```bash
        git clone https://github.com/tu-usuario/tu-repositorio.git
        ```
        *(Reemplaza `https://github.com/tu-usuario/tu-repositorio.git` con la dirección real de este proyecto).*
    *   Luego, entra a la carpeta que se creó:
        ```bash
        cd nombre-de-la-carpeta-del-proyecto
        ```

2.  **Prepara las Llaves Secretas (`.env`)**:
    *   Ve a la carpeta `backend/`.
    *   Busca un archivo llamado `.env.example`. Haz una copia y llámala `.env`.
    *   Abre el archivo `.env` con un editor de texto simple (¡como el Bloc de Notas!).
    *   Aquí es donde pondrás tus "llaves secretas" y configurarás la base de datos. Pídele ayuda a un adulto para llenar esto. Se verá algo así:

        ```env
        # Configuración del Servidor
        NODE_ENV=development
        PORT=3001
        API_PREFIX=/api
        CORS_ORIGIN=http://localhost:3000

        # Seguridad de Contraseñas
        BCRYPT_SALT_ROUNDS=12

        # Twilio (si las tienes)
        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
        TWILIO_AUTH_TOKEN=tu_token_de_twilio
        TWILIO_PHONE_NUMBER=+1234567890
        VOICE_WEBHOOK_URL=http://localhost:3001/api/twilio/webhook # Para pruebas locales con ngrok

        # Google Gemini AI (si la tienes)
        GEMINI_API_KEY=AIxxxxxxxxxxxxxxx

        # Base de Datos (ejemplo para MariaDB/MySQL local)
        DB_HOST=localhost
        DB_PORT=3306
        DB_NAME=micrm_db
        DB_USER=usuario_crm
        DB_PASSWORD=contraseña_super_secreta
        DB_DIALECT=mysql
        ```
    *   **¡Importante!** Guarda este archivo. Nunca compartas tus llaves secretas con nadie.

3.  **Consigue las Piezas (Instalar Dependencias)**:
    *   Asegúrate de estar en la carpeta `backend/` en tu ventana de comandos.
    *   Escribe esto y presiona Enter:
        ```bash
        npm install
        ```
        Esto descargará todas las "piezas" que nuestro CRM necesita para funcionar. ¡Puede tardar un poquito!

4.  **¡Enciende el Motor! (Iniciar el Servidor)**:
    *   Aún en la carpeta `backend/`, escribe esto y presiona Enter:
        ```bash
        npm run dev
        ```
        Esto enciende el CRM en "modo desarrollo" (¡perfecto para jugar y probar!). Verás mensajes en la consola que te dicen que está funcionando.

5.  **¡A Explorar!**:
    *   Si todo salió bien, el backend del CRM estará corriendo. Generalmente, la parte del "frontend" (lo que ves en el navegador) se sirve desde la carpeta `frontend/` que está junto a `backend/`.
    *   Abre tu navegador de internet (Chrome, Firefox, etc.) y ve a `http://localhost:3001` (o el puerto que hayas puesto en `PORT` en tu archivo `.env`). El servidor Node.js también sirve el frontend.
    *   Si hay una interfaz gráfica, ¡deberías verla!
    *   Puedes probar si el API funciona yendo a `http://localhost:3001/api/health` (o `http://localhost:PUERTO/tu_API_PREFIX/health`). Debería decirte que todo está "UP".

¡Y eso es todo! Ya tienes el CRM funcionando en tu computadora para que lo explores.

## 🚀 Despliegue Fácil a Producción (¡Para que Todos lo Usen!)

¿Ya probaste el CRM en tu compu y ahora quieres ponerlo en un servidor real para que otras personas lo usen? ¡Genial! Usaremos un script mágico llamado `deploy-production.sh` que hace casi todo el trabajo.

**¿Qué necesitas antes de empezar?**

1.  **Un Servidor**: Imagina que es una computadora superpoderosa que está siempre encendida y conectada a internet. Necesitas tener acceso a uno (puedes rentar uno o usar uno que te den).
2.  **Acceso SSH a tu Servidor**: Es como tener una llave secreta para entrar a tu servidor y darle órdenes. Necesitarás un usuario y, a veces, una contraseña o una "llave SSH".
3.  **Node.js (versión 18+) y npm en el Servidor**: Igual que en tu compu, el servidor necesita el "motor" (Node.js) y la "tienda de piezas" (npm).
4.  **El Código del CRM**: Asegúrate de tener la última versión del código en tu computadora local, en la carpeta principal del proyecto.

**¡A Desplegar!**

1.  **Prepara las Llaves Secretas para el Servidor (`.env.production`)**:
    *   En **tu computadora local**, en la carpeta principal del proyecto (la que contiene las carpetas `backend/`, `frontend/` y el archivo `deploy-production.sh`).
    *   Crea un archivo llamado `.env.production`. Este archivo es MUY IMPORTANTE.
    *   Abre `.env.production` con un editor de texto.
    *   Copia aquí TODAS las configuraciones que necesita tu CRM para funcionar en el servidor real (las API keys de Twilio y Gemini, los datos de la base de datos de producción, etc.). Debe ser similar al archivo `.env` que usaste para probar, ¡pero con los datos REALES del servidor de producción!
        ```env
        # Ejemplo de .env.production
        NODE_ENV=production
        PORT=3001 # O el puerto que quieras usar en producción
        API_PREFIX=/api
        CORS_ORIGIN=https://tu-dominio-real.com # La dirección de tu frontend en producción

        BCRYPT_SALT_ROUNDS=12

        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx_PRODUCCION
        TWILIO_AUTH_TOKEN=tu_token_de_twilio_PRODUCCION
        TWILIO_PHONE_NUMBER=+1_numero_twilio_produccion
        VOICE_WEBHOOK_URL=https://tu-dominio-real.com/api/twilio/webhook # URL real para webhooks

        GEMINI_API_KEY=AIxxxxxxxxxxxxxxx_PRODUCCION

        DB_HOST=servidor_de_bd_produccion.com
        DB_NAME=micrm_db_produccion
        DB_USER=usuario_db_produccion
        DB_PASSWORD=contraseña_super_segura_produccion
        DB_DIALECT=mysql
        ```
    *   Guarda este archivo. El script de despliegue lo tomará y lo pondrá en el servidor como `.env`.

2.  **Dale Permiso al Script Mágico**:
    *   En tu computadora local, abre una ventana de comandos en la carpeta principal del proyecto.
    *   Escribe esto y presiona Enter:
        ```bash
        chmod +x deploy-production.sh
        ```
        Esto es como decirle a tu computadora: "¡Oye, este script tiene permiso para hacer cosas!" (Solo necesitas hacerlo una vez).

3.  **¡Ejecuta el Script Mágico!**:
    *   Ahora viene la parte emocionante. Desde la carpeta principal de tu proyecto en tu computadora, escribe algo como esto:
        ```bash
        ./deploy-production.sh tu_usuario_ssh tu_servidor.com /home/tu_usuario_ssh/ruta_app_servidor
        ```
        **Reemplaza:**
        *   `tu_usuario_ssh`: Con tu nombre de usuario para entrar al servidor (ej. `pepito`).
        *   `tu_servidor.com`: Con la dirección de tu servidor (ej. `crm.miservidor.com` o una IP).
        *   `/home/tu_usuario_ssh/ruta_app_servidor`: Con la carpeta exacta en tu servidor donde quieres que viva el CRM (ej. `/home/pepito/mi_crm_online`).

        *Si el script `deploy-production.sh` ya tiene estos valores configurados adentro y son los correctos, podrías ejecutarlo solo con `./deploy-production.sh`.*

    *   Presiona Enter. El script te pedirá tu contraseña de SSH (si es que usas contraseña para entrar al servidor).
    *   Verás un montón de mensajes en la pantalla. ¡Es el script trabajando! Está copiando los archivos, instalando las "piezas" en el servidor y encendiendo el CRM.

4.  **¿Funcionó? ¡A Verificar!**:
    *   Si todo sale bien, el script te dirá algo como "¡Aplicación iniciada correctamente!" o "Deployment completado con éxito".
    *   Abre tu navegador de internet y ve a la dirección donde debería estar tu CRM en producción (ej. `https://tu-dominio-real.com` o `http://ip_de_tu_servidor:PUERTO_CONFIGURADO`).
    *   Si ves tu CRM, ¡felicidades! ¡Lo lograste!
    *   **Si algo sale mal**: El script tratará de decirte qué pasó. También puedes revisar los "logs" (como un diario de lo que hace la app) en tu servidor. El script usualmente te dice dónde están (algo como `/ruta/en/el_servidor/logs/app.log`).

¡Y listo! Desplegar puede parecer complicado, pero este script ayuda muchísimo. Recuerda siempre tener cuidado con tus contraseñas y llaves secretas.

## 📊 API Endpoints (Illustrative - check `routes/` for specifics)

Base path: `/api` (configurable via `API_PREFIX`)

### Contact Management (`/contacts`)
-   `POST /` - Create contact (triggers AI analysis).
-   `GET /` - List contacts (supports filtering/pagination).
-   `PUT /:id` - Update contact (may trigger re-analysis).
-   `DELETE /:id` - Delete contact.

### Twilio Communications (`/twilio`)
-   `POST /send-sms` - Send an SMS.
    -   Body: `{ "to": "+1...", "body": "Hello", "from": "+1..." (optional) }`
-   `POST /make-call` - Initiate a call (spoof or regular).
    -   Body: `{ "to": "+1...", "spoofNumber": "+1...", "message": "Connecting...", "record": false }`
-   Webhooks:
    -   `POST /webhook/voice`
    -   `POST /webhook/status`
    -   `POST /webhook/recording`
-   Session Management (for active spoof calls):
    -   `GET /session/:sessionId`
    -   `POST /session/:sessionId/end`

### AI & Advisor Endpoints (`/ai`, `/advisors`)
-   Endpoints for triggering database-wide analysis, contact distribution, managing advisors, etc. (Refer to specific route files like `ai.js`, `advisors.js`).

## 🤖 AI Features in Detail (GeminiService)

### Contact Quality Scoring (`SCORING_WEIGHTS`)
The `geminiService.js` uses a weighted system:
-   `VALID_PHONE`: +30
-   `VALID_EMAIL`: +20
-   `COMPLETE_NAME`: +20 (full score for names with space, half otherwise)
-   `IS_COMPLETE`: +20 (if essential fields like name & valid phone are present)
-   `OPTIONAL_FIELDS_BONUS`: +10 (example, can be expanded)
-   `AI_SUSPICION_PENALTY`: -20 (if Gemini AI flags as suspicious or pattern matching is positive)
The final score is capped between 0 and 100.

### Suspicious Name Detection
A list of regex patterns (e.g., `/^test/i`, `/(.)\1{2,}/`) is used for quick flagging.

### Gemini AI Prompting
A structured JSON-based prompt is sent to Gemini for:
-   Genuineness assessment (`is_genuine_person`)
-   Suspicion score and reason (`suspicion_score`, `suspicion_reason`)
-   Data completeness and accuracy scores
-   Specific quality issues and recommendations.

### Contact Distribution Logic
1.  Contacts: Sorted by `qualityScore` (desc), then `createdAt` (desc).
2.  Advisors: Filtered for `isActive` and capacity. Sorted by `performanceScore` (desc), then `currentContactCount` (asc).
3.  Assignment: Iterative, assigning best contacts to best available advisors.

## 🔒 Security Features (Updated)

-   **Helmet.js**: Provides various security headers (CSP, XSS protection, etc.).
-   **CORS**: Configurable via `CORS_ORIGIN` for controlled cross-origin access.
-   **Rate Limiting**: Implemented via `express-rate-limit` (configuration in `middleware/rateLimiter.js`).
-   **Input Validation**: `express-validator` in controllers (e.g., `twilioController.js`).
-   **Password Hashing**: `bcrypt` with configurable salt rounds (`BCRYPT_SALT_ROUNDS`).
-   **SQL Injection Protection**: Via Sequelize ORM's parameterized queries.
-   **Graceful Shutdown**: Handles termination signals to prevent data corruption or abrupt disconnections.
-   **Environment Variable Management**: Critical configurations are externalized to `.env` files.

## 📈 Performance Optimizations

-   **Response Compression**: `compression` middleware (gzip).
-   **Database Indexing**: Defined in Sequelize models for faster queries.
-   **Connection Pooling**: Managed by Sequelize.
-   **Efficient Deployment**: `rsync` in `deploy-production.sh`.
-   **Frontend Optimizations**: DOM caching and robust polling in `spoofCalling.js`.
-   *(Note: Redis caching was present in an older version, but removed from the current `package.json`. Can be re-added if needed.)*

## 🧪 Testing
-   Manual testing of API endpoints using tools like Postman or `curl` is recommended.
-   `supertest` is included in `devDependencies` for potential future integration tests.
-   The `deploy-production.sh` script should be tested in a staging environment first.

**Example `curl` for sending SMS:**
```bash
curl -X POST http://localhost:3001/api/twilio/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "body": "Hello from the CRM!",
    "from": "+15557654321"
  }'
```

## 📝 Logging & Monitoring
-   **Winston Logger**: Configured in `utils/logger.js` for structured JSON logs.
-   **Request Logging**: `server.js` logs details of each incoming request.
-   **Error Logging**: Global error handlers in `server.js` log unhandled errors. Specific services also log important events and errors.
-   **Deployment Logs**: `deploy-production.sh` provides console output. Application logs on server at `[remote_path]/logs/app.log`.

## 🤝 Contributing
Standard fork, feature branch, test, and pull request workflow. Ensure code passes linting (`npm run lint`) and formatting (`npm run format`).

## 📄 License
This project is licensed under the MIT License.

## 🆘 Support
-   Check application logs (server-side and browser console).
-   Verify all `.env` variables are correctly set and loaded.
-   Ensure Twilio and Gemini API keys are valid and have necessary permissions.
-   Consult Twilio/Gemini dashboards for API call errors.

## 🔮 Future Enhancements
-   Re-integrate Redis or another caching layer for high-traffic endpoints.
-   Develop comprehensive automated tests (unit, integration, e2e).
-   Implement full JWT-based authentication workflow.
-   Expand AI capabilities (e.g., sentiment analysis from call transcriptions if available).
-   User interface for managing `SCORING_WEIGHTS` or AI settings.

---

**Version 3.1.0** - Enhanced with robust services, security, and deployment.
