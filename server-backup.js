const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables - Render automatically sets NODE_ENV=production
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const exportRoutes = require('./routes/export');

const app = express();

// Trust proxy for proper IP detection on Render
app.set('trust proxy', 1);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable for development
}));

// Comprehensive CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Production frontend URLs
      process.env.FRONTEND_URL,
      'https://jivhala-motors.onrender.com',
      'https://jivhala-motors-frontend.onrender.com',
      
      // Development URLs
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
      
      // Flutter development servers
      'http://localhost:52519',
      'http://127.0.0.1:52519',
      
      // Android emulator
      'http://10.0.2.2:3000',
      'http://10.0.2.2:3001',
      
      // Local network access
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
      
      // Dynamic localhost ports for development
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ].filter(Boolean);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      console.log('📋 Allowed origins:', allowedOrigins.filter(o => typeof o === 'string'));
      callback(null, true); // Allow all origins in development - change to false in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-requested-with',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Additional CORS headers middleware for problematic clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Database connection with enhanced error handling and retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`🔄 Attempting MongoDB connection (attempt ${retries + 1}/${maxRetries})...`);
      
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 75000, // 75 seconds
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      return;
      
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed:`, error.message);
      
      // Provide specific error guidance
      if (error.message.includes('IP')) {
        console.error('\n🚨 IP WHITELIST ERROR:');
        console.error('1. Go to MongoDB Atlas Dashboard');
        console.error('2. Navigate to Network Access');
        console.error('3. Add 0.0.0.0/0 to allow all IPs (for Render deployment)');
        console.error('4. Ensure database user has proper permissions\n');
      } else if (error.message.includes('authentication')) {
        console.error('\n🚨 AUTHENTICATION ERROR:');
        console.error('1. Check your MongoDB username and password');
        console.error('2. Ensure the user has read/write permissions');
        console.error('3. Verify the database name is correct\n');
      } else if (error.message.includes('MONGODB_URI')) {
        console.error('\n🚨 CONFIGURATION ERROR:');
        console.error('1. Set MONGODB_URI environment variable in Render dashboard');
        console.error('2. Format: mongodb+srv://username:password@cluster.mongodb.net/database\n');
      }
      
      if (retries >= maxRetries) {
        console.error('💀 Max retries reached. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, retries), 30000);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Connect to database
connectDB();

// Routes with logging
app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 Auth route: ${req.method} ${req.path}`);
  next();
}, authRoutes);

app.use('/api/vehicles', (req, res, next) => {
  console.log(`🚗 Vehicle route: ${req.method} ${req.path}`);
  next();
}, vehicleRoutes);

app.use('/api/export', (req, res, next) => {
  console.log(`📤 Export route: ${req.method} ${req.path}`);
  next();
}, exportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚗 Jivhala Motors API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      export: '/api/export'
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced health check
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'Jivhala Motors API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(healthStatus);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Important for Render deployment

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📚 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('📚 MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Jivhala Motors API Server Started`);
  console.log(`📍 Host: ${HOST}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`🔗 Health Check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
  console.log(`📝 API Docs: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`);
  console.log('─'.repeat(60));
});
