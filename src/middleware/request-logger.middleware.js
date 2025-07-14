/**
 * Request logging middleware
 * Provides detailed HTTP request logging with response times
 */
const logger = require('../utils/logger');

/**
 * Middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Skip logging for specified paths
  const skipPaths = ['/health', '/metrics'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  // Record start time
  const start = Date.now();
  
  // Log request received in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`${req.method} ${req.originalUrl} - Request received`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.httpRequest(req, res, duration);
  });
  
  next();
};

module.exports = requestLogger;