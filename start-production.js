/**
 * Production startup script for DevBoard API
 * 
 * This script sets up the environment for production and starts the server.
 * It includes additional checks and configurations specific to production.
 */

// Set environment to production
process.env.NODE_ENV = 'production';

// Load environment variables
require('dotenv').config();

// Import required modules
const app = require('./src/app');
const { initializeDatabase } = require('./src/config/db-init');
const http = require('http');
const logger = require('./src/utils/logger');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const SERVER_TIMEOUT = 30000; // 30 seconds

/**
 * Verify required environment variables
 * @returns {boolean} True if all required variables are present
 */
const verifyEnvironment = () => {
  const requiredVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_EXPIRES_IN'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Verify required directories exist
 * @returns {boolean} True if all required directories exist
 */
const verifyDirectories = () => {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir);
      logger.info(`Created logs directory: ${logsDir}`);
    } catch (err) {
      logger.error(`Failed to create logs directory: ${logsDir}`, err);
      return false;
    }
  }
  
  return true;
};

/**
 * Start the server
 */
const startServer = async () => {
  logger.info('Starting DevBoard API in production mode');
  
  // Verify environment and directories
  if (!verifyEnvironment() || !verifyDirectories()) {
    logger.error('Startup verification failed. Exiting...');
    process.exit(1);
  }
  
  try {
    // Initialize database
    logger.info('Initializing database connection...');
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      logger.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }
    
    logger.info('Database connection established successfully');
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Configure server timeouts
    server.timeout = SERVER_TIMEOUT;
    server.keepAliveTimeout = 65000; // Recommended for production behind load balancers
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`DevBoard API server running on port ${PORT} in production mode`);
      logger.info(`Server configured with timeout: ${SERVER_TIMEOUT}ms`);
    });
    
    // Implement graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Start the server
startServer();