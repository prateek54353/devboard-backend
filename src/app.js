const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpecs = require('./config/swagger');
const errorMiddleware = require('./middleware/error.middleware');
const requestLogger = require('./middleware/request-logger.middleware');
const logger = require('./utils/logger');

// Import configuration
const productionConfig = require('./config/production');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Import routes
// const authRoutes = require('./routes/auth.routes');
// const githubRoutes = require('./routes/github.routes');
// const stackoverflowRoutes = require('./routes/stackoverflow.routes');
// const todoRoutes = require('./routes/todo.routes');
// const streakRoutes = require('./routes/streak.routes');
// const challengeRoutes = require('./routes/challenge.routes');

// Initialize express app
const app = express();

// Apply middleware
if (isProduction) {
  // Production middleware
  console.log('Running in production mode');
  
  // Trust proxy if behind a load balancer
  if (productionConfig.server.trustProxy) {
    app.set('trust proxy', 1);
  }
  
  // Apply compression
  if (productionConfig.server.compression) {
    app.use(compression());
  }
  
  // Apply rate limiting
  if (productionConfig.server.rateLimit) {
    app.use(rateLimit(productionConfig.server.rateLimit));
  }
  
  // Apply security headers with production config
  app.use(helmet(productionConfig.security.helmet));
  
  // Apply CORS with production config
  app.use(cors(productionConfig.security.cors));
  
  // Apply custom request logging
  app.use(requestLogger);
  
  logger.info('Production middleware applied', {
    compression: productionConfig.server.compression,
    rateLimit: !!productionConfig.server.rateLimit,
    trustProxy: productionConfig.server.trustProxy
  });
} else {
  // Development middleware
  app.use(helmet()); // Default security headers
  app.use(requestLogger); // Custom request logging
  app.use(cors()); // Default CORS for cross-origin requests
  
  logger.info('Development middleware applied');
}

// Common middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'success',
    message: 'DevBoard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`
  };
  
  res.status(200).json(healthData);
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  // Convert bytes to MB for readability
  const formatMemory = (bytes) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;
  
  const metrics = {
    status: 'success',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    memory: {
      rss: formatMemory(memoryUsage.rss),
      heapTotal: formatMemory(memoryUsage.heapTotal),
      heapUsed: formatMemory(memoryUsage.heapUsed),
      external: formatMemory(memoryUsage.external)
    },
    node: {
      version: process.version
    }
  };
  
  res.status(200).json(metrics);
});

// API Routes
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/github', githubRoutes);
// app.use('/api/v1/stackoverflow', stackoverflowRoutes);
// app.use('/api/v1/todos', todoRoutes);
// app.use('/api/v1/streaks', streakRoutes);
// app.use('/api/v1/challenges', challengeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use(errorMiddleware);

// Log application initialization
logger.info(`DevBoard API initialized in ${process.env.NODE_ENV || 'development'} mode`);

module.exports = app;