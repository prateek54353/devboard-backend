require('dotenv').config();
const app = require('./src/app');
const { initializeDatabase } = require('./src/config/db-init');
const http = require('http');

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Configure server timeout for production
const SERVER_TIMEOUT = isProduction ? 30000 : 120000; // 30 seconds in production, 2 minutes in development

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Configure server timeouts
    server.timeout = SERVER_TIMEOUT;
    server.keepAliveTimeout = isProduction ? 65000 : 5000; // Recommended for production behind load balancers
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`DevBoard API server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      
      if (isProduction) {
        console.log(`Server configured with timeout: ${SERVER_TIMEOUT}ms`);
      }
    });
    
    // Implement graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (isProduction) {
    console.error('Error details:', err.stack);
    // In production, we should log to a file or monitoring service
    // but still shut down as this indicates a critical issue
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (isProduction) {
    console.error('Error details:', err.stack);
    // In production, we should log to a file or monitoring service
  }
  process.exit(1);
});