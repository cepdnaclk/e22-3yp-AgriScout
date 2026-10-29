const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const greenhouseRoutes = require('./routes/greenhouseRoutes');
const plantRoutes = require('./routes/plantRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const robotRoutes = require('./routes/robotRoutes');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration supporting web and mobile clients
app.use(cors({
  origin: (origin, callback) => {
    // Allow mobile apps / curl / Postman without origin
    if (!origin) return callback(null, true);
    if (config.clientOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed for this origin'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Robot-Id', 'X-Robot-Key', 'X-Robot-Identifier', 'X-Robot-Api-Key']
}));

// Rate limiting for general API requests (skip in test environment)
if (config.env !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests from this IP, please try again later.' }
  });
  app.use('/api', limiter);
}

// Request logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static leaf inspection images safely
const uploadsPath = path.resolve(__dirname, '../', config.uploadDir);
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/greenhouses', greenhouseRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/robot', robotRoutes);
app.use('/api/robots', robotRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    service: 'Greenhouse Monitoring Robot Full-Stack System API',
    status: 'online',
    healthCheck: '/api/health',
    version: '1.0.0'
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
