/**
 * Logger utility for consistent logging across the application
 * In a production environment, this would typically use a proper logging library
 * like Winston or Pino, but this simple implementation provides the basics.
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  
  if (isProduction) {
    // Structured logging for production (JSON format)
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  } else {
    // Human-readable format for development
    const metaStr = Object.keys(meta).length ? 
      `\n${JSON.stringify(meta, null, 2)}` : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }
};

/**
 * Log info message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  console.log(formatLog('info', message, meta));
};

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
const warn = (message, meta = {}) => {
  console.warn(formatLog('warn', message, meta));
};

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or additional metadata
 * @param {Object} meta - Additional metadata
 */
const error = (message, error = {}, meta = {}) => {
  const errorMeta = error instanceof Error ? {
    name: error.name,
    stack: isDevelopment ? error.stack : undefined,
    ...meta
  } : { ...error, ...meta };
  
  console.error(formatLog('error', message, errorMeta));
};

/**
 * Log debug message (only in development)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
const debug = (message, meta = {}) => {
  if (!isDevelopment) return;
  console.debug(formatLog('debug', message, meta));
};

/**
 * Log HTTP request (for request logging)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} time - Response time in ms
 */
const httpRequest = (req, res, time) => {
  const meta = {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    responseTime: `${time}ms`,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.connection.remoteAddress,
    requestId: req.headers['x-request-id'] || req.headers['x-correlation-id']
  };
  
  if (res.statusCode >= 400) {
    warn(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
  } else {
    info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
  }
};

module.exports = {
  info,
  warn,
  error,
  debug,
  httpRequest
};