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

## 🔧 Installation & Setup

### Prerequisites
- Node.js >=18.0.0 (as per `package.json` engines)
- npm
- MariaDB (or MySQL)
- Google Gemini API key
- Twilio Account SID, Auth Token, Phone Number

### Environment Configuration (`.env` file in `backend/`)
Create a `.env` file in the `backend/` directory (or `.env.production` for production deployments, which will be copied as `.env` by the deploy script).

```env
# Server Configuration
NODE_ENV=development # or production
PORT=3001
API_PREFIX=/api # Base path for all API routes
CORS_ORIGIN=http://localhost:3000,http://your-frontend-domain.com # Comma-separated origins

# Password Security
BCRYPT_SALT_ROUNDS=12

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890 # Your default Twilio number
AGENT_PHONE_NUMBER=+1xxxxxxxxxx # Optional: A specific agent number
VOICE_WEBHOOK_URL=https://your-app-domain.com/api/twilio/webhook # Base URL for Twilio voice webhooks

# Google Gemini AI Configuration
GEMINI_API_KEY=AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database Configuration (MariaDB/MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_crm_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DIALECT=mysql # or mariadb

# JWT Secret (if using JWT based authentication)
# JWT_SECRET=your_very_strong_jwt_secret
```

### Installation Steps
1.  **Clone Repository**
2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    ```
3.  **Configure `.env`** as shown above.
4.  **Start Backend Server**:
    ```bash
    npm run dev # For development with nodemon
    # or
    npm start # For production start
    ```
5.  **Frontend**: Serve `frontend/index.html` and related assets. The backend can do this if configured.

### Accessing the Application
-   **Frontend**: Typically `http://localhost:3000` (if served separately) or `http://localhost:3001` (if backend serves it).
-   **API Base URL**: `http://localhost:3001/api` (or your `API_PREFIX`).

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

## 🚀 Deployment (Updated `deploy-production.sh`)
The `deploy-production.sh` script now:
1.  Performs local checks (e.g., `.env.production`, `rsync` availability).
2.  Creates a local `dist/` package.
3.  Uses `rsync -avz --delete` to upload `dist/` to the remote server (efficiently syncing files).
4.  Connects via SSH to:
    *   Run `npm ci --omit=dev --legacy-peer-deps` for clean, production-only dependency installation.
    *   Stop any old application instances using `pkill`.
    *   Start the application with `nohup node backend/server.js > logs/app.log 2>&1 &`.
    *   Verify the application process.
5.  Cleans up the local `dist/` directory.

**Usage**:
```bash
chmod +x deploy-production.sh
./deploy-production.sh [ssh_user] [ssh_host] [remote_path]
# Arguments are optional if defaults in script are correct.
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
