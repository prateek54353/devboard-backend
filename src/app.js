const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const errorMiddleware = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const githubRoutes = require('./routes/github.routes');
const stackoverflowRoutes = require('./routes/stackoverflow.routes');
const todoRoutes = require('./routes/todo.routes');
const streakRoutes = require('./routes/streak.routes');
const challengeRoutes = require('./routes/challenge.routes');

// Initialize express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors()); // CORS for cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DevBoard API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/github', githubRoutes);
app.use('/api/v1/stackoverflow', stackoverflowRoutes);
app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/streaks', streakRoutes);
app.use('/api/v1/challenges', challengeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;