/**
 * Global error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log error in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Send standardized error response
  res.status(statusCode).json({
    status,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Custom error class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = errorMiddleware;
module.exports.AppError = AppError;