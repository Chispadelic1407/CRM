# CRM Twilio - Advanced Spoof Calling System

## 🚀 Vercel Deployment Ready

This CRM system with advanced spoof calling capabilities is now configured for seamless Vercel deployment.

### 📋 Pre-Deployment Checklist

- ✅ Vercel configuration (`vercel.json`) created
- ✅ Root package.json for deployment
- ✅ Environment variables configured
- ✅ Static files optimized
- ✅ API routes properly structured
- ✅ Demo mode for testing without credentials

### 🔧 Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

### 🌍 Environment Variables

Set these environment variables in your Vercel dashboard:

```env
# Twilio Configuration (Optional - system works in demo mode without these)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
AGENT_PHONE_NUMBER=+0987654321

# Server Configuration
NODE_ENV=production
PORT=3001

# Security Configuration
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_KEYS=1000

# Logging Configuration
LOG_LEVEL=info
```

### 🏗️ Project Structure

```
crm-twilio/
├── vercel.json              # Vercel deployment configuration
├── package.json             # Root package.json for Vercel
├── .vercelignore           # Files to ignore during deployment
├── backend/                # Backend API
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   └── utils/              # Utility functions
└── frontend/               # Frontend static files
    ├── index.html          # Main HTML file
    ├── css/                # Stylesheets
    └── js/                 # JavaScript files
```

### 🔐 Security Features

- **Anti-Screenshot Protection**: Prevents unauthorized screenshots
- **Developer Tools Detection**: Blurs content when dev tools are open
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js implementation

### 📱 Demo Credentials

- **Admin**: admin / admin123
- **Asesor**: asesor / asesor123

### 🎯 Key Features

- **Advanced Spoof Calling**: Multiple spoofing techniques
- **Voice Modulation**: Customizable voice options
- **SMS Integration**: Send SMS with custom sender ID
- **Contact Management**: Full CRUD operations
- **Real-time Dashboard**: Live statistics and monitoring
- **Demo Mode**: Safe testing without real Twilio credentials

### 🔧 API Endpoints

- `GET /health` - System health check
- `POST /send-sms` - Send SMS messages
- `POST /make-call` - Initiate calls
- `POST /api/spoof/call` - Advanced spoof calling
- `POST /api/spoof/sms` - Spoof SMS sending

### 📊 Performance Optimizations

- **Caching Layer**: Redis-compatible caching
- **Compression**: Gzip compression enabled
- **Resource Preloading**: Critical resource optimization
- **Error Handling**: Comprehensive error management
- **Logging**: Winston-based logging system

### 🚨 Important Notes

1. **Demo Mode**: The system runs in demo mode by default for safe testing
2. **Twilio Credentials**: Add real credentials only when ready for production
3. **Security**: All security features are enabled by default
4. **Monitoring**: Built-in performance and error monitoring

### 📞 Support

For deployment issues or questions, refer to the comprehensive logging system and error handling built into the application.

---

**Ready for Vercel deployment! 🎉**
