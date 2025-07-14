/**
 * Production configuration settings
 */
module.exports = {
  // Server settings
  server: {
    trustProxy: true, // Trust proxy headers for secure connections behind load balancers
    compression: true, // Enable compression
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    },
  },
  
  // Security settings
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
          styleSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      xssFilter: true,
      noSniff: true,
      hidePoweredBy: true,
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*', // Restrict in production
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },
  
  // Cache settings
  cache: {
    duration: 3600, // 1 hour in seconds
  },
  
  // Logging settings
  logging: {
    format: 'combined', // Apache combined log format
    skipPaths: ['/health', '/metrics'], // Skip logging for health check endpoints
  },
};