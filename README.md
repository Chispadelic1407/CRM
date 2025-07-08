# AI-Powered CRM System with Gemini Integration

## Overview

This is an advanced Customer Relationship Management (CRM) system enhanced with Google Gemini AI capabilities for intelligent contact analysis, data quality assessment, and automated advisor assignment. The system combines traditional CRM functionality with cutting-edge AI to provide superior contact management and business intelligence.

## 🚀 Key Features

### AI-Powered Contact Analysis
- **Intelligent Data Validation**: Automatic phone number (powered by libphonenumber-js and enhanced by AI) and email validation.
- **Quality Scoring**: AI-driven quality assessment for each contact (typically on a 0-100 scale), considering factors like data validity, completeness, and AI-detected patterns.
- **Suspicious Contact Detection**: Identifies potentially fake, temporary, or low-quality contacts through pattern analysis and AI insights.
- **Data Completeness Analysis**: Evaluates missing or incomplete information in contact records and suggests improvements.

### Smart Advisor Management
- **Automated Contact Distribution**: Intelligent, AI-powered assignment of contacts to advisors based on performance metrics, current workload, capacity, and specialization.
- **Performance Tracking**: Comprehensive metrics and statistics for each advisor to monitor effectiveness.
- **Workload Balancing**: Smart distribution algorithms to prevent advisor overload and ensure fair task allocation.
- **Specialization Matching**: Assigns contacts to advisors best suited to their expertise or department.

### Database Health Monitoring
- **Real-time Analytics**: Live statistics on overall contact quality, data distribution, and identification of potential issues.
- **Duplicate Detection**: Tools and processes to identify and manage duplicate contact entries.
- **Data Cleaning Tools**: Automated and manual options for removing or rectifying suspicious, invalid, or low-quality entries.
- **Quality Improvement Suggestions**: AI-generated recommendations for enhancing data integrity and completeness.

### Advanced Communication Features
- **Spoof Calling System**: Allows making calls with a custom caller ID for professional communication.
- **SMS Integration**: Twilio-powered SMS capabilities for direct communication with contacts.
- **Call Recording**: Automated logging and recording of calls for quality assurance and record-keeping (via Twilio webhooks).
- **Integrated Communication**: SMS and voice communication features integrated within the CRM workflow.

## 🏗️ System Architecture

### Backend (Node.js/Express)
```
backend/
├── models/           # Sequelize database models
│   ├── Advisor.js    # Advisor entity
│   ├── Contact.js    # Contact entity with AI analysis fields
│   ├── User.js       # User entity for authentication
│   └── index.js      # Sequelize initialization and model associations
├── services/         # Business logic services
│   ├── databaseService.js # Handles database interactions and complex queries
│   ├── geminiService.js   # Interface for Google Gemini AI functionalities
│   └── twilioService.js   # Manages Twilio SMS and Voice call functionalities
├── routes/           # API endpoint definitions
│   ├── advisors.js   # Routes for advisor management
│   ├── ai.js         # Routes for AI-powered features and database analysis
│   ├── auth.js       # Routes for user authentication (login, logout)
│   ├── contacts.js   # Routes for contact management
│   └── spoofCalling.js # Routes for advanced communication features (spoof calls, SMS)
├── middleware/       # Custom Express middleware
│   ├── cache.js      # Redis caching middleware
│   └── rateLimiter.js # API rate limiting middleware
├── utils/            # Utility functions
│   └── logger.js     # Winston structured logging configuration
└── server.js         # Main application entry point, server setup
```

### Frontend (HTML/CSS/JavaScript)
```
frontend/
├── index.html        # Main HTML file for the Single Page Application (SPA)
├── css/
│   └── styles.css    # Main stylesheet
└── js/
    ├── app.js        # Core client-side application logic
    └── spoofCalling.js # JavaScript for spoof calling specific UI interactions
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- SQLite (default, typically for development) or PostgreSQL/MySQL (recommended for production)
- Google Gemini API key
- Twilio account SID, Auth Token, and a Twilio phone number (optional, for full SMS/calls functionality)
- Redis server (optional, for caching and performance improvements)

### Environment Configuration

1.  **Navigate to the project's backend directory**:
    ```bash
    cd backend
    ```
2.  **Create a `.env` file** by copying the example file. This file should reside in the `backend/` directory, as `server.js` loads it from its relative path.
    ```bash
    cp .env.example .env
    ```
3.  **Edit the `.env` file** and provide your specific configuration values.

    Below is an example structure based on `backend/.env.example` (ensure you use the one in `backend/` as the primary source for backend variables):

    ```env
    # Twilio Configuration
    TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
    TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
    TWILIO_PHONE_NUMBER=your_twilio_phone_number_here # Your Twilio phone number
    AGENT_PHONE_NUMBER=your_agent_phone_number_here # Phone number of the agent/user making calls

    # Spoof Calling Configuration (Optional)
    SPOOF_CALLER_ID=your_spoof_caller_id_here # Default caller ID for spoof calls if not specified per call
    VOICE_WEBHOOK_URL=https://your-domain.com/api/spoof/webhook/voice # Your public URL for Twilio voice webhooks
    SMS_WEBHOOK_URL=https://your-domain.com/api/spoof/webhook/sms # Your public URL for Twilio SMS webhooks

    # Server Configuration
    PORT=3001
    NODE_ENV=development # Use 'production' for production environment

    # Redis Configuration (Optional - for caching)
    # REDIS_URL=redis://username:password@host:port
    REDIS_URL=redis://localhost:6379 # Example for local Redis
    # REDIS_PASSWORD=your_redis_password_here # Uncomment if your Redis server requires a password

    # Security
    JWT_SECRET=your_very_strong_jwt_secret_here # Secret key for signing JWT tokens
    RATE_LIMIT_WINDOW_MS=900000 # (15 minutes) Window for rate limiting
    RATE_LIMIT_MAX_REQUESTS=100 # Max requests per window per IP

    # Logging
    LOG_LEVEL=info # e.g., error, warn, info, http, verbose, debug, silly
    LOG_FILE=logs/app.log # Path to log file

    # Database Configuration (Using Sequelize environment variables is preferred)
    # Ensure your Sequelize CLI configuration (if used) or model index.js aligns with these.
    # For SQLite (development default if others are not set in models/index.js):
    # No specific vars needed if using default SQLite path in models/index.js.
    # For PostgreSQL/MySQL (Production Recommended):
    # DB_HOST=localhost
    # DB_PORT=5432 # 3306 for MySQL
    # DB_NAME=crm_database
    # DB_USER=crm_user
    # DB_PASSWORD=your_secure_password
    # DB_DIALECT=postgres # or mysql

    # Gemini AI Configuration
    # This is typically loaded from the ROOT .env file if your setup uses one there,
    # or ensure GEMINI_API_KEY is available in the environment where the backend process runs.
    # GEMINI_API_KEY=your_gemini_api_key_here
    ```
    **Important Note on `.env` files:** This project appears to have two `.env.example` files: one in the root and one in `backend/`.
    - The `backend/server.js` loads `.env` using `require('dotenv').config();` which by default looks for `.env` in the current working directory (i.e., `backend/` when you run `npm start` from there).
    - The `config.php` file in the root reads `../.env`.
    - **For the Node.js backend, prioritize the `.env` file within the `backend/` directory.**
    - The `GEMINI_API_KEY` and database credentials like `DB_HOST`, `DB_USER`, etc., are crucial. While `GEMINI_API_KEY` is shown in the root `.env.example`, ensure it's accessible to the backend process. This might mean duplicating it in `backend/.env` or ensuring the root `.env` is loaded if your deployment strategy allows. The `backend/models/index.js` will determine how DB credentials are read (often via `process.env.DB_HOST` etc., or a `DATABASE_URL`). For clarity, include all necessary backend runtime variables in `backend/.env`.

### Installation Steps

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Initialize the database** (creates tables, default users/advisors if not present):
    This step might be automatically handled by `npm start` if `databaseService.initialize()` is called on server startup, or you might need a separate script if not. The current `server.js` calls `databaseService.initialize()` on startup.

4.  **Start the Server**:
    ```bash
    npm start
    ```

3. **Access the Application**
- Frontend: http://localhost:3001
- API Documentation: http://localhost:3001/api

## 📊 API Endpoints

The API is organized into several categories:

### Authentication (`/api/auth`)
- `POST /login` - Authenticate user and receive JWT token.
- `POST /logout` - Log out user (requires authentication token).
- `GET /me` - Get current authenticated user's information (requires authentication token).

### Contact Management (`/api/contacts`)
- `GET /` - List all contacts with filtering options (e.g., by status, advisor, quality).
- `POST /` - Create a new contact. AI analysis is automatically performed.
- `GET /:contactId` - Get details of a specific contact.
- `PUT /:contactId` - Update an existing contact. Triggers re-analysis if critical fields change.
- `DELETE /:contactId` - Delete a specific contact.
- `POST /bulk` - Bulk import contacts. Each contact is processed and analyzed.
- `GET /search/:query` - Search for contacts by name, phone, email, or notes.
- `GET /export/json` - Export contacts in JSON format, with optional filters.
- `POST /:contactId/interaction` - Log an interaction (call, SMS, email, meeting) with a contact and optionally update status.

### AI Analysis & Database Management (`/api/ai`)
- `POST /analyze-contacts` - Trigger a full analysis of the entire contact database.
- `POST /validate-contact` - Validate an individual contact's data using AI.
- `GET /contact-analysis/:contactId` - Get detailed AI analysis for a specific contact.
- `POST /bulk-analyze` - Perform AI analysis on a list of specified contact IDs.
- `POST /clean-database` - Perform database cleaning operations (e.g., remove suspicious contacts, invalid entries).
- `POST /distribute-contacts` - Automatically distribute unassigned contacts to suitable advisors based on AI logic.
- `GET /database-stats` - Get comprehensive statistics about the database health, contact quality, and advisor load.
- `POST /suggest-improvements` - Get AI-powered suggestions for improving data quality and CRM operations.

### Advisor Management (`/api/advisors`)
- `GET /` - List all advisors and their assigned contacts.
- `POST /` - Create a new advisor.
- `GET /:advisorId` - Get details of a specific advisor.
- `PUT /:advisorId` - Update an existing advisor's details.
- `DELETE /:advisorId` - Deactivate an advisor (soft delete, sets them as inactive).
- `GET /:advisorId/performance` - Get performance metrics for a specific advisor.
- `GET /:advisorId/workload` - Get workload analysis (e.g., contact distribution by status/priority) for an advisor.
- `POST /:advisorId/assign-contacts` - Manually assign a list of contacts to a specific advisor.

### Communication (`/api/spoof`)
- `POST /call` - Make a spoof call with a custom caller ID. Supports options like recording and voice modulation.
- `POST /sms` - Send an SMS message, optionally with a custom sender ID (if permitted by Twilio and regulations).
- `GET /session/:sessionId` - Get information about a specific call session.
- `POST /session/:sessionId/end` - End an active call session.
- `GET /recordings/:callSid` - Get recording details for a specific call SID (from Twilio).

**Note on Webhooks:** The system also includes webhook endpoints under `/api/spoof/webhook/` (e.g., `/voice`, `/status`, `/recording`) which are intended for receiving real-time updates from Twilio regarding call and SMS status, and recordings. These are generally configured within your Twilio account and not called directly by API clients.

## 🤖 AI Features in Detail

### Contact Quality Analysis
The system, leveraging both programmatic checks and Google Gemini AI, analyzes each contact across multiple dimensions:

- **Phone Validation**: Utilizes `libphonenumber-js` for format validation (defaults to 'MX' region but adaptable) and further AI analysis to assess the likelihood of it being a real, usable number.
- **Email Validation**: Employs `validator.js` for standard email format checks and considers domain validity.
- **Name Analysis**: Programmatically checks for common suspicious patterns (e.g., "test", "demo", "fake", overly short names, numeric names) and uses AI to identify less obvious anomalies.
- **Completeness Score**: Evaluates the presence and validity of required fields (name, phone) and optional fields (email), contributing to the overall quality score.
- **Suspicious Indicators & AI Insights**: If a Gemini API key is provided, the system sends contact details to the AI for a deeper analysis. The AI returns insights on potential red flags, suspicious indicators, and suggestions for improvement. These insights, particularly the count of `suspiciousIndicators` from the AI, can influence the final quality score and flag a contact as suspicious.

### Quality Scoring Algorithm
Each contact is assigned a quality score, typically on a 0-100 scale. This score is calculated based on several factors:
- **Base Points**: Awarded for valid phone numbers, valid email addresses, complete names, and overall data completeness (presence of required fields).
- **Bonus Points**: Added for providing optional information.
- **AI-driven Adjustments**: If Gemini AI analysis is enabled, the AI's assessment (e.g., number of suspicious indicators detected) can modify the score, potentially penalizing contacts flagged as suspicious.
- **Normalization**: The final score is normalized to fit within the 0-100 range.

The scoring aims to provide a quick measure of a contact's reliability and data quality.

### Advisor Assignment Logic
The system employs an algorithmic approach to distribute contacts to advisors, aiming for an intelligent and balanced assignment. Key factors considered include:

- **Contact Priority**: Contacts are typically sorted by priority (e.g., Urgent, High, Medium, Low) and quality score, ensuring high-value leads are addressed promptly.
- **Advisor Performance**: Advisors' historical performance scores can be used to route more critical contacts to top performers.
- **Advisor Workload & Capacity**: The system considers the current number of contacts assigned to an advisor versus their maximum capacity. Advisors with more available capacity are prioritized.
- **Advisor Availability**: Only active advisors are considered for new assignments.
- **Specialization Match**: While the current distribution logic in `geminiService.js` is primarily based on load and performance, the system is designed to be extensible for specialization matching (e.g., by department) if advisor and contact data include such attributes. The AI analysis of contact notes could potentially be used to infer specialization needs in future enhancements.

The goal is to distribute leads effectively, prevent advisor overload, and maximize the chances of successful contact engagement.

### Database Health Monitoring
The system provides tools and analytics for continuous monitoring of database health:

- **Data Quality Distribution**: Statistics show the breakdown of contacts by quality score categories (e.g., Excellent, Good, Fair, Poor).
- **Suspicious Contact Identification**: Tracks the number of contacts flagged as suspicious by programmatic checks or AI analysis.
- **Data Completion Rates**: Monitors the percentage of contacts with complete and valid information.
- **Duplicate Detection**: Programmatically identifies potential duplicate contacts based on matching phone numbers or email addresses.
- **AI-driven Recommendations**: `analyzeDatabaseHealth` in `geminiService.js` can generate high-level recommendations, such as removing duplicates or reviewing suspicious contacts.

## 🔒 Security Features

- **Authentication & Authorization**: Secure user authentication using JSON Web Tokens (JWT). Role-based access can be implemented via middleware.
- **Password Hashing**: User passwords are securely hashed using `bcrypt`.
- **Rate Limiting**: API endpoints are protected against abuse using `express-rate-limit`.
- **Input Validation**: Data received from clients is validated using `express-validator` to prevent common vulnerabilities.
- **SQL Injection Protection**: The use of Sequelize ORM with parameterized queries significantly mitigates SQL injection risks.
- **XSS Prevention**: `Helmet.js` is used to set security headers like Content Security Policy (CSP), which helps prevent Cross-Site Scripting (XSS).
- **CORS Configuration**: Proper Cross-Origin Resource Sharing (CORS) policies are in place to control access from different origins.
- **Helmet.js**: Provides various other security headers to protect against common web vulnerabilities (e.g., clickjacking, MIME sniffing).

## 📈 Performance Optimizations

- **Redis Caching**: Optional Redis integration for caching frequently accessed data, reducing database load (`node-cache` can also be used as a fallback or for simpler caching needs if Redis is not configured).
- **Database Indexing**: Appropriate database indexes should be defined in Sequelize models to speed up query performance (developer responsibility).
- **Compression**: HTTP responses are compressed using `gzip` (via `compression` middleware) to reduce bandwidth usage and improve load times.
- **Connection Pooling**: Sequelize manages database connection pooling by default, ensuring efficient use of database connections.
- **Asynchronous Operations**: Node.js's non-blocking I/O and use of async/await ensures the server remains responsive under load.
- **Selective Data Loading**: Lazy loading and selective field fetching (e.g., `attributes` in Sequelize) can be used to optimize data retrieval.

## 🧪 Testing

The system includes capabilities for API testing and has a testing framework setup.

### API Testing Examples
You can test the API endpoints using tools like `curl` or Postman.

**Create Contact with AI Analysis:**
```bash
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \ # If auth is enabled for the route
  -d '{
    "name": "María García",
    "phone": "+525512345678",
    "email": "maria@example.com",
    "priority": "High"
  }'
```

**Analyze Database Health:**
```bash
curl -X POST http://localhost:3001/api/ai/analyze-contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" # If auth is enabled
```

**Get Database Statistics:**
```bash
curl -X GET http://localhost:3001/api/ai/database-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" # If auth is enabled
```
*(Note: The example `GET /api/contacts/stats/overview` previously listed is also available and provides similar statistics via `/api/contacts/stats/overview`.)*

### Unit & Integration Tests
- The backend uses **Jest** for testing.
- Run tests from the `backend/` directory:
  ```bash
  npm test
  ```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production values
2. **Database**: Use PostgreSQL/MySQL for production
3. **Redis**: Enable caching for better performance
4. **SSL/HTTPS**: Secure communication
5. **Process Management**: Use PM2 or similar
6. **Monitoring**: Implement logging and alerting

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Configuration Options

Key configuration options are managed primarily through environment variables in the `backend/.env` file:

### Core Configuration
- **`NODE_ENV`**: Set to `development` or `production`. Affects logging, error handling, and potentially other behaviors.
- **`PORT`**: The port on which the backend server will listen.
- **`GEMINI_API_KEY`**: Your API key for Google Gemini AI services. Essential for AI features.
- **`JWT_SECRET`**: Secret key for signing and verifying JSON Web Tokens.
- **Database Credentials**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_DIALECT` for connecting to PostgreSQL or MySQL. If these are not set, Sequelize might default to SQLite (check `backend/models/index.js` for exact behavior).

### Twilio Configuration (for SMS/Calls)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `AGENT_PHONE_NUMBER`
- `SPOOF_CALLER_ID` (optional default for spoof calls)
- `VOICE_WEBHOOK_URL`, `SMS_WEBHOOK_URL` (your publicly accessible URLs for Twilio to send updates)

### Optional Features Configuration
- **Redis**: `REDIS_URL`, `REDIS_PASSWORD` (if password protected). Enables caching.
- **Rate Limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`.
- **Logging**: `LOG_LEVEL`, `LOG_FILE`.

### Gemini AI Settings (Code Level)
- **Model Selection**: The AI model used is currently hardcoded as `"gemini-pro"` in `backend/services/geminiService.js`. Changes would require code modification.
- **Analysis Prompts**: The prompts sent to Gemini for contact analysis and other AI tasks are defined within `geminiService.js`. Modifying these prompts can change the AI's behavior and the nature of its analysis.

### Database Options (Data Level)
- **Supported Databases**: SQLite (development), PostgreSQL (production recommended), MySQL. Configuration is via environment variables used by Sequelize.
- **Connection Pooling**: Handled by Sequelize, generally configurable in `backend/models/index.js` if customization beyond defaults is needed.

## 📝 Logging & Monitoring

The system incorporates robust logging using **Winston**:

- **Structured Logging**: Logs are typically in JSON format, making them easy to parse and process by log management systems.
- **Log Levels**: Configurable log levels (`LOG_LEVEL` in `.env`) allow for different verbosity in different environments (e.g., `info`, `debug`, `error`).
- **Request Tracking**: Middleware logs incoming HTTP requests, including method, URL, status code, duration, IP, and user agent.
- **Error Handling**: Comprehensive global error handlers log unhandled exceptions and errors, providing stack traces and context.
- **AI Analysis Logs**: Key AI operations and their outcomes can be logged for auditing and debugging.
- **Service-Specific Logs**: Individual services (Database, Twilio, Gemini) log important events, successes, and failures.
- **Log Output**: Logs can be directed to console and/or files (configurable via `LOG_FILE` in `.env`). Consider integrating with a centralized logging platform (e.g., ELK Stack, Splunk, Datadog) for production environments.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the logs for error details
- Ensure all environment variables are set
- Verify Gemini API key permissions

## 🔮 Future Enhancements

- **Machine Learning Models**: Custom ML for contact scoring
- **Advanced Analytics**: Predictive contact conversion
- **Multi-language Support**: International contact handling
- **Mobile App**: React Native companion app
- **Webhook Integration**: Real-time external system sync
- **Advanced Reporting**: Business intelligence dashboards

---

**Built with ❤️ using Node.js, Express, Sequelize, Google Gemini AI, and modern web technologies.**
