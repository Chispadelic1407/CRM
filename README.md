# 📞 CRM Twilio - Advanced Spoof Calling System

## 🚀 Production-Ready CRM with Advanced Spoof Calling Capabilities

A comprehensive Customer Relationship Management system with advanced Twilio integration, featuring sophisticated spoof calling capabilities, voice modulation, and enterprise-level security features.

## ✨ Key Features

### 🎯 Core Functionality
- **Advanced Spoof Calling**: Multiple spoofing techniques with caller ID manipulation
- **Voice Modulation**: Customizable voice options and language settings
- **SMS Integration**: Send SMS with custom sender ID and spoof numbers
- **Contact Management**: Full CRUD operations with search and filtering
- **Real-time Dashboard**: Live statistics and monitoring
- **Role-based Access**: Admin and Asesor user roles with different permissions

### 🔐 Security Features
- **Anti-Screenshot Protection**: Prevents unauthorized screenshots and screen recording
- **Developer Tools Detection**: Automatically blurs content when dev tools are detected
- **Rate Limiting**: Comprehensive API abuse prevention
- **Input Validation**: Advanced request validation and sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js implementation with CSP

### 📊 Performance & Monitoring
- **Caching Layer**: Redis-compatible caching with fallback
- **Compression**: Gzip compression for optimal performance
- **Logging System**: Winston-based comprehensive logging
- **Error Handling**: Robust error management and recovery
- **Performance Metrics**: Built-in monitoring and analytics

## 🏗️ Architecture

```
crm-twilio/
├── 📁 backend/                 # Express.js API Server
│   ├── server.js              # Main server with optimizations
│   ├── 📁 routes/             # API route handlers
│   │   └── spoofCalling.js    # Advanced spoof calling endpoints
│   ├── 📁 services/           # Business logic layer
│   │   └── twilioService.js   # Twilio integration with demo mode
│   ├── 📁 middleware/         # Express middleware
│   │   ├── rateLimiter.js     # Rate limiting configuration
│   │   └── cache.js           # Caching middleware
│   └── 📁 utils/              # Utility functions
│       └── logger.js          # Winston logging configuration
├── 📁 frontend/               # Static Frontend
│   ├── index.html             # Main application interface
│   ├── 📁 css/               # Stylesheets
│   │   └── styles.css         # Modern responsive design
│   └── 📁 js/                # JavaScript modules
│       ├── app.js             # Main application logic
│       └── spoofCalling.js    # Spoof calling functionality
└── 📁 deployment/             # Deployment configurations
    ├── vercel.json            # Vercel deployment config
    └── .vercelignore          # Deployment exclusions
```

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

#### Prerequisites
- Node.js 18+ installed
- Vercel account
- Git repository access

#### Quick Deploy
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Clone and Deploy**:
   ```bash
   git clone https://github.com/SebastianVernis/crm-twilio.git
   cd crm-twilio
   git checkout optimize-spoof-calling
   vercel --prod
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   ```env
   # Twilio Configuration (Optional - works in demo mode without these)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   AGENT_PHONE_NUMBER=+0987654321
   
   # Server Configuration
   NODE_ENV=production
   PORT=3001
   
   # Security Configuration
   ALLOWED_ORIGINS=https://your-domain.vercel.app
   
   # Performance Configuration
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CACHE_TTL=300
   LOG_LEVEL=info
   ```

### Option 2: Traditional Server Deployment

#### Local Development
```bash
# Clone repository
git clone https://github.com/SebastianVernis/crm-twilio.git
cd crm-twilio
git checkout optimize-spoof-calling

# Install dependencies
cd backend && npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

#### Production Server
```bash
# Install dependencies
cd backend && npm install --production

# Configure environment variables
export NODE_ENV=production
export TWILIO_ACCOUNT_SID=your_account_sid
export TWILIO_AUTH_TOKEN=your_auth_token
# ... other environment variables

# Start production server
npm start
```

## 🔧 Configuration Guide

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | No* | Demo mode |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | No* | Demo mode |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | No | +1234567890 |
| `AGENT_PHONE_NUMBER` | Agent's phone number | No | +0987654321 |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 3001 |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | localhost |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | No | 100 |
| `CACHE_TTL` | Cache time-to-live (seconds) | No | 300 |
| `LOG_LEVEL` | Logging level | No | info |

*System works in demo mode without real Twilio credentials

### Demo Mode vs Production Mode

#### Demo Mode (Default)
- ✅ Safe testing without real API calls
- ✅ All functionality simulated
- ✅ No charges incurred
- ✅ Perfect for development and testing

#### Production Mode
- ✅ Real Twilio API integration
- ✅ Actual SMS and call functionality
- ⚠️ Requires valid Twilio credentials
- ⚠️ API usage charges apply

## 📱 User Guide

### Demo Credentials
- **Admin**: `admin` / `admin123`
- **Asesor**: `asesor` / `asesor123`

### Admin Features
- Full contact management (CRUD operations)
- Advanced spoof calling configuration
- System monitoring and analytics
- User management capabilities

### Asesor Features
- Contact viewing and basic management
- Standard calling and SMS functionality
- Limited spoof calling capabilities

## 🔌 API Documentation

### Authentication Endpoints
```http
POST /login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Communication Endpoints

#### Send SMS
```http
POST /send-sms
Content-Type: application/json

{
  "to": "+1234567890",
  "body": "Your message here",
  "from": "+0987654321"
}
```

#### Make Call
```http
POST /make-call
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Hello, this is a test call",
  "record": false
}
```

#### Advanced Spoof Call
```http
POST /api/spoof/call
Content-Type: application/json

{
  "to": "+1234567890",
  "spoofNumber": "+19876543210",
  "message": "Spoof call message",
  "voiceModulation": {
    "voice": "alice",
    "language": "en-US"
  },
  "useConference": true,
  "record": false
}
```

#### Spoof SMS
```http
POST /api/spoof/sms
Content-Type: application/json

{
  "to": "+1234567890",
  "spoofNumber": "+19876543210",
  "body": "Your spoof SMS message"
}
```

### System Endpoints

#### Health Check
```http
GET /health
```

#### Cache Statistics
```http
GET /api/cache/stats
```

## 🛡️ Security Considerations

### Anti-Screenshot Protection
- Automatic content blurring on window focus loss
- Keyboard shortcut prevention (Print Screen, etc.)
- Developer tools detection and response
- Context menu disabling in sensitive areas

### API Security
- Rate limiting per IP address
- Input validation and sanitization
- CORS protection with configurable origins
- Security headers via Helmet.js
- Request size limiting

### Data Protection
- No sensitive data stored in logs
- Environment variable protection
- Secure session management
- Input/output sanitization

## 🔧 Troubleshooting

### Common Issues

#### 1. Twilio Authentication Errors
**Problem**: `Error: accountSid must start with AC`
**Solution**: 
- Verify TWILIO_ACCOUNT_SID format
- System automatically falls back to demo mode
- Check environment variable configuration

#### 2. Rate Limiting
**Problem**: `Too many requests`
**Solution**:
- Wait for rate limit window to reset
- Adjust RATE_LIMIT_MAX_REQUESTS if needed
- Implement request queuing in client

#### 3. CORS Errors
**Problem**: Cross-origin request blocked
**Solution**:
- Add your domain to ALLOWED_ORIGINS
- Verify protocol (http vs https)
- Check Vercel domain configuration

### Debug Mode
Enable detailed logging:
```bash
export LOG_LEVEL=debug
npm start
```

## 📊 Performance Optimization

### Caching Strategy
- In-memory caching with Redis fallback
- Configurable TTL per endpoint
- Cache warming on startup
- Automatic cache invalidation

### Resource Optimization
- Gzip compression enabled
- Static asset optimization
- Resource preloading
- Lazy loading implementation

### Monitoring
- Real-time performance metrics
- Error tracking and reporting
- Usage analytics
- Health check endpoints

## 🤝 Contributing

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/crm-twilio.git
cd crm-twilio

# Create feature branch
git checkout -b feature/your-feature-name

# Install dependencies
cd backend && npm install

# Start development server
npm run dev
```

### Code Standards
- ESLint configuration included
- Prettier for code formatting
- Comprehensive error handling
- Unit tests with Jest

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Twilio API Documentation](https://www.twilio.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)

### Issues and Support
- Create an issue on GitHub for bugs
- Check existing issues before creating new ones
- Provide detailed reproduction steps
- Include environment information

---

## 🎉 Ready for Production!

This CRM system is production-ready with:
- ✅ Enterprise-level security
- ✅ Scalable architecture
- ✅ Comprehensive monitoring
- ✅ Easy deployment options
- ✅ Demo mode for safe testing

**Deploy to Vercel in one command**: `vercel --prod`

---

*Built with ❤️ for advanced communication needs*
