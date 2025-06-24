# AI-Powered CRM System with Gemini Integration

## Overview

This is an advanced Customer Relationship Management (CRM) system enhanced with Google Gemini AI capabilities for intelligent contact analysis, data quality assessment, and automated advisor assignment. The system combines traditional CRM functionality with cutting-edge AI to provide superior contact management and business intelligence.

## 🚀 Key Features

### AI-Powered Contact Analysis
- **Intelligent Data Validation**: Automatic phone number and email validation using AI
- **Quality Scoring**: AI-driven quality assessment for each contact (0-100 scale)
- **Suspicious Contact Detection**: Identifies fake, test, or low-quality contacts
- **Data Completeness Analysis**: Evaluates missing information and suggests improvements

### Smart Advisor Management
- **Automated Contact Distribution**: AI-powered assignment based on advisor performance and capacity
- **Performance Tracking**: Comprehensive metrics for each advisor
- **Workload Balancing**: Intelligent distribution to prevent overload
- **Specialization Matching**: Assigns contacts based on advisor expertise

### Database Health Monitoring
- **Real-time Analytics**: Live statistics on contact quality and distribution
- **Duplicate Detection**: Identifies and manages duplicate contacts
- **Data Cleaning Tools**: Automated removal of suspicious and invalid entries
- **Quality Improvement Suggestions**: AI-generated recommendations for data enhancement

### Advanced Communication Features
- **Spoof Calling System**: Professional caller ID management
- **SMS Integration**: Bulk messaging with Twilio integration
- **Call Recording**: Automated call logging and recording
- **Multi-channel Communication**: Email, SMS, and voice integration

## 🏗️ System Architecture

### Backend (Node.js/Express)
```
backend/
├── models/           # Sequelize database models
│   ├── Contact.js    # Contact entity with AI analysis fields
│   ├── Advisor.js    # Advisor management model
│   └── index.js      # Database configuration
├── services/         # Business logic services
│   ├── geminiService.js     # AI analysis and recommendations
│   ├── databaseService.js   # Database operations
│   └── twilioService.js     # Communication services
├── routes/           # API endpoints
│   ├── ai.js         # AI analysis endpoints
│   ├── contacts.js   # Contact management
│   ├── advisors.js   # Advisor management
│   └── spoofCalling.js # Communication features
├── middleware/       # Custom middleware
│   ├── cache.js      # Redis caching
│   └── rateLimiter.js # API rate limiting
└── utils/           # Utility functions
    └── logger.js    # Structured logging
```

### Frontend (HTML/CSS/JavaScript)
```
frontend/
├── index.html       # Main dashboard
├── css/            # Styling
├── js/             # Client-side logic
└── assets/         # Static resources
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- SQLite (default) or PostgreSQL/MySQL
- Google Gemini API key
- Twilio account (optional, for SMS/calls)

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Twilio Configuration (Optional - runs in demo mode without)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
AGENT_PHONE_NUMBER=your_agent_phone_number_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL=sqlite:./database.sqlite

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### Installation Steps

1. **Clone and Install Dependencies**
```bash
cd backend
npm install
```

2. **Start the Server**
```bash
npm start
```

3. **Access the Application**
- Frontend: http://localhost:3001
- API Documentation: http://localhost:3001/api

## 📊 API Endpoints

### Contact Management
- `GET /api/contacts` - List contacts with filtering
- `POST /api/contacts` - Create contact with AI analysis
- `PUT /api/contacts/:id` - Update contact (triggers re-analysis)
- `DELETE /api/contacts/:id` - Delete contact
- `POST /api/contacts/bulk` - Bulk import with AI validation

### AI Analysis
- `POST /api/ai/analyze-contacts` - Analyze entire database
- `POST /api/ai/validate-contact` - Validate individual contact
- `POST /api/ai/clean-database` - Remove suspicious/invalid contacts
- `POST /api/ai/distribute-contacts` - Auto-assign to advisors
- `GET /api/ai/database-stats` - Get health metrics
- `POST /api/ai/suggest-improvements` - Get AI recommendations

### Advisor Management
- `GET /api/advisors` - List all advisors
- `POST /api/advisors` - Create new advisor
- `PUT /api/advisors/:id` - Update advisor
- `GET /api/advisors/:id/performance` - Performance metrics
- `GET /api/advisors/:id/workload` - Workload analysis
- `POST /api/advisors/:id/assign-contacts` - Manual assignment

### Communication
- `POST /api/spoof/call` - Make spoof call
- `POST /api/spoof/sms` - Send SMS
- `GET /api/spoof/history` - Communication history

## 🤖 AI Features in Detail

### Contact Quality Analysis
The Gemini AI service analyzes each contact across multiple dimensions:

- **Phone Validation**: Uses libphonenumber-js + AI verification
- **Email Validation**: Format and domain validation
- **Name Analysis**: Detects suspicious patterns (test, demo, fake names)
- **Completeness Score**: Evaluates required vs optional fields
- **Suspicious Indicators**: AI-powered fraud detection

### Quality Scoring Algorithm
```javascript
// Base scoring (0-100)
- Valid phone: +30 points
- Valid email: +20 points  
- Complete name: +20 points
- Data completeness: +20 points
- Optional fields: +10 points
- AI confidence boost/penalty: ±20 points
```

### Advisor Assignment Logic
The AI considers multiple factors for optimal assignment:

- **Performance Score**: Historical success rate
- **Current Workload**: Available capacity
- **Contact Priority**: Urgent contacts to top performers
- **Specialization Match**: Department/skill alignment
- **Response Time**: Average advisor response metrics

### Database Health Monitoring
Continuous monitoring provides insights on:

- **Data Quality Distribution**: Excellent/Good/Fair/Poor breakdown
- **Suspicious Contact Trends**: Fraud detection patterns
- **Completion Rates**: Missing information analysis
- **Duplicate Detection**: Phone/email matching algorithms

## 🔒 Security Features

- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data sanitization
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Content Security Policy headers
- **CORS Configuration**: Controlled cross-origin access
- **Helmet.js**: Security headers implementation

## 📈 Performance Optimizations

- **Redis Caching**: Frequently accessed data caching
- **Database Indexing**: Optimized query performance
- **Compression**: Gzip response compression
- **Connection Pooling**: Efficient database connections
- **Lazy Loading**: On-demand data fetching

## 🧪 Testing

### API Testing Examples

**Create Contact with AI Analysis:**
```bash
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "phone": "+525512345678",
    "email": "maria@example.com",
    "priority": "High"
  }'
```

**Analyze Database Health:**
```bash
curl -X POST http://localhost:3001/api/ai/analyze-contacts
```

**Get Statistics:**
```bash
curl -X GET http://localhost:3001/api/contacts/stats/overview
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

### Gemini AI Settings
- **Model Selection**: Choose between gemini-pro models
- **Analysis Depth**: Configure AI analysis complexity
- **Confidence Thresholds**: Set suspicious contact detection sensitivity
- **Rate Limiting**: Manage API usage costs

### Database Options
- **SQLite**: Default for development
- **PostgreSQL**: Recommended for production
- **MySQL**: Alternative production option
- **Connection Pooling**: Configurable pool sizes

## 📝 Logging & Monitoring

The system includes comprehensive logging:

- **Structured Logging**: JSON format with Winston
- **Request Tracking**: All API calls logged
- **Error Handling**: Detailed error reporting
- **Performance Metrics**: Response time tracking
- **AI Analysis Logs**: Decision tracking for auditing

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
