/**
 * Global error handling middleware
 */
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Set default values
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Generate request ID if not already present
  const requestId = req.headers['x-request-id'] ||
                    req.headers['x-correlation-id'] ||
                    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Prepare error details for logging
  const errorDetails = {
    requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    errorName: err.name,
    errorMessage: err.message,
    isOperational: err.isOperational || false,
    timestamp: new Date().toISOString()
  };
  
  // Log error appropriately based on environment
  const logMeta = {
    ...errorDetails,
    params: req.params,
    query: req.query,
    // Only include body in development to avoid logging sensitive data
    ...(isDevelopment && { body: req.body })
  };
  
  // Use our logger utility
  logger.error(
    `${err.name || 'Error'}: ${err.message}`,
    err,
    logMeta
  );

  // Prepare client response
  const clientResponse = {
    status,
    message: isProduction && !err.isOperational
      ? 'Internal server error' // Generic message for non-operational errors in production
      : err.message || 'Internal server error',
    requestId // Include request ID for error tracking
  };
  
  // Include stack trace in development
  if (isDevelopment) {
    clientResponse.stack = err.stack;
    clientResponse.details = err.details || undefined;
  }

  // Send standardized error response
  res.status(statusCode).json(clientResponse);
};

/**
 * Custom error class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indicates this is a known operational error
    this.details = details; // Additional error details for debugging

    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Factory method for creating common error types
   */
  static badRequest(message, details) {
    return new AppError(message || 'Bad request', 400, details);
  }
  
  static unauthorized(message, details) {
    return new AppError(message || 'Unauthorized access', 401, details);
  }
  
  static forbidden(message, details) {
    return new AppError(message || 'Forbidden access', 403, details);
  }
  
  static notFound(message, details) {
    return new AppError(message || 'Resource not found', 404, details);
  }
  
  static validation(message, details) {
    return new AppError(message || 'Validation error', 422, details);
  }
  
  static internal(message, details) {
    return new AppError(message || 'Internal server error', 500, details);
  }
}

module.exports = errorMiddleware;
module.exports.AppError = AppError;